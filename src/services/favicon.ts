import { APP_CONFIG } from '../config';

export function getFaviconUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return APP_CONFIG.FAVICON_API.replace('{domain}', hostname);
  } catch {
    return '';
  }
}

export function getFaviconFallback(url: string): string {
  try {
    const { hostname } = new URL(url);
    return APP_CONFIG.FAVICON_FALLBACK.replace('{domain}', hostname);
  } catch {
    return '';
  }
}

export function getInitialAvatar(title: string): string {
  const letter = (title || '?')[0].toUpperCase();
  const hue = title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="hsl(${hue}, 60%, 50%)"/><text x="32" y="32" text-anchor="middle" dominant-baseline="central" fill="white" font-size="28" font-family="system-ui">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
