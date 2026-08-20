import {
    APP_CONFIG,
    type SearchEngineId,
} from "../config";
import { buildSearchUrl } from "../scripts/search-engines";
import { recognizeUrl } from "../scripts/url-utils";


export function searchOrNavigate(
    query: string,
    engineId: SearchEngineId =
        APP_CONFIG.DEFAULTS.settings.defaultSearchEngine,
    openInNewTab = false,
): void {
    const value = query.trim();

    if (!value) {
        return;
    }

    const directUrl =
        recognizeUrl(value);

    const url =
        directUrl ??
        buildSearchUrl(
            engineId,
            value,
        );

    if (openInNewTab) {
        window.open(
            url,
            "_blank",
            "noopener,noreferrer",
        );

        return;
    }

    window.location.href = url;
}
