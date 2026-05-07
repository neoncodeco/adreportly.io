type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();

export async function getOrSetCache<T>(
  key: string,
  ttlMs: number,
  factory: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    return existing.value;
  }
  const value = await factory();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}

export function invalidateCacheByPrefix(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}

export const ADMIN_CACHE_HEADERS = {
  "Cache-Control": "private, max-age=10, stale-while-revalidate=30",
} as const;

export const USER_CACHE_HEADERS = {
  "Cache-Control": "private, max-age=8, stale-while-revalidate=20",
} as const;
