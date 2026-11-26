// bookmark-grid.ts
import { APP_CONFIG } from '../config';
import type { BookmarkItem } from '../types';
import { clampGridColumns } from '../utils/dashboard-data';
import { createBookmarkCard, createTileMenuButton } from './bookmark-card';

export const MAX_STAGGER_INDEX = 10;

export function createBookmarkGrid(
  bookmarks: BookmarkItem[],
  className = 'grid',
  density: 'comfortable' | 'compact' = 'comfortable',
  columns = APP_CONFIG.GRID.DEFAULT_COLUMNS,
): HTMLElement {
  const grid = document.createElement('div');
  grid.className = `${className} bookmark-grid`;
  grid.setAttribute('role', 'list');
  grid.dataset.grid = 'launcher';
  grid.style.setProperty('--grid-columns', String(clampGridColumns(columns)));

  const fragment = document.createDocumentFragment();

  bookmarks.forEach((bookmark, index) => {
    const card = createBookmarkCard(bookmark, index, density);
    card.style.setProperty('--item-index', String(Math.min(index, MAX_STAGGER_INDEX)));
    fragment.append(asListItem(card, createTileMenuButton(bookmark)));
  });

  grid.append(fragment);
  return grid;
}

/**
 * Wraps a tile for the grid's list. The tile keeps its own role (a link or a
 * button) instead of being turned into a list item, and the wrapper gives the
 * tile's menu button something to sit on.
 */
export function asListItem(...children: HTMLElement[]): HTMLElement {
  const item = document.createElement('div');
  item.className = 'group/tile relative';
  item.setAttribute('role', 'listitem');
  item.append(...children);
  return item;
}
