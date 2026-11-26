# My Tab

[![CI](https://github.com/elshanhsynv/mytab/actions/workflows/ci.yml/badge.svg)](https://github.com/elshanhsynv/mytab/actions/workflows/ci.yml)

My Tab is a fast, customizable Chrome new-tab extension built with TypeScript, vanilla DOM APIs, and Tailwind CSS. It replaces the default new-tab page with a personal dashboard for quick access to sites and bookmarks.

## Features

- **Search** the web with Google, Bing, DuckDuckGo or Brave, with autocomplete suggestions. Typing an address opens it directly, and typing also filters the tiles on the dashboard.
- **Favorites**: your own shortcuts. Add, edit, pin, reorder by dragging, and remove them with Undo.
- **Browser bookmarks** in a grid or by folder. Create bookmarks and folders, move bookmarks between folders, reorder, edit, and remove them with Undo. Changes are saved to Chrome, and changes made elsewhere in Chrome show up straight away.
- **Paging** with dots, the mouse, or the keyboard.
- **Customization**: 7 built-in wallpapers or your own (URL or upload), a 12/24-hour clock, a greeting, grid size (up to 5 rows and 4–8 columns), and tile density.
- **Backup**: export and import your settings and favorites as a JSON file.

### Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `/` or `Ctrl`/`Cmd` + `K` | Focus the search bar |
| `Enter` / `Ctrl`/`Cmd` + `Enter` | Search or open the address, in this tab / a new tab |
| `Esc` | Clear the search, or leave an open folder |
| Arrow keys, `Home`, `End` | Move between tiles; past the first or last tile, turn the page |
| `←` / `→` (focus outside the grid) | Previous / next page |
| `Ctrl`/`Cmd` + `,` | Open settings |

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 22 (20.19 or newer also works)
- npm
- Chrome, or another Chromium-based browser that supports Manifest V3 extensions

### Install

```sh
npm install
```

### Run the dev server

```sh
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). Outside the extension, the dashboard uses **sample bookmarks** and saves settings to `localStorage`. Search suggestions don't load there, because the browser blocks the request outside the extension.

### Build and load the extension

```sh
npm run build
```

This type-checks the code and writes the extension to `dist/`, including `dist/manifest.json` (generated in [`vite.config.ts`](vite.config.ts)). To load it:

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `dist` folder.
4. Open a new tab.

After rebuilding, click the reload icon on the extension's card in `chrome://extensions`, then open a new tab.

Every CI run also uploads a ready-to-load build as the `my-tab-extension` artifact.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with sample data |
| `npm run build` | Type-check with `tsc`, then build the extension into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

## Permissions and data

| Permission | Used for |
| --- | --- |
| `bookmarks` | Reading, creating, editing, moving and removing your Chrome bookmarks |
| `storage` | Saving settings, favorites, pins and the custom wallpaper in `chrome.storage.local` |
| `favicon` | Showing site icons from Chrome's own favicon cache |
| `https://suggestqueries.google.com/*` | Fetching search suggestions |

Your data stays in the browser on this computer; it is not synced. One exception: search suggestions come from Google, so whatever you type in the search bar is sent to Google as you type, whichever search engine you pick.

## Project structure

```text
src/
  app.ts            Entry point
  config.ts         App settings: defaults, wallpapers, grid limits, storage keys
  core/             State store, storage wrapper, event delegation
  dashboard/        Startup, rendering, actions, event wiring, bookmark sync, toasts
  components/       DOM building blocks: tiles, grids, modals, menus, search bar
  services/         Chrome bookmarks, favicons, wallpapers, sample data
  scripts/          Search: engines, suggestions, URL detection, results list
  utils/            Small helpers: pagination, debounce, settings validation
  pages/newtab.html The new-tab page
public/icons/       Extension and search-engine icons
```

## Continuous integration

[GitHub Actions](.github/workflows/ci.yml) runs `npm ci` and `npm run build` on every pull request and every push to `main`, so type errors and broken builds are caught before merging.
