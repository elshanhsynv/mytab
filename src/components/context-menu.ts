import type { BookmarkItem } from '../types';
import { icons } from './icons';

type ContextAction = 'open-new-tab' | 'pin' | 'edit' | 'copy' | 'delete';
type MaybePromise<T> = T | Promise<T>;

const styles = {
  menu: 'context-menu fixed z-50 min-w-48 rounded-2xl border border-white/15 bg-white/10 py-1 text-white shadow-2xl shadow-black/30 backdrop-blur-xl ring-1 ring-white/10',
  item:
    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-white/85 transition hover:bg-white/10 hover:text-white',
  danger: 'text-red-300 hover:bg-red-500/10 hover:text-red-200',
  icon: 'size-4 shrink-0 opacity-75 [&_svg]:size-full',
  label: 'flex-1',
  separator: 'my-1 h-px bg-white/10',
};

export function showContextMenu(
  bookmark: BookmarkItem,
  position: { x: number; y: number },
  onAction: (action: ContextAction, bookmark: BookmarkItem) => MaybePromise<void>
): void {
  closeContextMenu();

  const menu = document.createElement('div');
  menu.className = styles.menu;
  menu.setAttribute('role', 'menu');
  const itemType = bookmark.source === 'favorite' ? 'favorite' : 'bookmark';
  menu.innerHTML = `
    ${item('open-new-tab', icons.external, 'Open in new tab')}
    ${item('pin', icons.pin, bookmark.pinned ? 'Unpin' : 'Pin favorite')}
    ${item('edit', icons.edit, `Edit ${itemType}`)}
    ${item('copy', icons.copy, 'Copy URL')}
    <div class="${styles.separator}"></div>
    ${item('delete', icons.trash, `Remove ${itemType}`, true)}
  `;

  document.body.append(menu);
  const rect = menu.getBoundingClientRect();
  const x = Math.min(position.x, window.innerWidth - rect.width - 8);
  const y = Math.min(position.y, window.innerHeight - rect.height - 8);
  menu.style.left = `${Math.max(8, x)}px`;
  menu.style.top = `${Math.max(8, y)}px`;

  const clickHandler = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-context-action]');
    if (target) {
      void Promise.resolve(onAction(target.dataset.contextAction as ContextAction, bookmark)).catch((error: unknown) => {
        console.error('Context menu action failed.', error);
      });
      closeContextMenu();
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keyHandler);
      return;
    }

    if (!menu.contains(event.target as Node)) {
      closeContextMenu();
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    }
  };

  const keyHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeContextMenu();
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    }
  };

  window.setTimeout(() => {
    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', keyHandler);
  }, 0);
}

export function closeContextMenu(): void {
  document.querySelector('.context-menu')?.remove();
}

function item(action: ContextAction, iconMarkup: string, label: string, danger = false): string {
  return `
    <button class="${styles.item} ${danger ? styles.danger : ''}" type="button" role="menuitem" data-context-action="${action}">
      <span class="${styles.icon}">${iconMarkup}</span>
      <span class="${styles.label}">${label}</span>
    </button>
  `;
}
