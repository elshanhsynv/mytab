import { DASHBOARD_VIEWS, VIEW_LABELS } from "../dashboard/types";
import type { DashboardView } from "../dashboard/types";

const styles = {
    switcher: "mx-auto flex w-max pb-3",

    button:
        "relative px-6 py-1.5 text-lg font-medium text-white/60 transition-colors duration-200 " +
        "hover:text-white focus-visible:outline-none",

    buttonActive: "text-violet-400",

    indicator:
        "absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-violet-500",
};
export function createViewSwitch(activeView: DashboardView): HTMLElement {
    const switcher = document.createElement("div");
    switcher.className = styles.switcher;
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "Dashboard view");

    for (const view of DASHBOARD_VIEWS) {
        switcher.append(createViewButton(view, activeView));
    }

    return switcher;
}

function createViewButton(
    view: DashboardView,
    activeView: DashboardView,
): HTMLButtonElement {
    const button = document.createElement("button");
    const isActive = view === activeView;

    button.type = "button";
    button.dataset.view = view;
    button.textContent = VIEW_LABELS[view];
    button.className = `${styles.button} ${isActive ? styles.buttonActive : ""}`;

    if (isActive) {
        const indicator = document.createElement("span");
        indicator.className = styles.indicator;
        button.appendChild(indicator);
    }

    return button;
}
