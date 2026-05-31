import { createBookmarkGrid } from '../components/bookmark-grid';
import { createClock } from '../components/clock';
import { createFolderCard } from '../components/folder-card';
import { icons } from '../components/icons';
import { createSearchBar } from '../components/search-bar';
import { createSection } from '../components/section';
import { state } from '../core/state';
import { bookmarkService } from '../services/bookmarks';
import { getWallpaperBackground } from '../services/wallpapers';
import type { AppState, DashboardSettings, Folder } from '../types';
import {
  getDashboardFolders,
  getGridItemCount,
  sortLauncherItems,
  withPinnedFlags,
} from './items';
import { dashboardStyles as styles } from './styles';
import type { CardDensity, DashboardView, VisibleDashboardData } from './types';
import { DASHBOARD_VIEWS, VIEW_LABELS } from './types';

export function renderDashboard(appRoot: HTMLElement): void {
  const settings = state.get('settings');
  document.body.className = 'min-h-screen overflow-x-hidden bg-slate-950 bg-cover bg-center bg-fixed font-sans antialiased';
  appRoot.replaceChildren(createDashboardShell(settings));
  renderSections(appRoot);
}

export function renderSections(appRoot: HTMLElement): void {
  const content = appRoot.querySelector<HTMLElement>('[data-dashboard-content]');
  if (!content) return;

  const current = state.getState();
  const visibleData = getVisibleDashboardData(current);
  const fragment = document.createDocumentFragment();
  fragment.append(createViewSwitch(visibleData.settings.dashboardView));

  if (visibleData.settings.dashboardView === 'folders') {
    fragment.append(renderFoldersView(visibleData.folders, current.activeFolderId, visibleData.settings.cardDensity));
  }

  if (visibleData.settings.dashboardView === 'favorites') {
    fragment.append(renderFavoritesView(visibleData, current));
  }

  if (visibleData.settings.dashboardView === 'bookmarks') {
    fragment.append(renderBookmarksView(visibleData, current.pinnedIds));
  }

  content.replaceChildren(fragment);
}

export function applyAppearance(settings: DashboardSettings): void {
  document.body.style.backgroundImage = getWallpaperBackground(settings.wallpaperId, settings.wallpaperUrl);
}

function createDashboardShell(settings: DashboardSettings): HTMLElement {
  const dashboard = document.createElement('main');
  dashboard.className = styles.dashboard;

  const header = document.createElement('header');
  header.className = styles.header;
  header.append(createSettingsButton());

  const hero = document.createElement('div');
  hero.className = styles.hero;
  hero.dataset.dashboardHero = 'true';
  hero.append(createClock(settings));

  if (settings.showSearch) {
    hero.append(createSearchBar((query) => state.set('searchQuery', query)));
  }

  const content = document.createElement('div');
  content.className = styles.content;
  content.dataset.dashboardContent = 'true';

  dashboard.append(header, hero, content);
  return dashboard;
}

function createSettingsButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = styles.settingsButton;
  button.type = 'button';
  button.dataset.action = 'open-settings';
  button.setAttribute('aria-label', 'Open settings');
  button.innerHTML = icons.settings;
  return button;
}

function getVisibleDashboardData(current: Readonly<AppState>): VisibleDashboardData {
  const settings = current.settings;
  const favorites = bookmarkService.search(withPinnedFlags(current.favorites, current.pinnedIds), current.searchQuery);
  const bookmarks = bookmarkService.search(withPinnedFlags(current.bookmarks, current.pinnedIds), current.searchQuery);
  const visibleBookmarkIds = new Set(bookmarks.map((item) => item.id));

  return {
    settings,
    itemCount: getGridItemCount(settings.gridRows),
    favorites,
    bookmarks,
    folders: getDashboardFolders(current, visibleBookmarkIds),
  };
}

function renderFoldersView(folders: Folder[], activeFolderId: string, density: CardDensity): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const activeFolder = folders.find((folder) => folder.id === activeFolderId);

  if (activeFolder) {
    fragment.append(createFolderHeader(activeFolder.title));
    fragment.append(createSection('', createBookmarkGrid(activeFolder.items, gridClass(density), density), 'No websites match your search.'));
    return fragment;
  }

  const folderGrid = document.createElement('div');
  folderGrid.className = styles.folderGrid;
  folders.forEach((folder) => folderGrid.append(createFolderCard(folder)));
  fragment.append(createSection('', folderGrid, 'No folders match your search.'));
  return fragment;
}

function createFolderHeader(titleText: string): HTMLElement {
  const header = document.createElement('div');
  header.className = styles.folderHeader;

  const backButton = document.createElement('button');
  backButton.className = styles.backButton;
  backButton.type = 'button';
  backButton.dataset.action = 'close-folder';
  backButton.textContent = 'Back to folders';

  const title = document.createElement('span');
  title.className = styles.folderTitle;
  title.textContent = titleText;

  header.append(backButton, title);
  return header;
}

function renderFavoritesView(data: VisibleDashboardData, current: Readonly<AppState>): HTMLElement {
  const sites = sortLauncherItems(data.favorites, current.pinnedIds).slice(0, data.itemCount);
  const grid = createBookmarkGrid(sites, gridClass(data.settings.cardDensity), data.settings.cardDensity);

  if (!current.searchQuery.trim() && current.favorites.length < data.itemCount) {
    grid.append(createAddFavoriteCard(data.settings.cardDensity));
  }

  return createSection('', grid, 'No favorites match your search.');
}

function renderBookmarksView(data: VisibleDashboardData, pinnedIds: string[]): HTMLElement {
  const sites = sortLauncherItems(data.bookmarks, pinnedIds).slice(0, data.itemCount);
  return createSection('', createBookmarkGrid(sites, gridClass(data.settings.cardDensity), data.settings.cardDensity), 'No bookmarks match your search.');
}

function createViewSwitch(activeView: DashboardView): HTMLElement {
  const switcher = document.createElement('div');
  switcher.className = styles.viewSwitch;
  switcher.setAttribute('aria-label', 'Dashboard view');

  for (const view of DASHBOARD_VIEWS) {
    switcher.append(createViewButton(view, activeView));
  }

  return switcher;
}

function createViewButton(view: DashboardView, activeView: DashboardView): HTMLButtonElement {
  const button = document.createElement('button');
  const isActive = view === activeView;
  button.className = `${styles.viewButton} ${isActive ? styles.viewButtonActive : ''}`;
  button.type = 'button';
  button.dataset.view = view;
  button.setAttribute('aria-pressed', String(isActive));
  button.textContent = VIEW_LABELS[view];
  return button;
}

function createAddFavoriteCard(density: CardDensity): HTMLButtonElement {
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

function gridClass(density: CardDensity): string {
  return density === 'compact' ? styles.launcherGridCompact : styles.launcherGrid;
}
