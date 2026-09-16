import { createAddFavoriteCard } from "../components/add-favorite-card";
import {
    createBookmarkGrid,
    MAX_STAGGER_INDEX,
} from "../components/bookmark-grid";
import { createClock } from "../components/clock";
import { gridClass, renderFoldersView } from "../components/folder-view";
import { createGreeting } from "../components/greeting";
import { createPagination } from "../components/pagination";
import { createSearchBar } from "../components/search-bar";
import { createSection } from "../components/section";

import { createSettingsButton } from "../components/settings-modal";
import { createViewSwitch } from "../components/view-switch";
import { state } from "../core/state";
import { bookmarkService } from "../services/bookmarks";
import { getWallpaperBackground } from "../services/wallpapers";
import type { AppState, DashboardSettings } from "../types";
import { getPageWindow, type PageWindow } from "../utils/pagination";
import {
    getDashboardFolders,
    getGridPageSize,
    sortLauncherItems,
    withPinnedFlags,
} from "./items";
import { dashboardStyles as styles } from "./styles";
import type { VisibleDashboardData } from "./types";

type PaginatedView = "favorites" | "bookmarks";

const dashboardPages: Record<PaginatedView, number> = {
    favorites: 0,
    bookmarks: 0,
};

let paginationQuery = "";
const folderPages = new Map<string, number>();
let sectionsController: AbortController | undefined;

export function renderDashboard(appRoot: HTMLElement): void {
    const settings = state.get("settings");
    document.body.className =
        "min-h-screen overflow-x-hidden bg-slate-950 bg-cover bg-center bg-fixed font-sans antialiased";
    appRoot.replaceChildren(createDashboardShell(settings));
    renderSections(appRoot);
}

export function renderSections(appRoot: HTMLElement): void {
    sectionsController?.abort();
    sectionsController = undefined;

    const content = appRoot.querySelector<HTMLElement>(
        "[data-dashboard-content]",
    );
    if (!content) return;

    const controller = new AbortController();
    sectionsController = controller;
    const current = state.getState();
    resetPaginationForQuery(current.searchQuery);
    const visibleData = getVisibleDashboardData(current);
    const fragment = document.createDocumentFragment();
    fragment.append(createViewSwitch(visibleData.settings.dashboardView));

    if (visibleData.settings.dashboardView === "folders") {
        fragment.append(
            renderFoldersView(
                {
                    folders: visibleData.folders,
                    activeFolderId: current.activeFolderId,
                    density: visibleData.settings.cardDensity,
                    columns: visibleData.settings.gridColumns,
                    itemsPerPage: visibleData.itemsPerPage,
                    currentPage: folderPages.get(current.activeFolderId) ?? 0,
                    onPageChange: (selectedPage) => {
                        folderPages.set(current.activeFolderId, selectedPage);
                        renderSections(appRoot);
                    },
                    signal: controller.signal,
                },
            ),
        );
    }

    if (visibleData.settings.dashboardView === "favorites") {
        fragment.append(
            renderFavoritesView(appRoot, visibleData, current, controller.signal),
        );
    }

    if (visibleData.settings.dashboardView === "bookmarks") {
        fragment.append(
            renderBookmarksView(
                appRoot,
                visibleData,
                current.pinnedIds,
                controller.signal,
            ),
        );
    }

    content.replaceChildren(fragment);
}

export function applyAppearance(settings: DashboardSettings): void {
    document.body.style.backgroundImage = getWallpaperBackground(
        settings.wallpaperId,
        settings.wallpaperUrl,
    );
}

function createDashboardShell(
    settings: DashboardSettings,
): HTMLElement {
    const dashboard = document.createElement("main");
    dashboard.className = styles.dashboard;

    const header = document.createElement("header");

    header.className = [
        styles.header,
        settings.showGreeting
            ? styles.headerWithGreeting
            : styles.headerWithoutGreeting,
    ].join(" ");

    if (settings.showGreeting) {
        header.append(createGreeting(settings));
    }

    header.append(createSettingsButton());

    const hero = document.createElement("div");
    hero.className = styles.hero;
    hero.dataset.dashboardHero = "true";

    hero.append(createClock(settings));

    if (settings.showSearch) {
        hero.append(createSearchBar());
    }

    const content = document.createElement("div");
    content.className = styles.content;
    content.dataset.dashboardContent = "true";

    dashboard.append(header, hero, content);

    return dashboard;
}

function getVisibleDashboardData(
    current: Readonly<AppState>,
): VisibleDashboardData {
    const settings = current.settings;
    const favorites = bookmarkService.search(
        withPinnedFlags(current.favorites, current.pinnedIds),
        current.searchQuery,
    );
    const bookmarks = bookmarkService.search(
        withPinnedFlags(current.bookmarks, current.pinnedIds),
        current.searchQuery,
    );
    const visibleBookmarkIds = new Set(bookmarks.map((item) => item.id));

    return {
        settings,
        itemsPerPage: getGridPageSize(
            settings.gridRows,
            settings.gridColumns,
        ),
        favorites,
        bookmarks,
        folders: getDashboardFolders(current, visibleBookmarkIds),
    };
}

function renderFavoritesView(
    appRoot: HTMLElement,
    data: VisibleDashboardData,
    current: Readonly<AppState>,
    signal: AbortSignal,
): HTMLElement {
    const sites = sortLauncherItems(data.favorites, current.pinnedIds);
    const isSearching = current.searchQuery.trim().length > 0;
    const page = getDashboardPageWindow(
        "favorites",
        sites.length + (isSearching ? 0 : 1),
        data.itemsPerPage,
    );
    const grid = createBookmarkGrid(
        sites.slice(page.start, Math.min(page.end, sites.length)),
        gridClass(data.settings.cardDensity),
        data.settings.cardDensity,
        data.settings.gridColumns,
    );

    if (!isSearching && page.start <= sites.length && page.end > sites.length) {
        grid.append(
            createAddFavoriteCard(
                data.settings.cardDensity,
                Math.min(sites.length, MAX_STAGGER_INDEX),
            ),
        );
    }

    return createPaginatedSection(
        grid,
        page,
        "No favorites match your search.",
        (selectedPage) => {
            dashboardPages.favorites = selectedPage;
            renderSections(appRoot);
        },
        signal,
    );
}

function renderBookmarksView(
    appRoot: HTMLElement,
    data: VisibleDashboardData,
    pinnedIds: string[],
    signal: AbortSignal,
): HTMLElement {
    const sites = sortLauncherItems(data.bookmarks, pinnedIds);
    const page = getDashboardPageWindow(
        "bookmarks",
        sites.length,
        data.itemsPerPage,
    );
    const grid = createBookmarkGrid(
        sites.slice(page.start, page.end),
        gridClass(data.settings.cardDensity),
        data.settings.cardDensity,
        data.settings.gridColumns,
    );
    return createPaginatedSection(
        grid,
        page,
        "No bookmarks match your search.",
        (selectedPage) => {
            dashboardPages.bookmarks = selectedPage;
            renderSections(appRoot);
        },
        signal,
    );
}

function resetPaginationForQuery(query: string): void {
    if (query === paginationQuery) return;

    paginationQuery = query;
    dashboardPages.favorites = 0;
    dashboardPages.bookmarks = 0;
    folderPages.clear();
}

function getDashboardPageWindow(
    view: PaginatedView,
    itemCount: number,
    itemsPerPage: number,
): PageWindow {
    const page = getPageWindow(itemCount, itemsPerPage, dashboardPages[view]);
    dashboardPages[view] = page.currentPage;
    return page;
}

function createPaginatedSection(
    grid: HTMLElement,
    page: PageWindow,
    emptyText: string,
    onPageChange: (page: number) => void,
    signal: AbortSignal,
): HTMLElement {
    const pagination = createPagination({
        currentPage: page.currentPage,
        pageCount: page.pageCount,
        onPageChange,
        signal,
    });
    if (!pagination) return createSection("", grid, emptyText);

    const content = document.createElement("div");
    content.append(grid, pagination);
    return createSection("", content, emptyText);
}
