function getCollectionKey(collection: string): string {
  return `runclub_db_${collection}`
}

export function dbGet<T>(collection: string, id: string): T | null {
  try {
    const key = getCollectionKey(collection)
    const data = uni.getStorageSync(key) as Record<string, T> | undefined
    if (!data) return null
    return data[id] ?? null
  } catch (e) {
    console.error('dbGet error:', e)
    return null
  }
}

export function dbGetAll<T>(collection: string): T[] {
  try {
    const key = getCollectionKey(collection)
    const data = uni.getStorageSync(key) as Record<string, T> | undefined
    if (!data) return []
    return Object.values(data)
  } catch (e) {
    console.error('dbGetAll error:', e)
    return []
  }
}

export function dbSet<T>(collection: string, id: string, data: T): void {
  try {
    const key = getCollectionKey(collection)
    const existing = uni.getStorageSync(key) as Record<string, T> | undefined
    const store = existing || {}
    store[id] = data
    uni.setStorageSync(key, store)
  } catch (e) {
    console.error('dbSet error:', e)
  }
}

export function dbDelete(collection: string, id: string): void {
  try {
    const key = getCollectionKey(collection)
    const existing = uni.getStorageSync(key) as Record<string, any> | undefined
    if (!existing) return
    delete existing[id]
    uni.setStorageSync(key, existing)
  } catch (e) {
    console.error('dbDelete error:', e)
  }
}

export function dbQuery<T>(collection: string, filter: (item: T) => boolean): T[] {
  const all = dbGetAll<T>(collection)
  return all.filter(filter)
}

export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
