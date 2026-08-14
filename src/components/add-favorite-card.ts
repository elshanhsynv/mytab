import type { CardDensity } from "../dashboard/types";
import { icons } from "./icons";

const styles = {
  addFavoriteCard: [
    "add-favorite-card group relative flex w-full flex-col",
    "items-center justify-center rounded-2xl",
    "border border-white/15 bg-white/10",
    "text-center text-white",
    "backdrop-blur-xl ring-1 ring-white/10 transition duration-200",
    "hover:-translate-y-1 hover:border-white/25 hover:bg-white/15",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300",
    "",
  ].join(" "),
  addFavoriteIcon: [
    "grid shrink-0 place-items-center rounded-xl",
    "bg-white/15 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]",
    "transition group-hover:bg-white/20 group-hover:text-white [&_svg]:size-7",
  ].join(" "),
  addFavoriteIconComfortable: "size-10 sm:size-10",
  addFavoriteIconCompact: "size-8 sm:size-8 [&_svg]:size-5",
  addFavoriteTitle:
    "max-w-full truncate font-semibold leading-tight text-white",
};

export function createAddFavoriteCard(
  density: CardDensity,
  index: number,
): HTMLButtonElement {
  const isCompact = density === "compact";
  const card = document.createElement("button");
  card.className = `${styles.addFavoriteCard} ${isCompact ? "gap-2 py-2" : "gap-3 py-3"}`;
  card.style.setProperty("--item-index", String(index));

  console.log(card.style.getPropertyValue("--item-index")); 
  
  card.type = "button";
  card.dataset.action = "add-favorite";
  card.setAttribute("role", "listitem");
  card.setAttribute("aria-label", "Add favorite");

  const icon = document.createElement("span");
  icon.className = `${styles.addFavoriteIcon} ${isCompact ? styles.addFavoriteIconCompact : styles.addFavoriteIconComfortable}`;
  icon.innerHTML = icons.plus;

  const title = document.createElement("span");
  title.className = `${styles.addFavoriteTitle} ${isCompact ? "text-[11px]" : "text-xs"}`;
  title.textContent = "Add shortcut";

  card.append(icon, title);
  return card;
}
