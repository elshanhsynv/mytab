export type PaginationOptions = {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  signal: AbortSignal;
};

const styles = {
  navigation: 'flex justify-center gap-2 pt-4',
  page: 'size-2.5 rounded-full bg-white/35 transition hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-white/70',
  activePage: 'w-5 bg-white hover:bg-white',
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

  for (let page = 0; page < pageCount; page += 1) {
    const button = document.createElement('button');
    const isActive = page === currentPage;
    button.type = 'button';
    button.className = `${styles.page} ${isActive ? styles.activePage : ''}`;
    button.setAttribute('aria-label', `Page ${page + 1}`);
    if (isActive) button.setAttribute('aria-current', 'page');
    button.addEventListener('click', () => onPageChange(page));
    navigation.append(button);
  }

  return navigation;
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
