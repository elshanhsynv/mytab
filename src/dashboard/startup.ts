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
import { syncBrowserBookmarks } from './bookmark-sync';
import { bindDashboardEvents } from './events';
import { settingsPreview } from './settings-preview';
import { applyPinsToFolders, GRID_BREAKPOINTS } from './items';
import { applyAppearance, renderDashboard, scheduleSectionsRender as scheduleSections } from './render';
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
  syncBrowserBookmarks();
  watchGridBreakpoints(appRoot);
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
  const scheduleSectionsRender = () => scheduleSections(appRoot);

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
      // Previews from the open settings modal are shown but not saved.
      if (!settingsPreview.active) void persistSettings(settings);
      applyAppearance(settings);
      if (settingsAffectShell(settings, previousSettings)) {
        renderDashboard(appRoot);
      } else if (settingsAffectSections(settings, previousSettings)) {
        scheduleSectionsRender();
      }
    }),
    state.subscribe('recentlyVisited', (items) => {
      void persistSafely('recently visited items', () => storage.set(APP_CONFIG.STORAGE_KEYS.RECENT, items.slice(0, APP_CONFIG.RECENT.MAX_ITEMS)));
    }),
  ];

  return () => subscriptions.forEach((unsubscribe) => unsubscribe());
}

// Settings shown in the header and hero (greeting, clock, search bar). Changing
// one of these rebuilds the whole dashboard. The wallpaper is applied to the
// page body separately, so it needs no rebuild at all.
function settingsAffectShell(
  settings: DashboardSettings,
  previousSettings: DashboardSettings | undefined,
): boolean {
  if (!previousSettings) return true;

  return (
    settings.clockFormat !== previousSettings.clockFormat ||
    settings.showGreeting !== previousSettings.showGreeting ||
    settings.showClock !== previousSettings.showClock ||
    settings.showSearch !== previousSettings.showSearch ||
    settings.userName !== previousSettings.userName
  );
}

// Settings that only change the tiles below the search bar.
function settingsAffectSections(
  settings: DashboardSettings,
  previousSettings: DashboardSettings,
): boolean {
  return (
    settings.dashboardView !== previousSettings.dashboardView ||
    settings.gridRows !== previousSettings.gridRows ||
    settings.gridColumns !== previousSettings.gridColumns ||
    settings.cardDensity !== previousSettings.cardDensity
  );
}

/** The wallpaper URL last written, to skip rewriting a large data URL. */
let savedWallpaperUrl: string | undefined;

async function persistSettings(settings: DashboardSettings): Promise<void> {
  await persistSafely('settings', async () => {
    const writes: Promise<void>[] = [
      storage.set(APP_CONFIG.STORAGE_KEYS.SETTINGS, getSettingsForStorage(settings)),
    ];

    // Compared with the last save rather than the previous state, which may
    // have been an unsaved preview with the same wallpaper.
    if (savedWallpaperUrl !== settings.wallpaperUrl) {
      savedWallpaperUrl = settings.wallpaperUrl;
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

/** Page sizes depend on how many columns fit, so re-page when that changes. */
function watchGridBreakpoints(appRoot: HTMLElement): void {
  for (const query of GRID_BREAKPOINTS) {
    window.matchMedia(query).addEventListener('change', () => scheduleSections(appRoot));
  }
}
