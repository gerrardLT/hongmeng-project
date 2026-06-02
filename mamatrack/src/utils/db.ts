/**
 * 本地存储封装
 * 使用 uni.getStorageSync / uni.setStorageSync 实现简单集合存储
 */

function getCollectionKey(collection: string): string {
  return `mamatrack_db_${collection}`
}

/**
 * 根据 ID 获取集合中的单条数据
 */
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

/**
 * 获取集合中全部数据
 */
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

/**
 * 向集合中写入单条数据
 */
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

/**
 * 从集合中删除单条数据
 */
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

/**
 * 根据过滤条件查询集合数据
 */
export function dbQuery<T>(collection: string, filter: (item: T) => boolean): T[] {
  const all = dbGetAll<T>(collection)
  return all.filter(filter)
}

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * 清空指定集合，或清空所有 mamatrack_db_ 前缀的数据
 */
export function dbClear(collection?: string): void {
  try {
    if (collection) {
      uni.removeStorageSync(getCollectionKey(collection))
    } else {
      const keys = uni.getStorageInfoSync().keys
      keys.forEach((key) => {
        if (key.startsWith('mamatrack_db_')) {
          uni.removeStorageSync(key)
        }
      })
    }
  } catch (e) {
    console.error('dbClear error:', e)
  }
}
