import './styles/tailwind.css';

import { APP_CONFIG } from './config';
import { delegate } from './core/events';
import { state } from './core/state';
import { storage } from './core/storage';
import { bookmarkService } from './services/bookmarks';
import type { AppState, BookmarkItem, DashboardSettings, Folder } from './types';
import { createBookmarkGrid } from './components/bookmark-grid';
import { createClock } from './components/clock';
import { showFavoriteModal, type FavoriteFormValues } from './components/favorite-modal';
import { showContextMenu } from './components/context-menu';
import { createFolderCard } from './components/folder-card';
import { icons } from './components/icons';
import { createSearchBar } from './components/search-bar';
import { createSection } from './components/section';
import { showSettingsModal } from './components/settings-modal';
import { getWallpaperBackground } from './services/wallpapers';

const root = document.querySelector<HTMLElement>('#app');

const styles = {
  dashboard: 'min-h-screen px-4 pb-10 text-white sm:px-6 lg:px-8',
  header: 'flex min-h-16 items-center justify-end gap-2 pt-4',
  hero: 'mx-auto flex w-full max-w-3xl flex-col items-center pt-6 pb-6 text-center sm:pt-8',
  content: 'mx-auto w-full max-w-[880px]',
  settingsButton:
    'inline-flex size-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 [&_svg]:size-5',
  addFavoriteCard:
    'add-favorite-card group relative flex w-full flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-center text-white shadow-lg shadow-black/10 backdrop-blur-xl ring-1 ring-white/10 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl hover:shadow-violet-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300',
  addFavoriteIcon:
    'grid shrink-0 place-items-center rounded-xl bg-white/15 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition group-hover:bg-white/20 group-hover:text-white [&_svg]:size-7',
  addFavoriteIconComfortable: 'size-10 sm:size-10',
  addFavoriteIconCompact: 'size-8 sm:size-8 [&_svg]:size-5',
  addFavoriteTitle: 'max-w-full truncate font-semibold leading-tight text-white',
  launcherGrid:
    'mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(3,minmax(0,92px))] sm:gap-4 sm:[grid-template-columns:repeat(5,minmax(0,104px))] lg:[grid-template-columns:repeat(7,minmax(0,112px))] xl:[grid-template-columns:repeat(7,minmax(0,118px))]',
  launcherGridCompact:
    'mx-auto grid w-full justify-center gap-2 [grid-template-columns:repeat(3,minmax(0,78px))] sm:gap-3 sm:[grid-template-columns:repeat(5,minmax(0,88px))] lg:[grid-template-columns:repeat(7,minmax(0,96px))] xl:[grid-template-columns:repeat(7,minmax(0,104px))]',
  folderGrid:
    'mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(2,minmax(0,128px))] sm:gap-5 sm:[grid-template-columns:repeat(4,minmax(0,142px))]',
  folderHeader: 'mb-4 flex px-10 items-center justify-between',
  backButton:
    'inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75 shadow-lg backdrop-blur-xl transition hover:bg-white/15 hover:text-white',
  folderTitle: 'truncate text-sm font-semibold text-white/70',
  viewSwitch:
    'mx-auto mb-4 flex w-max rounded-full border border-white/10 bg-white/10 p-1 shadow-lg backdrop-blur',
  viewButton:
    'min-w-24 rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:text-white',
  viewButtonActive: 'bg-violet-500/25 text-white shadow-sm',
};

if (root) {
  void init(root);
}

async function init(appRoot: HTMLElement): Promise<void> {
  const [{ bookmarks, folders }, savedSettings, savedFavorites, savedPinnedIds, savedRecentlyVisited] = await Promise.all([
    bookmarkService.getDashboardBookmarks(),
    storage.get<unknown>(APP_CONFIG.STORAGE_KEYS.SETTINGS, APP_CONFIG.DEFAULTS.settings),
    storage.get<unknown[]>(APP_CONFIG.STORAGE_KEYS.FAVORITES, []),
    storage.get<unknown[]>(APP_CONFIG.STORAGE_KEYS.PINNED, []),
    storage.get<unknown[]>(APP_CONFIG.STORAGE_KEYS.RECENT, []),
  ]);

  const legacyWallpaperUrl = getLegacyWallpaperUrl(savedSettings);
  const settings = sanitizeSettings({ ...(isRecord(savedSettings) ? savedSettings : {}), wallpaperUrl: legacyWallpaperUrl });
  const favorites = sanitizeFavorites(savedFavorites);
  const pinnedIds = savedPinnedIds.filter(isString);
  const recentlyVisited = sanitizeStoredItems(savedRecentlyVisited);

  state.init({
    bookmarks,
    favorites,
    folders: applyPinsToFolders(folders, pinnedIds),
    pinnedIds,
    activeFolderId: '',
    recentlyVisited,
    settings,
  });

  applyAppearance(settings);
  render(appRoot);
  bindEvents(appRoot);
  void hydrateWallpaper(settings, legacyWallpaperUrl);

  state.subscribe('bookmarks', () => renderSections(appRoot));
  state.subscribe('folders', () => renderSections(appRoot));
  state.subscribe('searchQuery', () => renderSections(appRoot));
  state.subscribe('activeFolderId', () => renderSections(appRoot));
  state.subscribe('pinnedIds', async (ids) => {
    await storage.set(APP_CONFIG.STORAGE_KEYS.PINNED, ids);
    renderSections(appRoot);
  });
  state.subscribe('favorites', async (favorites) => {
    await storage.set(APP_CONFIG.STORAGE_KEYS.FAVORITES, favorites);
    renderSections(appRoot);
  });
  state.subscribe('settings', async (settings) => {
    await Promise.all([
      storage.set(APP_CONFIG.STORAGE_KEYS.SETTINGS, getSettingsForStorage(settings)),
      storage.set(APP_CONFIG.STORAGE_KEYS.WALLPAPER, settings.wallpaperUrl),
    ]);
    applyAppearance(settings);
    render(appRoot);
  });
  state.subscribe('recentlyVisited', async (items) => {
    await storage.set(APP_CONFIG.STORAGE_KEYS.RECENT, items.slice(0, APP_CONFIG.RECENT.MAX_ITEMS));
  });
}

function render(appRoot: HTMLElement): void {
  const settings = state.get('settings');
  document.body.className = 'min-h-screen overflow-x-hidden bg-slate-950 bg-cover bg-center bg-fixed font-sans antialiased';
  appRoot.replaceChildren();

  const dashboard = document.createElement('main');
  dashboard.className = styles.dashboard;
  dashboard.innerHTML = `
    <header class="${styles.header}">
      <button class="${styles.settingsButton}" type="button" data-action="open-settings" aria-label="Open settings">${icons.settings}</button>
    </header>
    <div class="${styles.hero}" data-dashboard-hero></div>
    <div class="${styles.content}" data-dashboard-content></div>
  `;

  const hero = dashboard.querySelector<HTMLElement>('[data-dashboard-hero]');

  if (hero) {
    hero.append(createClock(settings));
    if (settings.showSearch) {
      hero.append(createSearchBar((query) => state.set('searchQuery', query)));
    }
  }

  appRoot.append(dashboard);
  renderSections(appRoot);
}

function renderSections(appRoot: HTMLElement): void {
  const content = appRoot.querySelector<HTMLElement>('[data-dashboard-content]');
  if (!content) return;

  const current = state.getState();
  const settings = current.settings;
  const itemCount = getGridItemCount(settings.gridRows);
  const favorites = bookmarkService.search(withPinnedFlags(current.favorites, current.pinnedIds), current.searchQuery);
  const bookmarks = bookmarkService.search(withPinnedFlags(current.bookmarks, current.pinnedIds), current.searchQuery);
  const visibleBookmarkIds = new Set(bookmarks.map((item) => item.id));
  const folders = getDashboardFolders(current, visibleBookmarkIds);
  const fragment = document.createDocumentFragment();
  fragment.append(createViewSwitch(settings.dashboardView));

  if (settings.dashboardView === 'folders') {
    const activeFolder = folders.find((folder) => folder.id === current.activeFolderId);
    if (activeFolder) {
      const header = document.createElement('div');
      header.className = styles.folderHeader;
      header.innerHTML = `
        <button class="${styles.backButton}" type="button" data-action="close-folder">Back to folders</button>
        <span class="${styles.folderTitle}">${activeFolder.title}</span>
      `;
      fragment.append(header);
      fragment.append(createSection('', createBookmarkGrid(activeFolder.items, gridClass(settings.cardDensity), settings.cardDensity), 'No websites match your search.'));
    } else {
      const folderGrid = document.createElement('div');
      folderGrid.className = styles.folderGrid;
      folders.forEach((folder) => folderGrid.append(createFolderCard(folder)));
      fragment.append(createSection('', folderGrid, 'No folders match your search.'));
    }
  } else if (settings.dashboardView === 'favorites') {
    const sites = sortSites(favorites, current.pinnedIds).slice(0, itemCount);
    const grid = createBookmarkGrid(sites, gridClass(settings.cardDensity), settings.cardDensity);
    if (!current.searchQuery.trim() && current.favorites.length < itemCount) {
      grid.append(createAddFavoriteCard(settings.cardDensity));
    }
    fragment.append(createSection('', grid, 'No favorites match your search.'));
  } else {
    const sites = sortSites(bookmarks, current.pinnedIds).slice(0, itemCount);
    fragment.append(createSection('', createBookmarkGrid(sites, gridClass(settings.cardDensity), settings.cardDensity), 'No bookmarks match your search.'));
  }

  content.replaceChildren(fragment);
}

function bindEvents(appRoot: HTMLElement): void {
  delegate(appRoot, '[data-action="add-favorite"]', 'click', () => {
    showFavoriteModal({
      onSave: (favorite) => addFavorite(favorite),
    });
  });

  delegate(appRoot, '[data-action="open-settings"]', 'click', () => {
    showSettingsModal({
      settings: state.get('settings'),
      onSave: (settings) => state.set('settings', settings),
      onExport: exportSettings,
      onImport: importSettings,
    });
  });

  delegate(appRoot, '[data-view]', 'click', (_event, target) => {
    const view = (target as HTMLElement).dataset.view;
    if (!isDashboardView(view)) return;
    state.set('activeFolderId', '');
    state.set('settings', { ...state.get('settings'), dashboardView: view });
  });

  delegate(appRoot, '.folder-card', 'click', (_event, target) => {
    const folderId = (target as HTMLElement).dataset.folderId ?? '';
    if (folderId) state.set('activeFolderId', folderId);
  });

  delegate(appRoot, '[data-action="close-folder"]', 'click', () => {
    state.set('activeFolderId', '');
  });

  let suppressNextCardClick = false;
  delegate(appRoot, '.bookmark-card', 'click', (event, target) => {
    if (suppressNextCardClick) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextCardClick = false;
      return;
    }

    const bookmark = findBookmark(String((target as HTMLElement).dataset.bookmarkId));
    if (bookmark) addRecent(bookmark);
  });

  delegate(appRoot, '.bookmark-card', 'contextmenu', (event, target) => {
    event.preventDefault();
    const bookmark = findBookmark(String((target as HTMLElement).dataset.bookmarkId));
    if (!bookmark || !(event instanceof MouseEvent)) return;
    showContextMenu(bookmark, { x: event.clientX, y: event.clientY }, handleContextAction);
  });

  delegate(appRoot, '[data-action="toggle-folder"]', 'click', (_event, target) => {
    const card = target.closest<HTMLElement>('.folder-card');
    if (!card) return;
    card.classList.toggle('folder-card--collapsed');
    const expanded = !card.classList.contains('folder-card--collapsed');
    target.setAttribute('aria-expanded', String(expanded));
  });

  let draggedId = '';
  let dragOverId = '';
  let dropHandled = false;
  let pointerDragId = '';
  let pointerOverId = '';
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerMoved = false;

  delegate(appRoot, '.bookmark-card', 'pointerdown', (event, target) => {
    if (!(event instanceof PointerEvent) || event.button !== 0) return;

    pointerDragId = String((target as HTMLElement).dataset.bookmarkId);
    pointerOverId = pointerDragId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerMoved = false;
  });
  delegate(appRoot, '.bookmark-card', 'pointermove', (event, target) => {
    if (!(event instanceof PointerEvent) || !pointerDragId) return;

    const dx = Math.abs(event.clientX - pointerStartX);
    const dy = Math.abs(event.clientY - pointerStartY);
    pointerMoved = pointerMoved || dx > 8 || dy > 8;
    pointerOverId = String((target as HTMLElement).dataset.bookmarkId);
  });
  delegate(appRoot, '.bookmark-card', 'pointerup', (event, target) => {
    if (!pointerDragId) return;

    const dropTarget = event instanceof PointerEvent
      ? document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('.bookmark-card')
      : target.closest<HTMLElement>('.bookmark-card');
    const targetId = String(dropTarget?.dataset.bookmarkId || pointerOverId);
    if (pointerMoved && targetId && pointerDragId !== targetId) {
      event.preventDefault();
      dropHandled = true;
      suppressNextCardClick = true;
      reorderBookmarks(pointerDragId, targetId);
    }

    pointerDragId = '';
    pointerOverId = '';
    pointerMoved = false;
  });

  delegate(appRoot, '.bookmark-card', 'dragstart', (event, target) => {
    draggedId = String((target as HTMLElement).dataset.bookmarkId);
    dragOverId = '';
    dropHandled = false;
    if (event instanceof DragEvent && event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedId);
    }
    target.classList.add('opacity-50', 'scale-105');
  });
  delegate(appRoot, '.bookmark-card', 'dragend', (event, target) => {
    const dropTarget = event instanceof DragEvent
      ? document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('.bookmark-card')
      : null;
    const targetId = String(dropTarget?.dataset.bookmarkId || dragOverId);
    if (!dropHandled && draggedId && targetId && draggedId !== targetId) {
      reorderBookmarks(draggedId, targetId);
    }
    target.classList.remove('opacity-50', 'scale-105');
    draggedId = '';
    dragOverId = '';
    dropHandled = false;
  });
  delegate(appRoot, '.bookmark-card', 'dragenter', (_event, target) => {
    dragOverId = String((target as HTMLElement).dataset.bookmarkId);
  });
  delegate(appRoot, '.bookmark-card', 'dragover', (event) => {
    event.preventDefault();
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('.bookmark-card') : null;
    dragOverId = String(target?.dataset.bookmarkId ?? dragOverId);
    if (event instanceof DragEvent && event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  });
  delegate(appRoot, '.bookmark-card', 'drop', (event, target) => {
    event.preventDefault();
    const targetId = String((target as HTMLElement).dataset.bookmarkId);
    const sourceId = event instanceof DragEvent
      ? event.dataTransfer?.getData('text/plain') || draggedId
      : draggedId;
    if (sourceId && sourceId !== targetId) {
      dropHandled = true;
      reorderBookmarks(sourceId, targetId);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === ',' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      appRoot.querySelector<HTMLElement>('[data-action="open-settings"]')?.click();
    }
  });
}

async function handleContextAction(action: string, bookmark: BookmarkItem): Promise<void> {
  if (action === 'open-new-tab') {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
    return;
  }

  if (action === 'pin') {
    const pinned = state.get('pinnedIds');
    state.set('pinnedIds', pinned.includes(bookmark.id) ? pinned.filter((id) => id !== bookmark.id) : [...pinned, bookmark.id]);
    return;
  }

  if (action === 'copy') {
    await copyText(bookmark.url);
    showToast('URL copied');
    return;
  }

  if (action === 'edit') {
    if (bookmark.source === 'favorite') {
      showFavoriteModal({
        favorite: bookmark,
        onSave: (favorite) => updateFavorite(bookmark.id, favorite),
      });
      return;
    }

    const title = window.prompt('Bookmark title', bookmark.title);
    if (title === null) return;
    const url = window.prompt('Bookmark URL', bookmark.url);
    if (url === null) return;
    const updated = await bookmarkService.updateBookmark(bookmark, { title, url });
    replaceBookmark(updated);
    return;
  }

  if (action === 'delete' && window.confirm(`Remove "${bookmark.title}"?`)) {
    if (bookmark.source === 'favorite') {
      removeFavorite(bookmark.id);
      return;
    }

    await bookmarkService.removeBookmark(bookmark.id);
    removeBookmark(bookmark.id);
  }
}

function findBookmark(id: string): BookmarkItem | undefined {
  const bookmark = getDashboardItems(state.getState()).find((item) => item.id === id);
  if (!bookmark) return undefined;
  return { ...bookmark, pinned: state.get('pinnedIds').includes(bookmark.id) };
}

function addRecent(bookmark: BookmarkItem): void {
  const recent = [bookmark, ...state.get('recentlyVisited').filter((item) => item.id !== bookmark.id)];
  state.set('recentlyVisited', recent.slice(0, APP_CONFIG.RECENT.MAX_ITEMS));
}

function reorderBookmarks(sourceId: string, targetId: string): void {
  if (isFavoriteId(sourceId) && isFavoriteId(targetId)) {
    reorderFavorites(sourceId, targetId);
    return;
  }

  const bookmarks = [...state.get('bookmarks')];
  const from = bookmarks.findIndex((bookmark) => bookmark.id === sourceId);
  const to = bookmarks.findIndex((bookmark) => bookmark.id === targetId);
  if (from < 0 || to < 0) return;
  const [moved] = bookmarks.splice(from, 1);
  if (!moved) return;
  bookmarks.splice(to, 0, moved);
  state.set('bookmarks', bookmarks.map((bookmark, order) => ({ ...bookmark, order })));
  reorderBookmarkInsideFolder(sourceId, targetId);
}

function reorderBookmarkInsideFolder(sourceId: string, targetId: string): void {
  const folders = state.get('folders');
  const folderIndex = folders.findIndex((folder) => (
    folder.items.some((item) => item.id === sourceId) &&
    folder.items.some((item) => item.id === targetId)
  ));
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

  state.set('folders', nextFolders);
}

function getDashboardItems(current: Pick<AppState, 'bookmarks' | 'favorites'>): BookmarkItem[] {
  return [...current.favorites, ...current.bookmarks];
}

function getDashboardFolders(current: Readonly<AppState>, visibleBookmarkIds: Set<string>): Folder[] {
  return current.folders
    .map((folder) => ({
      ...folder,
      items: withPinnedFlags(folder.items, current.pinnedIds).filter((item) => visibleBookmarkIds.has(item.id)),
    }))
    .filter((folder) => folder.items.length > 0);
}

function createViewSwitch(activeView: DashboardSettings['dashboardView']): HTMLElement {
  const switcher = document.createElement('div');
  switcher.className = styles.viewSwitch;
  switcher.setAttribute('aria-label', 'Dashboard view');
  switcher.innerHTML = `
    <button class="${styles.viewButton} ${activeView === 'favorites' ? styles.viewButtonActive : ''}" type="button" data-view="favorites" aria-pressed="${activeView === 'favorites'}">Favorites</button>
    <button class="${styles.viewButton} ${activeView === 'bookmarks' ? styles.viewButtonActive : ''}" type="button" data-view="bookmarks" aria-pressed="${activeView === 'bookmarks'}">Bookmarks</button>
    <button class="${styles.viewButton} ${activeView === 'folders' ? styles.viewButtonActive : ''}" type="button" data-view="folders" aria-pressed="${activeView === 'folders'}">Folders</button>
  `;
  return switcher;
}

function getGridItemCount(rows: number): number {
  const safeRows = Math.min(APP_CONFIG.GRID.MAX_ROWS, Math.max(1, rows || APP_CONFIG.GRID.DEFAULT_ROWS));
  return safeRows * APP_CONFIG.GRID.COLUMNS;
}

function createAddFavoriteCard(density: DashboardSettings['cardDensity']): HTMLButtonElement {
  const isCompact = density === 'compact';
  const card = document.createElement('button');
  card.className = `${styles.addFavoriteCard} ${isCompact ? 'gap-2 py-2' : 'gap-3 py-3'}`;
  card.type = 'button';
  card.dataset.action = 'add-favorite';
  card.setAttribute('role', 'listitem');
  card.setAttribute('aria-label', 'Add favorite');

  const icon = document.createElement('span');
  icon.className = `${styles.addFavoriteIcon} ${isCompact ? styles.addFavoriteIconCompact : styles.addFavoriteIconComfortable}`;
  icon.innerHTML = icons.plus;

  const title = document.createElement('span');
  title.className = `${styles.addFavoriteTitle} ${isCompact ? 'text-[11px]' : 'text-xs'}`;
  title.textContent = 'Add site';

  card.append(icon, title);
  return card;
}

function sortSites(bookmarks: BookmarkItem[], pinnedIds: string[]): BookmarkItem[] {
  const pinned = new Set(pinnedIds);
  return [...bookmarks].sort((a, b) => {
    const pinWeight = Number(pinned.has(b.id)) - Number(pinned.has(a.id));
    if (pinWeight !== 0) return pinWeight;
    if (a.source !== b.source) return a.source === 'favorite' ? -1 : 1;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}

function gridClass(density: DashboardSettings['cardDensity']): string {
  return density === 'compact' ? styles.launcherGridCompact : styles.launcherGrid;
}

function showToast(message: string): void {
  document.querySelector('[data-toast]')?.remove();
  const toast = document.createElement('div');
  toast.dataset.toast = 'true';
  toast.className =
    'fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-white/10';
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard?.writeText(value);
    return;
  } catch {
    const input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.className = 'fixed -left-[9999px] top-0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
}

function replaceBookmark(updated: BookmarkItem): void {
  state.set('bookmarks', state.get('bookmarks').map((bookmark) => (bookmark.id === updated.id ? updated : bookmark)));
  state.set('folders', state.get('folders').map((folder) => ({
    ...folder,
    items: folder.items.map((bookmark) => (bookmark.id === updated.id ? updated : bookmark)),
  })));
}

function addFavorite(values: FavoriteFormValues): void {
  const now = Date.now();
  const favorite: BookmarkItem = {
    id: createFavoriteId(),
    title: values.title.trim(),
    url: normalizeFavoriteUrl(values.url),
    source: 'favorite',
    dateAdded: now,
    order: state.get('favorites').length,
  };

  state.set('favorites', [...state.get('favorites'), favorite]);
  showToast('Favorite added');
}

function updateFavorite(id: string, values: FavoriteFormValues): void {
  const next = state.get('favorites').map((favorite) => {
    if (favorite.id !== id) return favorite;

    return {
      ...favorite,
      title: values.title.trim(),
      url: normalizeFavoriteUrl(values.url),
    };
  });

  state.set('favorites', next);
  showToast('Favorite updated');
}

function removeFavorite(id: string): void {
  state.set('favorites', state.get('favorites').filter((favorite) => favorite.id !== id));
  state.set('pinnedIds', state.get('pinnedIds').filter((pinnedId) => pinnedId !== id));
  state.set('recentlyVisited', state.get('recentlyVisited').filter((item) => item.id !== id));
}

function removeBookmark(id: string): void {
  state.set('bookmarks', state.get('bookmarks').filter((bookmark) => bookmark.id !== id));
  state.set('folders', state.get('folders').map((folder) => ({
    ...folder,
    items: folder.items.filter((bookmark) => bookmark.id !== id),
  })));
  state.set('pinnedIds', state.get('pinnedIds').filter((pinnedId) => pinnedId !== id));
}

function applyAppearance(settings: DashboardSettings): void {
  document.body.style.backgroundImage = getWallpaperBackground(settings.wallpaperId, settings.wallpaperUrl);
}

function reorderFavorites(sourceId: string, targetId: string): void {
  const favorites = [...state.get('favorites')];
  const from = favorites.findIndex((favorite) => favorite.id === sourceId);
  const to = favorites.findIndex((favorite) => favorite.id === targetId);
  if (from < 0 || to < 0) return;

  const [moved] = favorites.splice(from, 1);
  if (!moved) return;

  favorites.splice(to, 0, moved);
  state.set('favorites', favorites.map((favorite, order) => ({ ...favorite, order })));
}

function isFavoriteId(id: string): boolean {
  return state.get('favorites').some((favorite) => favorite.id === id);
}

function withPinnedFlags(bookmarks: BookmarkItem[], pinnedIds: string[]): BookmarkItem[] {
  const pinned = new Set(pinnedIds);
  return bookmarks.map((bookmark) => ({ ...bookmark, pinned: pinned.has(bookmark.id) }));
}

function applyPinsToFolders(folders: Folder[], pinnedIds: string[]): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    items: withPinnedFlags(folder.items, pinnedIds),
  }));
}

function exportSettings(): void {
  const payload: Pick<AppState, 'settings' | 'favorites' | 'pinnedIds' | 'recentlyVisited'> = {
    settings: getExportableSettings(state.get('settings')),
    favorites: state.get('favorites'),
    pinnedIds: state.get('pinnedIds'),
    recentlyVisited: state.get('recentlyVisited'),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'my-tab-settings.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function getLegacyWallpaperUrl(value: unknown): string {
  return isRecord(value) && typeof value.wallpaperUrl === 'string' ? value.wallpaperUrl : '';
}

async function hydrateWallpaper(settings: DashboardSettings, legacyWallpaperUrl: string): Promise<void> {
  if (legacyWallpaperUrl) {
    await Promise.all([
      storage.set(APP_CONFIG.STORAGE_KEYS.WALLPAPER, legacyWallpaperUrl),
      storage.set(APP_CONFIG.STORAGE_KEYS.SETTINGS, getSettingsForStorage(settings)),
    ]);
    return;
  }

  if (settings.wallpaperId !== 'custom') return;

  const wallpaperUrl = await storage.get<string>(APP_CONFIG.STORAGE_KEYS.WALLPAPER, '');
  if (!wallpaperUrl) return;

  const currentSettings = state.get('settings');
  if (currentSettings.wallpaperUrl !== wallpaperUrl) {
    state.set('settings', { ...currentSettings, wallpaperUrl });
  }
}

async function importSettings(file: File): Promise<void> {
  const raw = await file.text();
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data)) return;

  if (isRecord(data.settings)) state.set('settings', sanitizeSettings(data.settings));
  if (Array.isArray(data.favorites)) state.set('favorites', sanitizeFavorites(data.favorites));
  if (Array.isArray(data.pinnedIds)) state.set('pinnedIds', data.pinnedIds.filter(isString));
  if (Array.isArray(data.recentlyVisited)) state.set('recentlyVisited', sanitizeStoredItems(data.recentlyVisited));
}

function sanitizeSettings(value: unknown): DashboardSettings {
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
    accentColor: typeof settings.accentColor === 'string' ? settings.accentColor : APP_CONFIG.DEFAULTS.settings.accentColor,
    clockFormat: optionFrom(settings.clockFormat, ['12h', '24h'], APP_CONFIG.DEFAULTS.settings.clockFormat),
    showGreeting: typeof settings.showGreeting === 'boolean' ? settings.showGreeting : APP_CONFIG.DEFAULTS.settings.showGreeting,
    showClock: typeof settings.showClock === 'boolean' ? settings.showClock : APP_CONFIG.DEFAULTS.settings.showClock,
    showSearch: typeof settings.showSearch === 'boolean' ? settings.showSearch : APP_CONFIG.DEFAULTS.settings.showSearch,
    userName: typeof settings.userName === 'string' ? settings.userName : APP_CONFIG.DEFAULTS.settings.userName,
    gridRows: Math.min(APP_CONFIG.GRID.MAX_ROWS, Math.max(1, gridRows || APP_CONFIG.GRID.DEFAULT_ROWS)),
    cardDensity: settings.cardDensity === 'compact' ? 'compact' : 'comfortable',
  };
}

function getExportableSettings(settings: DashboardSettings): DashboardSettings {
  if (settings.wallpaperUrl.length === 0) return settings;

  return {
    ...settings,
    wallpaperId: APP_CONFIG.DEFAULTS.settings.wallpaperId,
    wallpaperUrl: '',
  };
}

function getSettingsForStorage(settings: DashboardSettings): Omit<DashboardSettings, 'wallpaperUrl'> {
  return {
    dashboardView: settings.dashboardView,
    wallpaperId: settings.wallpaperId,
    accentColor: settings.accentColor,
    clockFormat: settings.clockFormat,
    showGreeting: settings.showGreeting,
    showClock: settings.showClock,
    showSearch: settings.showSearch,
    gridRows: settings.gridRows,
    cardDensity: settings.cardDensity,
    userName: settings.userName,
  };
}

function optionFrom<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && options.includes(value as T) ? (value as T) : fallback;
}

function sanitizeFavorites(value: unknown[]): BookmarkItem[] {
  return value
    .map((item, index) => sanitizeFavorite(item, index))
    .filter((favorite): favorite is BookmarkItem => favorite !== undefined);
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

function sanitizeStoredItems(value: unknown[]): BookmarkItem[] {
  return value
    .map(sanitizeStoredItem)
    .filter((item): item is BookmarkItem => item !== undefined);
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

function normalizeFavoriteUrl(value: string): string {
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

function createFavoriteId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `favorite-${crypto.randomUUID()}`;
  }

  return `favorite-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isDashboardView(value: unknown): value is DashboardSettings['dashboardView'] {
  return value === 'favorites' || value === 'bookmarks' || value === 'folders';
}
