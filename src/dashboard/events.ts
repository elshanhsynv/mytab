import { showContextMenu } from "../components/context-menu";
import { showFavoriteModal } from "../components/favorite-modal";
import { showSettingsModal } from "../components/settings-modal";
import { delegate } from "../core/events";
import { state } from "../core/state";
import {
  addFavorite,
  addRecent,
  exportSettings,
  findDashboardItem,
  handleContextAction,
  importSettings,
  reorderBookmarks,
} from "./actions";
import type { DashboardView, DragState } from "./types";
import { DASHBOARD_VIEWS } from "./types";

export function bindDashboardEvents(appRoot: HTMLElement): void {
  bindModalEvents(appRoot);
  bindNavigationEvents(appRoot);
  bindBookmarkEvents(appRoot, createDragState());
  bindKeyboardShortcuts(appRoot);
}

function bindModalEvents(appRoot: HTMLElement): void {
  delegate(appRoot, '[data-action="add-favorite"]', "click", () => {
    showFavoriteModal({
      onSave: (favorite) => addFavorite(favorite),
    });
  });

  delegate(appRoot, '[data-action="open-settings"]', "click", () => {
    showSettingsModal({
      settings: state.get("settings"),
      onSave: (settings) => state.set("settings", settings),
      onExport: exportSettings,
      onImport: importSettings,
    });
  });
}

function bindNavigationEvents(appRoot: HTMLElement): void {
  delegate(appRoot, "[data-view]", "click", (_event, target) => {
    const view = getDatasetValue(target, "view");
    if (!isDashboardView(view)) return;

    state.set("activeFolderId", "");
    state.set("settings", { ...state.get("settings"), dashboardView: view });
  });

  delegate(appRoot, ".folder-card", "click", (_event, target) => {
    const folderId = getDatasetValue(target, "folderId");
    if (folderId) state.set("activeFolderId", folderId);
  });

  delegate(appRoot, '[data-action="close-folder"]', "click", () => {
    state.set("activeFolderId", "");
  });

  delegate(
    appRoot,
    '[data-action="toggle-folder"]',
    "click",
    (_event, target) => {
      const card = target.closest<HTMLElement>(".folder-card");
      if (!card) return;

      card.classList.toggle("folder-card--collapsed");
      const expanded = !card.classList.contains("folder-card--collapsed");
      target.setAttribute("aria-expanded", String(expanded));
    },
  );
}

function bindBookmarkEvents(appRoot: HTMLElement, dragState: DragState): void {
  delegate(appRoot, ".bookmark-card", "click", (event, target) => {
    if (dragState.suppressNextCardClick) {
      event.preventDefault();
      event.stopPropagation();
      dragState.suppressNextCardClick = false;
      return;
    }

    const bookmark = findDashboardItem(getBookmarkId(target));
    if (bookmark) addRecent(bookmark);
  });

  delegate(appRoot, ".bookmark-card", "contextmenu", (event, target) => {
    event.preventDefault();
    const bookmark = findDashboardItem(getBookmarkId(target));
    if (!bookmark || !(event instanceof MouseEvent)) return;

    showContextMenu(
      bookmark,
      { x: event.clientX, y: event.clientY },
      handleContextAction,
    );
  });

  delegate(appRoot, ".bookmark-card", "pointerdown", (event, target) => {
    if (!(event instanceof PointerEvent) || event.button !== 0) return;

    dragState.pointerDragId = getBookmarkId(target);
    dragState.pointerOverId = dragState.pointerDragId;
    dragState.pointerStartX = event.clientX;
    dragState.pointerStartY = event.clientY;
    dragState.pointerMoved = false;
  });

  delegate(appRoot, ".bookmark-card", "pointermove", (event, target) => {
    if (!(event instanceof PointerEvent) || !dragState.pointerDragId) return;

    const dx = Math.abs(event.clientX - dragState.pointerStartX);
    const dy = Math.abs(event.clientY - dragState.pointerStartY);
    dragState.pointerMoved = dragState.pointerMoved || dx > 8 || dy > 8;
    dragState.pointerOverId = getBookmarkId(target);
  });

  delegate(appRoot, ".bookmark-card", "pointerup", (event, target) => {
    if (!dragState.pointerDragId) return;

    const dropTarget =
      event instanceof PointerEvent
        ? document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>(".bookmark-card")
        : target.closest<HTMLElement>(".bookmark-card");
    const targetId = dropTarget?.dataset.bookmarkId || dragState.pointerOverId;
    if (
      dragState.pointerMoved &&
      targetId &&
      dragState.pointerDragId !== targetId
    ) {
      event.preventDefault();
      dragState.dropHandled = true;
      dragState.suppressNextCardClick = true;
      reorderBookmarks(dragState.pointerDragId, targetId);
    }

    dragState.pointerDragId = "";
    dragState.pointerOverId = "";
    dragState.pointerMoved = false;
  });

  delegate(appRoot, ".bookmark-card", "dragstart", (event, target) => {
    dragState.draggedId = getBookmarkId(target);
    dragState.dragOverId = "";
    dragState.dropHandled = false;

    if (event instanceof DragEvent && event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", dragState.draggedId);
    }

    target.classList.add("opacity-50", "scale-105");
  });

  delegate(appRoot, ".bookmark-card", "dragend", (event, target) => {
    const dropTarget =
      event instanceof DragEvent
        ? document
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>(".bookmark-card")
        : null;
    const targetId = dropTarget?.dataset.bookmarkId || dragState.dragOverId;

    if (
      !dragState.dropHandled &&
      dragState.draggedId &&
      targetId &&
      dragState.draggedId !== targetId
    ) {
      reorderBookmarks(dragState.draggedId, targetId);
    }

    target.classList.remove("opacity-50", "scale-105");
    dragState.draggedId = "";
    dragState.dragOverId = "";
    dragState.dropHandled = false;
  });

  delegate(appRoot, ".bookmark-card", "dragenter", (_event, target) => {
    dragState.dragOverId = getBookmarkId(target);
  });

  delegate(appRoot, ".bookmark-card", "dragover", (event) => {
    event.preventDefault();
    const target =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>(".bookmark-card")
        : null;
    dragState.dragOverId = target?.dataset.bookmarkId ?? dragState.dragOverId;

    if (event instanceof DragEvent && event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  });

  delegate(appRoot, ".bookmark-card", "drop", (event, target) => {
    event.preventDefault();
    const targetId = getBookmarkId(target);
    const sourceId =
      event instanceof DragEvent
        ? event.dataTransfer?.getData("text/plain") || dragState.draggedId
        : dragState.draggedId;

    if (sourceId && sourceId !== targetId) {
      dragState.dropHandled = true;
      reorderBookmarks(sourceId, targetId);
    }
  });
}

function bindKeyboardShortcuts(appRoot: HTMLElement): void {
  document.addEventListener("keydown", (event) => {
    if (event.key === "," && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      appRoot
        .querySelector<HTMLElement>('[data-action="open-settings"]')
        ?.click();
    }
  });
}

function createDragState(): DragState {
  return {
    suppressNextCardClick: false,
    draggedId: "",
    dragOverId: "",
    dropHandled: false,
    pointerDragId: "",
    pointerOverId: "",
    pointerStartX: 0,
    pointerStartY: 0,
    pointerMoved: false,
  };
}

function getBookmarkId(target: Element): string {
  return getDatasetValue(target, "bookmarkId");
}

function getDatasetValue(target: Element, key: string): string {
  return target instanceof HTMLElement ? (target.dataset[key] ?? "") : "";
}

function isDashboardView(value: unknown): value is DashboardView {
  return (
    typeof value === "string" &&
    (DASHBOARD_VIEWS as readonly string[]).includes(value)
  );
}
