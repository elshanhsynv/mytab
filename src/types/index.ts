import type { SearchEngineId } from "../config";

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  source: 'bookmark' | 'favorite';
  favicon?: string;
  pinned?: boolean;
  folderId?: string;
  folderTitle?: string;
  dateAdded?: number;
  order?: number;
}

export interface Folder {
  id: string;
  title: string;
  items: BookmarkItem[];
  collapsed?: boolean;
  order?: number;
}

export interface DashboardSettings {
  dashboardView: 'favorites' | 'bookmarks' | 'folders';
  wallpaperId: string;
  wallpaperUrl: string;
  clockFormat: '12h' | '24h';
  showGreeting: boolean;
  showClock: boolean;
  showSearch: boolean;
  gridRows: number;
  cardDensity: 'comfortable' | 'compact';
  defaultSearchEngine: SearchEngineId;
  userName: string;
}

export interface AppState {
  bookmarks: BookmarkItem[];
  favorites: BookmarkItem[];
  folders: Folder[];
  pinnedIds: string[];
  searchQuery: string;
  activeFolderId: string;
  settings: DashboardSettings;
  recentlyVisited: BookmarkItem[];
}

export type StateKey = keyof AppState;
export type StateListener<K extends StateKey = StateKey> = (value: AppState[K], prev: AppState[K]) => void;
