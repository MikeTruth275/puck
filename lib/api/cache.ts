type CacheEntry<T> = { data: T; expiry: number }

const store = new Map<string, CacheEntry<unknown>>()

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

export function cached<T>(key: string, fn: () => Promise<T>, ttlMs = DEFAULT_TTL_MS): Promise<T> {
  const existing = store.get(key) as CacheEntry<T> | undefined
  if (existing && Date.now() < existing.expiry) {
    return Promise.resolve(existing.data)
  }

  const promise = fn().then((data) => {
    store.set(key, { data, expiry: Date.now() + ttlMs })
    return data
  })

  return promise
}

export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store.clear()
    return
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}
