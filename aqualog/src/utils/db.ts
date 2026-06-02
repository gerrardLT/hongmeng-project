/**
 * 本地存储封装 — 基于 uni.getStorageSync / uni.setStorageSync
 * 以 collection + id 的方式模拟文档型数据库
 */

function getCollectionKey(collection: string): string {
  return `aqualog_db_${collection}`
}

/** 获取单条记录 */
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

/** 获取集合所有记录 */
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

/** 写入/更新一条记录 */
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

/** 删除一条记录 */
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

/** 按条件查询记录 */
export function dbQuery<T>(collection: string, filter: (item: T) => boolean): T[] {
  const all = dbGetAll<T>(collection)
  return all.filter(filter)
}

/** 生成唯一 ID */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
