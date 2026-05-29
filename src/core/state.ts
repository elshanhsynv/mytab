import type { AppState, StateKey, StateListener } from '../types/index';
import { APP_CONFIG } from '../config';

class StateManager {
  private state: AppState = {
    bookmarks: [],
    favorites: [],
    folders: [],
    pinnedIds: [],
    searchQuery: '',
    activeFolderId: '',
    settings: { ...APP_CONFIG.DEFAULTS.settings },
    recentlyVisited: [],
  };

  private listeners = new Map<StateKey, Set<StateListener>>();

  get<K extends StateKey>(key: K): AppState[K] {
    return this.state[key];
  }

  set<K extends StateKey>(key: K, value: AppState[K]): void {
    const prev = this.state[key];
    this.state[key] = value;

    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      for (const fn of keyListeners) {
        (fn as StateListener<K>)(value, prev);
      }
    }
  }

  subscribe<K extends StateKey>(key: K, fn: StateListener<K>): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(fn as StateListener);

    return () => {
      this.listeners.get(key)?.delete(fn as StateListener);
    };
  }

  getState(): Readonly<AppState> {
    return this.state;
  }

  init(initialState: Partial<AppState>): void {
    this.state = { ...this.state, ...initialState };
  }
}

export const state = new StateManager();
