import { icons } from "./icons";

// Kept apart from settings-modal.ts so the header can show the button without
// loading the modal, which is fetched only when settings are opened.
const styles = {
    settingsButton:
        "inline-flex size-10 items-center justify-center rounded-2xl [&_svg]:size-4",
    settingsContainer:
        "relative rounded-2xl bg-white/10 backdrop-blur-md transition hover:bg-white/15 hover:scale-105",
};

export function createSettingsButton(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = styles.settingsContainer;
    const button = document.createElement("button");
    button.className = styles.settingsButton;
    button.type = "button";
    button.dataset.action = "open-settings";
    button.setAttribute("aria-label", "Open settings");
    button.innerHTML = icons.settings;
    container.appendChild(button);
    return container;
}
