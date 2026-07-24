import { APP_CONFIG } from "../config";
import { debounce } from "../utils/debounce";
import { icons } from "./icons";

const styles = {
    wrapper:
        "group mt-6 flex h-14 w-full max-w-xl items-center gap-3 rounded-2xl bg-white/10 px-5 shadow-2xl shadow-violet-950/30 backdrop-blur-md transition focus-within:border focus-within:border-violet-400/60 sm:mt-8 sm:h-16",
    srOnly: "sr-only",
    icon: "flex size-5 shrink-0 text-white/70",
    input: "min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55 sm:text-base",
    shortcut:
        "rounded-md px-2 py-0.5 text-xs font-medium text-violet-300 group-focus-within:hidden",
    clear: "hidden rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white [&_svg]:size-4",
};

export function createSearchBar(
    onSearch: (query: string) => void,
): HTMLElement {
    const wrapper = document.createElement("label");
    wrapper.className = styles.wrapper;
    wrapper.innerHTML = `
    <span class="${styles.srOnly}">Search the web or type a URL</span>
    <span class="${styles.icon}">${icons.search}</span>
    <input class="${styles.input}" type="search" placeholder="Search the web or type a URL" autocomplete="off" spellcheck="false" />
    <span class="${styles.shortcut}">/</span>
    <button class="${styles.clear}" type="button" aria-label="Clear search">${icons.x}</button>
  `;

    const input = wrapper.querySelector<HTMLInputElement>("input");
    const clear = wrapper.querySelector<HTMLButtonElement>("button");
    if (!input || !clear) return wrapper;

    const emit = debounce(
        (value: unknown) => onSearch(String(value)),
        APP_CONFIG.SEARCH.DEBOUNCE_MS,
    );

    input.addEventListener("input", () => {
        clear.classList.toggle("hidden", input.value.length === 0);
        emit(input.value);
    });

    clear.addEventListener("click", () => {
        input.value = "";
        clear.classList.add("hidden");
        onSearch("");
        input.focus();
    });

    document.addEventListener("keydown", (event) => {
        const target = event.target as HTMLElement | null;
        const isTyping = target?.closest(
            "input, textarea, select, [contenteditable]",
        );
        if (
            (event.key === "/" ||
                (event.key.toLowerCase() === "k" &&
                    (event.metaKey || event.ctrlKey))) &&
            !isTyping
        ) {
            event.preventDefault();
            input.focus();
        }
    });

    return wrapper;
}
