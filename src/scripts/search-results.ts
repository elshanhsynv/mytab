export interface SearchResult {
    name: string;
    value: string;
    directLink: boolean;
    detail?: string;
}

export type SuggestionStatus = "loading" | "ready" | "empty" | "unavailable";

export interface SearchResultRendererOptions {
    container: HTMLElement;
    input: HTMLInputElement;
    onSelect: (result: SearchResult, openInNewTab: boolean) => void;
}

const MAX_RESULTS = 8;
const RESULT_SELECTOR = "button[data-search-result-index]";

export class SearchResultRenderer {
    private readonly container: HTMLElement;
    private readonly input: HTMLInputElement;
    private readonly onSelect: (result: SearchResult, openInNewTab: boolean) => void;
    private results: SearchResult[] = [];
    private selectedIndex = 0;
    private status: SuggestionStatus = "ready";

    constructor(options: SearchResultRendererOptions) {
        this.container = options.container;
        this.input = options.input;
        this.onSelect = options.onSelect;
        this.container.addEventListener("mousedown", this.handleMouseDown);
        this.container.addEventListener("mouseup", this.preventMiddleMouse);
        this.container.addEventListener("auxclick", this.preventMiddleMouse);
    }

    setResults(results: SearchResult[], status: SuggestionStatus = "ready"): void {
        this.results = results;
        this.status = status;
        this.selectedIndex = clampIndex(this.selectedIndex, this.visibleCount);
        this.render();
    }

    moveSelection(delta: number): void {
        if (this.visibleCount === 0) {
            return;
        }

        this.selectedIndex = (this.selectedIndex + delta + this.visibleCount) % this.visibleCount;
        this.renderSelectionOnly(true);
    }

    getSelectedResult(): SearchResult | undefined {
        return this.results[this.selectedIndex];
    }

    show(): void {
        this.container.classList.remove("hidden");
        this.input.setAttribute("aria-expanded", "true");
    }

    hide(): void {
        this.container.classList.add("hidden");
        this.input.setAttribute("aria-expanded", "false");
        this.input.removeAttribute("aria-activedescendant");
    }

    clear(): void {
        this.results = [];
        this.selectedIndex = 0;
        this.status = "ready";
        this.container.replaceChildren();
        this.hide();
    }

    destroy(): void {
        this.container.removeEventListener("mousedown", this.handleMouseDown);
        this.container.removeEventListener("mouseup", this.preventMiddleMouse);
        this.container.removeEventListener("auxclick", this.preventMiddleMouse);
        this.clear();
    }

    private get visibleCount(): number {
        return Math.min(this.results.length, MAX_RESULTS);
    }

    private readonly handleMouseDown = (event: MouseEvent): void => {
        const button = getResultButton(event.target);

        if (!button) {
            event.preventDefault();
            return;
        }

        if (event.button !== 0 && event.button !== 1) {
            return;
        }

        event.preventDefault();
        const index = Number(button.dataset.searchResultIndex);
        const result = Number.isInteger(index) ? this.results[index] : undefined;

        if (result) {
            this.onSelect(result, event.button === 1 || event.ctrlKey || event.metaKey);
        }
    };

    private readonly preventMiddleMouse = (event: MouseEvent): void => {
        if (event.button === 1) {
            event.preventDefault();
        }
    };

    private render(): void {
        const visible = this.results.slice(0, MAX_RESULTS);
        const query = this.input.value.trim();
        const fragment = document.createDocumentFragment();

        visible.forEach((result, index) => {
            fragment.append(this.createResultElement(result, index, query));
        });

        const status = this.createStatusElement();
        if (status) {
            fragment.append(status);
        }

        this.container.replaceChildren(fragment);

        if (visible.length === 0) {
            this.hide();
            return;
        }

        this.show();
        this.renderSelectionOnly();
    }

    private renderSelectionOnly(scroll = false): void {
        const buttons = this.container.querySelectorAll<HTMLButtonElement>(RESULT_SELECTOR);

        buttons.forEach((button, index) => {
            const selected = index === this.selectedIndex;
            button.setAttribute("aria-selected", String(selected));
            button.classList.toggle("bg-violet-400/[0.12]", selected);
            button.classList.toggle("bg-transparent", !selected);
        });

        const selectedButton = buttons[this.selectedIndex];
        if (!selectedButton) {
            this.input.removeAttribute("aria-activedescendant");
            return;
        }

        this.input.setAttribute("aria-activedescendant", selectedButton.id);
        if (scroll) {
            selectedButton.scrollIntoView({ block: "nearest" });
        }
    }

    private createResultElement(result: SearchResult, index: number, query: string): HTMLButtonElement {
        const button = document.createElement("button");
        button.type = "button";
        button.id = `${this.input.id}-result-${index}`;
        button.dataset.searchResultIndex = String(index);
        button.setAttribute("role", "option");
        button.className = [
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors",
            index === this.selectedIndex
                ? "bg-violet-400/[0.12]"
                : "bg-transparent hover:bg-white/[0.06]",
            "focus-visible:bg-violet-400/[0.12]",
        ].join(" ");

        const icon = document.createElement("span");
        icon.className = "flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm text-white/55";
        icon.textContent = result.directLink ? "↗" : "⌕";

        const content = document.createElement("span");
        content.className = "min-w-0 flex-1";

        const name = document.createElement("span");
        name.className = "block truncate text-sm text-white/85";
        renderHighlightedText(name, result.name, query, result.directLink);
        content.append(name);

        if (result.detail) {
            const detail = document.createElement("span");
            detail.className = "mt-0.5 block truncate text-xs text-white/40";
            detail.textContent = result.detail;
            content.append(detail);
        }

        button.append(icon, content);
        return button;
    }

    private createStatusElement(): HTMLElement | null {
        const message = getStatusMessage(this.status);
        if (!message) {
            return null;
        }

        const status = document.createElement("div");
        status.className = "mx-3 flex items-center gap-2 border-t border-white/[0.07] px-1 py-2 text-xs text-white/40";
        status.setAttribute("role", "status");

        if (this.status === "loading") {
            const spinner = document.createElement("span");
            spinner.className = "size-3 shrink-0 animate-spin rounded-full border-2 border-white/15 border-t-violet-300";
            status.append(spinner);
        }

        status.append(message);
        return status;
    }
}

function getResultButton(target: EventTarget | null): HTMLButtonElement | null {
    return target instanceof Element ? target.closest<HTMLButtonElement>(RESULT_SELECTOR) : null;
}

function getStatusMessage(status: SuggestionStatus): Text | null {
    switch (status) {
        case "loading":
            return document.createTextNode("Finding suggestions");
        case "empty":
            return document.createTextNode("No suggestions found. Press Enter to search.");
        case "unavailable":
            return document.createTextNode("Suggestions are unavailable. Press Enter to search.");
        case "ready":
            return null;
    }
}

function renderHighlightedText(container: HTMLElement, text: string, query: string, directLink: boolean): void {
    const characters = Array.from(text);
    const ranges = getHighlightRanges(characters, query);
    const fragment = document.createDocumentFragment();

    for (let start = 0; start < characters.length;) {
        const highlighted = ranges[start];
        let end = start + 1;

        while (end < characters.length && ranges[end] === highlighted) {
            end++;
        }

        const span = document.createElement("span");
        span.className = highlighted ? (directLink ? "text-violet-200" : "text-white") : "text-white/55";
        span.textContent = characters.slice(start, end).join("");
        fragment.append(span);
        start = end;
    }

    container.replaceChildren(fragment);
}

function getHighlightRanges(characters: string[], query: string): boolean[] {
    const ranges = Array.from({ length: characters.length }, () => false);
    const queryCharacters = Array.from(query.trim().toLocaleLowerCase());
    const textCharacters = characters.map((character) => character.toLocaleLowerCase());

    if (queryCharacters.length === 0) {
        return ranges;
    }

    for (let start = 0; start <= textCharacters.length - queryCharacters.length; start++) {
        if (queryCharacters.every((character, index) => textCharacters[start + index] === character)) {
            ranges.fill(true, start, start + queryCharacters.length);
            return ranges;
        }
    }

    let queryIndex = 0;
    for (let index = 0; index < textCharacters.length && queryIndex < queryCharacters.length; index++) {
        if (queryCharacters[queryIndex] === " ") {
            queryIndex++;
            index--;
        } else if (textCharacters[index] === queryCharacters[queryIndex]) {
            ranges[index] = true;
            queryIndex++;
        }
    }

    while (queryCharacters[queryIndex] === " ") {
        queryIndex++;
    }

    return queryIndex === queryCharacters.length ? ranges : ranges.fill(false);
}

function clampIndex(index: number, length: number): number {
    return length === 0 ? 0 : Math.min(Math.max(index, 0), length - 1);
}
