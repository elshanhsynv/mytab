import type { ContextAction } from "../dashboard/types";
import type { BookmarkItem } from "../types";
import { icons } from "./icons";

type MaybePromise<T> = T | Promise<T>;

const styles = {
    menu: [
        "context-menu",
        "fixed z-50 min-w-56 overflow-hidden rounded-xl",
        "border border-zinc-800/80",
        "bg-zinc-900/95",
        "backdrop-blur-md",
        "p-1",
        "animate-in fade-in zoom-in-95 duration-100",
    ].join(" "),

    item: [
        "group flex w-full items-center gap-3 rounded-lg",
        "px-3 py-2",
        "text-left text-sm font-medium",
        "text-zinc-300",
        "transition-colors duration-100",
        "hover:bg-zinc-800",
        "hover:text-white",
        "focus:bg-zinc-800",
        "focus:text-white",
        "outline-none",
    ].join(" "),

    danger: [
        "text-red-400",
        "hover:bg-red-500/10",
        "hover:text-red-300",
        "focus:bg-red-500/10",
        "focus:text-red-300",
    ].join(" "),

    icon: [
        "flex size-4 shrink-0 items-center justify-center",
        "text-zinc-500",
        "group-hover:text-zinc-300",
        "[&_svg]:size-full",
    ].join(" "),

    label: "flex-1",

    shortcut: "ml-6 text-xs text-zinc-500",

    separator: "my-1 border-t border-zinc-800",
};

export function showContextMenu(
    bookmark: BookmarkItem,
    position: { x: number; y: number },
    onAction: (
        action: ContextAction,
        bookmark: BookmarkItem,
    ) => MaybePromise<void>,
): void {
    closeContextMenu();

    const menu = document.createElement("div");
    menu.className = styles.menu;
    menu.setAttribute("role", "menu");
    const itemType = bookmark.source === "favorite" ? "favorite" : "bookmark";
    menu.innerHTML = `
    ${item("open-new-tab", icons.external, "Open in new tab")}
    ${item("pin", icons.pin, bookmark.pinned ? "Unpin" : "Pin")}
    ${itemType === "bookmark" ? item("add-to-favorites", icons.star, "Add to favorites") : ""}
    ${item("edit", icons.edit, `Edit ${itemType}`)}
    ${item("copy", icons.copy, "Copy URL")}
    <div class="${styles.separator}"></div>
    ${item("delete", icons.trash, `Remove ${itemType}`, true)}
  `;

    document.body.append(menu);
    const rect = menu.getBoundingClientRect();
    const x = Math.min(position.x, window.innerWidth - rect.width - 8);
    const y = Math.min(position.y, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, x)}px`;
    menu.style.top = `${Math.max(8, y)}px`;

    // Closing the menu (any way, including opening another one) removes these.
    const controller = new AbortController();
    menuController = controller;
    const { signal } = controller;

    const clickHandler = (event: MouseEvent) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(
            "[data-context-action]",
        );
        if (target) {
            void Promise.resolve(
                onAction(
                    target.dataset.contextAction as ContextAction,
                    bookmark,
                ),
            ).catch((error: unknown) => {
                console.error("Context menu action failed.", error);
            });
            closeContextMenu();
            return;
        }

        if (!menu.contains(event.target as Node)) {
            closeContextMenu();
        }
    };

    const keyHandler = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
            closeContextMenu();
        }
    };

    // Wait a tick so the click that opened the menu doesn't close it. If the
    // menu is closed before then, the aborted signal makes these no-ops.
    window.setTimeout(() => {
        document.addEventListener("click", clickHandler, { signal });
        document.addEventListener("keydown", keyHandler, { signal });
    }, 0);
}

let menuController: AbortController | undefined;

export function closeContextMenu(): void {
    menuController?.abort();
    menuController = undefined;
    document.querySelector(".context-menu")?.remove();
}

function item(
    action: ContextAction,
    iconMarkup: string,
    label: string,
    danger = false,
): string {
    return `
    <button class="${styles.item} ${danger ? styles.danger : ""}" type="button" role="menuitem" data-context-action="${action}">
      <span class="${styles.icon}">${iconMarkup}</span>
      <span class="${styles.label}">${label}</span>
    </button>
  `;
}
