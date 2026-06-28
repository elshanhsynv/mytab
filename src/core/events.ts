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
