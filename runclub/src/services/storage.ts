import { dbGetAll, dbSet } from '@/utils/db'

/**
 * 同步数据（预留接口）
 */
export async function syncData(): Promise<void> {
  // 预留：未来接入云端同步
  console.log('[storage] sync data - placeholder')
}

/**
 * 备份所有本地数据
 */
export async function backupData(): Promise<string> {
  try {
    const collections = ['activities', 'registrations', 'checkins', 'results', 'records', 'training_plans', 'clubs', 'runner_cards', 'friends']
    const backup: Record<string, any> = {}

    for (const collection of collections) {
      backup[collection] = dbGetAll(collection)
    }

    const backupStr = JSON.stringify(backup)
    const backupKey = `runclub_backup_${Date.now()}`
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
          const idField = Object.keys(item).find((k) => k.endsWith('Id') && k !== 'userId' && k !== 'clubId' && k !== 'activityId')
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

/**
 * 清除所有数据
 */
export async function clearAllData(): Promise<void> {
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('[storage] clear error:', e)
    throw new Error('清除数据失败')
  }
}
