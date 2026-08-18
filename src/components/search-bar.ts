import { APP_CONFIG } from "../config";
import { debounce } from "../utils/debounce";
import { icons } from "./icons";

const SEARCH_PLACEHOLDER = "Search the web or enter a URL";

const styles = {
    wrapper:
        "group relative flex h-14 w-full max-w-2xl items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.055] px-4 shadow-[0_8px_40px_-16px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-200 hover:border-white/[0.13] hover:bg-white/[0.07] focus-within:border-violet-300/30 focus-within:bg-white/[0.075] focus-within:shadow-[0_0_0_4px_rgba(167,139,250,0.06),0_12px_48px_-16px_rgba(0,0,0,0.6)] sm:mt-8 sm:h-16 sm:px-5",

    srOnly: "sr-only",

    icon:
        "flex size-5 shrink-0 items-center justify-center text-white/45 transition-colors duration-200 group-focus-within:text-white/70",

    input:
        "min-w-0 flex-1 bg-transparent text-[15px] font-normal text-white outline-none placeholder:text-white/38 selection:bg-violet-400/20 sm:text-base [&::-webkit-search-cancel-button]:appearance-none",

    shortcut:
        "flex h-7 min-w-7 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 text-[11px] font-medium text-white/35 transition-all duration-150 group-focus-within:border-white/[0.05] group-focus-within:bg-transparent group-focus-within:text-white/20",

    clear:
        "hidden rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white/75 [&_svg]:size-4",

    suggestions:
        "absolute left-0 right-0 top-[calc(100%+10px)] z-50 hidden overflow-hidden rounded-2xl border border-white/[0.08] bg-black/75 p-2 shadow-2xl backdrop-blur-2xl",
};

let searchBarId = 0;

export function createSearchBar(
    onSearch: (query: string) => void,
): HTMLElement {
    const inputId = `search-input-${++searchBarId}`;

    const wrapper = document.createElement("div");
    wrapper.className = styles.wrapper;
    wrapper.setAttribute("role", "search");

    wrapper.innerHTML = `
        <label class="${styles.srOnly}" for="${inputId}">
            ${SEARCH_PLACEHOLDER}
        </label>

        <span class="${styles.icon}" aria-hidden="true">
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="m21 21-4.35-4.35m1.35-5.4a6.75 6.75 0 1 1-13.5 0 6.75 6.75 0 0 1 13.5 0Z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                />
            </svg>
        </span>

        <input
            id="${inputId}"
            class="${styles.input}"
            type="search"
            placeholder="${SEARCH_PLACEHOLDER}"
            autocomplete="off"
            spellcheck="false"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-controls="${inputId}-suggestions"
        />

        <span class="${styles.shortcut}" aria-hidden="true">
            /
        </span>

        <button
            class="${styles.clear}"
            type="button"
            aria-label="Clear search"
        >
            ${icons.x}
        </button>

        <div
            id="${inputId}-suggestions"
            role="listbox"
            class="${styles.suggestions}"
        ></div>
    `;

    const input = wrapper.querySelector<HTMLInputElement>("input");
    const clear = wrapper.querySelector<HTMLButtonElement>("button");

    if (!input || !clear) {
        return wrapper;
    }

    const updateClearButton = () => {
        clear.classList.toggle("hidden", input.value.length === 0);
    };

    const emit = debounce(
        (...args: unknown[]) => onSearch(String(args[0] ?? "")),
        APP_CONFIG.SEARCH.DEBOUNCE_MS,
    );

    input.addEventListener("input", () => {
        updateClearButton();
    });

    input.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "Escape":
                if (!input.value) {
                    return;
                }

                input.value = "";
                updateClearButton();
                break;

            case "Enter": {
                const query = input.value.trim();

                if (!query) {
                    return;
                }

                onSearch(query);
                break;
            }
        }
    });

    clear.addEventListener("click", () => {
        emit.cancel();
        input.value = "";
        updateClearButton();
        onSearch("");
        input.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target;

        if (
            target instanceof HTMLElement &&
            target.closest("input, textarea, select, [contenteditable]")
        ) {
            return;
        }

        const focusShortcut =
            event.key === "/" ||
            ((event.ctrlKey || event.metaKey) && event.code === "KeyK");

        if (!focusShortcut) {
            return;
        }

        event.preventDefault();
        input.focus();
    };

    document.addEventListener("keydown", onKeyDown);

    const observer = new MutationObserver(() => {
        if (!document.contains(wrapper)) {
            document.removeEventListener("keydown", onKeyDown);
            emit.cancel();
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    updateClearButton();

    return wrapper;
}
