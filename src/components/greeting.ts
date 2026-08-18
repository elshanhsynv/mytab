import type { DashboardSettings } from "../types";

const styles = {
    container:
        "flex select-none flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-500",

    greeting:
        "flex flex-wrap items-baseline justify-center gap-x-2 text-2xl font-normal tracking-[-0.02em] text-white/55 sm:text-3xl",

    name:
        "relative font-semibold tracking-[-0.025em] text-white",

    nameGlow:
        "absolute inset-x-0 -bottom-1 h-2 rounded-full bg-white/10 blur-md",

    punctuation:
        "text-white/35",
};

function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
}

export function createGreeting(settings: DashboardSettings): HTMLElement {
    const container = document.createElement("div");
    container.className = styles.container;

    const greeting = document.createElement("div");
    greeting.className = styles.greeting;

    const greetingText = document.createElement("span");
    greetingText.textContent = getGreeting();

    const comma = document.createElement("span");
    comma.className = styles.punctuation;
    comma.textContent = ",";

    const nameWrapper = document.createElement("span");
    nameWrapper.className = "relative inline-flex";

    const name = document.createElement("span");
    name.className = styles.name;
    name.textContent = `${settings.userName?.trim() || "there"}`;

    const glow = document.createElement("span");
    glow.className = styles.nameGlow;
    glow.setAttribute("aria-hidden", "true");

    const exclamation = document.createElement("span");
    exclamation.className = styles.punctuation;
    exclamation.textContent = "!";

    nameWrapper.append(glow, name);
    greeting.append(greetingText, comma, nameWrapper, exclamation);

    container.append(greeting);

    return container;
}
