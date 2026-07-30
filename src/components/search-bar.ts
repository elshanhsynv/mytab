import { APP_CONFIG } from "../config";
import { debounce } from "../utils/debounce";
import { icons } from "./icons";

const SEARCH_PLACEHOLDER = "Search the web or type a URL";

const styles = {
    wrapper:
        "group mt-6 flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl bg-white/10 px-5 shadow-2xl shadow-violet-950/30 backdrop-blur-md transition focus-within:border focus-within:border-violet-400/60 sm:mt-8 sm:h-16",
    srOnly: "sr-only",
    icon: "flex size-5 shrink-0 text-white/70",
    input:
        "min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55 sm:text-base [&::-webkit-search-cancel-button]:appearance-none",
    shortcut:
        "rounded-md px-2 py-0.5 text-xs font-medium text-violet-300 group-focus-within:hidden",
    clear:
        "hidden rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white [&_svg]:size-4",
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
            ${icons.search}
        </span>

        <input
            id="${inputId}"
            class="${styles.input}"
            type="search"
            placeholder="${SEARCH_PLACEHOLDER}"
            autocomplete="off"
            spellcheck="false"
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
        emit(input.value);
    });

    input.addEventListener("keydown", (event) => {
        switch (event.key) {
            case "Escape":
                if (!input.value) {
                    return;
                }

                emit.cancel();
                input.value = "";
                updateClearButton();
                onSearch("");
                break;

            case "Enter":
                emit.flush();
                onSearch(input.value);
                break;
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