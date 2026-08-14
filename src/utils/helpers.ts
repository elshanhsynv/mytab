import { state } from "../core/state";

export function handleDashboardKeydown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;

    const activeFolderId = state.get("activeFolderId");
    if (!activeFolderId) return;

    const backButton = document.querySelector<HTMLButtonElement>(
        '[data-action="close-folder"]',
    );

    if (!backButton) return;

    event.preventDefault();
    backButton.click();
}
