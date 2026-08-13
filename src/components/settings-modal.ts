import { APP_CONFIG } from "../config";
import {
    getWallpaperOptions,
    getWallpaperPreview,
} from "../services/wallpapers";
import type { DashboardSettings } from "../types";
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

type SelectName = "dashboardView" | "gridRows" | "cardDensity" | "clockFormat";

const DASHBOARD_VIEW_OPTIONS = [
    { label: "Favorites", value: "favorites" },
    { label: "Bookmarks", value: "bookmarks" },
    { label: "Folders", value: "folders" },
] as const satisfies readonly SelectOption<
    DashboardSettings["dashboardView"]
>[];

const GRID_ROW_OPTIONS = [
    { label: "3 rows x 7 cols", value: "3" },
    { label: "4 rows x 7 cols", value: "4" },
    { label: "5 rows x 7 cols", value: "5" },
    { label: "6 rows x 7 cols", value: "6" },
] as const satisfies readonly SelectOption<string>[];

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

const styles = {
    settingsButton:
        "inline-flex size-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 [&_svg]:size-4",
    settingsContainer: "relative",
    overlay:
        "fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 transition-opacity sm:p-6",
    panel:
        "w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl outline-none",
    header:
        "flex items-center justify-between border-b border-zinc-800 px-6 py-4",
    title: "m-0 text-base font-semibold text-zinc-100",
    subtitle: "mt-0.5 text-xs text-zinc-400",
    close:
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/40 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-700 [&_svg]:size-4",
    body: "flex max-h-[70vh] flex-col gap-5 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-700",
    section: "rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4",
    sectionTitle:
        "mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400",
    fieldGrid: "grid grid-cols-1 gap-4 sm:grid-cols-2",
    field: "grid gap-1.5",
    label: "text-xs font-medium text-zinc-300",
    inputShell:
        "flex h-9 items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 transition-colors focus-within:border-zinc-700 focus-within:ring-1 focus-within:ring-zinc-700",
    select:
        "h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-xs font-medium text-zinc-200 outline-none [&_option]:bg-zinc-900 [&_option]:text-zinc-200",
    chevron: "pointer-events-none size-3.5 shrink-0 text-zinc-500",
    wallpaperGrid: "grid grid-cols-2 gap-3 sm:grid-cols-4",
    wallpaperCard: "group grid cursor-pointer gap-1.5",
    wallpaperInput: "peer sr-only",
    wallpaperPreview:
        "relative block aspect-[1.5/1] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 bg-cover bg-center transition-all group-hover:border-zinc-700 peer-checked:border-indigo-500 peer-checked:ring-1 peer-checked:ring-indigo-500 peer-checked:[&_.wallpaper-check]:flex",
    wallpaperCheck:
        "wallpaper-check absolute right-1.5 top-1.5 hidden size-5 items-center justify-center rounded-full bg-indigo-600 text-white [&_svg]:size-3",
    wallpaperName:
        "truncate text-center text-xs font-medium text-zinc-400 transition-colors peer-checked:text-zinc-200",
    fileButton:
        "inline-flex h-8 w-max cursor-pointer items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-800/40 px-3 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus-within:ring-2 focus-within:ring-zinc-700 [&_svg]:size-3.5",
    colorInput:
        "h-5 w-full cursor-pointer appearance-none rounded border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-zinc-700 [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-zinc-700 [&::-moz-color-swatch]:rounded-md",
    footer:
        "flex flex-wrap items-center justify-end gap-2.5 border-t border-zinc-800 bg-zinc-900/80 px-6 py-3.5",
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

function selectField<T extends string>(
    labelText: string,
    name: SelectName,
    current: T,
    iconHtml: string,
    options: readonly SelectOption<T>[],
): string {
    const optionHtml = options
        .map(
            (option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === current ? "selected" : ""}>
      ${escapeHtml(option.label)}
    </option>`,
        )
        .join("");

    return `
    <label class="${styles.field}">
      <span class="${styles.label}">${escapeHtml(labelText)}</span>
      <span class="${styles.inputShell}">
        <span class="size-3.5 shrink-0 text-zinc-500 [&_svg]:size-3.5">${iconHtml}</span>
        <select class="${styles.select}" name="${name}">${optionHtml}</select>
        <span class="${styles.chevron}">${icons.chevron}</span>
      </span>
    </label>`;
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
    const hasCustomPreview =
        hasCustomWallpaper && customWallpaperUrl.trim().length > 0;
    const previewStyle = hasCustomPreview
        ? `background-image:${cssUrl(customWallpaperUrl.trim())};display:block;`
        : "display:none;";

    return `${presets}
    <label class="${styles.wallpaperCard}">
      <input class="${styles.wallpaperInput}" type="radio" name="wallpaperId" value="custom" ${hasCustomWallpaper ? "checked" : ""} />
      <span class="${styles.wallpaperPreview} grid place-items-center border-dashed border-zinc-800 bg-zinc-950">
        <span data-custom-preview class="absolute inset-0 bg-cover bg-center" style="${escapeHtml(previewStyle)}"></span>
        <span class="grid size-7 place-items-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-400 [&_svg]:size-3.5">${icons.plus}</span>
        <span class="${styles.wallpaperCheck}">${icons.checkCircle}</span>
      </span>
      <span class="${styles.wallpaperName}">Custom</span>
    </label>`;
}

function buildHTML(draft: DashboardSettings): string {
    const gridRows = String(clampRows(draft.gridRows));

    return `
    <form class="${styles.panel}" role="dialog" aria-modal="true" aria-labelledby="sm-title" tabindex="-1">
      <header class="${styles.header}">
        <div>
          <h2 id="sm-title" class="${styles.title}">Settings</h2>
          <p class="${styles.subtitle}">Configure dashboard layout, background, and preferences</p>
        </div>
        <button class="${styles.close}" type="button" data-close aria-label="Close settings">${icons.x}</button>
      </header>

      <div class="${styles.body}">
        <section class="${styles.section}">
          <h3 class="${styles.sectionTitle}">Dashboard Layout</h3>
          <div class="${styles.fieldGrid}">
            ${selectField("Default view", "dashboardView", draft.dashboardView, icons.grid, DASHBOARD_VIEW_OPTIONS)}
            ${selectField("Grid rows", "gridRows", gridRows, icons.grid, GRID_ROW_OPTIONS)}
            ${selectField("Item density", "cardDensity", draft.cardDensity, icons.dots, CARD_DENSITY_OPTIONS)}
            ${selectField("Clock format", "clockFormat", draft.clockFormat, icons.clock, CLOCK_FORMAT_OPTIONS)}
          </div>
        </section>

        <section class="${styles.section}">
          <h3 class="${styles.sectionTitle}">Appearance</h3>
          <div class="${styles.wallpaperGrid}">
            ${wallpaperCards(draft.wallpaperId, draft.wallpaperUrl)}
          </div>

          <input
            type="hidden"
            name="wallpaperUrl"
            value="${escapeHtml(draft.wallpaperUrl)}"
            data-wallpaper-url
          />
        </section>
      </div>

      <footer class="${styles.footer}">
        <label class="${styles.secondary}">
          ${icons.upload} Choose file
          <input type="file" accept="image/*" data-wallpaper-file class="hidden" />
        </label>

        <button class="${styles.secondary}" type="button" data-export>
          ${icons.download} Export
        </button>

        <label class="${styles.secondary}">
          ${icons.upload} Import
          <input type="file" accept="application/json" data-import class="hidden" />
        </label>

        <button class="${styles.primary}" type="submit">
          ${icons.checkCircle} Save changes
        </button>
      </footer>
    </form>`;
}

let closeActiveModal: (() => void) | undefined;

function bindWallpaperSelection(
    root: HTMLElement,
    signal: AbortSignal,
): void {
    const radios = root.querySelectorAll<HTMLInputElement>(
        'input[name="wallpaperId"]',
    );

    radios.forEach((radio) => {
        radio.addEventListener(
            "change",
            () => {
                if (!radio.checked) return;

                const urlInput = root.querySelector<HTMLInputElement>(
                    "[data-wallpaper-url]",
                );

                if (radio.value === "custom") {
                    return;
                }

                if (urlInput) {
                    urlInput.value = "";
                }
            },
            { signal },
        );
    });
}

function bindWallpaperFile(root: HTMLElement, signal: AbortSignal): void {
    const fileInput = root.querySelector<HTMLInputElement>(
        "[data-wallpaper-file]",
    );
    fileInput?.addEventListener(
        "change",
        (event) => {
            const input = event.currentTarget;
            if (!(input instanceof HTMLInputElement)) return;

            const file = input.files?.[0];
            if (!file) return;
            if (!isImageFile(file)) {
                input.value = "";
                return;
            }

            void readOptimizedWallpaper(file)
                .then((dataUrl) => {
                    root
                        .querySelector<HTMLInputElement>(
                            'input[name="wallpaperId"][value="custom"]',
                        )
                        ?.click();
                    setCustomWallpaper(root, dataUrl);
                })
                .catch((error: unknown) => {
                    input.value = "";
                    console.error("Failed to load custom wallpaper.", error);
                });
        },
        { signal },
    );
}

function setCustomWallpaper(root: HTMLElement, dataUrl: string): void {
    const urlInput = root.querySelector<HTMLInputElement>("[data-wallpaper-url]");
    const preview = root.querySelector<HTMLElement>("[data-custom-preview]");

    if (urlInput) urlInput.value = dataUrl;
    if (preview) {
        preview.style.backgroundImage = cssUrl(dataUrl);
        preview.style.display = "block";
    }
}

function getFormString(data: FormData, key: string, fallback: string): string {
    const value = data.get(key);
    return typeof value === "string" ? value : fallback;
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
        wallpaperId,
        wallpaperUrl,
        gridRows: clampRows(
            Number(getFormString(data, "gridRows", String(draft.gridRows))),
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

    overlay
        .querySelector<HTMLElement>("[data-close]")
        ?.addEventListener("click", close, { signal: controller.signal });
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

    bindWallpaperFile(overlay, controller.signal);
    bindWallpaperSelection(overlay, controller.signal);

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
