/**
 * PlantCare 云同步服务
 * 鸿蒙端使用Cloud DB同步，通用端使用本地导出导入
 */
import { dbGetAll, dbSet } from '@/utils/db'

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：同步数据到云端（Cloud DB）
 */
export async function syncToCloud(): Promise<void> {
  try {
    const collections = ['plants', 'care_records', 'growth_records']
    const data: Record<string, any[]> = {}
    for (const col of collections) {
      data[col] = dbGetAll(col)
    }
    // 预留：接入华为 Cloud DB
    console.log('[storage] syncToCloud - placeholder, data size:', JSON.stringify(data).length)
  } catch (e) {
    console.error('[storage] syncToCloud error:', e)
    throw new Error('云端同步失败')
  }
}

/**
 * 鸿蒙端：从云端同步数据
 */
export async function syncFromCloud(): Promise<void> {
  try {
    // 预留：从华为 Cloud DB 拉取数据
    console.log('[storage] syncFromCloud - placeholder')
  } catch (e) {
    console.error('[storage] syncFromCloud error:', e)
    throw new Error('云端拉取失败')
  }
}
// #endif

// #ifndef APP-HARMONY
/**
 * 通用端：导出数据为 JSON 字符串
 */
export async function exportData(): Promise<string> {
  try {
    const collections = ['plants', 'care_records', 'growth_records']
    const data: Record<string, any[]> = {}
    for (const col of collections) {
      data[col] = dbGetAll(col)
    }
    return JSON.stringify(data)
  } catch (e) {
    console.error('[storage] exportData error:', e)
    throw new Error('导出数据失败')
  }
}

/**
 * 通用端：导入数据
 */
export async function importData(jsonStr: string): Promise<void> {
  try {
    const data = JSON.parse(jsonStr) as Record<string, any[]>
    for (const [collection, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          const idField = Object.keys(item).find(
            (k) => k.endsWith('Id') && k !== 'userId' && k !== 'speciesId'
          )
          if (idField) {
            dbSet(collection, item[idField], item)
          }
        }
      }
    }
  } catch (e) {
    console.error('[storage] importData error:', e)
    throw new Error('导入数据失败')
  }
}
// #endif

/**
 * 备份所有本地数据
 */
export async function backupData(): Promise<string> {
  try {
    const collections = ['plants', 'care_records', 'growth_records']
    const backup: Record<string, any> = {}

    for (const collection of collections) {
      backup[collection] = dbGetAll(collection)
    }

    const backupStr = JSON.stringify(backup)
    const backupKey = `plantcare_backup_${Date.now()}`
    uni.setStorageSync(backupKey, backupStr)

    return backupKey
  } catch (e) {
    console.error('[storage] backup error:', e)
    throw new Error('备份失败')
  }
}

/**
 * 恢复数据
 */
export async function restoreData(backupKey: string): Promise<void> {
  try {
    const backupStr = uni.getStorageSync(backupKey) as string
    if (!backupStr) throw new Error('备份数据不存在')

    const backup = JSON.parse(backupStr) as Record<string, any[]>

    for (const [collection, items] of Object.entries(backup)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          const idField = Object.keys(item).find(
            (k) => k.endsWith('Id') && k !== 'userId' && k !== 'speciesId'
          )
          if (idField) {
            dbSet(collection, item[idField], item)
          }
        }
      }
    }
  } catch (e) {
    console.error('[storage] restore error:', e)
    throw new Error('恢复失败')
  }
}
