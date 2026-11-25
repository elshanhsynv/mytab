export type PaginationOptions = {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  signal: AbortSignal;
};

// Most dots shown at once. With more pages than this, the dots slide with the
// current page and the outermost ones shrink to hint that more pages follow.
const MAX_PAGINATION_DOTS = 7;

const styles = {
  navigation: 'flex items-center justify-center gap-2 pt-4',
  page: 'shrink-0 rounded-full bg-white/35 transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-white/70',
  // Exactly one size class per dot, so Tailwind's class order can't override it.
  dot: 'size-2.5',
  activePage: 'h-2.5 w-5 bg-white hover:bg-white',
  morePages: 'size-1.5',
};

export function createPagination({
  currentPage,
  pageCount,
  onPageChange,
  signal,
}: PaginationOptions): HTMLElement | undefined {
  if (pageCount <= 1) return undefined;

  const navigation = document.createElement('nav');
  navigation.className = styles.navigation;
  navigation.setAttribute('aria-label', 'Grid pages');
  const handleKeyDown = (event: KeyboardEvent) => {
    const targetPage = getTargetPage(event.key, currentPage, pageCount);
    if (targetPage === undefined) return;

    event.preventDefault();
    if (targetPage !== currentPage) onPageChange(targetPage);
  };

  navigation.addEventListener('keydown', handleKeyDown, { signal });
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.defaultPrevented || isInteractiveTarget(event.target)) return;
      handleKeyDown(event);
    },
    { signal },
  );

  const { first, last } = getDotWindow(currentPage, pageCount);

  for (let page = first; page <= last; page += 1) {
    const button = document.createElement('button');
    const isActive = page === currentPage;
    const hintsMore =
      (page === first && first > 0) || (page === last && last < pageCount - 1);
    button.type = 'button';
    button.className = [
      styles.page,
      isActive ? styles.activePage : hintsMore ? styles.morePages : styles.dot,
    ].join(' ');
    button.setAttribute('aria-label', `Page ${page + 1} of ${pageCount}`);
    if (isActive) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => onPageChange(page));
    navigation.append(button);
  }

  return navigation;
}

/** The range of pages that get a dot: at most MAX_PAGINATION_DOTS, centred on the current page where possible. */
function getDotWindow(
  currentPage: number,
  pageCount: number,
): { first: number; last: number } {
  const count = Math.min(pageCount, MAX_PAGINATION_DOTS);
  const first = Math.min(
    Math.max(0, currentPage - Math.floor(count / 2)),
    pageCount - count,
  );
  return { first, last: first + count - 1 };
}

function getTargetPage(
  key: string,
  currentPage: number,
  pageCount: number,
): number | undefined {
  switch (key) {
    case 'ArrowLeft':
      return Math.max(0, currentPage - 1);
    case 'ArrowRight':
      return Math.min(pageCount - 1, currentPage + 1);
    case 'Home':
      return 0;
    case 'End':
      return pageCount - 1;
    default:
      return undefined;
  }
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(
    'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="listbox"]',
  ) !== null;
}
