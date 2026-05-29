import { isExtension } from '../config';

async function get<T>(key: string, fallback: T): Promise<T> {
  if (isExtension && chrome?.storage?.local) {
    const result = await chrome.storage.local.get(key);
    return (result[key] as T) ?? fallback;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function set(key: string, value: unknown): Promise<void> {
  if (isExtension && chrome?.storage?.local) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

async function remove(key: string): Promise<void> {
  if (isExtension && chrome?.storage?.local) {
    await chrome.storage.local.remove(key);
    return;
  }

  localStorage.removeItem(key);
}

async function clear(): Promise<void> {
  if (isExtension && chrome?.storage?.local) {
    await chrome.storage.local.clear();
    return;
  }

  const keys = Object.keys(localStorage).filter((k) => k.startsWith('mytab_'));
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}

export const storage = { get, set, remove, clear };
