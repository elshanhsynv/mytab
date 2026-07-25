import type { BookmarkItem } from "../types";
import { getIconUrl, getInitialAvatar } from "../services/favicon";

const styles = {
    card: "bookmark-card group relative flex w-full flex-col items-center justify-center rounded-2xl bg-white/[0.08] text-center text-white backdrop-blur-xl shadow-lg shadow-black/10 ring-1 ring-white/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.12] hover:shadow-2xl hover:shadow-violet-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 active:scale-[0.98]",

    comfortable: "gap-3 py-3",
    compact: "gap-2 py-2",

    pinned: "border-violet-300/30 bg-violet-500/[0.08]",

    iconWrapper:
        "flex items-center justify-center rounded-2xl bg-white/[0.1] overflow-hidden p-2 transition-all duration-200 group-hover:border-white/20 group-hover:bg-white/[0.2] group-hover:scale-110",

    wrapperComfortable: "size-12",
    wrapperCompact: "size-10",

    icon: "object-contain w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-110",

    title: "max-w-[90%] truncate font-medium tracking-tight text-white/95",

    titleComfortable: "text-xs",
    titleCompact: "text-[11px]",

    pinBadge:
        "absolute left-3 top-3 size-2 rounded-full bg-violet-300 shadow-[0_0_12px_rgba(196,181,253,.8)]",

};

export function createBookmarkCard(
    bookmark: BookmarkItem,
    index = 0,
    density: "comfortable" | "compact" = "comfortable",
): HTMLAnchorElement {
    const card = document.createElement("a");
    const isCompact = density === "compact";

    card.className = `${styles.card} ${isCompact ? styles.compact : styles.comfortable} ${
        bookmark.pinned ? styles.pinned : ""
    }`;

    card.href = bookmark.url;
    card.dataset.bookmarkId = bookmark.id;
    card.draggable = true;

    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Open ${bookmark.title}`);
    card.style.setProperty("--item-index", String(index));

    const wrapper = document.createElement("div");

    wrapper.className = `
    ${styles.iconWrapper}
    ${isCompact ? styles.wrapperCompact : styles.wrapperComfortable}
    p-2
    `;

    const icon = document.createElement("img");

    icon.className = `${styles.icon}`;

    icon.src = bookmark.favicon || getIconUrl(bookmark.url);

    icon.alt = "";

    icon.loading = "lazy";

    icon.decoding = "async";

    icon.draggable = false;

    icon.addEventListener("error", () => {
        icon.onerror = null;
        icon.src = getInitialAvatar(bookmark.title);
    });

    wrapper.append(icon);

    const title = document.createElement("span");
    title.className = `${styles.title} ${
        isCompact ? styles.titleCompact : styles.titleComfortable
    }`;
    title.title = bookmark.title;
    title.textContent = bookmark.title || bookmark.url;

    if (bookmark.pinned) {
        const pin = document.createElement("span");
        pin.className = styles.pinBadge;
        pin.title = "Pinned";
        card.append(pin);
    }

    card.title = getDomain(bookmark.url);
    card.append(wrapper, title);

    return card;
}

function getDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}
