const SUGGESTIONS_URL = "https://suggestqueries.google.com/complete/search";

export async function fetchSearchSuggestions(
    query: string,
    signal: AbortSignal,
): Promise<string[]> {
    const value = query.trim();

    if (!value) {
        return [];
    }

    const url = new URL(SUGGESTIONS_URL);
    url.searchParams.set("client", "chrome");
    url.searchParams.set("q", value);

    const response = await fetch(url, { cache: "no-store", signal });

    if (!response.ok) {
        throw new Error(`Suggestion service returned ${response.status}`);
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data) || !Array.isArray(data[1])) {
        return [];
    }

    return data[1]
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 7);
}
