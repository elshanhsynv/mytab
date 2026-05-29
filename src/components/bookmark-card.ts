import type { BookmarkItem } from '../types';
import { getFaviconFallback, getFaviconUrl, getInitialAvatar } from '../services/favicon';
import { icons } from './icons';

const styles = {
  card:
    'bookmark-card group relative flex w-full flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-center text-white shadow-lg shadow-black/10 backdrop-blur-xl ring-1 ring-white/10 transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/15 hover:shadow-2xl hover:shadow-violet-950/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300',
  comfortable: 'gap-3 py-3',
  compact: 'gap-2 py-2',
  pinned: 'border-violet-300/40 shadow-violet-900/30',
  dragging: 'opacity-50 scale-105',
  icon: 'shrink-0 rounded-xl object-contain',
  iconComfortable: 'size-10 sm:size-10',
  iconCompact: 'size-8 sm:size-8',
  title: 'max-w-full truncate font-semibold leading-tight text-white',
  titleComfortable: 'text-xs',
  titleCompact: 'text-[11px]',
  pinBadge: 'absolute left-3 top-3 size-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,0.8)]',
  actions: 'absolute right-2 top-2 hidden text-violet-200 group-hover:block [&_svg]:size-4',
};

export function createBookmarkCard(
  bookmark: BookmarkItem,
  index = 0,
  density: 'comfortable' | 'compact' = 'comfortable'
): HTMLAnchorElement {
  const card = document.createElement('a');
  const isCompact = density === 'compact';
  card.className = `${styles.card} ${isCompact ? styles.compact : styles.comfortable} ${bookmark.pinned ? styles.pinned : ''}`;
  card.href = bookmark.url;
  card.dataset.bookmarkId = bookmark.id;
  card.draggable = true;
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Open ${bookmark.title}`);
  card.style.animationDelay = `${Math.min(index, 10) * 30}ms`;

  const icon = document.createElement('img');
  icon.className = `${styles.icon} ${isCompact ? styles.iconCompact : styles.iconComfortable}`;
  icon.src = bookmark.favicon || getFaviconUrl(bookmark.url);
  icon.alt = '';
  icon.loading = 'lazy';
  icon.addEventListener('error', () => {
    const fallback = getFaviconFallback(bookmark.url);
    if (icon.src !== fallback && fallback) {
      icon.src = fallback;
      return;
    }
    icon.src = getInitialAvatar(bookmark.title);
  }, { once: true });

  const title = document.createElement('span');
  title.className = `${styles.title} ${isCompact ? styles.titleCompact : styles.titleComfortable}`;
  title.textContent = bookmark.title || bookmark.url;

  if (bookmark.pinned) {
    const pin = document.createElement('span');
    pin.className = styles.pinBadge;
    pin.title = 'Pinned';
    card.append(pin);
  }

  const actions = document.createElement('span');
  actions.className = styles.actions;
  actions.innerHTML = `<span title="Pinned">${icons.pin}</span>`;

  card.title = getDomain(bookmark.url);
  card.append(icon, title);
  if (bookmark.pinned) card.append(actions);
  return card;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
