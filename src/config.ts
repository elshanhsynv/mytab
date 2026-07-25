export const isExtension =
    typeof chrome !== "undefined" && !!chrome?.runtime?.id;

export type WallpaperConfig = {
    id: string;
    name: string;
    background?: string;
    path?: string;
};

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
            wallpaperId: "aurora",
            wallpaperUrl: "",
            accentColor: "#863bff",
            clockFormat: "24h" as const,
            showGreeting: false,
            showClock: true,
            showSearch: true,
            gridRows: 4,
            cardDensity: "comfortable" as const,
            userName: "",
        },
    },
    WALLPAPERS: [
        {
            id: "ocean",
            name: "Ocean",
            background:
                "radial-gradient(circle at 18% 20%, rgba(56, 189, 248, 0.45), transparent 30%), radial-gradient(circle at 82% 75%, rgba(99, 102, 241, 0.38), transparent 35%), radial-gradient(circle at 50% 100%, rgba(14, 165, 233, 0.18), transparent 50%), linear-gradient(135deg, #020617 0%, #06283d 45%, #0f172a 100%)",
        },
        {
            id: "sunset",
            name: "Sunset",
            background:
                "radial-gradient(circle at 25% 25%, rgba(251, 146, 60, 0.42), transparent 32%), radial-gradient(circle at 75% 70%, rgba(236, 72, 153, 0.38), transparent 34%), radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.2), transparent 50%), linear-gradient(135deg, #2a0d18 0%, #431407 45%, #1e1b4b 100%)",
        },
        {
            id: "emerald",
            name: "Emerald",
            background:
                "radial-gradient(circle at 20% 25%, rgba(16, 185, 129, 0.42), transparent 32%), radial-gradient(circle at 78% 78%, rgba(34, 197, 94, 0.35), transparent 36%), radial-gradient(circle at 50% 0%, rgba(45, 212, 191, 0.18), transparent 45%), linear-gradient(135deg, #022c22 0%, #052e16 45%, #020617 100%)",
        },
        {
            id: "royal",
            name: "Royal",
            background:
                "radial-gradient(circle at 22% 22%, rgba(129, 140, 248, 0.45), transparent 30%), radial-gradient(circle at 82% 72%, rgba(168, 85, 247, 0.42), transparent 34%), radial-gradient(circle at 55% 95%, rgba(59, 130, 246, 0.18), transparent 48%), linear-gradient(135deg, #0f172a 0%, #312e81 45%, #140b32 100%)",
        },
        {
            id: "crimson",
            name: "Crimson",
            background:
                "radial-gradient(circle at 18% 18%, rgba(248, 113, 113, 0.42), transparent 30%), radial-gradient(circle at 82% 78%, rgba(239, 68, 68, 0.35), transparent 34%), radial-gradient(circle at 50% 100%, rgba(251, 191, 36, 0.18), transparent 50%), linear-gradient(135deg, #1f0a0a 0%, #450a0a 50%, #111827 100%)",
        },
        {
            id: "cosmos",
            name: "Cosmos",
            background:
                "radial-gradient(circle at 15% 20%, rgba(167, 139, 250, 0.45), transparent 30%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.35), transparent 35%), radial-gradient(circle at 60% 10%, rgba(236, 72, 153, 0.2), transparent 45%), linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #020617 100%)",
        },
        {
            id: "forest",
            name: "Forest",
            background:
                "radial-gradient(circle at 22% 18%, rgba(74, 222, 128, 0.4), transparent 30%), radial-gradient(circle at 78% 82%, rgba(16, 185, 129, 0.35), transparent 35%), radial-gradient(circle at 50% 0%, rgba(163, 230, 53, 0.15), transparent 45%), linear-gradient(135deg, #052e16 0%, #14532d 50%, #020617 100%)",
        },
        {
            id: "galaxy",
            name: "Galaxy",
            background:
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.42), transparent 28%), radial-gradient(circle at 80% 75%, rgba(217, 70, 239, 0.4), transparent 34%), radial-gradient(circle at 55% 45%, rgba(255, 255, 255, 0.08), transparent 20%), linear-gradient(135deg, #030712 0%, #111827 45%, #312e81 100%)",
        },
        {
            id: "golden",
            name: "Golden Hour",
            background:
                "radial-gradient(circle at 20% 20%, rgba(253, 224, 71, 0.45), transparent 28%), radial-gradient(circle at 80% 75%, rgba(251, 191, 36, 0.35), transparent 34%), radial-gradient(circle at 50% 100%, rgba(255, 255, 255, 0.08), transparent 45%), linear-gradient(135deg, #1c1917 0%, #78350f 45%, #f59e0b 100%)",
        },
        {
            id: "graphite",
            name: "Graphite",
            background:
                "radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.12), transparent 26%), radial-gradient(circle at 75% 70%, rgba(148, 163, 184, 0.15), transparent 32%), linear-gradient(135deg, #000000 0%, #111827 45%, #374151 100%)",
        },
        {
            id: "obsidian",
            name: "Obsidian",
            background:
                "radial-gradient(circle at 22% 18%, rgba(255, 255, 255, 0.08), transparent 22%), radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.22), transparent 32%), radial-gradient(circle at 50% 45%, rgba(17, 24, 39, 0.45), transparent 40%), linear-gradient(135deg, #000000 0%, #0f172a 45%, #030712 100%)",
        },
        {
            id: "volcanic",
            name: "Volcanic",
            background:
                "radial-gradient(circle at 18% 22%, rgba(239, 68, 68, 0.38), transparent 28%), radial-gradient(circle at 82% 78%, rgba(249, 115, 22, 0.3), transparent 34%), radial-gradient(circle at 50% 100%, rgba(120, 53, 15, 0.18), transparent 48%), linear-gradient(135deg, #120909 0%, #2b0a03 45%, #09090b 100%)",
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
