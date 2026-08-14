// src/components/favorite-modal.ts
import type { BookmarkItem } from "../types";
import { icons } from "./icons";

type MaybePromise<T> = T | Promise<T>;

export type FavoriteFormValues = {
  title: string;
  url: string;
};

export type FavoriteModalOptions = {
  favorite?: BookmarkItem;
  onSave: (favorite: FavoriteFormValues) => MaybePromise<void>;
};

const ERROR_ID = "favorite-modal-error";
const CLOSE_ANIMATION_FALLBACK_MS = 200;

const styles = {
  overlay:
    "favorite-modal favorite-modal-overlay fixed inset-0 z-[55] grid place-items-center bg-black/60 p-4 transition-opacity ",
  panel:
    "w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 outline-none",
  header:
    "flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5",
  title: "m-0 text-base font-semibold tracking-tight text-zinc-100",
  subtitle: "mt-1 text-sm text-zinc-400",
  close:
    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  body: "grid gap-4 p-6",
  field: "grid gap-1.5",
  label: "text-xs font-medium text-zinc-300",
  input:
    "h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 transition-colors placeholder:text-zinc-500 hover:border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:opacity-50",
  error: "min-h-5 text-xs font-medium text-red-400",
  footer:
    "flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4",
  secondary:
    "inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 disabled:pointer-events-none disabled:opacity-50",
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-3.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
};

type ValidationResult =
  | { ok: true; values: FavoriteFormValues }
  | { ok: false; field: keyof FavoriteFormValues; message: string };

let closeActiveModal: (() => void) | undefined;

export function showFavoriteModal(options: FavoriteModalOptions): void {
  closeActiveModal?.();

  const controller = new AbortController();
  const previouslyFocused =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  const overlay = document.createElement("div");
  overlay.className = styles.overlay;

  const form = document.createElement("form");
  form.className = styles.panel;
  form.setAttribute("role", "dialog");
  form.setAttribute("aria-modal", "true");
  form.setAttribute("aria-labelledby", "favorite-modal-title");
  form.noValidate = true;
  form.tabIndex = -1;

  const isEditing = Boolean(options.favorite);
  form.append(
    createHeader(isEditing),
    createBody(options.favorite),
    createFooter(isEditing ? "Save favorite" : "Add favorite"),
  );

  overlay.append(form);
  document.body.append(overlay);
  form.querySelector<HTMLInputElement>('input[name="title"]')?.focus();

  const errorEl = form.querySelector<HTMLElement>("[data-error]");
  const saveButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  const closeButtons = form.querySelectorAll<HTMLButtonElement>("[data-close]");
  const inputs = form.querySelectorAll<HTMLInputElement>("input");

  let saving = false;

  const setSaving = (next: boolean): void => {
    saving = next;
    form.setAttribute("aria-busy", String(next));
    closeButtons.forEach((button) => {
      button.disabled = next;
    });
    inputs.forEach((input) => {
      input.disabled = next;
    });
    if (saveButton) {
      saveButton.disabled = next;
      const label = saveButton.querySelector("span");
      if (label) {
        label.textContent = next ? "Saving…" : (saveButton.dataset.label ?? "");
      }
    }
  };

  const close = (opts?: { force?: boolean }): void => {
    if (controller.signal.aborted) return;
    if (saving && !opts?.force) return;

    controller.abort();
    closeActiveModal = undefined;

    overlay.classList.add("is-closing");
    form.classList.add("is-closing");

    let finished = false;
    const cleanup = (): void => {
      if (finished) return;
      finished = true;
      overlay.remove();
      previouslyFocused?.focus();
    };

    overlay.addEventListener("animationend", cleanup, { once: true });
    window.setTimeout(cleanup, CLOSE_ANIMATION_FALLBACK_MS);
  };
  closeActiveModal = () => close({ force: true });

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
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key === "Tab") {
        trapFocus(form, event);
      }
    },
    { signal: controller.signal },
  );

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => close(), {
      signal: controller.signal,
    });
  });

  inputs.forEach((input) => {
    input.addEventListener(
      "input",
      () => {
        if (errorEl && errorEl.textContent) errorEl.textContent = "";
      },
      { signal: controller.signal },
    );
  });

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      if (saving) return;

      const result = validateFavorite(readFavoriteForm(form));

      if (!result.ok) {
        if (errorEl) errorEl.textContent = result.message;
        form
          .querySelector<HTMLInputElement>(`input[name="${result.field}"]`)
          ?.focus();
        return;
      }

      if (errorEl) errorEl.textContent = "";
      setSaving(true);

      void Promise.resolve(options.onSave(result.values))
        .then(() => close({ force: true }))
        .catch((saveError: unknown) => {
          if (controller.signal.aborted) return;
          if (errorEl) {
            errorEl.textContent = "Could not save favorite. Please try again.";
          }
          console.error("Save favorite failed.", saveError);
        })
        .finally(() => {
          if (controller.signal.aborted) return;
          setSaving(false);
        });
    },
    { signal: controller.signal },
  );
}

function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      "input:not([disabled]), button:not([disabled])",
    ),
  );
}

function createHeader(isEditing: boolean): HTMLElement {
  const header = document.createElement("header");
  header.className = styles.header;

  const copy = document.createElement("div");

  const heading = document.createElement("h2");
  heading.id = "favorite-modal-title";
  heading.className = styles.title;
  heading.textContent = isEditing ? "Edit favorite" : "Add favorite";

  const subtitle = document.createElement("p");
  subtitle.className = styles.subtitle;
  subtitle.textContent = "Save a title and URL to your personal launcher.";

  const closeButton = document.createElement("button");
  closeButton.className = styles.close;
  closeButton.type = "button";
  closeButton.dataset.close = "true";
  closeButton.setAttribute("aria-label", "Close favorite form");
  closeButton.innerHTML = icons.x;

  copy.append(heading, subtitle);
  header.append(copy, closeButton);
  return header;
}

function createBody(favorite?: BookmarkItem): HTMLElement {
  const body = document.createElement("div");
  body.className = styles.body;

  const titleField = createField(
    "Title",
    "title",
    "Example",
    favorite?.title ?? "",
  );
  const urlField = createField(
    "URL",
    "url",
    "https://example.com",
    favorite?.url ?? "",
  );
  const error = document.createElement("p");
  error.id = ERROR_ID;
  error.className = styles.error;
  error.dataset.error = "true";
  error.setAttribute("aria-live", "polite");

  body.append(titleField, urlField, error);
  return body;
}

function createFooter(saveLabel: string): HTMLElement {
  const footer = document.createElement("footer");
  footer.className = styles.footer;

  const cancel = document.createElement("button");
  cancel.className = styles.secondary;
  cancel.type = "button";
  cancel.dataset.close = "true";
  cancel.textContent = "Cancel";

  const save = document.createElement("button");
  save.className = styles.primary;
  save.type = "submit";
  save.dataset.label = saveLabel;
  save.innerHTML = `${icons.checkCircle}<span>${saveLabel}</span>`;

  footer.append(cancel, save);
  return footer;
}

function createField(
  labelText: string,
  name: keyof FavoriteFormValues,
  placeholder: string,
  value: string,
): HTMLElement {
  const label = document.createElement("label");
  label.className = styles.field;

  const text = document.createElement("span");
  text.className = styles.label;
  text.textContent = labelText;

  const input = document.createElement("input");
  input.className = styles.input;
  input.name = name;
  input.placeholder = placeholder;
  input.required = true;
  input.value = value;
  input.type = "text";
  input.setAttribute("autocomplete", name === "url" ? "url" : "off");
  input.setAttribute("inputmode", name === "url" ? "url" : "text");
  input.setAttribute("aria-describedby", ERROR_ID);

  label.append(text, input);
  return label;
}

function readFavoriteForm(form: HTMLFormElement): FavoriteFormValues {
  const data = new FormData(form);
  return {
    title: getFormString(data, "title"),
    url: getFormString(data, "url"),
  };
}

function getFormString(data: FormData, key: keyof FavoriteFormValues): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

function validateFavorite(values: FavoriteFormValues): ValidationResult {
  const title = values.title.trim();
  const rawUrl = values.url.trim();

  if (!title) {
    return {
      ok: false,
      field: "title",
      message: "Add a title for this favorite.",
    };
  }
  if (!rawUrl) {
    return { ok: false, field: "url", message: "Add a URL for this favorite." };
  }

  const hasScheme = /^[a-z][a-z\d+.-]*:/i.test(rawUrl);
  const candidate = hasScheme ? rawUrl : `https://${rawUrl}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, field: "url", message: "Enter a valid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, field: "url", message: "Use an http or https URL." };
  }

  return { ok: true, values: { title, url: url.toString() } };
}
