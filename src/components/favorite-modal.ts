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

const styles = {
    overlay:
        "fixed inset-0 z-[55] grid place-items-center bg-black/60 p-4 transition-opacity",
    panel: "w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl outline-none",
    header: "flex items-start justify-between gap-4 border-b border-zinc-800 px-6 py-5",
    title: "m-0 text-base font-semibold tracking-tight text-zinc-100",
    subtitle: "mt-1 text-sm text-zinc-400",
    close: "inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-600 [&_svg]:size-4",
    body: "grid gap-4 p-6",
    field: "grid gap-1.5",
    label: "text-xs font-medium text-zinc-300",
    input: "h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-100 transition-colors placeholder:text-zinc-500 hover:border-zinc-700 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500",
    error: "min-h-5 text-xs font-medium text-red-400",
    footer: "flex items-center justify-end gap-3 border-t border-zinc-800 px-6 py-4",
    secondary:
        "inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600",
    primary:
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-3.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 [&_svg]:size-4",
};

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
    form.tabIndex = -1;

    const isEditing = Boolean(options.favorite);
    form.append(
        createHeader(isEditing),
        createBody(options.favorite),
        createFooter(isEditing ? "Save favorite" : "Add favorite"),
    );

    const close = (): void => {
        if (controller.signal.aborted) return;

        controller.abort();
        overlay.remove();
        closeActiveModal = undefined;
        previouslyFocused?.focus();
    };
    closeActiveModal = close;

    overlay.append(form);
    document.body.append(overlay);
    form.querySelector<HTMLInputElement>('input[name="title"]')?.focus();

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

    form.querySelectorAll<HTMLButtonElement>("[data-close]").forEach(
        (button) => {
            button.addEventListener("click", close, {
                signal: controller.signal,
            });
        },
    );

    form.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();
            const values = readFavoriteForm(form);
            const error = validateFavorite(values);
            const errorEl = form.querySelector<HTMLElement>("[data-error]");

            if (error) {
                if (errorEl) errorEl.textContent = error;
                return;
            }

            if (errorEl) errorEl.textContent = "";
            void Promise.resolve(options.onSave(values))
                .then(close)
                .catch((saveError: unknown) => {
                    if (errorEl)
                        errorEl.textContent =
                            "Could not save favorite. Please try again.";
                    console.error("Save favorite failed.", saveError);
                });
        },
        { signal: controller.signal },
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
    input.setAttribute("autocomplete", name === "url" ? "url" : "off");
    input.type = "text";

    label.append(text, input);
    return label;
}

function readFavoriteForm(form: HTMLFormElement): FavoriteFormValues {
    const data = new FormData(form);
    return {
        title: getFormString(data, "title").trim(),
        url: getFormString(data, "url").trim(),
    };
}

function getFormString(data: FormData, key: keyof FavoriteFormValues): string {
    const value = data.get(key);
    return typeof value === "string" ? value : "";
}

function validateFavorite(values: FavoriteFormValues): string {
    if (!values.title) return "Add a title for this favorite.";
    if (!values.url) return "Add a URL for this favorite.";

    try {
        const candidate = /^[a-z][a-z\d+.-]*:/i.test(values.url)
            ? values.url
            : `https://${values.url}`;
        const url = new URL(candidate);
        if (url.protocol === "http:" || url.protocol === "https:") return "";
        return "Use an http or https URL.";
    } catch {
        return "Enter a valid URL.";
    }
}
