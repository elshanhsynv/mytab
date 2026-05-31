import { APP_CONFIG } from '../config';
import type { AppState, BookmarkItem, Folder } from '../types';

export function getGridItemCount(rows: number): number {
  const safeRows = Math.min(APP_CONFIG.GRID.MAX_ROWS, Math.max(1, rows || APP_CONFIG.GRID.DEFAULT_ROWS));
  return safeRows * APP_CONFIG.GRID.COLUMNS;
}

export function getDashboardItems(current: Pick<AppState, 'bookmarks' | 'favorites'>): BookmarkItem[] {
  return [...current.favorites, ...current.bookmarks];
}

export function getDashboardFolders(current: Readonly<AppState>, visibleBookmarkIds: Set<string>): Folder[] {
  return current.folders
    .map((folder) => ({
      ...folder,
      items: withPinnedFlags(folder.items, current.pinnedIds).filter((item) => visibleBookmarkIds.has(item.id)),
    }))
    .filter((folder) => folder.items.length > 0);
}

export function sortLauncherItems(bookmarks: BookmarkItem[], pinnedIds: string[]): BookmarkItem[] {
  const pinned = new Set(pinnedIds);
  return [...bookmarks].sort((a, b) => {
    const pinWeight = Number(pinned.has(b.id)) - Number(pinned.has(a.id));
    if (pinWeight !== 0) return pinWeight;
    if (a.source !== b.source) return a.source === 'favorite' ? -1 : 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

export function withPinnedFlags(bookmarks: BookmarkItem[], pinnedIds: string[]): BookmarkItem[] {
  const pinned = new Set(pinnedIds);
  return bookmarks.map((bookmark) => ({ ...bookmark, pinned: pinned.has(bookmark.id) }));
}

export function applyPinsToFolders(folders: Folder[], pinnedIds: string[]): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    items: withPinnedFlags(folder.items, pinnedIds),
  }));
}
