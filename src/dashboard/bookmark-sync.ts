import { state } from '../core/state';
import { bookmarkService } from '../services/bookmarks';
import type { BookmarkItem, Folder } from '../types';
import { debounce } from '../utils/debounce';
import { applyPinsToFolders } from './items';
import type { Unsubscribe } from './types';

/** Bookmark events often arrive in bursts (moving a folder, an undo), so wait for them to settle. */
const RELOAD_DELAY_MS = 150;

/**
 * Keeps the dashboard in step with the browser's bookmarks. Changes made in
 * Chrome's bookmark manager, another tab or another extension show up
 * without reloading the page.
 */
export function syncBrowserBookmarks(): Unsubscribe {
  let latestReload = 0;

  const reload = async (): Promise<void> => {
    const reloadId = ++latestReload;

    try {
      const { bookmarks, folders } = await bookmarkService.readBrowserBookmarks();
      // A newer reload has started; let that one apply its fresher result.
      if (reloadId !== latestReload) return;
      applyBrowserBookmarks(bookmarks, folders);
    } catch (error) {
      console.error('Failed to reload browser bookmarks.', error);
    }
  };

  const scheduleReload = debounce(() => void reload(), RELOAD_DELAY_MS);
  const stopWatching = bookmarkService.watchBookmarks(scheduleReload);

  return () => {
    stopWatching();
    scheduleReload.cancel();
  };
}

function applyBrowserBookmarks(
  bookmarks: BookmarkItem[],
  folders: Folder[],
): void {
  const bookmarkIds = new Set(bookmarks.map((bookmark) => bookmark.id));
  const favoriteIds = new Set(state.get('favorites').map((favorite) => favorite.id));
  const stillExists = (id: string) => bookmarkIds.has(id) || favoriteIds.has(id);

  // Forget pins and recent visits of bookmarks deleted elsewhere, as removing
  // one from the dashboard does.
  const pinnedIds = state.get('pinnedIds').filter(stillExists);
  if (pinnedIds.length !== state.get('pinnedIds').length) state.set('pinnedIds', pinnedIds);

  const recent = state.get('recentlyVisited');
  const keptRecent = recent.filter((item) => item.source !== 'bookmark' || bookmarkIds.has(item.id));
  if (keptRecent.length !== recent.length) state.set('recentlyVisited', keptRecent);

  state.set('bookmarks', bookmarks);
  state.set('folders', applyPinsToFolders(folders, pinnedIds));

  // Leave a folder that no longer exists.
  const activeFolderId = state.get('activeFolderId');
  if (activeFolderId && !folders.some((folder) => folder.id === activeFolderId)) {
    state.set('activeFolderId', '');
  }
}
