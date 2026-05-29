import { APP_CONFIG, isExtension, type WallpaperConfig } from '../config';

export function getWallpaperBackground(wallpaperId: string, customUrl: string): string {
  if (wallpaperId === 'custom' && customUrl.trim()) {
    return wallpaperImage(customUrl.trim());
  }

  const wallpaper = APP_CONFIG.WALLPAPERS.find((item) => item.id === wallpaperId) ?? APP_CONFIG.WALLPAPERS[0];
  return getWallpaperCss(wallpaper);
}

export function getWallpaperOptions(): readonly WallpaperConfig[] {
  return APP_CONFIG.WALLPAPERS;
}

export function getWallpaperPreview(wallpaper: WallpaperConfig): string {
  return getWallpaperCss(wallpaper);
}

function getWallpaperCss(wallpaper?: WallpaperConfig): string {
  if (wallpaper?.path) return wallpaperImage(wallpaper.path);
  return wallpaper?.background ?? 'linear-gradient(135deg, #020617 0%, #09090b 100%)';
}

function wallpaperImage(url: string): string {
  const resolvedUrl = resolveWallpaperUrl(url);
  return `linear-gradient(rgba(3, 6, 23, 0.28), rgba(3, 6, 23, 0.28)), url("${resolvedUrl}")`;
}

function resolveWallpaperUrl(url: string): string {
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  if (isExtension && chrome?.runtime?.id) return chrome.runtime.getURL(url.replace(/^\/+/, ''));
  return url.startsWith('/') ? url : `/${url}`;
}
