export const isExtension =
    typeof chrome !== "undefined" && !!chrome?.runtime?.id;

export type WallpaperConfig = {
    id: string;
    name: string;
    background?: string;
    path?: string;
};

export const EXTENSION_NAME = "My Tab";
export const EXTENSION_VERSION = "1.0";
export const EXTENSION_AUTHOR = "Elshan Huseynov";
export const EXTENSION_DESCRIPTION = "A fast, polished custom new tab page";

export const APP_CONFIG = {
    STORAGE_KEYS: {
        SETTINGS: "mytab_settings",
        FAVORITES: "mytab_favorites",
        PINNED: "mytab_pinned",
        RECENT: "mytab_recent",
        WALLPAPER: "mytab_wallpaper",
    },
    DEFAULTS: {
        settings: {
            dashboardView: "favorites" as const,
            wallpaperId: "cosmos",
            wallpaperUrl: "",
            clockFormat: "24h" as const,
            showGreeting: false,
            showClock: true,
            showSearch: true,
            gridRows: 4,
            cardDensity: "compact" as const,
            userName: "",
        },
    },
    WALLPAPERS: [
        {
            id: "cosmos",
            name: "Cosmos",
            background:
                "radial-gradient(circle at 15% 20%, rgba(167, 139, 250, 0.45), transparent 30%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.35), transparent 35%), radial-gradient(circle at 60% 10%, rgba(236, 72, 153, 0.2), transparent 45%), linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #020617 100%)",
        },
        {
            id: "sunset",
            name: "Sunset",
            background:
                "radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.42), transparent 32%), radial-gradient(circle at 75% 70%, rgba(236, 72, 153, 0.38), transparent 34%), radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.2), transparent 50%), linear-gradient(135deg, #2a0d18 0%, #431407 45%, #1e1b4b 100%)",
        },
        {
            id: "royal",
            name: "Royal",
            background:
                "radial-gradient(circle at 22% 22%, rgba(129, 140, 248, 0.45), transparent 30%), radial-gradient(circle at 82% 72%, rgba(168, 85, 247, 0.42), transparent 34%), radial-gradient(circle at 55% 95%, rgba(59, 130, 246, 0.18), transparent 48%), linear-gradient(135deg, #0f172a 0%, #312e81 45%, #140b32 100%)",
        },
        {
            id: "obsidian",
            name: "Obsidian",
            background:
                "radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.08), transparent 22%), radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.22), transparent 32%), radial-gradient(circle at 50% 45%, rgba(17, 24, 39, 0.45), transparent 40%), linear-gradient(135deg, #000000 0%, #0f172a 45%, #030712 100%)",
        },
        {
            id: "midnight-grid",
            name: "Midnight Grid",
            background:
                "linear-gradient(rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.07) 1px, transparent 1px), radial-gradient(circle at 50% 45%, rgba(59, 130, 246, 0.18), transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #111827 100%)",
        },
        {
            id: "neon-horizon",
            name: "Neon Horizon",
            background:
                "radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.45), transparent 38%), radial-gradient(ellipse at 50% 105%, rgba(59, 130, 246, 0.35), transparent 55%), linear-gradient(180deg, #020617 0%, #0b1120 42%, #1e1b4b 70%, #4c1d95 100%)",
        },
        {
            id: "starfield",
            name: "Starfield",
            background:
                "radial-gradient(circle at 8% 15%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.5px), radial-gradient(circle at 22% 72%, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px), radial-gradient(circle at 38% 28%, rgba(255, 255, 255, 0.7) 0 1px, transparent 1.5px), radial-gradient(circle at 57% 82%, rgba(255, 255, 255, 0.5) 0 1px, transparent 1.5px), radial-gradient(circle at 73% 18%, rgba(255, 255, 255, 0.65) 0 1px, transparent 1.5px), radial-gradient(circle at 91% 61%, rgba(255, 255, 255, 0.75) 0 1px, transparent 1.5px), linear-gradient(180deg, #020617 0%, #030712 45%, #111827 100%)",
        },
    ] satisfies WallpaperConfig[],
    GRID: {
        COLUMNS: 7,
        DEFAULT_ROWS: 4,
        MAX_ROWS: 5,
    },
    SEARCH: {
        DEBOUNCE_MS: 200,
    },
    RECENT: {
        MAX_ITEMS: 8,
    },
};
