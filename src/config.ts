export const isExtension = typeof chrome !== 'undefined' && !!chrome?.runtime?.id;

export type WallpaperConfig = {
  id: string;
  name: string;
  background?: string;
  path?: string;
};

export const APP_CONFIG = {
  STORAGE_KEYS: {
    SETTINGS: 'mytab_settings',
    BOOKMARKS: 'mytab_bookmarks',
    FOLDERS: 'mytab_folders',
    FAVORITES: 'mytab_favorites',
    PINNED: 'mytab_pinned',
    RECENT: 'mytab_recent',
    WALLPAPER: 'mytab_wallpaper',
  },
  DEFAULTS: {
    settings: {
      dashboardView: 'favorites' as const,
      wallpaperId: 'aurora',
      wallpaperUrl: '',
      accentColor: '#863bff',
      clockFormat: '24h' as const,
      showGreeting: false,
      showClock: true,
      showSearch: true,
      gridRows: 3,
      cardDensity: 'comfortable' as const,
      userName: '',
    },
  },
  WALLPAPERS: [
    {
      id: 'aurora',
      name: 'Aurora',
      background:
        'radial-gradient(circle at 22% 30%, rgba(48, 73, 255, 0.34), transparent 36%), radial-gradient(circle at 70% 82%, rgba(158, 42, 255, 0.42), transparent 32%), linear-gradient(135deg, #020617 0%, #070735 48%, #120021 100%)',
    },
    {
      id: 'midnight',
      name: 'Midnight',
      background:
        'radial-gradient(circle at 72% 30%, rgba(79, 70, 229, 0.28), transparent 32%), radial-gradient(circle at 28% 80%, rgba(20, 184, 166, 0.2), transparent 28%), linear-gradient(135deg, #020617 0%, #0f172a 100%)',
    },
    {
      id: 'ember',
      name: 'Ember',
      background:
        'radial-gradient(circle at 70% 82%, rgba(236, 72, 153, 0.32), transparent 32%), radial-gradient(circle at 18% 28%, rgba(245, 158, 11, 0.2), transparent 30%), linear-gradient(135deg, #130315 0%, #05030d 54%, #1a0835 100%)',
    },
  ] satisfies WallpaperConfig[],
  FAVICON_API: 'https://www.google.com/s2/favicons?domain={domain}&sz=64',
  FAVICON_FALLBACK: 'https://icons.duckduckgo.com/ip3/{domain}.ico',
  ANIMATION: {
    STAGGER_DELAY: 30,
    MAX_STAGGER: 10,
  },
  GRID: {
    COLUMNS: 7,
    DEFAULT_ROWS: 3,
    MAX_ROWS: 5,
    MAX_ITEMS: 35,
    TILE_SIZE: 112,
    GAP: 16,
  },
  SEARCH: {
    DEBOUNCE_MS: 200,
  },
  RECENT: {
    MAX_ITEMS: 8,
  },
  FAVORITES: {
    FOLDER_ID: 'mytab-favorites',
  },
} as const;
