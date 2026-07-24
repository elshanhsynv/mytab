import { APP_CONFIG } from "../config";
import { state } from "../core/state";
import { storage } from "../core/storage";
import {
  showFavoriteModal,
  type FavoriteFormValues,
} from "../components/favorite-modal";
import { bookmarkService } from "../services/bookmarks";
import type { AppState, BookmarkItem, DashboardSettings } from "../types";
import {
  createFavoriteId,
  getExportableSettings,
  getSettingsForStorage,
  isRecord,
  isString,
  normalizeFavoriteUrl,
  sanitizeFavorites,
  sanitizeSettings,
  sanitizeStoredItems,
} from "../utils/dashboard-data";
import { getDashboardItems } from "./items";
import { showToast } from "./toast";
import type { ContextAction } from "./types";
import { CONTEXT_ACTIONS } from "./types";

export async function handleContextAction(
  action: ContextAction,
  bookmark: BookmarkItem,
): Promise<void> {
  if (!isContextAction(action)) return;

  try {
    switch (action) {
      case "open-new-tab":
        window.open(bookmark.url, "_blank", "noopener,noreferrer");
        return;
      case "pin":
        togglePinned(bookmark.id);
        return;
      case "copy":
        await copyText(bookmark.url);
        showToast("URL copied");
        return;
      case "edit":
        await editDashboardItem(bookmark);
        return;
      case "delete":
        await deleteDashboardItem(bookmark);
    }
  } catch (error) {
    console.error(`Failed to ${action} dashboard item.`, error);
    showToast("Action failed");
  }
}

export function findDashboardItem(id: string): BookmarkItem | undefined {
  const bookmark = getDashboardItems(state.getState()).find(
    (item) => item.id === id,
  );
  if (!bookmark) return undefined;
  return { ...bookmark, pinned: state.get("pinnedIds").includes(bookmark.id) };
}

export function addRecent(bookmark: BookmarkItem): void {
  const recent = [
    bookmark,
    ...state.get("recentlyVisited").filter((item) => item.id !== bookmark.id),
  ];
  state.set("recentlyVisited", recent.slice(0, APP_CONFIG.RECENT.MAX_ITEMS));
}

export function addFavorite(values: FavoriteFormValues): void {
  const title = values.title.trim();
  const url = normalizeFavoriteUrl(values.url);
  if (!title || !url) {
    showToast("Enter a valid favorite");
    return;
  }

  const favorite: BookmarkItem = {
    id: createFavoriteId(),
    title,
    url,
    source: "favorite",
    dateAdded: Date.now(),
    order: state.get("favorites").length,
  };

  state.set("favorites", [...state.get("favorites"), favorite]);
  showToast("Favorite added");
}

export function updateFavorite(id: string, values: FavoriteFormValues): void {
  const title = values.title.trim();
  const url = normalizeFavoriteUrl(values.url);
  if (!title || !url) {
    showToast("Enter a valid favorite");
    return;
  }

  const next = state.get("favorites").map((favorite) => {
    if (favorite.id !== id) return favorite;

    return {
      ...favorite,
      title,
      url,
    };
  });

  state.set("favorites", next);
  showToast("Favorite updated");
}

export function reorderBookmarks(sourceId: string, targetId: string): void {
  if (isFavoriteId(sourceId) && isFavoriteId(targetId)) {
    reorderFavorites(sourceId, targetId);
    return;
  }

  const bookmarks = [...state.get("bookmarks")];
  const from = bookmarks.findIndex((bookmark) => bookmark.id === sourceId);
  const to = bookmarks.findIndex((bookmark) => bookmark.id === targetId);
  if (from < 0 || to < 0) return;

  const [moved] = bookmarks.splice(from, 1);
  if (!moved) return;

  bookmarks.splice(to, 0, moved);
  state.set(
    "bookmarks",
    bookmarks.map((bookmark, order) => ({ ...bookmark, order })),
  );
  reorderBookmarkInsideFolder(sourceId, targetId);
}

export function exportSettings(): void {
  const payload: Pick<
    AppState,
    "settings" | "favorites" | "pinnedIds" | "recentlyVisited"
  > = {
    settings: getExportableSettings(state.get("settings")),
    favorites: state.get("favorites"),
    pinnedIds: state.get("pinnedIds"),
    recentlyVisited: state.get("recentlyVisited"),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "my-tab-settings.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function hydrateWallpaper(
  settings: DashboardSettings,
  legacyWallpaperUrl: string,
): Promise<void> {
  if (legacyWallpaperUrl) {
    await Promise.all([
      storage.set(APP_CONFIG.STORAGE_KEYS.WALLPAPER, legacyWallpaperUrl),
      storage.set(
        APP_CONFIG.STORAGE_KEYS.SETTINGS,
        getSettingsForStorage(settings),
      ),
    ]);
    return;
  }

  if (settings.wallpaperId !== "custom") return;

  const wallpaperUrl = await storage.get<string>(
    APP_CONFIG.STORAGE_KEYS.WALLPAPER,
    "",
  );
  if (!wallpaperUrl) return;

  const currentSettings = state.get("settings");
  if (currentSettings.wallpaperUrl !== wallpaperUrl) {
    state.set("settings", { ...currentSettings, wallpaperUrl });
  }
}

export async function importSettings(file: File): Promise<void> {
  let data: unknown;

  try {
    data = JSON.parse(await file.text());
  } catch (error) {
    console.error("Invalid settings import file.", error);
    showToast("Invalid settings file");
    return;
  }

  if (!isRecord(data)) return;

  if (isRecord(data.settings))
    state.set("settings", sanitizeSettings(data.settings));
  if (Array.isArray(data.favorites))
    state.set("favorites", sanitizeFavorites(data.favorites));
  if (Array.isArray(data.pinnedIds))
    state.set("pinnedIds", data.pinnedIds.filter(isString));
  if (Array.isArray(data.recentlyVisited))
    state.set("recentlyVisited", sanitizeStoredItems(data.recentlyVisited));
  showToast("Settings imported");
}

function togglePinned(id: string): void {
  const pinned = state.get("pinnedIds");
  state.set(
    "pinnedIds",
    pinned.includes(id)
      ? pinned.filter((pinnedId) => pinnedId !== id)
      : [...pinned, id],
  );
}

async function editDashboardItem(bookmark: BookmarkItem): Promise<void> {
  if (bookmark.source === "favorite") {
    showFavoriteModal({
      favorite: bookmark,
      onSave: (favorite) => updateFavorite(bookmark.id, favorite),
    });
    return;
  }

  const title = window.prompt("Bookmark title", bookmark.title);
  if (title === null) return;
  const url = window.prompt("Bookmark URL", bookmark.url);
  if (url === null) return;

  const updated = await bookmarkService.updateBookmark(bookmark, {
    title,
    url,
  });
  replaceBookmark(updated);
}

async function deleteDashboardItem(bookmark: BookmarkItem): Promise<void> {
  if (!window.confirm(`Remove "${bookmark.title}"?`)) return;

  if (bookmark.source === "favorite") {
    removeFavorite(bookmark.id);
    return;
  }

  await bookmarkService.removeBookmark(bookmark.id);
  removeBookmark(bookmark.id);
}

function replaceBookmark(updated: BookmarkItem): void {
  state.set(
    "bookmarks",
    state
      .get("bookmarks")
      .map((bookmark) => (bookmark.id === updated.id ? updated : bookmark)),
  );
  state.set(
    "folders",
    state.get("folders").map((folder) => ({
      ...folder,
      items: folder.items.map((bookmark) =>
        bookmark.id === updated.id ? updated : bookmark,
      ),
    })),
  );
}

function removeFavorite(id: string): void {
  state.set(
    "favorites",
    state.get("favorites").filter((favorite) => favorite.id !== id),
  );
  state.set(
    "pinnedIds",
    state.get("pinnedIds").filter((pinnedId) => pinnedId !== id),
  );
  state.set(
    "recentlyVisited",
    state.get("recentlyVisited").filter((item) => item.id !== id),
  );
}

function removeBookmark(id: string): void {
  state.set(
    "bookmarks",
    state.get("bookmarks").filter((bookmark) => bookmark.id !== id),
  );
  state.set(
    "folders",
    state.get("folders").map((folder) => ({
      ...folder,
      items: folder.items.filter((bookmark) => bookmark.id !== id),
    })),
  );
  state.set(
    "pinnedIds",
    state.get("pinnedIds").filter((pinnedId) => pinnedId !== id),
  );
}

function reorderFavorites(sourceId: string, targetId: string): void {
  const favorites = [...state.get("favorites")];
  const from = favorites.findIndex((favorite) => favorite.id === sourceId);
  const to = favorites.findIndex((favorite) => favorite.id === targetId);
  if (from < 0 || to < 0) return;

  const [moved] = favorites.splice(from, 1);
  if (!moved) return;

  favorites.splice(to, 0, moved);
  state.set(
    "favorites",
    favorites.map((favorite, order) => ({ ...favorite, order })),
  );
}

function reorderBookmarkInsideFolder(sourceId: string, targetId: string): void {
  const folders = state.get("folders");
  const folderIndex = folders.findIndex(
    (folder) =>
      folder.items.some((item) => item.id === sourceId) &&
      folder.items.some((item) => item.id === targetId),
  );
  if (folderIndex < 0) return;

  const nextFolders = folders.map((folder, index) => {
    if (index !== folderIndex) return folder;

    const items = [...folder.items];
    const from = items.findIndex((item) => item.id === sourceId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) return folder;

    const [moved] = items.splice(from, 1);
    if (!moved) return folder;

    items.splice(to, 0, moved);
    return {
      ...folder,
      items: items.map((item, order) => ({ ...item, order })),
    };
  });

  state.set("folders", nextFolders);
}

function isFavoriteId(id: string): boolean {
  return state.get("favorites").some((favorite) => favorite.id === id);
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall through to the textarea copy path for extension contexts without clipboard permission.
    }
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.className = "fixed -left-[9999px] top-0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function isContextAction(value: unknown): value is ContextAction {
  return (
    typeof value === "string" &&
    (CONTEXT_ACTIONS as readonly string[]).includes(value)
  );
}
