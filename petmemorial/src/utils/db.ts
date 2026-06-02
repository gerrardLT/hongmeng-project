const DB_PREFIX = 'petmemorial_'

/**
 * 获取带前缀的存储键名
 * @param collection 集合名
 * @returns 完整键名
 */
function getCollectionKey(collection: string): string {
  return `${DB_PREFIX}${collection}`
}

/**
 * 获取集合中指定 ID 的数据
 * @param collection 集合名
 * @param id 数据 ID
 * @returns 数据或 null
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
 * 获取集合中所有数据
 * @param collection 集合名
 * @returns 数据数组
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
 * 设置集合中指定 ID 的数据
 * @param collection 集合名
 * @param id 数据 ID
 * @param data 数据内容
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
 * 删除集合中指定 ID 的数据
 * @param collection 集合名
 * @param id 数据 ID
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
 * 清空集合数据
 * @param collection 集合名
 */
export function dbClear(collection: string): void {
  try {
    const key = getCollectionKey(collection)
    uni.removeStorageSync(key)
  } catch (e) {
    console.error('dbClear error:', e)
  }
}

/**
 * 条件查询集合数据
 * @param collection 集合名
 * @param filter 过滤函数
 * @returns 符合条件的数据数组
 */
export function dbQuery<T>(collection: string, filter: (item: T) => boolean): T[] {
  const all = dbGetAll<T>(collection)
  return all.filter(filter)
}

/**
 * 生成唯一 ID
 * @returns 唯一标识字符串
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
