import type { AppState, BookmarkItem, Folder } from '../types';
import { clampGridColumns, clampGridRows } from '../utils/dashboard-data';

/**
 * Width breakpoints of the launcher grid (`gridClass` in
 * components/folder-view.ts): 3 columns, 5 from Tailwind's `sm`, and the
 * chosen count from `lg`. Keep the two in step.
 */
export const GRID_BREAKPOINTS = ['(min-width: 40rem)', '(min-width: 64rem)'] as const;

/** How many columns the launcher grid shows at the current window width. */
export function getVisibleColumns(columns: number): number {
  if (window.matchMedia(GRID_BREAKPOINTS[1]).matches) return clampGridColumns(columns);
  if (window.matchMedia(GRID_BREAKPOINTS[0]).matches) return 5;
  return 3;
}

/**
 * Tiles per page: the chosen rows times the columns actually on screen, so a
 * narrower window shows the same number of rows instead of overflowing.
 */
export function getGridPageSize(rows: number, columns: number): number {
  return clampGridRows(rows) * getVisibleColumns(columns);
}

export function getDashboardItems(current: Pick<AppState, 'bookmarks' | 'favorites'>): BookmarkItem[] {
  return [...current.favorites, ...current.bookmarks];
}

export function getDashboardFolders(current: Readonly<AppState>, visibleBookmarkIds: Set<string>): Folder[] {
  return current.folders
    .map((folder) => ({
      ...folder,
      items: withPinnedFlags(folder.items.filter((item) => visibleBookmarkIds.has(item.id)), current.pinnedIds),
    }))
    // Empty folders stay visible so bookmarks can be added to them, but are
    // hidden while searching, where they can't match.
    .filter((folder) => folder.items.length > 0 || !current.searchQuery.trim());
}

/**
 * Pinned first, then favorites before bookmarks. Bookmarks from several
 * folders are kept together folder by folder, in `folders` order, so the
 * grid follows Chrome's own bookmark order instead of interleaving folders
 * (an item's `order` is only its position inside its own folder).
 */
export function sortLauncherItems(
  bookmarks: BookmarkItem[],
  pinnedIds: string[],
  folders: readonly Pick<Folder, 'id'>[] = [],
): BookmarkItem[] {
  const pinned = new Set(pinnedIds);
  const folderRank = new Map(folders.map((folder, index) => [folder.id, index]));
  // Bookmarks outside any folder come first; unknown folders last.
  const rankOf = (item: BookmarkItem) =>
    item.folderId === undefined ? -1 : (folderRank.get(item.folderId) ?? folders.length);

  return [...bookmarks].sort((a, b) => {
    const pinWeight = Number(pinned.has(b.id)) - Number(pinned.has(a.id));
    if (pinWeight !== 0) return pinWeight;
    if (a.source !== b.source) return a.source === 'favorite' ? -1 : 1;
    const folderWeight = rankOf(a) - rankOf(b);
    if (folderWeight !== 0) return folderWeight;
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
