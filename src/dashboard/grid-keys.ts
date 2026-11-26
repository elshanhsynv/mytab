import { delegate } from "../core/events";

/** Everything that sits in a dashboard grid and can take focus. */
const TILE_SELECTOR = [
  ".bookmark-card",
  ".add-favorite-card",
  ".folder-card",
  '[data-action="new-folder"]',
].join(", ");

/**
 * Arrow keys move focus between tiles the way they are laid out on screen:
 * left/right to the previous/next tile, up/down by one row, Home/End to the
 * first/last tile. Moving past the first or last tile of a page goes to the
 * neighbouring page, when there is one.
 */
export function bindGridKeyboard(appRoot: HTMLElement): void {
  delegate(appRoot, TILE_SELECTOR, "keydown", (event, tile) => {
    if (!(event instanceof KeyboardEvent) || !(tile instanceof HTMLElement)) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

    const grid = tile.parentElement;
    if (!grid) return;

    const tiles = Array.from(grid.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(TILE_SELECTOR),
    );
    const index = tiles.indexOf(tile);
    if (index < 0) return;

    const target = getTargetIndex(event.key, index, tiles.length, countColumns(grid));
    if (target === undefined) return;

    event.preventDefault();

    if (target < 0 || target >= tiles.length) {
      turnPage(appRoot, target < 0 ? "previous" : "next");
      return;
    }

    tiles[target]?.focus();
  });
}

/**
 * Where focus goes for `key`. Returns -1 or `count` to leave the page
 * backwards or forwards, and undefined for keys this doesn't handle or moves
 * that stay put (e.g. Up on the top row).
 */
function getTargetIndex(
  key: string,
  index: number,
  count: number,
  columns: number,
): number | undefined {
  switch (key) {
    case "ArrowLeft":
      return index - 1;
    case "ArrowRight":
      return index + 1;
    case "ArrowUp":
      return index - columns >= 0 ? index - columns : undefined;
    case "ArrowDown":
      // On a partly filled last row, Down from the row above lands on the
      // last tile instead of doing nothing.
      if (index + columns < count) return index + columns;
      return Math.floor(index / columns) < Math.floor((count - 1) / columns)
        ? count - 1
        : undefined;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return undefined;
  }
}

/** The number of columns the grid currently shows, which varies with width. */
function countColumns(grid: HTMLElement): number {
  const columns = getComputedStyle(grid)
    .gridTemplateColumns.split(" ")
    .filter(Boolean).length;
  return Math.max(1, columns);
}

/**
 * Asks the page dots to turn the page, then focuses the tile nearest to
 * where the user came from: the first tile going forward, the last going back.
 */
function turnPage(appRoot: HTMLElement, direction: "previous" | "next"): void {
  const pagination = appRoot.querySelector<HTMLElement>('nav[aria-label="Grid pages"]');
  if (!pagination) return;

  const before = pagination.querySelector('[aria-current="page"]');
  pagination.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: direction === "next" ? "ArrowRight" : "ArrowLeft",
      bubbles: true,
      cancelable: true,
    }),
  );

  // The pagination re-renders the grid synchronously when the page changes.
  if (pagination.isConnected && pagination.querySelector('[aria-current="page"]') === before) {
    return;
  }

  const tiles = appRoot.querySelectorAll<HTMLElement>(TILE_SELECTOR);
  const next = direction === "next" ? tiles[0] : tiles[tiles.length - 1];
  next?.focus();
}
