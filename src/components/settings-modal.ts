import { APP_CONFIG, EXTENSION_AUTHOR, EXTENSION_DESCRIPTION, EXTENSION_NAME, EXTENSION_VERSION } from "../config";
import type { SearchEngineId } from "../config";
import { SEARCH_ENGINE_OPTIONS } from "../scripts/search-engines";
import {
    getWallpaperOptions,
    getWallpaperPreview,
} from "../services/wallpapers";
import type { DashboardSettings } from "../types";
import {
    createDropdown,
    type Dropdown,
} from "./dropdown";
import { icons } from "./icons";

export type MaybePromise<T> = T | Promise<T>;

export type SettingsModalOptions = {
    settings: DashboardSettings;
    onSave: (settings: DashboardSettings) => MaybePromise<void>;
    onExport: () => MaybePromise<void>;
    onImport: (file: File) => MaybePromise<void>;
};

type SelectOption<T extends string = string> = {
    label: string;
    value: T;
};

type DropdownName =
    | "dashboardView"
    | "gridRows"
    | "cardDensity"
    | "clockFormat"
    | "defaultSearchEngine";

type SettingsDropdowns = {
    dashboardView?: Dropdown<DashboardSettings["dashboardView"]>;
    gridRows?: Dropdown<string>;
    cardDensity?: Dropdown<DashboardSettings["cardDensity"]>;
    clockFormat?: Dropdown<DashboardSettings["clockFormat"]>;
    defaultSearchEngine?: Dropdown<SearchEngineId>;
};

type SectionId = "dashboard" | "appearance" | "about";

type SectionMeta = {
    id: SectionId;
    label: string;
    icon: string;
};

const DASHBOARD_VIEW_OPTIONS = [
    { label: "Favorites", value: "favorites" },
    { label: "Bookmarks", value: "bookmarks" },
    { label: "Folders", value: "folders" },
] as const satisfies readonly SelectOption<
    DashboardSettings["dashboardView"]
>[];

const MIN_SELECTABLE_GRID_ROWS = 3;

const GRID_ROW_OPTIONS: readonly SelectOption<string>[] = Array.from(
    {
        length: Math.max(
            0,
            APP_CONFIG.GRID.MAX_ROWS - MIN_SELECTABLE_GRID_ROWS + 1,
        ),
    },
    (_, index) => {
        const rows = MIN_SELECTABLE_GRID_ROWS + index;
        return {
            label: `${rows} rows x ${APP_CONFIG.GRID.COLUMNS} cols`,
            value: String(rows),
        };
    },
);

const CARD_DENSITY_OPTIONS = [
    { label: "Comfortable", value: "comfortable" },
    { label: "Compact", value: "compact" },
] as const satisfies readonly SelectOption<DashboardSettings["cardDensity"]>[];

const CLOCK_FORMAT_OPTIONS = [
    { label: "12-hour", value: "12h" },
    { label: "24-hour", value: "24h" },
] as const satisfies readonly SelectOption<DashboardSettings["clockFormat"]>[];

const MAX_WALLPAPER_WIDTH = 1920;
const MAX_WALLPAPER_HEIGHT = 1080;
const WALLPAPER_QUALITY = 0.82;

const PALETTE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 9 9c0-.55-.45-1-1.02-1h-2.6a2.4 2.4 0 0 1 0-4.8H19a1 1 0 0 0 .92-1.38A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="10.5" r="1.1" fill="currentColor" stroke="none"/></svg>`;
const INFO_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r="0.6" fill="currentColor" stroke="none"/></svg>`;
const REFRESH_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>`;

const SECTIONS: readonly SectionMeta[] = [
    { id: "dashboard", label: "Dashboard", icon: icons.grid },
    { id: "appearance", label: "Appearance", icon: PALETTE_ICON },
    { id: "about", label: "About", icon: INFO_ICON },
];

const styles = {
    settingsButton:
        "inline-flex size-10 items-center justify-center rounded-2xl [&_svg]:size-4",
    settingsContainer:
        "relative rounded-2xl bg-white/10 backdrop-blur-md transition hover:bg-white/15 hover:scale-105",

    overlay:
        "fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 transition-opacity sm:p-6",
    panel:
        "grid h-[min(640px,85vh)] w-full max-w-3xl grid-cols-[220px_1fr] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none",

    sidebar:
        "flex min-h-0 flex-col gap-5 overflow-y-auto border-r border-zinc-800 bg-zinc-950/40 p-5",
    sidebarHeader: "px-1",
    title: "m-0 text-base font-semibold text-zinc-100",
    subtitle: "mt-0.5 text-xs text-zinc-400",
    nav: "flex flex-col gap-1",
    navItem:
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-zinc-800/60 hover:text-zinc-100 [&_svg]:size-4",
    navIcon: "shrink-0",
    sidebarFooter: "mt-auto",
    resetButton:
        "flex w-full items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-800/30 px-3 py-2 text-left text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 [&_svg]:size-3.5",

    content: "flex min-h-0 min-w-0 flex-col",
    closeBar: "flex justify-end px-6 pt-5",
    close:
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/40 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 [&_svg]:size-4",

    body: "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-6 pt-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700",
    panelSection: "flex flex-col gap-4",
    sectionHeading: "m-0 text-base font-semibold text-zinc-100",
    sectionSubtitle: "-mt-3 text-xs text-zinc-400",

    fieldGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    field: "grid gap-1.5",
    label: "text-xs font-medium text-zinc-300",
    inputShell:
        "flex h-9 items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 transition-colors focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700",
    textInput:
        "h-full min-w-0 flex-1 bg-transparent text-xs font-medium text-zinc-200 outline-none placeholder:text-zinc-600",

    subsection: "flex flex-col gap-3",
    subheading: "text-[11px] font-medium uppercase tracking-wider text-zinc-500",
    toggleList: "flex flex-col gap-2",
    toggleRow:
        "flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5",
    toggleLabel: "grid gap-0.5",
    toggleTitle: "text-xs font-medium text-zinc-200",
    toggleDescription: "text-[11px] text-zinc-500",
    toggleInput: "peer sr-only",
    toggleTrack:
        "relative h-5 w-9 shrink-0 rounded-full bg-zinc-700 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/50",

    wallpaperGrid: "grid grid-cols-2 gap-3 sm:grid-cols-4",
    wallpaperCard: "group grid gap-1.5",
    wallpaperInput: "peer sr-only",
    wallpaperPreview:
        "relative block aspect-[1.5/1] w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 bg-cover bg-center transition-colors group-hover:border-zinc-700 peer-checked:border-indigo-500 peer-checked:ring-1 peer-checked:ring-indigo-500 peer-checked:[&_.wallpaper-check]:flex",
    wallpaperUploadPreview:
        "grid cursor-pointer place-items-center border-dashed border-zinc-800 bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
    wallpaperUploadIcon:
        "grid size-7 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 [&_svg]:size-3.5",
    wallpaperCheck:
        "wallpaper-check absolute right-1.5 top-1.5 hidden size-5 items-center justify-center rounded-full bg-indigo-600 text-white [&_svg]:size-3",
    wallpaperName:
        "truncate text-center text-xs font-medium text-zinc-400 transition-colors peer-checked:text-zinc-200",

    aboutCard:
        "flex flex-col divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/40",
    aboutRow: "flex items-center justify-between px-4 py-3",
    aboutValue: "text-xs font-medium text-zinc-300",

    footer:
        "flex flex-wrap items-center gap-2.5 border-t border-zinc-800 bg-zinc-900/80 px-6 py-3.5",
    footerActions: "mr-auto flex flex-wrap items-center gap-2.5",
    secondary:
        "inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700 [&_svg]:size-3.5",
    primary:
        "inline-flex h-8 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 text-xs font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 [&_svg]:size-3.5",
};

export function createSettingsButton(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = styles.settingsContainer;
    const button = document.createElement("button");
    button.className = styles.settingsButton;
    button.type = "button";
    button.dataset.action = "open-settings";
    button.setAttribute("aria-label", "Open settings");
    button.innerHTML = icons.settings;
    container.appendChild(button);
    return container;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeCssString(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/[\n\r\f]/g, "");
}

function cssUrl(value: string): string {
    return `url("${escapeCssString(value)}")`;
}

function clampRows(value: number): number {
    const rows = Number.isFinite(value) ? value : APP_CONFIG.GRID.DEFAULT_ROWS;
    return Math.min(APP_CONFIG.GRID.MAX_ROWS, Math.max(1, rows));
}

function readAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
                return;
            }

            reject(new Error("Selected file could not be read as a data URL."));
        };
        reader.onerror = () =>
            reject(reader.error ?? new Error("Selected file could not be read."));
        reader.readAsDataURL(file);
    });
}

async function readOptimizedWallpaper(file: File): Promise<string> {
    if (file.type === "image/svg+xml") return readAsDataUrl(file);

    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(
            1,
            MAX_WALLPAPER_WIDTH / bitmap.width,
            MAX_WALLPAPER_HEIGHT / bitmap.height,
        );
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) return readAsDataUrl(file);

        context.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await canvasToBlob(canvas);
        return blob ? readAsDataUrl(blob) : readAsDataUrl(file);
    } catch {
        return readAsDataUrl(file);
    }
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, "image/webp", WALLPAPER_QUALITY);
    });
}

function isImageFile(file: File): boolean {
    return file.type === "" || file.type.startsWith("image/");
}

function dropdownField(
    labelText: string,
    name: DropdownName,
): string {
    return `
    <div class="${styles.field}">
      <span class="${styles.label}">${escapeHtml(labelText)}</span>
      <div data-settings-dropdown="${name}"></div>
    </div>`;
}

function toggleRow(
    name: string,
    title: string,
    description: string,
    checked: boolean,
): string {
    return `
    <label class="${styles.toggleRow}">
      <span class="${styles.toggleLabel}">
        <span class="${styles.toggleTitle}">${escapeHtml(title)}</span>
        <span class="${styles.toggleDescription}">${escapeHtml(description)}</span>
      </span>
      <input type="checkbox" class="${styles.toggleInput}" name="${name}" data-toggle="${name}" ${checked ? "checked" : ""} />
      <span class="${styles.toggleTrack}" aria-hidden="true"></span>
    </label>`;
}

function navItem(section: SectionMeta, isActive: boolean): string {
    const stateClasses = isActive
        ? "bg-indigo-500/15 text-indigo-300"
        : "text-zinc-400";

    return `
    <button type="button" class="${styles.navItem} ${stateClasses}" data-nav="${section.id}" aria-current="${isActive}">
      <span class="${styles.navIcon}">${section.icon}</span>
      ${escapeHtml(section.label)}
    </button>`;
}

function wallpaperCards(
    currentWallpaperId: string,
    customWallpaperUrl: string,
): string {
    const presets = getWallpaperOptions()
        .map(
            (wallpaper) => `
    <label class="${styles.wallpaperCard}">
      <input class="${styles.wallpaperInput}" type="radio" name="wallpaperId"
        value="${escapeHtml(wallpaper.id)}" ${wallpaper.id === currentWallpaperId ? "checked" : ""} />
      <span class="${styles.wallpaperPreview}" style="background-image:${escapeHtml(getWallpaperPreview(wallpaper))};">
        <span class="${styles.wallpaperCheck}">${icons.checkCircle}</span>
      </span>
      <span class="${styles.wallpaperName}">${escapeHtml(wallpaper.name)}</span>
    </label>`,
        )
        .join("");

    const hasCustomWallpaper = currentWallpaperId === "custom";
    const hasCustomImage =
        hasCustomWallpaper && customWallpaperUrl.trim().length > 0;
    const previewStyle = hasCustomImage
        ? `background-image:${cssUrl(customWallpaperUrl.trim())};`
        : "";

    return `${presets}
    <div class="${styles.wallpaperCard}">
      <input class="${styles.wallpaperInput}" type="radio" name="wallpaperId" value="custom" ${hasCustomWallpaper ? "checked" : ""} />
      <button
        type="button"
        class="${styles.wallpaperPreview} ${styles.wallpaperUploadPreview}"
        data-custom-trigger
        aria-label="${hasCustomImage ? "Change custom wallpaper" : "Upload a custom wallpaper"}"
      >
        <span data-custom-preview class="absolute inset-0 bg-cover bg-center" style="${escapeHtml(previewStyle)}"></span>
        <span data-custom-upload-icon class="${styles.wallpaperUploadIcon}" style="${hasCustomImage ? "display:none;" : ""}">${icons.plus}</span>
        <span class="${styles.wallpaperCheck}">${icons.checkCircle}</span>
      </button>
      <span class="${styles.wallpaperName}">Custom</span>
    </div>`;
}

function buildDashboardSection(draft: DashboardSettings): string {
    return `
    <section data-panel="dashboard" class="${styles.panelSection}">
      <h3 class="${styles.sectionHeading}">Dashboard layout</h3>
      <p class="${styles.sectionSubtitle}">Customize how your dashboard looks and behaves.</p>

      <div class="${styles.fieldGrid}">
        ${dropdownField("Default view", "dashboardView")}
        ${dropdownField("Grid rows", "gridRows")}
        ${dropdownField("Item density", "cardDensity")}
        ${dropdownField("Clock format", "clockFormat")}
        ${dropdownField("Default search engine", "defaultSearchEngine")}
      </div>

      <div class="${styles.subsection}">
        <h4 class="${styles.subheading}">Widgets</h4>
        <div class="${styles.toggleList}">
          ${toggleRow("showGreeting", "Show greeting", "Display a personalized greeting on your dashboard.", draft.showGreeting)}
          ${toggleRow("showClock", "Show clock", "Display the current time on your dashboard.", draft.showClock)}
          ${toggleRow("showSearch", "Show search bar", "Display the search bar on your dashboard.", draft.showSearch)}
        </div>

        <label class="${styles.field}" data-username-field ${draft.showGreeting ? "" : "hidden"}>
          <span class="${styles.label}">Your name</span>
          <span class="${styles.inputShell}">
            <input class="${styles.textInput}" type="text" name="userName" value="${escapeHtml(draft.userName)}" placeholder="e.g. Alex" maxlength="40" />
          </span>
        </label>
      </div>
    </section>`;
}

function buildAppearanceSection(draft: DashboardSettings): string {
    return `
    <section data-panel="appearance" class="${styles.panelSection}" hidden>
      <h3 class="${styles.sectionHeading}">Appearance</h3>
      <p class="${styles.sectionSubtitle}">Choose a wallpaper that matches your style.</p>
      <div class="${styles.wallpaperGrid}" data-wallpaper-grid>
        ${wallpaperCards(draft.wallpaperId, draft.wallpaperUrl)}
      </div>
      <input
        type="hidden"
        name="wallpaperUrl"
        value="${escapeHtml(draft.wallpaperUrl)}"
        data-wallpaper-url
      />
      <input type="file" accept="image/*" class="hidden" data-wallpaper-file />
    </section>`;
}

function buildAboutSection(): string {
    return `
    <section data-panel="about" class="${styles.panelSection}" hidden>
      <h3 class="${styles.sectionHeading}">About</h3>
      <p class="${styles.sectionSubtitle}">Information about this extension.</p>
      <div class="${styles.aboutCard}">
        <div class="${styles.aboutRow}">
          <span class="${styles.label}">Name</span>
          <span class="${styles.aboutValue}">${EXTENSION_NAME}</span>
        </div>
        <div class="${styles.aboutRow}">
          <span class="${styles.label}">Description</span>
          <span class="${styles.aboutValue}">${EXTENSION_DESCRIPTION}</span>
        </div>
        <div class="${styles.aboutRow}">
          <span class="${styles.label}">Version</span>
          <span class="${styles.aboutValue}">${EXTENSION_VERSION}</span>
        </div>
        <div class="${styles.aboutRow}">
          <span class="${styles.label}">Author</span>
          <span class="${styles.aboutValue}">${EXTENSION_AUTHOR}</span>
        </div>
      </div>
    </section>`;
}

function buildHTML(draft: DashboardSettings): string {
    const navItemsHtml = SECTIONS.map((section, index) =>
        navItem(section, index === 0),
    ).join("");

    return `
    <form class="${styles.panel}" role="dialog" aria-modal="true" aria-labelledby="sm-title" tabindex="-1">
      <aside class="${styles.sidebar}">
        <div class="${styles.sidebarHeader}">
          <h2 id="sm-title" class="${styles.title}">Settings</h2>
          <p class="${styles.subtitle}">Customize your new tab</p>
        </div>
        <nav class="${styles.nav}" aria-label="Settings sections" data-section-nav>
          ${navItemsHtml}
        </nav>
        <div class="${styles.sidebarFooter}">
          <button type="button" class="${styles.resetButton}" data-reset>
            ${REFRESH_ICON} Reset to defaults
          </button>
        </div>
      </aside>

      <div class="${styles.content}">
        <div class="${styles.closeBar}">
          <button class="${styles.close}" type="button" data-close aria-label="Close settings">${icons.x}</button>
        </div>

        <div class="${styles.body}">
          ${buildDashboardSection(draft)}
          ${buildAppearanceSection(draft)}
          ${buildAboutSection()}
        </div>

        <footer class="${styles.footer}">
          <div class="${styles.footerActions}">
            <button class="${styles.secondary}" type="button" data-export>
              ${icons.download} Export
            </button>
            <label class="${styles.secondary}">
              ${icons.upload} Import
              <input type="file" accept="application/json" data-import class="hidden" />
            </label>
          </div>
          <button class="${styles.secondary}" type="button" data-close>Cancel</button>
          <button class="${styles.primary}" type="submit">
            ${icons.checkCircle} Save changes
          </button>
        </footer>
      </div>
    </form>`;
}

let closeActiveModal: (() => void) | undefined;

function bindSectionNav(root: HTMLElement, signal: AbortSignal): void {
    const nav = root.querySelector<HTMLElement>("[data-section-nav]");
    const panels = root.querySelectorAll<HTMLElement>("[data-panel]");
    if (!nav) return;

    nav.addEventListener(
        "click",
        (event) => {
            const button = (event.target as HTMLElement).closest<HTMLButtonElement>(
                "[data-nav]",
            );
            if (!button) return;

            const targetId = button.dataset.nav;
            nav
                .querySelectorAll<HTMLButtonElement>("[data-nav]")
                .forEach((navButton) => setNavActive(navButton, navButton === button));
            panels.forEach((panel) => {
                panel.hidden = panel.dataset.panel !== targetId;
            });
        },
        { signal },
    );
}

function setNavActive(button: HTMLButtonElement, active: boolean): void {
    button.setAttribute("aria-current", active ? "true" : "false");
    button.classList.toggle("bg-indigo-500/15", active);
    button.classList.toggle("text-indigo-300", active);
    button.classList.toggle("text-zinc-400", !active);
}

function bindGreetingToggle(root: HTMLElement, signal: AbortSignal): void {
    const toggle = root.querySelector<HTMLInputElement>(
        '[data-toggle="showGreeting"]',
    );
    const usernameField = root.querySelector<HTMLElement>(
        "[data-username-field]",
    );
    if (!toggle || !usernameField) return;

    toggle.addEventListener(
        "change",
        () => {
            usernameField.hidden = !toggle.checked;
        },
        { signal },
    );
}

function bindWallpaperSelection(root: HTMLElement, signal: AbortSignal): void {
    const grid = root.querySelector<HTMLElement>("[data-wallpaper-grid]");

    grid?.addEventListener(
        "change",
        (event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || target.name !== "wallpaperId")
                return;
            if (target.value === "custom") return;

            const urlInput = root.querySelector<HTMLInputElement>(
                "[data-wallpaper-url]",
            );
            if (urlInput) urlInput.value = "";
        },
        { signal },
    );
}

function bindWallpaperUpload(root: HTMLElement, signal: AbortSignal): void {
    const trigger = root.querySelector<HTMLButtonElement>("[data-custom-trigger]");
    const fileInput = root.querySelector<HTMLInputElement>(
        "[data-wallpaper-file]",
    );

    trigger?.addEventListener("click", () => fileInput?.click(), { signal });

    fileInput?.addEventListener(
        "change",
        (event) => {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) return;

            const file = input.files?.[0];
            input.value = "";
            if (!file || !isImageFile(file)) return;

            void readOptimizedWallpaper(file)
                .then((dataUrl) => applyWallpaperToForm(root, "custom", dataUrl))
                .catch((error: unknown) => {
                    console.error("Failed to load custom wallpaper.", error);
                });
        },
        { signal },
    );
}

/** Updates the wallpaper radios, hidden url field, and custom preview to match a given wallpaper. */
function applyWallpaperToForm(
    root: HTMLElement,
    wallpaperId: string,
    wallpaperUrl: string,
): void {
    root
        .querySelectorAll<HTMLInputElement>('input[name="wallpaperId"]')
        .forEach((radio) => {
            radio.checked = radio.value === wallpaperId;
        });

    const isCustom = wallpaperId === "custom" && wallpaperUrl.trim().length > 0;
    const urlInput = root.querySelector<HTMLInputElement>("[data-wallpaper-url]");
    const preview = root.querySelector<HTMLElement>("[data-custom-preview]");
    const uploadIcon = root.querySelector<HTMLElement>(
        "[data-custom-upload-icon]",
    );
    const trigger = root.querySelector<HTMLButtonElement>("[data-custom-trigger]");

    if (urlInput) urlInput.value = isCustom ? wallpaperUrl : "";
    if (preview) preview.style.backgroundImage = isCustom ? cssUrl(wallpaperUrl) : "";
    if (uploadIcon) uploadIcon.style.display = isCustom ? "none" : "";
    trigger?.setAttribute(
        "aria-label",
        isCustom ? "Change custom wallpaper" : "Upload a custom wallpaper",
    );
}

function setCheckbox(form: HTMLFormElement, name: string, checked: boolean): void {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement) field.checked = checked;
}

function setTextValue(form: HTMLFormElement, name: string, value: string): void {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLInputElement) field.value = value;
}

/** Resets every field in the form (across all sections, visible or not) to match `settings`. */
function applySettingsToForm(
    root: HTMLElement,
    form: HTMLFormElement,
    settings: DashboardSettings,
    dropdowns: SettingsDropdowns,
): void {
    dropdowns.dashboardView?.setValue(settings.dashboardView);
    dropdowns.gridRows?.setValue(String(clampRows(settings.gridRows)));
    dropdowns.cardDensity?.setValue(settings.cardDensity);
    dropdowns.clockFormat?.setValue(settings.clockFormat);
    dropdowns.defaultSearchEngine?.setValue(settings.defaultSearchEngine);

    setCheckbox(form, "showGreeting", settings.showGreeting);
    setCheckbox(form, "showClock", settings.showClock);
    setCheckbox(form, "showSearch", settings.showSearch);
    setTextValue(form, "userName", settings.userName);

    const usernameField = root.querySelector<HTMLElement>(
        "[data-username-field]",
    );
    if (usernameField) usernameField.hidden = !settings.showGreeting;

    applyWallpaperToForm(root, settings.wallpaperId, settings.wallpaperUrl);
}

function getFormString(data: FormData, key: string, fallback: string): string {
    const value = data.get(key);
    return typeof value === "string" ? value : fallback;
}

function getFormBoolean(data: FormData, key: string): boolean {
    return data.get(key) !== null;
}

function optionValue<T extends string>(
    value: string,
    options: readonly SelectOption<T>[],
    fallback: T,
): T {
    return options.some((option) => option.value === value)
        ? (value as T)
        : fallback;
}

function safeWallpaperId(value: string, fallback: string): string {
    if (value === "custom") return value;
    return getWallpaperOptions().some((wallpaper) => wallpaper.id === value)
        ? value
        : fallback;
}

function readSettingsFromForm(
    form: HTMLFormElement,
    draft: DashboardSettings,
): DashboardSettings {
    const data = new FormData(form);

    const wallpaperId = safeWallpaperId(
        getFormString(data, "wallpaperId", draft.wallpaperId),
        APP_CONFIG.DEFAULTS.settings.wallpaperId,
    );

    const wallpaperUrl =
        wallpaperId === "custom"
            ? getFormString(data, "wallpaperUrl", draft.wallpaperUrl)
            : "";

    return {
        ...draft,
        dashboardView: optionValue(
            getFormString(data, "dashboardView", draft.dashboardView),
            DASHBOARD_VIEW_OPTIONS,
            draft.dashboardView,
        ),
        clockFormat: optionValue(
            getFormString(data, "clockFormat", draft.clockFormat),
            CLOCK_FORMAT_OPTIONS,
            draft.clockFormat,
        ),
        cardDensity: optionValue(
            getFormString(data, "cardDensity", draft.cardDensity),
            CARD_DENSITY_OPTIONS,
            draft.cardDensity,
        ),
        defaultSearchEngine: optionValue(
            getFormString(
                data,
                "defaultSearchEngine",
                draft.defaultSearchEngine,
            ),
            SEARCH_ENGINE_OPTIONS,
            draft.defaultSearchEngine,
        ),
        wallpaperId,
        wallpaperUrl,
        gridRows: clampRows(
            Number(getFormString(data, "gridRows", String(draft.gridRows))),
        ),
        showGreeting: getFormBoolean(data, "showGreeting"),
        showClock: getFormBoolean(data, "showClock"),
        showSearch: getFormBoolean(data, "showSearch"),
        userName: getFormString(data, "userName", draft.userName).trim(),
    };
}

function mountDropdown<T extends string>(
    root: HTMLElement,
    name: DropdownName,
    ariaLabel: string,
    options: readonly SelectOption<T>[],
    value: T,
    iconHtml: string,
    signal: AbortSignal,
): Dropdown<T> | undefined {
    const host = root.querySelector<HTMLElement>(
        `[data-settings-dropdown="${name}"]`,
    );
    if (!host) return undefined;

    const dropdown = createDropdown({
        ariaLabel,
        name,
        options,
        value,
        variant: "settings",
        iconHtml,
    });

    host.append(dropdown.element);
    signal.addEventListener("abort", dropdown.destroy, { once: true });
    return dropdown;
}

function mountSettingsDropdowns(
    root: HTMLElement,
    settings: DashboardSettings,
    signal: AbortSignal,
): SettingsDropdowns {
    return {
        dashboardView: mountDropdown(
            root,
            "dashboardView",
            "Default view",
            DASHBOARD_VIEW_OPTIONS,
            settings.dashboardView,
            icons.grid,
            signal,
        ),
        gridRows: mountDropdown(
            root,
            "gridRows",
            "Grid rows",
            GRID_ROW_OPTIONS,
            String(clampRows(settings.gridRows)),
            icons.grid,
            signal,
        ),
        cardDensity: mountDropdown(
            root,
            "cardDensity",
            "Item density",
            CARD_DENSITY_OPTIONS,
            settings.cardDensity,
            icons.dots,
            signal,
        ),
        clockFormat: mountDropdown(
            root,
            "clockFormat",
            "Clock format",
            CLOCK_FORMAT_OPTIONS,
            settings.clockFormat,
            icons.clock,
            signal,
        ),
        defaultSearchEngine: mountDropdown(
            root,
            "defaultSearchEngine",
            "Default search engine",
            SEARCH_ENGINE_OPTIONS,
            settings.defaultSearchEngine,
            icons.search,
            signal,
        ),
    };
}

function runSafely(action: () => MaybePromise<void>, label: string): void {
    void Promise.resolve()
        .then(action)
        .catch((error: unknown) => {
            console.error(`${label} failed.`, error);
        });
}

function normalizeWallpaperSettings(
    wallpaperId: string,
    wallpaperUrl: string,
): Pick<DashboardSettings, "wallpaperId" | "wallpaperUrl"> {
    const url = wallpaperUrl.trim();

    if (wallpaperId === "custom" && url) {
        return {
            wallpaperId: "custom",
            wallpaperUrl: url,
        };
    }

    const presetExists = APP_CONFIG.WALLPAPERS.some(
        (wallpaper) => wallpaper.id === wallpaperId,
    );

    if (presetExists) {
        return {
            wallpaperId,
            wallpaperUrl: "",
        };
    }

    const fallback = APP_CONFIG.WALLPAPERS[0];

    return {
        wallpaperId: fallback.id,
        wallpaperUrl: "",
    };
}

export function showSettingsModal(options: SettingsModalOptions): void {
    closeActiveModal?.();

    const controller = new AbortController();
    const previouslyFocused =
        document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
    const wallpaper = normalizeWallpaperSettings(
        options.settings.wallpaperId,
        options.settings.wallpaperUrl,
    );

    const draft: DashboardSettings = {
        ...options.settings,
        ...wallpaper,
    };

    const overlay = document.createElement("div");
    overlay.className = styles.overlay;
    overlay.innerHTML = buildHTML(draft);

    const form = overlay.querySelector<HTMLFormElement>("form");
    if (!form) return;

    const close = (): void => {
        if (controller.signal.aborted) return;

        controller.abort();
        overlay.remove();
        closeActiveModal = undefined;
        previouslyFocused?.focus();
    };
    closeActiveModal = close;

    document.body.append(overlay);
    form.focus();

    const dropdowns = mountSettingsDropdowns(
        overlay,
        draft,
        controller.signal,
    );

    overlay.querySelectorAll<HTMLElement>("[data-close]").forEach((element) => {
        element.addEventListener("click", close, { signal: controller.signal });
    });

    overlay.addEventListener(
        "click",
        (event) => {
            if (event.target === overlay) close();
        },
        { signal: controller.signal },
    );

    document.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Escape") close();
        },
        { signal: controller.signal },
    );

    overlay.querySelector<HTMLElement>("[data-export]")?.addEventListener(
        "click",
        () => {
            runSafely(options.onExport, "Export settings");
        },
        { signal: controller.signal },
    );

    overlay.querySelector<HTMLInputElement>("[data-import]")?.addEventListener(
        "change",
        (event) => {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) return;

            const file = input.files?.[0];
            if (file) {
                runSafely(() => options.onImport(file), "Import settings");
            }
            input.value = "";
        },
        { signal: controller.signal },
    );

    overlay.querySelector<HTMLElement>("[data-reset]")?.addEventListener(
        "click",
        () => {
            // Resets the form to app defaults but does not save — the
            // person still has to hit "Save changes" (or can just Cancel
            // to back out of the reset entirely).
            applySettingsToForm(
                overlay,
                form,
                APP_CONFIG.DEFAULTS.settings as DashboardSettings,
                dropdowns,
            );
        },
        { signal: controller.signal },
    );

    bindSectionNav(overlay, controller.signal);
    bindGreetingToggle(overlay, controller.signal);
    bindWallpaperSelection(overlay, controller.signal);
    bindWallpaperUpload(overlay, controller.signal);

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            const settings = readSettingsFromForm(form, draft);

            void Promise.resolve(options.onSave(settings))
                .then(close)
                .catch((error: unknown) => {
                    console.error("Save settings failed.", error);
                });
        },
        { signal: controller.signal },
    );
}
