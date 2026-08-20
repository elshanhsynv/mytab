import { debounce, type DebouncedFunction } from "../utils/debounce";
import {
    APP_CONFIG,
    type SearchEngineId,
} from "../config";
import { getSearchEngine } from "./search-engines";
import { SearchResultRenderer, type SearchResult } from "./search-results";
import { recognizeUrl } from "./url-utils";
import { fetchSearchSuggestions } from "./suggestions";

const DEBOUNCE_MS = APP_CONFIG.SEARCH.DEBOUNCE_MS;

export interface SearchControllerOptions {
    input: HTMLInputElement;
    renderer: SearchResultRenderer;
    getEngineId: () => SearchEngineId;
    onSearch: (value: string, openInNewTab: boolean) => void;
}

export class SearchController {
    private readonly input: HTMLInputElement;
    private readonly renderer: SearchResultRenderer;
    private readonly getEngineId: () => SearchEngineId;
    private readonly onSearch: (value: string, openInNewTab: boolean) => void;
    private readonly debouncedRefresh: DebouncedFunction<() => void>;
    private abortController: AbortController | null = null;
    private requestId = 0;
    private blurTimer: ReturnType<typeof setTimeout> | undefined;

    constructor(options: SearchControllerOptions) {
        this.input = options.input;
        this.renderer = options.renderer;
        this.getEngineId = options.getEngineId;
        this.onSearch = options.onSearch;
        this.debouncedRefresh = debounce(() => void this.refresh(), DEBOUNCE_MS);
        this.bindEvents();
    }

    cancel(): void {
        this.abortController?.abort();
        this.abortController = null;
        this.requestId++;
        this.debouncedRefresh.cancel();
    }

    refreshNow(): void {
        this.debouncedRefresh.cancel();
        void this.refresh();
    }

    destroy(): void {
        this.cancel();

        if (this.blurTimer !== undefined) {
            clearTimeout(this.blurTimer);
        }

        this.input.removeEventListener("input", this.handleInputEvent);
        this.input.removeEventListener("keydown", this.handleKeyDownEvent);
        this.input.removeEventListener("focus", this.handleFocus);
        this.input.removeEventListener("blur", this.handleBlur);
    }

    private bindEvents(): void {
        this.input.addEventListener("input", this.handleInputEvent);
        this.input.addEventListener("keydown", this.handleKeyDownEvent);
        this.input.addEventListener("focus", this.handleFocus);
        this.input.addEventListener("blur", this.handleBlur);
    }

    private readonly handleInputEvent = (): void => {
        const query = this.input.value.trim();

        if (!query) {
            this.cancel();
            this.renderer.clear();
            return;
        }

        if (recognizeUrl(query)) {
            this.cancel();
            this.renderer.setResults([this.createResult(query, true)]);
            return;
        }

        this.renderer.setResults([this.createResult(query, true)], "loading");
        this.debouncedRefresh();
    };

    private readonly handleKeyDownEvent = (event: KeyboardEvent): void => {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                this.renderer.moveSelection(1);
                break;
            case "ArrowUp":
                event.preventDefault();
                this.renderer.moveSelection(-1);
                break;
            case "Enter":
                if (!event.isComposing) {
                    event.preventDefault();
                    const selected = this.renderer.getSelectedResult();
                    this.onSearch(
                        selected?.value ?? this.input.value.trim(),
                        event.ctrlKey || event.metaKey,
                    );
                }
                break;
            case "Escape":
                this.renderer.hide();
                break;
        }
    };

    private readonly handleFocus = (): void => {
        if (this.input.value.trim() && this.renderer.getSelectedResult()) {
            this.renderer.show();
        }
    };

    private readonly handleBlur = (): void => {
        if (this.blurTimer !== undefined) {
            clearTimeout(this.blurTimer);
        }

        this.blurTimer = window.setTimeout(() => {
            if (document.activeElement !== this.input) {
                this.renderer.hide();
            }
        }, 0);
    };

    private async refresh(): Promise<void> {
        const query = this.input.value.trim();
        const requestId = ++this.requestId;

        if (!query) {
            this.renderer.clear();
            return;
        }

        this.abortController?.abort();
        const abortController = new AbortController();
        this.abortController = abortController;

        try {
            const suggestions = await fetchSearchSuggestions(query, abortController.signal);

            if (!this.isCurrentRequest(query, requestId, abortController.signal)) {
                return;
            }

            const results = uniqueStrings([query, ...suggestions]).map((value, index) =>
                this.createResult(value, index === 0),
            );
            this.renderer.setResults(results, suggestions.length === 0 ? "empty" : "ready");
        } catch (error) {
            if (!this.isCurrentRequest(query, requestId, abortController.signal)) {
                return;
            }

            console.warn("[Search] Suggestions unavailable:", error);
            this.renderer.setResults([this.createResult(query, true)], "unavailable");
        }
    }

    private isCurrentRequest(query: string, requestId: number, signal: AbortSignal): boolean {
        return !signal.aborted && requestId === this.requestId && this.input.value.trim() === query;
    }

    private createResult(value: string, isQuery: boolean): SearchResult {
        const directUrl = recognizeUrl(value);

        return {
            name: value,
            value: directUrl ?? value,
            directLink: Boolean(directUrl),
            detail: directUrl
                ? "Open address"
                : isQuery
                    ? `Search with ${getSearchEngine(this.getEngineId()).name}`
                    : undefined,
        };
    }
}

function uniqueStrings(values: string[]): string[] {
    const seen = new Set<string>();

    return values.filter((value) => {
        const normalized = value.trim();
        const key = normalized.toLocaleLowerCase();

        if (!normalized || seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}
