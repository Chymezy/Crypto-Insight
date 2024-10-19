interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const cache: { [key: string]: CacheItem<any> } = {};

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function getFromCache<T>(key: string): T | null {
  const item = cache[key];
  if (item && Date.now() - item.timestamp < CACHE_DURATION) {
    return item.data;
  }
  return null;
}

export function setInCache<T>(key: string, data: T): void {
  cache[key] = { data, timestamp: Date.now() };
}

export function invalidateCache(key: string): void {
  delete cache[key];
}

export function invalidateCacheStartingWith(prefix: string): void {
  Object.keys(cache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete cache[key];
    }
  });
}

export function clearCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}
