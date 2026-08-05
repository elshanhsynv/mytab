import { APP_CONFIG } from '../config';
import type { BookmarkItem, DashboardSettings } from '../types';

export function getLegacyWallpaperUrl(value: unknown): string {
  return isRecord(value) && typeof value.wallpaperUrl === 'string' ? value.wallpaperUrl : '';
}

export function sanitizeSettings(value: unknown): DashboardSettings {
  const settings = isRecord(value) ? value : {};
  const gridRows = typeof settings.gridRows === 'number' ? settings.gridRows : APP_CONFIG.GRID.DEFAULT_ROWS;
  const dashboardView = settings.dashboardView === 'sites'
    ? APP_CONFIG.DEFAULTS.settings.dashboardView
    : optionFrom(settings.dashboardView, ['favorites', 'bookmarks', 'folders'], APP_CONFIG.DEFAULTS.settings.dashboardView);

  return {
    ...APP_CONFIG.DEFAULTS.settings,
    dashboardView,
    wallpaperId: typeof settings.wallpaperId === 'string' ? settings.wallpaperId : APP_CONFIG.DEFAULTS.settings.wallpaperId,
    wallpaperUrl: typeof settings.wallpaperUrl === 'string' ? settings.wallpaperUrl : APP_CONFIG.DEFAULTS.settings.wallpaperUrl,
    clockFormat: optionFrom(settings.clockFormat, ['12h', '24h'], APP_CONFIG.DEFAULTS.settings.clockFormat),
    showGreeting: typeof settings.showGreeting === 'boolean' ? settings.showGreeting : APP_CONFIG.DEFAULTS.settings.showGreeting,
    showClock: typeof settings.showClock === 'boolean' ? settings.showClock : APP_CONFIG.DEFAULTS.settings.showClock,
    showSearch: typeof settings.showSearch === 'boolean' ? settings.showSearch : APP_CONFIG.DEFAULTS.settings.showSearch,
    userName: typeof settings.userName === 'string' ? settings.userName : APP_CONFIG.DEFAULTS.settings.userName,
    gridRows: Math.min(APP_CONFIG.GRID.MAX_ROWS, Math.max(1, gridRows || APP_CONFIG.GRID.DEFAULT_ROWS)),
    cardDensity: settings.cardDensity === 'compact' ? 'compact' : 'comfortable',
  };
}

export function getExportableSettings(settings: DashboardSettings): DashboardSettings {
  if (settings.wallpaperUrl.length === 0) return settings;

  return {
    ...settings,
    wallpaperId: APP_CONFIG.DEFAULTS.settings.wallpaperId,
    wallpaperUrl: '',
  };
}

export function getSettingsForStorage(settings: DashboardSettings): Omit<DashboardSettings, 'wallpaperUrl'> {
  return {
    dashboardView: settings.dashboardView,
    wallpaperId: settings.wallpaperId,
    clockFormat: settings.clockFormat,
    showGreeting: settings.showGreeting,
    showClock: settings.showClock,
    showSearch: settings.showSearch,
    gridRows: settings.gridRows,
    cardDensity: settings.cardDensity,
    userName: settings.userName,
  };
}

export function sanitizeFavorites(value: unknown[]): BookmarkItem[] {
  return value
    .map((item, index) => sanitizeFavorite(item, index))
    .filter((favorite): favorite is BookmarkItem => favorite !== undefined);
}

export function sanitizeStoredItems(value: unknown[]): BookmarkItem[] {
  return value
    .map(sanitizeStoredItem)
    .filter((item): item is BookmarkItem => item !== undefined);
}

export function normalizeFavoriteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const withProtocol = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function createFavoriteId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `favorite-${crypto.randomUUID()}`;
  }

  return `favorite-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function sanitizeFavorite(value: unknown, fallbackOrder: number): BookmarkItem | undefined {
  if (!isRecord(value) || typeof value.title !== 'string' || typeof value.url !== 'string') {
    return undefined;
  }

  const title = value.title.trim();
  const url = normalizeFavoriteUrl(value.url);
  if (!title || !url) return undefined;

  return {
    id: typeof value.id === 'string' && value.id.trim() ? value.id : createFavoriteId(),
    title,
    url,
    source: 'favorite',
    dateAdded: typeof value.dateAdded === 'number' ? value.dateAdded : Date.now(),
    order: typeof value.order === 'number' ? value.order : fallbackOrder,
    favicon: typeof value.favicon === 'string' ? value.favicon : undefined,
  };
}

function sanitizeStoredItem(value: unknown): BookmarkItem | undefined {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.title !== 'string' || typeof value.url !== 'string') {
    return undefined;
  }

  const source = value.source === 'favorite' ? 'favorite' : 'bookmark';
  const url = normalizeFavoriteUrl(value.url);
  if (!url) return undefined;

  return {
    id: value.id,
    title: value.title.trim() || url,
    url,
    source,
    favicon: typeof value.favicon === 'string' ? value.favicon : undefined,
    pinned: typeof value.pinned === 'boolean' ? value.pinned : undefined,
    folderId: typeof value.folderId === 'string' ? value.folderId : undefined,
    folderTitle: typeof value.folderTitle === 'string' ? value.folderTitle : undefined,
    dateAdded: typeof value.dateAdded === 'number' ? value.dateAdded : undefined,
    order: typeof value.order === 'number' ? value.order : undefined,
  };
}

function optionFrom<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && options.includes(value as T) ? (value as T) : fallback;
}
