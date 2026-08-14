import "./styles/tailwind.css";

import { initDashboard } from "./dashboard/startup";
import { handleDashboardKeydown } from "./utils/helpers";

async function bootstrap(): Promise<void> {
    const root = document.querySelector<HTMLElement>("#app");

    if (!root) {
        throw new Error("Missing #app root element.");
    }

    try {
        document.addEventListener("keydown", handleDashboardKeydown);
        await initDashboard(root);
    } catch (error) {
        console.error("Failed to initialize dashboard.", error);

        root.innerHTML = `
            <div class="flex min-h-screen items-center justify-center p-6">
                <div class="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center dark:border-red-900 dark:bg-red-950">
                    <p class="font-medium text-red-700 dark:text-red-300">
                        Unable to load dashboard.
                    </p>
                    <p class="mt-1 text-sm text-red-600/80 dark:text-red-400/80">
                        Please refresh the page or try again later.
                    </p>
                </div>
            </div>
        `;
    }
}

void bootstrap();
