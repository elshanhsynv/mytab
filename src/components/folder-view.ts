import type { CardDensity } from "../dashboard/types";
import type { Folder } from "../types";
import { createBookmarkGrid } from "./bookmark-grid";
import { createFolderCard } from "./folder-card";
import { createSection } from "./section";
import { ArrowLeft, createElement } from "lucide";

const styles = {
    folderGrid:
        "mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(2,minmax(0,128px))] sm:gap-5 sm:[grid-template-columns:repeat(4,minmax(0,142px))]",
    folderHeader: "mb-4 flex px-10 items-center justify-between",
    backButton:
        "inline-flex items-center rounded-full gap-1.5 border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/75 shadow-lg backdrop-blur-xl transition hover:bg-white/15 hover:text-white",
    folderTitle: "truncate text-sm font-semibold text-white/70",
    launcherGrid:
        "mx-auto grid w-full justify-center gap-3 [grid-template-columns:repeat(3,minmax(0,92px))] sm:gap-4 sm:[grid-template-columns:repeat(5,minmax(0,104px))] lg:[grid-template-columns:repeat(7,minmax(0,112px))] xl:[grid-template-columns:repeat(7,minmax(0,118px))]",
    launcherGridCompact:
        "mx-auto grid w-full justify-center gap-2 [grid-template-columns:repeat(3,minmax(0,78px))] sm:gap-3 sm:[grid-template-columns:repeat(5,minmax(0,88px))] lg:[grid-template-columns:repeat(7,minmax(0,96px))] xl:[grid-template-columns:repeat(7,minmax(0,104px))]",
};

export function renderFoldersView(
    folders: Folder[],
    activeFolderId: string,
    density: CardDensity,
): DocumentFragment {
    const fragment = document.createDocumentFragment();
    const activeFolder = folders.find((folder) => folder.id === activeFolderId);

    if (activeFolder) {
        fragment.append(createFolderHeader(activeFolder.title));
        fragment.append(
            createSection(
                "",
                createBookmarkGrid(
                    activeFolder.items,
                    gridClass(density),
                    density,
                ),
                "No websites match your search.",
            ),
        );
        return fragment;
    }

    const folderGrid = document.createElement("div");
    folderGrid.className = styles.folderGrid;
    folders.forEach((folder) => folderGrid.append(createFolderCard(folder)));
    fragment.append(
        createSection("", folderGrid, "No folders match your search."),
    );
    return fragment;
}


function createFolderHeader(titleText: string): HTMLElement {
    const header = document.createElement("div");
    header.className = styles.folderHeader;

    const backButton = document.createElement("button");
    backButton.className = styles.backButton;
    backButton.type = "button";
    backButton.dataset.action = "close-folder";

    const icon = createElement(ArrowLeft, {
        width: 16,
        height: 16,
        "aria-hidden": "true",
    });

    backButton.append(icon, document.createTextNode("Back to folders"));

    const title = document.createElement("span");
    title.className = styles.folderTitle;
    title.textContent = titleText;

    header.append(backButton, title);
    return header;
}

export function gridClass(density: CardDensity): string {
    return density === "compact"
        ? styles.launcherGridCompact
        : styles.launcherGrid;
}
