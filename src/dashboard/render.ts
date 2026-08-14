import { createAddFavoriteCard } from "../components/add-favorite-card";
import {
    createBookmarkGrid,
    MAX_STAGGER_INDEX,
} from "../components/bookmark-grid";
import { createClock } from "../components/clock";
import { gridClass, renderFoldersView } from "../components/folder-view";
import { createSearchBar } from "../components/search-bar";
import { createSection } from "../components/section";
import { createSettingsButton } from "../components/settings-modal";
import { createViewSwitch } from "../components/view-switch";
import { state } from "../core/state";
import { bookmarkService } from "../services/bookmarks";
import { getWallpaperBackground } from "../services/wallpapers";
import type { AppState, DashboardSettings } from "../types";
import { searchOrNavigate } from "../utils/helpers";
import {
    getDashboardFolders,
    getGridItemCount,
    sortLauncherItems,
    withPinnedFlags,
} from "./items";
import { dashboardStyles as styles } from "./styles";
import type { VisibleDashboardData } from "./types";

export function renderDashboard(appRoot: HTMLElement): void {
    const settings = state.get("settings");
    document.body.className =
        "min-h-screen overflow-x-hidden bg-slate-950 bg-cover bg-center bg-fixed font-sans antialiased";
    appRoot.replaceChildren(createDashboardShell(settings));
    renderSections(appRoot);
}

export function renderSections(appRoot: HTMLElement): void {
    const content = appRoot.querySelector<HTMLElement>(
        "[data-dashboard-content]",
    );
    if (!content) return;

    const current = state.getState();
    const visibleData = getVisibleDashboardData(current);
    const fragment = document.createDocumentFragment();
    fragment.append(createViewSwitch(visibleData.settings.dashboardView));

    if (visibleData.settings.dashboardView === "folders") {
        fragment.append(
            renderFoldersView(
                visibleData.folders,
                current.activeFolderId,
                visibleData.settings.cardDensity,
            ),
        );
    }

    if (visibleData.settings.dashboardView === "favorites") {
        fragment.append(renderFavoritesView(visibleData, current));
    }

    if (visibleData.settings.dashboardView === "bookmarks") {
        fragment.append(renderBookmarksView(visibleData, current.pinnedIds));
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
    header.className = styles.header;
    header.append(createSettingsButton());

    const hero = document.createElement("div");
    hero.className = styles.hero;
    hero.dataset.dashboardHero = "true";
    hero.append(createClock(settings));

    if (settings.showSearch) {
        hero.append(
            createSearchBar(
                searchOrNavigate,
            ),
        );
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
        itemCount: getGridItemCount(settings.gridRows),
        favorites,
        bookmarks,
        folders: getDashboardFolders(current, visibleBookmarkIds),
    };
}

function renderFavoritesView(
    data: VisibleDashboardData,
    current: Readonly<AppState>,
): HTMLElement {
    const sites = sortLauncherItems(data.favorites, current.pinnedIds).slice(
        0,
        data.itemCount,
    );
    const grid = createBookmarkGrid(
        sites,
        gridClass(data.settings.cardDensity),
        data.settings.cardDensity,
    );

    if (
        !current.searchQuery.trim() &&
        current.favorites.length < data.itemCount
    ) {
        grid.append(
            createAddFavoriteCard(
                data.settings.cardDensity,
                Math.min(data.favorites.length, MAX_STAGGER_INDEX),
            ),
        );
    }

    return createSection("", grid, "No favorites match your search.");
}

function renderBookmarksView(
    data: VisibleDashboardData,
    pinnedIds: string[],
): HTMLElement {
    const sites = sortLauncherItems(data.bookmarks, pinnedIds).slice(
        0,
        data.itemCount,
    );
    return createSection(
        "",
        createBookmarkGrid(
            sites,
            gridClass(data.settings.cardDensity),
            data.settings.cardDensity,
        ),
        "No bookmarks match your search.",
    );
}
