type EventHandler = (data?: unknown) => void;

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  on(event: string, fn: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(fn);
  }

  off(event: string, fn: EventHandler): void {
    this.handlers.get(event)?.delete(fn);
  }

  emit(event: string, data?: unknown): void {
    const fns = this.handlers.get(event);
    if (fns) {
      for (const fn of fns) {
        fn(data);
      }
    }
  }
}

export const eventBus = new EventBus();

export function delegate(
  root: Element,
  selector: string,
  eventType: string,
  handler: (e: Event, target: Element) => void
): () => void {
  const listener = (e: Event) => {
    if (!(e.target instanceof Element)) return;

    const target = e.target.closest(selector);
    if (target && root.contains(target)) {
      handler(e, target);
    }
  };

  root.addEventListener(eventType, listener);

  return () => {
    root.removeEventListener(eventType, listener);
  };
}
