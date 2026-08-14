import type { Folder } from '../types';
import { icons } from './icons';

const styles = {
  card:
    'folder-card group relative flex aspect-square w-full flex-col items-center justify-center gap-4 rounded-2xl bg-white/10 p-4 text-center text-white backdrop-blur-xl ring-1 ring-white/10 transition duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-white/15',
  icon: 'size-11 text-violet-300 transition group-hover:scale-105 [&_svg]:size-full',
  name: 'max-w-full truncate text-sm font-medium text-white/80',
  count:
    'absolute right-3 top-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-violet-400/15 px-2 text-xs font-semibold text-violet-200',
};

export function createFolderCard(folder: Folder): HTMLElement {
  const card = document.createElement('button');
  card.className = styles.card;
  card.type = 'button';
  card.dataset.folderId = folder.id;
  const count = folder.items.length;

  card.setAttribute(
    'aria-label',
    `${folder.title}, ${count} item${count === 1 ? '' : 's'}`
  );

  card.innerHTML = `
    <span class="${styles.icon}">${icons.folder}</span>
    <span class="${styles.name}">${escapeText(folder.title)}</span>
    <span class="${styles.count}">${folder.items.length}</span>
  `;
  return card;
}

function escapeText(value: string): string {
  const span = document.createElement('span');
  span.textContent = value;
  return span.innerHTML;
}
