type ChromeBookmarkNode = {
  id: string;
  parentId?: string;
  index?: number;
  url?: string;
  title: string;
  dateAdded?: number;
  children?: ChromeBookmarkNode[];
};

type ChromeBookmarkChanges = {
  title?: string;
  url?: string;
};

type ChromeStorageArea = {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
};

interface ChromeGlobal {
  runtime?: {
    id?: string;
    getURL(path: string): string;
  };
  bookmarks?: {
    getTree(): Promise<ChromeBookmarkNode[]>;
    update(id: string, changes: ChromeBookmarkChanges): Promise<ChromeBookmarkNode>;
    remove(id: string): Promise<void>;
    move(id: string, destination: { parentId?: string; index?: number }): Promise<ChromeBookmarkNode>;
  };
  storage?: {
    local: ChromeStorageArea;
  };
}

declare const chrome: ChromeGlobal | undefined;
