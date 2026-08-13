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
            wallpaperId: "ocean",
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
            id: "cosmos",
            name: "Cosmos",
            background:
                "radial-gradient(circle at 15% 20%, rgba(167, 139, 250, 0.45), transparent 30%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.35), transparent 35%), radial-gradient(circle at 60% 10%, rgba(236, 72, 153, 0.2), transparent 45%), linear-gradient(135deg, #09090b 0%, #1e1b4b 50%, #020617 100%)",
        },
        {
            id: "galaxy",
            name: "Galaxy",
            background:
                "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.42), transparent 28%), radial-gradient(circle at 80% 75%, rgba(217, 70, 239, 0.4), transparent 34%), radial-gradient(circle at 55% 45%, rgba(255, 255, 255, 0.08), transparent 20%), linear-gradient(135deg, #030712 0%, #111827 45%, #312e81 100%)",
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
        {
            id: "glass",
            name: "Glass",
            background:
                "radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.18), transparent 22%), radial-gradient(circle at 88% 82%, rgba(125, 211, 252, 0.2), transparent 28%), linear-gradient(120deg, rgba(255, 255, 255, 0.06) 0%, transparent 35%, rgba(255, 255, 255, 0.04) 70%, transparent 100%), linear-gradient(135deg, #0f172a 0%, #1e293b 48%, #334155 100%)",
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
            id: "aurora-waves",
            name: "Aurora Waves",
            background:
                "linear-gradient(120deg, transparent 0%, rgba(34, 211, 238, 0.12) 25%, transparent 45%), linear-gradient(60deg, transparent 20%, rgba(129, 140, 248, 0.16) 42%, transparent 65%), linear-gradient(145deg, transparent 30%, rgba(45, 212, 191, 0.12) 52%, transparent 72%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #111827 100%)",
        },
        {
            id: "topographic",
            name: "Topographic",
            background:
                "repeating-radial-gradient(ellipse at 20% 30%, transparent 0 18px, rgba(148, 163, 184, 0.08) 19px 20px, transparent 21px 42px), repeating-radial-gradient(ellipse at 80% 70%, transparent 0 24px, rgba(96, 165, 250, 0.07) 25px 26px, transparent 27px 55px), linear-gradient(135deg, #0c1222 0%, #172033 50%, #0b1120 100%)",
        },
        {
            id: "ink",
            name: "Ink",
            background:
                "radial-gradient(ellipse at 15% 85%, rgba(30, 64, 175, 0.28), transparent 35%), radial-gradient(ellipse at 85% 15%, rgba(15, 118, 110, 0.22), transparent 32%), repeating-radial-gradient(ellipse at 50% 50%, transparent 0 32px, rgba(255, 255, 255, 0.025) 33px 34px, transparent 35px 68px), linear-gradient(145deg, #030712 0%, #111827 48%, #0f172a 100%)",
        },
        {
            id: "starfield",
            name: "Starfield",
            background:
                "radial-gradient(circle at 8% 15%, rgba(255, 255, 255, 0.8) 0 1px, transparent 1.5px), radial-gradient(circle at 22% 72%, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px), radial-gradient(circle at 38% 28%, rgba(255, 255, 255, 0.7) 0 1px, transparent 1.5px), radial-gradient(circle at 57% 82%, rgba(255, 255, 255, 0.5) 0 1px, transparent 1.5px), radial-gradient(circle at 73% 18%, rgba(255, 255, 255, 0.65) 0 1px, transparent 1.5px), radial-gradient(circle at 91% 61%, rgba(255, 255, 255, 0.75) 0 1px, transparent 1.5px), linear-gradient(180deg, #020617 0%, #030712 45%, #111827 100%)",
        },
        {
            id: "rain",
            name: "Rain",
            background:
                "repeating-linear-gradient(105deg, transparent 0 18px, rgba(125, 211, 252, 0.055) 19px 20px, transparent 21px 46px), repeating-linear-gradient(75deg, transparent 0 31px, rgba(255, 255, 255, 0.035) 32px 33px, transparent 34px 64px), radial-gradient(circle at 70% 20%, rgba(56, 189, 248, 0.18), transparent 30%), linear-gradient(135deg, #020617 0%, #0c4a6e 50%, #082f49 100%)",
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
