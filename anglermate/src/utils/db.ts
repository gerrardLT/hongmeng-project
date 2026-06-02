const DB_PREFIX = 'anglermate_'

/** 存储数据 */
export function setItem(key: string, value: any): void {
  try {
    const data = JSON.stringify(value)
    uni.setStorageSync(`${DB_PREFIX}${key}`, data)
  } catch (e) {
    console.error(`[DB] setItem error: key=${key}`, e)
  }
}

/** 读取数据 */
export function getItem<T = any>(key: string): T | null {
  try {
    const data = uni.getStorageSync(`${DB_PREFIX}${key}`)
    if (!data) return null
    return JSON.parse(data) as T
  } catch (e) {
    console.error(`[DB] getItem error: key=${key}`, e)
    return null
  }
}

/** 删除数据 */
export function removeItem(key: string): void {
  try {
    uni.removeStorageSync(`${DB_PREFIX}${key}`)
  } catch (e) {
    console.error(`[DB] removeItem error: key=${key}`, e)
  }
}

/** 清除所有本应用数据 */
export function clear(): void {
  try {
    const res = uni.getStorageInfoSync()
    res.keys.forEach((k: string) => {
      if (k.startsWith(DB_PREFIX)) {
        uni.removeStorageSync(k)
      }
    })
  } catch (e) {
    console.error('[DB] clear error', e)
  }
}
