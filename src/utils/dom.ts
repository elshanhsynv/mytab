export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
  }

  if (children) {
    for (const child of children) {
      element.append(typeof child === 'string' ? document.createTextNode(child) : child);
    }
  }

  return element;
}

export function qs<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T | null {
  return parent.querySelector<T>(selector);
}

export function qsa<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

export function html(template: string): DocumentFragment {
  const tpl = document.createElement('template');
  tpl.innerHTML = template.trim();
  return tpl.content;
}

export function show(element: HTMLElement): void {
  element.removeAttribute('hidden');
}

export function hide(element: HTMLElement): void {
  element.setAttribute('hidden', '');
}
