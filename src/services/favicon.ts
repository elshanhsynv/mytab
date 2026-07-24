// favicon.ts

export function getIconUrl(url: string): string {
    // Chrome/Brave extension API
    if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.getURL
    ) {
        const favicon = new URL("/_favicon/", chrome.runtime.getURL(""));

        favicon.searchParams.set("pageUrl", url);
        favicon.searchParams.set("size", "64");

        return favicon.toString();
    }

    // Browser fallback
    try {
        const hostname = new URL(url).hostname;

        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
    } catch {
        return "";
    }
}

export function getInitialAvatar(title: string): string {
    const letter = (title || "?")[0].toUpperCase();

    const hue = [...title].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg"
     width="64"
     height="64"
     viewBox="0 0 64 64">

<rect
    width="64"
    height="64"
    rx="16"
    fill="hsl(${hue},70%,50%)"/>

<text
    x="32"
    y="32"
    text-anchor="middle"
    dominant-baseline="middle"
    fill="white"
    font-family="system-ui"
    font-size="28"
    font-weight="600">
${letter}
</text>

</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
