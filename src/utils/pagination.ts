export type PageWindow = {
  currentPage: number;
  pageCount: number;
  start: number;
  end: number;
};

export function getPageWindow(
  itemCount: number,
  itemsPerPage: number,
  requestedPage: number,
): PageWindow {
  const safeItemsPerPage = Math.max(1, itemsPerPage);
  const pageCount = Math.max(1, Math.ceil(itemCount / safeItemsPerPage));
  const currentPage = Math.min(Math.max(0, requestedPage), pageCount - 1);
  const start = currentPage * safeItemsPerPage;

  return {
    currentPage,
    pageCount,
    start,
    end: Math.min(start + safeItemsPerPage, itemCount),
  };
}
