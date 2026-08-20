import { icons } from "./icons";

export type DropdownOption<T extends string> = {
    label: string;
    value: T;
};

type DropdownVariant = "search" | "settings";

export type DropdownOptions<T extends string> = {
    ariaLabel: string;
    options: readonly DropdownOption<T>[];
    value: T;
    variant: DropdownVariant;
    name?: string;
    iconHtml?: string;
    onChange?: (value: T) => void;
};

export type Dropdown<T extends string> = {
    element: HTMLElement;
    setValue: (value: T) => void;
    destroy: () => void;
};

const styles = {
    root: "relative",
    trigger:
        "flex h-9 w-full items-center gap-2 rounded-xl border px-3 text-left text-xs font-medium outline-none transition-colors focus:ring-2",
    searchTrigger:
        "min-w-32 border-white/[0.08] bg-white/[0.045] text-white/70 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-white focus:border-violet-300/35 focus:ring-violet-300/15",
    settingsTrigger:
        "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 focus:border-indigo-500 focus:ring-indigo-500/30",
    menu:
        "absolute z-[70] mt-2 min-w-full overflow-hidden rounded-xl border p-1 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl",
    searchMenu:
        "right-0 w-44 border-white/[0.1] bg-[#111522]/95",
    settingsMenu:
        "left-0 w-full border-zinc-800 bg-zinc-950/95",
    option:
        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors",
    searchOption: "text-white/60 hover:bg-white/[0.08] hover:text-white",
    settingsOption: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100",
    check: "size-3.5 text-indigo-300 [&_svg]:size-3.5",
    chevron: "size-3.5 shrink-0 text-current opacity-45 [&_svg]:size-3.5",
    leadingIcon: "size-3.5 shrink-0 text-current opacity-50 [&_svg]:size-3.5",
    label: "min-w-0 flex-1 truncate",
};

let dropdownId = 0;

export function createDropdown<T extends string>(
    options: DropdownOptions<T>,
): Dropdown<T> {
    const selected = options.options.find(
        (option) => option.value === options.value,
    ) ?? options.options[0];

    if (!selected) {
        throw new Error("Dropdown requires at least one option.");
    }

    const id = `dropdown-${++dropdownId}`;
    const root = document.createElement("div");
    const trigger = document.createElement("button");
    const label = document.createElement("span");
    const chevron = document.createElement("span");
    const leadingIcon = options.iconHtml ? document.createElement("span") : null;
    const menu = document.createElement("div");
    const input = options.name ? document.createElement("input") : null;
    let value = selected.value;

    root.className = styles.root;
    trigger.type = "button";
    trigger.className = [
        styles.trigger,
        options.variant === "search" ? styles.searchTrigger : styles.settingsTrigger,
    ].join(" ");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", id);
    trigger.setAttribute("aria-label", options.ariaLabel);

    chevron.className = styles.chevron;
    chevron.innerHTML = icons.chevron;
    label.className = styles.label;

    if (leadingIcon) {
        leadingIcon.className = styles.leadingIcon;
        leadingIcon.innerHTML = options.iconHtml ?? "";
        trigger.append(leadingIcon);
    }

    trigger.append(label, chevron);

    menu.id = id;
    menu.className = [
        styles.menu,
        options.variant === "search" ? styles.searchMenu : styles.settingsMenu,
        "hidden",
    ].join(" ");
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", options.ariaLabel);

    if (input) {
        input.type = "hidden";
        input.name = options.name ?? "";
        root.append(input);
    }

    root.append(trigger, menu);

    const close = (): void => {
        menu.classList.add("hidden");
        trigger.setAttribute("aria-expanded", "false");
    };

    const open = (): void => {
        menu.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
    };

    const setValue = (nextValue: T): void => {
        const next = options.options.find(
            (option) => option.value === nextValue,
        );

        if (!next) {
            return;
        }

        value = next.value;
        label.textContent = next.label;
        if (input) {
            input.value = next.value;
        }

        menu.querySelectorAll<HTMLButtonElement>("[data-dropdown-value]").forEach(
            (button) => {
                const active = button.dataset.dropdownValue === next.value;
                button.setAttribute("aria-selected", String(active));
                button.lastElementChild?.classList.toggle("invisible", !active);
            },
        );
    };

    const select = (nextValue: T): void => {
        if (nextValue !== value) {
            setValue(nextValue);
            options.onChange?.(nextValue);
        }

        close();
        trigger.focus();
    };

    options.options.forEach((option) => {
        const optionButton = document.createElement("button");
        const optionLabel = document.createElement("span");
        const check = document.createElement("span");

        optionButton.type = "button";
        optionButton.className = [
            styles.option,
            options.variant === "search" ? styles.searchOption : styles.settingsOption,
        ].join(" ");
        optionButton.dataset.dropdownValue = option.value;
        optionButton.setAttribute("role", "option");
        optionLabel.textContent = option.label;
        check.className = styles.check;
        check.innerHTML = icons.checkCircle;
        optionButton.append(optionLabel, check);
        menu.append(optionButton);
    });

    const onTriggerClick = (): void => {
        if (menu.classList.contains("hidden")) {
            open();
        } else {
            close();
        }
    };

    const onMenuPointerDown = (event: PointerEvent): void => {
        event.preventDefault();
    };

    const onMenuClick = (event: MouseEvent): void => {
        const target = event.target;
        const optionButton = target instanceof Element
            ? target.closest<HTMLButtonElement>("[data-dropdown-value]")
            : null;

        const next = options.options.find(
            (option) => option.value === optionButton?.dataset.dropdownValue,
        );

        if (next) {
            select(next.value);
        }
    };

    const onDocumentPointerDown = (event: PointerEvent): void => {
        if (event.target instanceof Node && !root.contains(event.target)) {
            close();
        }
    };

    const onFocusOut = (): void => {
        queueMicrotask(() => {
            if (!root.contains(document.activeElement)) {
                close();
            }
        });
    };

    const onTriggerKeyDown = (event: KeyboardEvent): void => {
        if (event.key === "Escape") {
            close();
            return;
        }

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTriggerClick();
            return;
        }

        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
        }

        event.preventDefault();
        const index = options.options.findIndex((option) => option.value === value);
        const direction = event.key === "ArrowDown" ? 1 : -1;
        const next = options.options[(index + direction + options.options.length) % options.options.length];

        if (next) {
            select(next.value);
        }
    };

    trigger.addEventListener("click", onTriggerClick);
    trigger.addEventListener("keydown", onTriggerKeyDown);
    menu.addEventListener("pointerdown", onMenuPointerDown);
    menu.addEventListener("click", onMenuClick);
    root.addEventListener("focusout", onFocusOut);
    document.addEventListener("pointerdown", onDocumentPointerDown);
    setValue(value);

    return {
        element: root,
        setValue,
        destroy: (): void => {
            trigger.removeEventListener("click", onTriggerClick);
            trigger.removeEventListener("keydown", onTriggerKeyDown);
            menu.removeEventListener("pointerdown", onMenuPointerDown);
            menu.removeEventListener("click", onMenuClick);
            root.removeEventListener("focusout", onFocusOut);
            document.removeEventListener("pointerdown", onDocumentPointerDown);
        },
    };
}
