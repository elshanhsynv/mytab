import type { BookmarkItem, DashboardSettings, Folder } from '../types';

export type DashboardView = DashboardSettings['dashboardView'];
export type CardDensity = DashboardSettings['cardDensity'];
export type ContextAction = 'open-new-tab' | 'pin' | 'edit' | 'copy' | 'delete';
export type Unsubscribe = () => void;

export type StartupData = {
  bookmarks: BookmarkItem[];
  folders: Folder[];
  settings: DashboardSettings;
  favorites: BookmarkItem[];
  pinnedIds: string[];
  recentlyVisited: BookmarkItem[];
  legacyWallpaperUrl: string;
};

export type VisibleDashboardData = {
  settings: DashboardSettings;
  itemCount: number;
  favorites: BookmarkItem[];
  bookmarks: BookmarkItem[];
  folders: Folder[];
};

export type DragState = {
  suppressNextCardClick: boolean;
  draggedId: string;
  dragOverId: string;
  dropHandled: boolean;
  pointerDragId: string;
  pointerOverId: string;
  pointerStartX: number;
  pointerStartY: number;
  pointerMoved: boolean;
};

export const DASHBOARD_VIEWS: readonly DashboardView[] = ['favorites', 'bookmarks', 'folders'];
export const CONTEXT_ACTIONS: readonly ContextAction[] = ['open-new-tab', 'pin', 'edit', 'copy', 'delete'];

export const VIEW_LABELS: Record<DashboardView, string> = {
  favorites: 'Favorites',
  bookmarks: 'Bookmarks',
  folders: 'Folders',
};
