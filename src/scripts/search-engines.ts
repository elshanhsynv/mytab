import {
  APP_CONFIG,
  type SearchEngineId,
} from "../config";

export type { SearchEngineId } from "../config";

const GOOGLE_ICON = "/icons/google.svg";
const BING_ICON = "/icons/bing.svg";
const DUCKDUCKGO_ICON = "/icons/duckduckgo.svg";
const BRAVE_ICON = "/icons/brave.svg";

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  icon?: string;
  searchUrl: string;
}

export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngine> = {
  google: {
    id: "google",
    name: "Google",
    icon: GOOGLE_ICON,
    searchUrl: "https://www.google.com/search?q=%s",
  },
  bing: {
    id: "bing",
    name: "Bing",
    icon: BING_ICON,
    searchUrl: "https://www.bing.com/search?q=%s",
  },
  duckduckgo: {
    id: "duckduckgo",
    name: "DuckDuckGo",
    icon: DUCKDUCKGO_ICON,
    searchUrl: "https://duckduckgo.com/?q=%s",
  },
  brave: {
    id: "brave",
    name: "Brave Search",
    icon: BRAVE_ICON,
    searchUrl: "https://search.brave.com/search?q=%s",
  },
};

export const SEARCH_ENGINE_OPTIONS: ReadonlyArray<{
  label: string;
  value: SearchEngineId;
}> = Object.values(SEARCH_ENGINES).map(({ id, name }) => ({
  label: name,
  value: id,
}));

export function getSearchEngine(id: SearchEngineId): SearchEngine {
  return (
    SEARCH_ENGINES[id] ??
    SEARCH_ENGINES[APP_CONFIG.DEFAULTS.settings.defaultSearchEngine]
  );
}

export function buildSearchUrl(
  engineId: SearchEngineId,
  query: string,
): string {
  const engine = getSearchEngine(engineId);

  return engine.searchUrl.replace("%s", encodeURIComponent(query));
}
