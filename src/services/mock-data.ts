import type { BookmarkItem, Folder } from '../types';

const now = Date.now();

export const mockFolders: Folder[] = [
  {
    id: 'folder-development',
    title: 'Development',
    order: 0,
    items: [
      bookmark('dev-1', 'MDN Web Docs', 'https://developer.mozilla.org', 'folder-development', 'Development', 0),
      bookmark('dev-2', 'TypeScript', 'https://www.typescriptlang.org/docs', 'folder-development', 'Development', 1),
      bookmark('dev-3', 'Vite', 'https://vite.dev', 'folder-development', 'Development', 2),
      bookmark('dev-4', 'Chrome Extensions', 'https://developer.chrome.com/docs/extensions', 'folder-development', 'Development', 3),
      bookmark('dev-5', 'ChatGPT', 'https://chatgpt.com', 'folder-development', 'Development', 4),
      bookmark('dev-6', 'Firebase', 'https://firebase.google.com', 'folder-development', 'Development', 5),
    ],
  },
  {
    id: 'folder-design',
    title: 'Design',
    order: 1,
    items: [
      bookmark('design-1', 'Figma', 'https://www.figma.com', 'folder-design', 'Design', 0),
      bookmark('design-2', 'Mobbin', 'https://mobbin.com', 'folder-design', 'Design', 1),
      bookmark('design-3', 'Notion', 'https://www.notion.so', 'folder-design', 'Design', 2),
      bookmark('design-4', 'Raycast', 'https://www.raycast.com', 'folder-design', 'Design', 3),
      bookmark('design-5', 'Gemini', 'https://gemini.google.com', 'folder-design', 'Design', 4),
    ],
  },
  {
    id: 'folder-social',
    title: 'Social',
    order: 2,
    items: [
      bookmark('social-1', 'GitHub', 'https://github.com', 'folder-social', 'Social', 0),
      bookmark('social-2', 'Product Hunt', 'https://www.producthunt.com', 'folder-social', 'Social', 1),
      bookmark('social-3', 'Hacker News', 'https://news.ycombinator.com', 'folder-social', 'Social', 2),
      bookmark('social-4', 'Read.cv', 'https://read.cv', 'folder-social', 'Social', 3),
      bookmark('social-5', 'Reddit', 'https://www.reddit.com', 'folder-social', 'Social', 4),
      bookmark('social-6', 'Pinterest', 'https://www.pinterest.com', 'folder-social', 'Social', 5),
      bookmark('social-7', 'Facebook', 'https://www.facebook.com', 'folder-social', 'Social', 6),
    ],
  },
  {
    id: 'folder-news',
    title: 'News',
    order: 3,
    items: [
      bookmark('news-1', 'The Verge', 'https://www.theverge.com', 'folder-news', 'News', 0),
      bookmark('news-2', 'Wired', 'https://www.wired.com', 'folder-news', 'News', 1),
      bookmark('news-3', 'TechCrunch', 'https://techcrunch.com', 'folder-news', 'News', 2),
      bookmark('news-4', 'Ars Technica', 'https://arstechnica.com', 'folder-news', 'News', 3),
      bookmark('news-5', 'YouTube', 'https://www.youtube.com', 'folder-news', 'News', 4),
      bookmark('news-6', 'Spotify', 'https://open.spotify.com', 'folder-news', 'News', 5),
      bookmark('news-7', 'Gmail', 'https://mail.google.com', 'folder-news', 'News', 6),
    ],
  },
];

function bookmark(
  id: string,
  title: string,
  url: string,
  folderId: string,
  folderTitle: string,
  order: number
): BookmarkItem {
  return {
    id,
    title,
    url,
    source: 'bookmark',
    folderId,
    folderTitle,
    order,
    dateAdded: now - order * 86_400_000,
  };
}
