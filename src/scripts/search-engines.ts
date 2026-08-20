import {
    APP_CONFIG,
    type SearchEngineId,
} from "../config";

export type { SearchEngineId } from "../config";

export interface SearchEngine {
    id: SearchEngineId;
    name: string;
    searchUrl: string;
}

export const SEARCH_ENGINES: Record<
    SearchEngineId,
    SearchEngine
> = {
    google: {
        id: "google",
        name: "Google",
        searchUrl:
            "https://www.google.com/search?q=%s",
    },

    bing: {
        id: "bing",
        name: "Bing",
        searchUrl:
            "https://www.bing.com/search?q=%s",
    },

    duckduckgo: {
        id: "duckduckgo",
        name: "DuckDuckGo",
        searchUrl:
            "https://duckduckgo.com/?q=%s",
    },

    brave: {
        id: "brave",
        name: "Brave Search",
        searchUrl:
            "https://search.brave.com/search?q=%s",
    },
};

export const SEARCH_ENGINE_OPTIONS: ReadonlyArray<{
    label: string;
    value: SearchEngineId;
}> = Object.values(SEARCH_ENGINES).map(
    ({ id, name }) => ({
        label: name,
        value: id,
    }),
);

export function getSearchEngine(
    id: SearchEngineId,
): SearchEngine {
    return (
        SEARCH_ENGINES[id] ??
        SEARCH_ENGINES[
            APP_CONFIG.DEFAULTS.settings.defaultSearchEngine
        ]
    );
}

export function buildSearchUrl(
    engineId: SearchEngineId,
    query: string,
): string {
    const engine = getSearchEngine(engineId);

    return engine.searchUrl.replace(
        "%s",
        encodeURIComponent(query),
    );
}
