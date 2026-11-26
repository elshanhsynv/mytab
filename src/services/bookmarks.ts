import { isExtension } from '../config';
import type { BookmarkItem, Folder } from '../types';
import { mockFolders } from './mock-data';

type BookmarkTreeNode = ChromeBookmarkNode;

async function getDashboardBookmarks(): Promise<{ bookmarks: BookmarkItem[]; folders: Folder[] }> {
  if (!isExtension || !chrome?.bookmarks) {
    return cloneMockData();
  }

  try {
    return await readBrowserBookmarks();
  } catch {
    return cloneMockData();
  }
}

/**
 * Reads the browser's bookmark tree. Unlike getDashboardBookmarks it throws
 * on failure instead of falling back to sample data, so a failed refresh
 * never replaces real bookmarks.
 */
async function readBrowserBookmarks(): Promise<{ bookmarks: BookmarkItem[]; folders: Folder[] }> {
  if (!isExtension || !chrome?.bookmarks) {
    throw new Error('Browser bookmarks are not available.');
  }

  const tree = await chrome.bookmarks.getTree();
  const folders: Folder[] = [];
  const looseBookmarks: BookmarkItem[] = [];

  for (const root of tree) {
    walk(root.children ?? [], folders, looseBookmarks);
  }

  const bookmarks = [...looseBookmarks, ...folders.flatMap((folder) => folder.items)];
  return { bookmarks, folders };
}

/**
 * Calls `onChange` whenever the browser's bookmarks change, including changes
 * made outside this page. A bookmark import fires many events, so those are
 * held back and reported once when the import ends. Returns a function that
 * stops listening. Does nothing outside the extension.
 */
function watchBookmarks(onChange: () => void): () => void {
  const api = isExtension ? chrome?.bookmarks : undefined;
  if (!api) return () => {};

  let importing = false;
  const handleChange = () => {
    if (!importing) onChange();
  };
  const handleImportBegan = () => {
    importing = true;
  };
  const handleImportEnded = () => {
    importing = false;
    onChange();
  };

  const listeners: [ChromeEvent, () => void][] = [
    [api.onCreated, handleChange],
    [api.onRemoved, handleChange],
    [api.onChanged, handleChange],
    [api.onMoved, handleChange],
    [api.onChildrenReordered, handleChange],
    [api.onImportBegan, handleImportBegan],
    [api.onImportEnded, handleImportEnded],
  ];

  for (const [event, listener] of listeners) event.addListener(listener);
  return () => {
    for (const [event, listener] of listeners) event.removeListener(listener);
  };
}

function search(bookmarks: BookmarkItem[], query: string): BookmarkItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return bookmarks;

  return bookmarks.filter((bookmark) => {
    const haystack = `${bookmark.title} ${bookmark.url} ${bookmark.folderTitle ?? ''}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

async function updateBookmark(bookmark: BookmarkItem, changes: Partial<Pick<BookmarkItem, 'title' | 'url'>>): Promise<BookmarkItem> {
  const next = { ...bookmark, ...changes };
  if (isExtension && chrome?.bookmarks) {
    await chrome.bookmarks.update(bookmark.id, {
      title: changes.title,
      url: changes.url,
    });
  }
  return next;
}

async function removeBookmark(id: string): Promise<void> {
  if (isExtension && chrome?.bookmarks) {
    await chrome.bookmarks.remove(id);
  }
}

type NewBookmark = Pick<BookmarkItem, 'title' | 'url' | 'folderId' | 'order'> & { id?: string };

/**
 * Creates a bookmark in its folder at its `order`, or at the end of the
 * folder when `order` is missing. Returns the ID Chrome gives it. Outside the
 * extension it returns `id` if one is given (e.g. undoing a removal) or a new
 * local ID.
 */
async function createBookmark(bookmark: NewBookmark): Promise<string> {
  if (!isExtension || !chrome?.bookmarks) return bookmark.id ?? localId('bookmark');

  const node = await chrome.bookmarks.create({
    parentId: bookmark.folderId,
    index: bookmark.order,
    title: bookmark.title,
    url: bookmark.url,
  });
  return node.id;
}

/**
 * Creates an empty folder at the end of the bookmarks bar and returns its ID.
 */
async function createFolder(title: string): Promise<string> {
  if (!isExtension || !chrome?.bookmarks) return localId('folder');

  // The tree's first top-level folder is the bookmarks bar.
  const [root] = await chrome.bookmarks.getTree();
  const bookmarksBar = root?.children?.find((node) => !node.url);
  if (!bookmarksBar) throw new Error('Could not find the bookmarks bar.');

  const node = await chrome.bookmarks.create({ parentId: bookmarksBar.id, title });
  return node.id;
}

/**
 * Moves a bookmark to the end of another folder. Returns its new index there
 * when the browser reports one.
 */
async function moveBookmarkToFolder(id: string, folderId: string): Promise<number | undefined> {
  if (!isExtension || !chrome?.bookmarks) return undefined;

  const node = await chrome.bookmarks.move(id, { parentId: folderId });
  return node.index;
}

function localId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

/**
 * Moves a bookmark to `index` inside `parentId`. `index` is the position the
 * bookmark should end up at once the move is done.
 */
async function moveBookmark(id: string, parentId: string, fromIndex: number, toIndex: number): Promise<void> {
  if (!isExtension || !chrome?.bookmarks) return;

  // Chrome reads the index against the list *before* the bookmark is taken
  // out, so moving it later in the same folder needs one extra slot.
  const index = toIndex > fromIndex ? toIndex + 1 : toIndex;
  await chrome.bookmarks.move(id, { parentId, index });
}

function walk(nodes: BookmarkTreeNode[], folders: Folder[], looseBookmarks: BookmarkItem[], parentFolder?: Folder): void {
  for (const node of nodes) {
    if (node.url) {
      const item = toBookmark(node, parentFolder);
      if (parentFolder) {
        parentFolder.items.push(item);
      } else {
        looseBookmarks.push(item);
      }
      continue;
    }

    const children = node.children ?? [];
    // Skip empty top-level folders such as an unused "Mobile bookmarks", but
    // keep empty folders the user made, so bookmarks can be added to them.
    if (!children.length && !parentFolder) continue;

    const folder: Folder = {
      id: node.id,
      title: node.title || 'Untitled folder',
      items: [],
      order: node.index ?? folders.length,
    };

    folders.push(folder);
    walk(children, folders, looseBookmarks, folder);
  }
}

function toBookmark(node: BookmarkTreeNode, folder?: Folder): BookmarkItem {
  return {
    id: node.id,
    title: node.title || node.url || 'Untitled',
    url: node.url ?? '',
    source: 'bookmark',
    folderId: folder?.id,
    folderTitle: folder?.title,
    dateAdded: node.dateAdded,
    order: node.index,
  };
}

function cloneMockData(): { bookmarks: BookmarkItem[]; folders: Folder[] } {
  const folders = mockFolders.map((folder) => ({
    ...folder,
    items: folder.items.map((item) => ({ ...item })),
  }));

  return {
    folders,
    bookmarks: folders.flatMap((folder) => folder.items.map((item) => ({ ...item }))),
  };
}

export const bookmarkService = {
  getDashboardBookmarks,
  readBrowserBookmarks,
  watchBookmarks,
  search,
  updateBookmark,
  removeBookmark,
  createBookmark,
  createFolder,
  moveBookmarkToFolder,
  moveBookmark,
};
