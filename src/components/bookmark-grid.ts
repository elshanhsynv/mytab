import type { BookmarkItem } from '../types';
import { createBookmarkCard } from './bookmark-card';

export function createBookmarkGrid(
  bookmarks: BookmarkItem[],
  className = 'grid',
  density: 'comfortable' | 'compact' = 'comfortable'
): HTMLElement {
  const grid = document.createElement('div');
  grid.className = className;
  grid.setAttribute('role', 'list');

  const fragment = document.createDocumentFragment();
  bookmarks.forEach((bookmark, index) => {
    const card = createBookmarkCard(bookmark, index, density);
    card.setAttribute('role', 'listitem');
    fragment.append(card);
  });

  grid.append(fragment);
  return grid;
}
