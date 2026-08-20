import { APP_CONFIG } from '../config';
import { state } from '../core/state';
import { storage } from '../core/storage';
import { bookmarkService } from '../services/bookmarks';
import type { DashboardSettings } from '../types';
import {
  asArray,
  getLegacyWallpaperUrl,
  getSettingsForStorage,
  isRecord,
  isString,
  sanitizeFavorites,
  sanitizeSettings,
  sanitizeStoredItems,
} from '../utils/dashboard-data';
import { hydrateWallpaper } from './actions';
import { bindDashboardEvents } from './events';
import { applyPinsToFolders } from './items';
import { applyAppearance, renderDashboard, renderSections } from './render';
import type { StartupData, Unsubscribe } from './types';

export async function initDashboard(appRoot: HTMLElement): Promise<void> {
  const startupData = await loadStartupData();

  state.init({
    bookmarks: startupData.bookmarks,
    favorites: startupData.favorites,
    folders: applyPinsToFolders(startupData.folders, startupData.pinnedIds),
    pinnedIds: startupData.pinnedIds,
    activeFolderId: '',
    recentlyVisited: startupData.recentlyVisited,
    settings: startupData.settings,
  });

  applyAppearance(startupData.settings);
  renderDashboard(appRoot);
  bindDashboardEvents(appRoot);
  void subscribeState(appRoot);
  void hydrateWallpaper(startupData.settings, startupData.legacyWallpaperUrl).catch((error: unknown) => {
    console.error('Failed to hydrate wallpaper.', error);
  });
}

async function loadStartupData(): Promise<StartupData> {
  const [{ bookmarks, folders }, savedSettings, savedFavorites, savedPinnedIds, savedRecentlyVisited] = await Promise.all([
    bookmarkService.getDashboardBookmarks(),
    storage.get<unknown>(APP_CONFIG.STORAGE_KEYS.SETTINGS, APP_CONFIG.DEFAULTS.settings),
    storage.get<unknown>(APP_CONFIG.STORAGE_KEYS.FAVORITES, []),
    storage.get<unknown>(APP_CONFIG.STORAGE_KEYS.PINNED, []),
    storage.get<unknown>(APP_CONFIG.STORAGE_KEYS.RECENT, []),
  ]);

  const legacyWallpaperUrl = getLegacyWallpaperUrl(savedSettings);
  const settings = sanitizeSettings({ ...(isRecord(savedSettings) ? savedSettings : {}), wallpaperUrl: legacyWallpaperUrl });

  return {
    bookmarks,
    folders,
    settings,
    favorites: sanitizeFavorites(asArray(savedFavorites)),
    pinnedIds: asArray(savedPinnedIds).filter(isString),
    recentlyVisited: sanitizeStoredItems(asArray(savedRecentlyVisited)),
    legacyWallpaperUrl,
  };
}

function subscribeState(appRoot: HTMLElement): Unsubscribe {
  let frameId = 0;
  const scheduleSectionsRender = () => {
    if (frameId) return;

    frameId = window.requestAnimationFrame(() => {
      frameId = 0;
      renderSections(appRoot);
    });
  };

  const subscriptions: Unsubscribe[] = [
    state.subscribe('bookmarks', scheduleSectionsRender),
    state.subscribe('folders', scheduleSectionsRender),
    state.subscribe('searchQuery', scheduleSectionsRender),
    state.subscribe('activeFolderId', scheduleSectionsRender),
    state.subscribe('pinnedIds', (ids) => {
      void persistSafely('pinned IDs', () => storage.set(APP_CONFIG.STORAGE_KEYS.PINNED, ids));
      scheduleSectionsRender();
    }),
    state.subscribe('favorites', (favorites) => {
      void persistSafely('favorites', () => storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, favorites));
      scheduleSectionsRender();
    }),
    state.subscribe('settings', (settings, previousSettings) => {
      void persistSettings(settings, previousSettings);
      applyAppearance(settings);
      if (settingsAffectDashboard(settings, previousSettings)) {
        renderDashboard(appRoot);
      }
    }),
    state.subscribe('recentlyVisited', (items) => {
      void persistSafely('recently visited items', () => storage.set(APP_CONFIG.STORAGE_KEYS.RECENT, items.slice(0, APP_CONFIG.RECENT.MAX_ITEMS)));
    }),
  ];

  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

function settingsAffectDashboard(
  settings: DashboardSettings,
  previousSettings: DashboardSettings | undefined,
): boolean {
  if (!previousSettings) return true;

  return (
    settings.dashboardView !== previousSettings.dashboardView ||
    settings.wallpaperId !== previousSettings.wallpaperId ||
    settings.wallpaperUrl !== previousSettings.wallpaperUrl ||
    settings.clockFormat !== previousSettings.clockFormat ||
    settings.showGreeting !== previousSettings.showGreeting ||
    settings.showClock !== previousSettings.showClock ||
    settings.showSearch !== previousSettings.showSearch ||
    settings.gridRows !== previousSettings.gridRows ||
    settings.cardDensity !== previousSettings.cardDensity ||
    settings.userName !== previousSettings.userName
  );
}

async function persistSettings(settings: DashboardSettings, previousSettings?: DashboardSettings): Promise<void> {
  await persistSafely('settings', async () => {
    const writes: Promise<void>[] = [
      storage.set(APP_CONFIG.STORAGE_KEYS.SETTINGS, getSettingsForStorage(settings)),
    ];

    if (!previousSettings || previousSettings.wallpaperUrl !== settings.wallpaperUrl) {
      writes.push(storage.set(APP_CONFIG.STORAGE_KEYS.WALLPAPER, settings.wallpaperUrl));
    }

    await Promise.all(writes);
  });
}

async function persistSafely(label: string, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    console.error(`Failed to persist ${label}.`, error);
  }
}
