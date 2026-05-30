import { APP_CONFIG } from '../config';
import { getWallpaperOptions, getWallpaperPreview } from '../services/wallpapers';
import type { DashboardSettings } from '../types';
import { icons } from './icons';

type MaybePromise<T> = T | Promise<T>;

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

type SelectName = 'dashboardView' | 'gridRows' | 'cardDensity' | 'clockFormat';

const DASHBOARD_VIEW_OPTIONS = [
  { label: 'Favorites', value: 'favorites' },
  { label: 'Bookmarks', value: 'bookmarks' },
  { label: 'Folders', value: 'folders' },
] as const satisfies readonly SelectOption<DashboardSettings['dashboardView']>[];

const GRID_ROW_OPTIONS = [
  { label: '3 rows x 7 cols', value: '3' },
  { label: '4 rows x 7 cols', value: '4' },
  { label: '5 rows x 7 cols', value: '5' },
] as const satisfies readonly SelectOption<string>[];

const CARD_DENSITY_OPTIONS = [
  { label: 'Comfortable', value: 'comfortable' },
  { label: 'Compact', value: 'compact' },
] as const satisfies readonly SelectOption<DashboardSettings['cardDensity']>[];

const CLOCK_FORMAT_OPTIONS = [
  { label: '12-hour', value: '12h' },
  { label: '24-hour', value: '24h' },
] as const satisfies readonly SelectOption<DashboardSettings['clockFormat']>[];

const COLOR_PATTERN = /^#[\da-f]{6}$/i;
const MAX_WALLPAPER_WIDTH = 1920;
const MAX_WALLPAPER_HEIGHT = 1080;
const WALLPAPER_QUALITY = 0.82;

const styles = {
  overlay: 'fixed inset-0 z-50 grid place-items-center bg-black/30 p-3 backdrop-blur-md transition-opacity sm:p-6',
  panel:
    'w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-white/20 bg-gradient-to-br from-white/10 to-white/5 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] outline-none backdrop-blur-xl backdrop-saturate-200',
  header: 'flex items-start justify-between gap-5 border-b border-white/10 bg-white/5 px-5 py-4 sm:px-6 sm:py-5',
  title: 'm-0 text-lg font-bold tracking-wide text-white drop-shadow-md',
  subtitle: 'mt-1 text-sm font-medium text-white/60',
  close:
    'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 shadow-sm backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&_svg]:size-4',
  body: 'flex max-h-[68vh] flex-col gap-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30',
  section:
    'rounded-3xl border border-white/10 bg-black/10 p-4 shadow-inner backdrop-blur-md sm:p-5',
  sectionTitle: 'mb-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/50 drop-shadow-sm',
  fieldGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  field: 'grid gap-2',
  label: 'text-sm font-semibold tracking-wide text-white/80 drop-shadow-sm',
  inputShell:
    'flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 shadow-inner backdrop-blur-md transition-all focus-within:border-white/30 focus-within:bg-black/30 focus-within:ring-2 focus-within:ring-white/20',
  select:
    'h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-sm font-medium text-white outline-none [&_option]:bg-slate-900 [&_option]:text-white',
  chevron: 'pointer-events-none size-4 shrink-0 text-white/50',
  wallpaperGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-4',
  wallpaperCard: 'group grid cursor-pointer gap-2',
  wallpaperInput: 'peer sr-only',
  wallpaperPreview:
    'relative block aspect-[1.45/1] overflow-hidden rounded-2xl border border-white/10 bg-black/20 bg-cover bg-center shadow-inner backdrop-blur-md transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/30 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] peer-checked:border-violet-400 peer-checked:shadow-[0_0_0_2px_rgba(167,139,250,0.5),0_8px_20px_rgba(0,0,0,0.3)] peer-checked:[&_.wallpaper-check]:flex',
  wallpaperCheck:
    'wallpaper-check absolute right-2 top-2 hidden size-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-md [&_svg]:size-3',
  wallpaperName: 'truncate text-center text-xs font-semibold tracking-wide text-white/60 transition-colors peer-checked:text-violet-300 drop-shadow-sm',
  fileButton:
    'inline-flex h-12 w-max cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white/80 shadow-sm backdrop-blur-md transition-all hover:bg-white/20 hover:text-white focus-within:ring-2 focus-within:ring-white/50 [&_svg]:size-4',
  colorInput:
    'h-8 w-full cursor-pointer appearance-none rounded border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md [&::-moz-color-swatch]:border-none [&::-moz-color-swatch]:rounded-md',
  footer: 'flex flex-wrap items-center justify-end gap-3 border-t border-white/10 bg-white/5 px-5 py-4 sm:px-6 sm:py-5 backdrop-blur-lg',
  secondary:
    'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-5 text-sm font-semibold text-white/80 shadow-sm backdrop-blur-md transition-all hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 [&_svg]:size-4',
  primary:
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-gradient-to-br from-violet-500/50 to-violet-700/50 px-5 text-sm font-bold text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] backdrop-blur-md transition-all hover:from-violet-500/60 hover:to-violet-700/60 hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)] focus:outline-none focus:ring-2 focus:ring-violet-400 [&_svg]:size-4',
};

let closeActiveModal: (() => void) | undefined;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeCssString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/[\n\r\f]/g, '');
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
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Selected file could not be read as a data URL.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

async function readOptimizedWallpaper(file: File): Promise<string> {
  if (file.type === 'image/svg+xml') return readAsDataUrl(file);

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WALLPAPER_WIDTH / bitmap.width, MAX_WALLPAPER_HEIGHT / bitmap.height);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d', { alpha: false });
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
    canvas.toBlob(resolve, 'image/webp', WALLPAPER_QUALITY);
  });
}

function isImageFile(file: File): boolean {
  return file.type === '' || file.type.startsWith('image/');
}

function selectField<T extends string>(
  labelText: string,
  name: SelectName,
  current: T,
  iconHtml: string,
  options: readonly SelectOption<T>[],
): string {
  const optionHtml = options.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === current ? 'selected' : ''}>
      ${escapeHtml(option.label)}
    </option>`).join('');

  return `
    <label class="${styles.field}">
      <span class="${styles.label}">${escapeHtml(labelText)}</span>
      <span class="${styles.inputShell}">
        <span class="size-4 shrink-0 text-white/45 [&_svg]:size-4">${iconHtml}</span>
        <select class="${styles.select}" name="${name}">${optionHtml}</select>
        <span class="${styles.chevron}">${icons.chevron}</span>
      </span>
    </label>`;
}

function wallpaperCards(currentWallpaperId: string, customWallpaperUrl: string): string {
  const presets = getWallpaperOptions().map((wallpaper) => `
    <label class="${styles.wallpaperCard}">
      <input class="${styles.wallpaperInput}" type="radio" name="wallpaperId"
        value="${escapeHtml(wallpaper.id)}" ${wallpaper.id === currentWallpaperId ? 'checked' : ''} />
      <span class="${styles.wallpaperPreview}" style="background-image:${escapeHtml(getWallpaperPreview(wallpaper))};">
        <span class="${styles.wallpaperCheck}">${icons.checkCircle}</span>
      </span>
      <span class="${styles.wallpaperName}">${escapeHtml(wallpaper.name)}</span>
    </label>`).join('');

  const hasCustomWallpaper = currentWallpaperId === 'custom';
  const hasCustomPreview = hasCustomWallpaper && customWallpaperUrl.trim().length > 0;
  const previewStyle = hasCustomPreview
    ? `background-image:${cssUrl(customWallpaperUrl.trim())};display:block;`
    : 'display:none;';

  return `${presets}
    <label class="${styles.wallpaperCard}">
      <input class="${styles.wallpaperInput}" type="radio" name="wallpaperId" value="custom" ${hasCustomWallpaper ? 'checked' : ''} />
      <span class="${styles.wallpaperPreview} grid place-items-center border-dashed bg-white/[0.035]">
        <span data-custom-preview class="absolute inset-0 bg-cover bg-center" style="${escapeHtml(previewStyle)}"></span>
        <span class="grid size-9 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] [&_svg]:size-4">${icons.plus}</span>
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
          <p class="${styles.subtitle}">Launcher, wallpaper, density, and backup controls</p>
        </div>
        <button class="${styles.close}" type="button" data-close aria-label="Close settings">${icons.x}</button>
      </header>

      <div class="${styles.body}">
        <section class="${styles.section}">
          <h3 class="${styles.sectionTitle}">Dashboard</h3>
          <div class="${styles.fieldGrid}">
            ${selectField('Default view', 'dashboardView', draft.dashboardView, icons.grid, DASHBOARD_VIEW_OPTIONS)}
            ${selectField('Grid rows', 'gridRows', gridRows, icons.grid, GRID_ROW_OPTIONS)}
            ${selectField('Item density', 'cardDensity', draft.cardDensity, icons.dots, CARD_DENSITY_OPTIONS)}
            ${selectField('Clock format', 'clockFormat', draft.clockFormat, icons.clock, CLOCK_FORMAT_OPTIONS)}
          </div>
        </section>

        <section class="${styles.section}">
          <h3 class="${styles.sectionTitle}">Appearance</h3>
          <div class="${styles.wallpaperGrid}">
            ${wallpaperCards(draft.wallpaperId, draft.wallpaperUrl)}
          </div>

          <div class="mt-4 grid gap-3">
            <label class="${styles.field}">
              <span class="${styles.label}">Wallpaper image file</span>
              <span class="${styles.fileButton}">
                ${icons.upload} Choose image
                <input type="file" accept="image/*" data-wallpaper-file class="hidden" />
              </span>
            </label>
            <input type="hidden" name="wallpaperUrl" value="${escapeHtml(draft.wallpaperUrl)}" data-wallpaper-url />

            <label class="${styles.field}">
              <span class="${styles.label}">Accent color</span>
              <span class="${styles.inputShell}">
                <input class="${styles.colorInput}" name="accentColor" type="color"
                  value="${escapeHtml(safeColor(draft.accentColor, APP_CONFIG.DEFAULTS.settings.accentColor))}" />
              </span>
            </label>
          </div>
        </section>
      </div>

      <footer class="${styles.footer}">
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

function bindWallpaperFile(root: HTMLElement, signal: AbortSignal): void {
  const fileInput = root.querySelector<HTMLInputElement>('[data-wallpaper-file]');
  fileInput?.addEventListener('change', (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    if (!file) return;
    if (!isImageFile(file)) {
      input.value = '';
      return;
    }

    void readOptimizedWallpaper(file)
      .then((dataUrl) => {
        root.querySelector<HTMLInputElement>('input[name="wallpaperId"][value="custom"]')?.click();
        setCustomWallpaper(root, dataUrl);
      })
      .catch((error: unknown) => {
        input.value = '';
        console.error('Failed to load custom wallpaper.', error);
      });
  }, { signal });
}

function setCustomWallpaper(root: HTMLElement, dataUrl: string): void {
  const urlInput = root.querySelector<HTMLInputElement>('[data-wallpaper-url]');
  const preview = root.querySelector<HTMLElement>('[data-custom-preview]');

  if (urlInput) urlInput.value = dataUrl;
  if (preview) {
    preview.style.backgroundImage = cssUrl(dataUrl);
    preview.style.display = 'block';
  }
}

function getFormString(data: FormData, key: string, fallback: string): string {
  const value = data.get(key);
  return typeof value === 'string' ? value : fallback;
}

function optionValue<T extends string>(value: string, options: readonly SelectOption<T>[], fallback: T): T {
  return options.some((option) => option.value === value) ? (value as T) : fallback;
}

function safeColor(value: string, fallback: string): string {
  return COLOR_PATTERN.test(value) ? value : fallback;
}

function safeWallpaperId(value: string, fallback: string): string {
  if (value === 'custom') return value;
  return getWallpaperOptions().some((wallpaper) => wallpaper.id === value) ? value : fallback;
}

function readSettingsFromForm(form: HTMLFormElement, draft: DashboardSettings): DashboardSettings {
  const data = new FormData(form);

  return {
    ...draft,
    dashboardView: optionValue(getFormString(data, 'dashboardView', draft.dashboardView), DASHBOARD_VIEW_OPTIONS, draft.dashboardView),
    clockFormat: optionValue(getFormString(data, 'clockFormat', draft.clockFormat), CLOCK_FORMAT_OPTIONS, draft.clockFormat),
    cardDensity: optionValue(getFormString(data, 'cardDensity', draft.cardDensity), CARD_DENSITY_OPTIONS, draft.cardDensity),
    wallpaperId: safeWallpaperId(getFormString(data, 'wallpaperId', draft.wallpaperId), APP_CONFIG.DEFAULTS.settings.wallpaperId),
    accentColor: safeColor(getFormString(data, 'accentColor', draft.accentColor), draft.accentColor),
    wallpaperUrl: getFormString(data, 'wallpaperUrl', draft.wallpaperUrl),
    gridRows: clampRows(Number(getFormString(data, 'gridRows', String(draft.gridRows)))),
  };
}

function runSafely(action: () => MaybePromise<void>, label: string): void {
  void Promise.resolve()
    .then(action)
    .catch((error: unknown) => {
      console.error(`${label} failed.`, error);
    });
}

export function showSettingsModal(options: SettingsModalOptions): void {
  closeActiveModal?.();

  const controller = new AbortController();
  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const draft: DashboardSettings = { ...options.settings };
  const overlay = document.createElement('div');
  overlay.className = styles.overlay;
  overlay.innerHTML = buildHTML(draft);

  const form = overlay.querySelector<HTMLFormElement>('form');
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

  overlay.querySelector<HTMLElement>('[data-close]')?.addEventListener('click', close, { signal: controller.signal });
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  }, { signal: controller.signal });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  }, { signal: controller.signal });

  overlay.querySelector<HTMLElement>('[data-export]')?.addEventListener('click', () => {
    runSafely(options.onExport, 'Export settings');
  }, { signal: controller.signal });

  overlay.querySelector<HTMLInputElement>('[data-import]')?.addEventListener('change', (event) => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    if (file) {
      runSafely(() => options.onImport(file), 'Import settings');
    }
    input.value = '';
  }, { signal: controller.signal });

  bindWallpaperFile(overlay, controller.signal);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const settings = readSettingsFromForm(form, draft);

    void Promise.resolve(options.onSave(settings))
      .then(close)
      .catch((error: unknown) => {
        console.error('Save settings failed.', error);
      });
  }, { signal: controller.signal });
}
