/**
 * 获取集合在本地存储中的键名
 * @param collection 集合名称
 * @returns 带前缀的存储键名
 */
function getCollectionKey(collection: string): string {
  return `coloraid_db_${collection}`
}

/**
 * 获取单条数据
 * @param collection 集合名称
 * @param id 数据ID
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
 * 获取集合全部数据
 * @param collection 集合名称
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
 * 写入单条数据
 * @param collection 集合名称
 * @param id 数据ID
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
 * 删除单条数据
 * @param collection 集合名称
 * @param id 数据ID
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
 * 条件查询数据
 * @param collection 集合名称
 * @param filter 过滤函数
 * @returns 符合条件的数据数组
 */
export function dbQuery<T>(collection: string, filter: (item: T) => boolean): T[] {
  const all = dbGetAll<T>(collection)
  return all.filter(filter)
}

/**
 * 生成唯一ID
 * @returns 唯一标识字符串
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}
