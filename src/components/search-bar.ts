import { icons } from "./icons";
import {
    createDropdown,
    type Dropdown,
} from "./dropdown";
import {
    SEARCH_ENGINE_OPTIONS,
} from "../scripts/search-engines";
import type { SearchEngineId } from "../config";
import { state } from "../core/state";
import { SearchController } from "../scripts/search-controller";
import { SearchResultRenderer } from "../scripts/search-results";
import { searchOrNavigate } from "../scripts/search-or-navigate";

const SEARCH_PLACEHOLDER = "Search the web or enter a URL";

const styles = {
    wrapper:
        "group relative z-10 flex h-14 w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.055] px-4 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.07] focus-within:z-20 focus-within:border-violet-300/30 focus-within:bg-white/[0.075] focus-within:shadow-[0_0_0_4px_rgba(167,139,250,0.06),0_12px_48px_-16px_rgba(0,0,0,0.6)] sm:mt-8 sm:h-16 sm:px-5",
    srOnly: "sr-only",
    icon:
        "flex size-5 shrink-0 items-center justify-center text-white/45 transition-colors duration-200 group-focus-within:text-white/70",
    input:
        "min-w-0 flex-1 bg-transparent text-[15px] font-normal text-white outline-none placeholder:text-white/38 selection:bg-violet-400/20 sm:text-base [&::-webkit-search-cancel-button]:appearance-none",
    shortcut:
        "flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[11px] font-medium text-white/35 transition-all duration-150 group-focus-within:border-white/[0.05] group-focus-within:bg-transparent group-focus-within:text-white/20",
    clear:
        "hidden rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/75 [&_svg]:size-4",
    engine: "shrink-0",
    suggestions:
        "absolute left-0 right-0 top-[calc(100%+10px)] z-50 hidden overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111522]/95 p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl",
};

let searchBarId = 0;

export function createSearchBar(): HTMLElement {
    const inputId = `search-input-${++searchBarId}`;
    const wrapper = document.createElement("div");

    wrapper.className = styles.wrapper;
    wrapper.setAttribute("role", "search");
    wrapper.innerHTML = `
        <label class="${styles.srOnly}" for="${inputId}">
            ${SEARCH_PLACEHOLDER}
        </label>
        <span class="${styles.icon}" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
        </span>
        <input id="${inputId}" class="${styles.input}" type="search" placeholder="${SEARCH_PLACEHOLDER}" autocomplete="off" autocapitalize="off" spellcheck="false" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${inputId}-suggestions" />
        <button class="${styles.clear}" type="button" aria-label="Clear search">
            ${icons.x}
        </button>
        <div class="${styles.engine}" data-search-engine></div>
        <span class="${styles.shortcut}" aria-hidden="true">/</span>
        <div id="${inputId}-suggestions" role="listbox" class="${styles.suggestions}" aria-label="Search suggestions"></div>
    `;

    const input = wrapper.querySelector<HTMLInputElement>("input");
    const clear = wrapper.querySelector<HTMLButtonElement>("button[aria-label='Clear search']");
    const engine = wrapper.querySelector<HTMLElement>("[data-search-engine]");
    const suggestions = wrapper.querySelector<HTMLElement>(`#${CSS.escape(`${inputId}-suggestions`)}`);

    if (!input || !clear || !engine || !suggestions) {
        return wrapper;
    }

    const searchInput = input;
    const clearButton = clear;
    const searchEngineContainer = engine;
    const suggestionContainer = suggestions;

    let currentEngineId = state.get("settings").defaultSearchEngine;
    let engineDropdown: Dropdown<SearchEngineId> | null = null;

    const renderer = new SearchResultRenderer({
        container: suggestionContainer,
        input: searchInput,
        onSelect: (result, openInNewTab) => {
            searchOrNavigate(result.value, currentEngineId, openInNewTab);
        },
    });

    const controller = new SearchController({
        input: searchInput,
        renderer,
        getEngineId: () => currentEngineId,
        onSearch: (query, openInNewTab) => {
            if (query) {
                searchOrNavigate(query, currentEngineId, openInNewTab);
            }
        },
    });

    const updateClearButton = (): void => {
        clearButton.classList.toggle("hidden", searchInput.value.length === 0);
    };

    const selectEngine = (engineId: SearchEngineId): void => {
        currentEngineId = engineId;
        state.set("settings", {
            ...state.get("settings"),
            defaultSearchEngine: engineId,
        });
        controller.refreshNow();
        searchInput.focus();
    };

    engineDropdown = createDropdown({
        ariaLabel: "Search engine",
        options: SEARCH_ENGINE_OPTIONS,
        value: currentEngineId,
        variant: "search",
        onChange: selectEngine,
    });
    searchEngineContainer.append(engineDropdown.element);

    const unsubscribeSettings = state.subscribe("settings", (settings) => {
        if (settings.defaultSearchEngine === currentEngineId) {
            return;
        }

        currentEngineId = settings.defaultSearchEngine;
        engineDropdown?.setValue(currentEngineId);
        controller.refreshNow();
    });

    const onInputKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== "Escape" || !searchInput.value) {
            return;
        }

        controller.cancel();
        searchInput.value = "";
        renderer.clear();
        updateClearButton();
        searchInput.focus();
    };

    const onClear = (): void => {
        controller.cancel();
        searchInput.value = "";
        renderer.clear();
        updateClearButton();
        searchInput.focus();
    };

    const onDocumentKeyDown = (event: KeyboardEvent): void => {
        const target = event.target;

        if (
            target instanceof HTMLElement &&
            target.closest("input, textarea, select, [contenteditable]")
        ) {
            return;
        }

        if (
            event.key !== "/" &&
            !((event.ctrlKey || event.metaKey) && event.code === "KeyK")
        ) {
            return;
        }

        event.preventDefault();
        searchInput.focus();
        searchInput.select();
    };

    searchInput.addEventListener("input", updateClearButton);
    searchInput.addEventListener("keydown", onInputKeyDown);
    clearButton.addEventListener("click", onClear);
    document.addEventListener("keydown", onDocumentKeyDown);

    const observer = new MutationObserver(() => {
        if (document.contains(wrapper)) {
            return;
        }

        searchInput.removeEventListener("input", updateClearButton);
        searchInput.removeEventListener("keydown", onInputKeyDown);
        clearButton.removeEventListener("click", onClear);
        document.removeEventListener("keydown", onDocumentKeyDown);
        unsubscribeSettings();
        engineDropdown?.destroy();
        controller.destroy();
        renderer.destroy();
        observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    updateClearButton();

    return wrapper;
}
