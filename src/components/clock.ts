import type { DashboardSettings } from '../types';

const styles = {
  wrapper: 'text-center text-white',
  time: 'inline-flex items-baseline gap-3 text-[clamp(4.5rem,10vw,8.5rem)] font-extralight leading-none tracking-normal',
  period: 'text-[clamp(1.1rem,2vw,1.7rem)] font-normal text-violet-300',
  date: 'mt-3 text-base font-medium text-white/60 sm:text-lg',
};

export function createClock(settings: DashboardSettings): HTMLElement {
  const clock = document.createElement('section');
  clock.className = styles.wrapper;
  clock.setAttribute('aria-live', 'polite');

  const time = document.createElement('time');
  time.className = styles.time;

  const date = document.createElement('p');
  date.className = styles.date;

  clock.append(time, date);

  const render = () => {
    const now = new Date();
    if (settings.showClock) {
      time.hidden = false;
      time.dateTime = now.toISOString();
      // const timeText = now.toLocaleTimeString([], {
      //   hour: 'numeric',
      //   minute: '2-digit',
      //   hour12: settings.clockFormat === '12h',
      // });
      // const [clockText, period] = timeText.split(' ');
      const parts = new Intl.DateTimeFormat([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: settings.clockFormat === "12h",
      }).formatToParts(now);
      const clockText = parts.filter(part => part.type !== 'dayPeriod').map(part => part.value).join('');
      const period = parts.find(part => part.type === 'dayPeriod')?.value ?? '';
      time.innerHTML = period ? `${clockText}<span class="${styles.period}">${period}</span>` : clockText;
    } else {
      time.hidden = true;
    }

    date.textContent = now.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  render();
  const interval = window.setInterval(render, 30_000);

  const instance = clock as HTMLElement & { destroy(): void };
  instance.destroy = () => {
    clearInterval(interval);
  };

  return instance;
}
