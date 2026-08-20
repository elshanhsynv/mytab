const POPULAR_TLDS = new Set([
    // Generic
    "com",
    "net",
    "org",
    "edu",
    "gov",
    "mil",
    "int",
    "info",
    "biz",
    "name",
    "pro",

    // Common short TLDs
    "co",
    "me",
    "io",
    "to",
    "so",

    // Modern
    "app",
    "ai",
    "dev",
    "tech",
    "xyz",
    "online",
    "site",
    "website",
    "store",
    "shop",
    "cloud",
    "page",
    "live",
    "news",
    "blog",
    "digital",
    "social",
    "network",
    "systems",
    "software",
    "data",
    "api",
    "tools",
    "wiki",
    "docs",

    // Azerbaijan / nearby
    "az",
    "tr",
    "ge",

    // Common country domains
    "uk",
    "de",
    "fr",
    "es",
    "it",
    "nl",
    "be",
    "ch",
    "at",
    "se",
    "no",
    "dk",
    "fi",
    "pl",
    "cz",
    "us",
    "ca",
    "au",
    "nz",
    "jp",
    "kr",
    "cn",
    "in",
    "br",
]);

export function recognizeUrl(
    input: string,
): string | null {
    const value = input.trim();

    if (!value) {
        return null;
    }

    if (/\s/.test(value)) {
        return null;
    }

    /*
     * Explicit URL:
     *
     * http://...
     * https://...
     */
    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {
                return null;
            }

            return url.href;
        } catch {
            return null;
        }
    }

    /*
     * Separate hostname from path/query/hash.
     */
    let cut = value.length;

    for (let index = 0; index < value.length; index++) {
        const character = value.charCodeAt(index);

        if (
            character === 47 || // /
            character === 63 || // ?
            character === 35 // #
        ) {
            cut = index;
            break;
        }
    }

    const hostname = value
        .slice(0, cut)
        .toLowerCase();

    const remainder = value.slice(cut);

    if (!isValidHostname(hostname)) {
        return null;
    }

    try {
        const url = new URL(
            `https://${hostname}${remainder}`,
        );

        return url.href;
    } catch {
        return null;
    }
}

function isValidHostname(
    hostname: string,
): boolean {
    const lastDot = hostname.lastIndexOf(".");

    if (
        lastDot <= 0 ||
        lastDot >= hostname.length - 1
    ) {
        return false;
    }

    const tld = hostname.slice(
        lastDot + 1,
    );

    if (!POPULAR_TLDS.has(tld)) {
        return false;
    }

    const labels = hostname.split(".");

    if (labels.length < 2) {
        return false;
    }

    for (const label of labels) {
        if (
            label.length < 1 ||
            label.length > 63
        ) {
            return false;
        }

        if (
            label.startsWith("-") ||
            label.endsWith("-")
        ) {
            return false;
        }

        if (!/^[a-z0-9-]+$/i.test(label)) {
            return false;
        }
    }

    return hostname.length <= 253;
}
