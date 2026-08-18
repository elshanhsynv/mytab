import type { DashboardSettings } from "../types";

const styles = {
    wrapper:
        "flex flex-col items-center text-center text-white select-none",

    time:
        "inline-flex items-baseline text-[clamp(4.5rem,10vw,8.5rem)] font-extralight leading-[0.88] tracking-[-0.055em] tabular-nums",

    period:
        "ml-2 text-[clamp(1rem,1.8vw,1.5rem)] font-medium tracking-[-0.01em] text-white/40 sm:ml-3",

    date:
        "mt-5 text-sm font-medium tracking-[0.01em] text-white/45 sm:mt-6 sm:text-base",
};

export function createClock(settings: DashboardSettings): HTMLElement {
    const clock = document.createElement("section");
    clock.className = styles.wrapper;
    clock.setAttribute("aria-live", "polite");

    const time = document.createElement("time");
    time.className = styles.time;

    const date = document.createElement("p");
    date.className = styles.date;

    clock.append(time, date);

    const render = () => {
        const now = new Date();

        if (settings.showClock) {
            time.hidden = false;
            time.dateTime = now.toISOString();

            const parts = new Intl.DateTimeFormat([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: settings.clockFormat === "12h",
            }).formatToParts(now);

            const clockText = parts
                .filter((part) => part.type !== "dayPeriod")
                .map((part) => part.value)
                .join("");

            const period =
                parts.find((part) => part.type === "dayPeriod")?.value ?? "";

            time.replaceChildren();

            const value = document.createTextNode(clockText);
            time.append(value);

            if (period) {
                const periodElement = document.createElement("span");
                periodElement.className = styles.period;
                periodElement.textContent = period;
                time.append(periodElement);
            }
        } else {
            time.hidden = true;
        }

        date.textContent = now.toLocaleDateString([], {
            weekday: "long",
            month: "long",
            day: "numeric",
        });
    };

    render();

    const interval = window.setInterval(render, 30_000);

    const instance = clock as HTMLElement & { destroy(): void };

    instance.destroy = () => {
        window.clearInterval(interval);
    };

    return instance;
}
