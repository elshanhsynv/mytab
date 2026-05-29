export abstract class Component {
  protected el: HTMLElement;
  protected cleanups: (() => void)[] = [];

  constructor(tag: keyof HTMLElementTagNameMap = 'div', className?: string) {
    this.el = document.createElement(tag);
    if (className) this.el.className = className;
  }

  abstract render(): void;

  mount(parent: Element): void {
    this.render();
    parent.appendChild(this.el);
  }

  destroy(): void {
    this.cleanups.forEach(fn => fn());
    this.cleanups = [];
    this.el.remove();
  }

  getElement(): HTMLElement {
    return this.el;
  }

  protected onCleanup(fn: () => void): void {
    this.cleanups.push(fn);
  }
}
