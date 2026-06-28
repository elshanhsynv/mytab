import { isExtension } from '../config';
import type { BookmarkItem, Folder } from '../types';
import { mockFolders } from './mock-data';

type BookmarkTreeNode = ChromeBookmarkNode;

async function getDashboardBookmarks(): Promise<{ bookmarks: BookmarkItem[]; folders: Folder[] }> {
  if (!isExtension || !chrome?.bookmarks) {
    return cloneMockData();
  }

  try {
    const tree = await chrome.bookmarks.getTree();
    const folders: Folder[] = [];
    const looseBookmarks: BookmarkItem[] = [];

    for (const root of tree) {
      walk(root.children ?? [], folders, looseBookmarks);
    }

    const bookmarks = [...looseBookmarks, ...folders.flatMap((folder) => folder.items)];
    return { bookmarks, folders };
  } catch {
    return cloneMockData();
  }
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
    if (!children.length) continue;

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

export const bookmarkService = { getDashboardBookmarks, search, updateBookmark, removeBookmark };
