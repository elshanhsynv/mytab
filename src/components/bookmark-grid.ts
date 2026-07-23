// bookmark-grid.ts
import type { BookmarkItem } from '../types';
import { createBookmarkCard } from './bookmark-card';

const MAX_STAGGER_INDEX = 10;

export function createBookmarkGrid(
  bookmarks: BookmarkItem[],
  className = 'grid',
  density: 'comfortable' | 'compact' = 'comfortable'
): HTMLElement {
  const grid = document.createElement('div');
  grid.className = `${className} bookmark-grid`;
  grid.setAttribute('role', 'list');
  grid.dataset.grid = 'launcher';

  const fragment = document.createDocumentFragment();

  bookmarks.forEach((bookmark, index) => {
    const card = createBookmarkCard(bookmark, index, density);
    card.setAttribute('role', 'listitem');
    card.style.setProperty('--item-index', String(Math.min(index, MAX_STAGGER_INDEX)));
    fragment.append(card);
  });

  grid.append(fragment);
  return grid;
}