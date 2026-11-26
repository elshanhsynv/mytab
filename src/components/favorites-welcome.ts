import { icons } from "./icons";

const styles = {
  panel:
    "empty-surface mx-auto grid max-w-md justify-items-center gap-4 rounded-3xl border border-white/10 bg-white/10 px-8 py-9 text-center text-white backdrop-blur-md",
  icon:
    "grid size-12 place-items-center rounded-2xl bg-violet-400/15 text-violet-200 [&_svg]:size-6",
  title: "text-base font-semibold text-white",
  text: "max-w-sm text-sm leading-6 text-white/70",
  actions: "mt-1 flex flex-wrap justify-center gap-3",
  primary:
    "inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-900 transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 [&_svg]:size-4",
  secondary:
    "inline-flex h-9 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300",
};

/**
 * Shown instead of an empty Favorites grid, so a new user sees what the view
 * is for and can reach the bookmarks they already have.
 */
export function createFavoritesWelcome(bookmarkCount: number): HTMLElement {
  const panel = document.createElement("div");
  panel.className = styles.panel;

  const icon = document.createElement("span");
  icon.className = styles.icon;
  icon.innerHTML = icons.star;

  const title = document.createElement("h2");
  title.className = styles.title;
  title.textContent = "Keep your favorite sites one click away";

  const text = document.createElement("p");
  text.className = styles.text;
  text.textContent =
    bookmarkCount > 0
      ? "Add the sites you use most as favorites, or start from the bookmarks you already have in Chrome. Open a bookmark’s ⋯ menu and choose “Add to favorites”."
      : "Add the sites you use most as favorites.";

  const actions = document.createElement("div");
  actions.className = styles.actions;

  const add = document.createElement("button");
  add.type = "button";
  add.className = styles.primary;
  add.dataset.action = "add-favorite";
  add.innerHTML = `${icons.plus}<span>Add favorite</span>`;
  actions.append(add);

  if (bookmarkCount > 0) {
    const browse = document.createElement("button");
    browse.type = "button";
    browse.className = styles.secondary;
    // Handled by the same click delegation as the view tabs.
    browse.dataset.view = "bookmarks";
    browse.textContent = `Show my bookmarks (${bookmarkCount})`;
    actions.append(browse);
  }

  panel.append(icon, title, text, actions);
  return panel;
}
