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


export function searchOrNavigate(query: string) {
    const value = query.trim();

    if (!value) {
        return;
    }

    let url: string;

    try {
        const candidate = new URL(
            value.includes("://") ? value : `https://${value}`,
        );

        if (candidate.hostname.includes(".")) {
            url = candidate.href;
        } else {
            throw new Error("Not a URL");
        }
    } catch {
        url = `https://www.google.com/search?q=${encodeURIComponent(value)}`;
    }

    window.location.href = url;
}
