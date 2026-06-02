import type { Artwork, UserSettings } from '@/types/models'
import { dbGetAll } from '@/utils/db'
import { isHarmony } from '@/utils/platform'

/** 同步状态存储键 */
const SYNC_STATUS_KEY = 'patterncraft_sync_status'

interface SyncStatus {
  lastSyncTime: number
  status: 'idle' | 'syncing' | 'success' | 'error'
  message?: string
}

/**
 * 全量同步本地数据到云端
 * 鸿蒙端使用 Cloud DB API，其他端使用模拟实现
 */
export async function syncToCloud(): Promise<void> {
  updateSyncStatus('syncing')

  // #ifdef APP-HARMONY
  try {
    const artworks = dbGetAll<Artwork>('artworks')
    const settings = uni.getStorageSync('patterncraft_settings') as UserSettings | undefined

    // @ts-ignore 鸿蒙 Cloud DB API
    if (typeof cloudDB !== 'undefined') {
      // @ts-ignore
      const zone = cloudDB.zone('patterncraft')

      // 同步作品数据
      for (const artwork of artworks) {
        // @ts-ignore
        await zone.upsert('artworks', artwork)
      }

      // 同步设置
      if (settings) {
        // @ts-ignore
        await zone.upsert('settings', { key: 'user_settings', ...settings })
      }

      updateSyncStatus('success', '同步完成')
      console.log('[storage] synced to cloud:', artworks.length, 'artworks')
    } else {
      updateSyncStatus('error', 'Cloud DB 不可用')
      console.warn('[storage] Cloud DB not available')
    }
  } catch (e) {
    updateSyncStatus('error', (e as Error).message)
    console.error('[storage] syncToCloud error:', e)
    throw e
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端：模拟同步
  await new Promise((resolve) => setTimeout(resolve, 800))
  updateSyncStatus('success', '模拟同步完成（非鸿蒙端）')
  console.log('[storage] syncToCloud: mock sync completed (non-Harmony)')
  // #endif
}

/**
 * 从云端恢复数据到本地
 * 鸿蒙端使用 Cloud DB API，其他端使用模拟实现
 */
export async function syncFromCloud(): Promise<void> {
  updateSyncStatus('syncing')

  // #ifdef APP-HARMONY
  try {
    // @ts-ignore 鸿蒙 Cloud DB API
    if (typeof cloudDB !== 'undefined') {
      // @ts-ignore
      const zone = cloudDB.zone('patterncraft')

      // @ts-ignore
      const artworks = await zone.query('artworks', {})
      if (artworks?.length) {
        const store: Record<string, Artwork> = {}
        for (const artwork of artworks) {
          store[artwork.artworkId] = artwork as Artwork
        }
        uni.setStorageSync('patterncraft_db_artworks', store)
      }

      updateSyncStatus('success', '恢复完成')
      console.log('[storage] synced from cloud:', artworks?.length || 0, 'artworks')
    } else {
      updateSyncStatus('error', 'Cloud DB 不可用')
    }
  } catch (e) {
    updateSyncStatus('error', (e as Error).message)
    console.error('[storage] syncFromCloud error:', e)
    throw e
  }
  // #endif

  // #ifndef APP-HARMONY
  await new Promise((resolve) => setTimeout(resolve, 800))
  updateSyncStatus('success', '模拟恢复完成（非鸿蒙端）')
  console.log('[storage] syncFromCloud: mock restore completed (non-Harmony)')
  // #endif
}

/**
 * 上传图片到云存储
 * @param filePath 本地图片文件路径
 * @returns 云端图片 URL
 */
export async function uploadImage(filePath: string): Promise<string> {
  // #ifdef APP-HARMONY
  try {
    // @ts-ignore 鸿蒙 Cloud Storage API
    if (typeof cloudStorage !== 'undefined') {
      const cloudPath = `patterncraft/images/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`
      // @ts-ignore
      const result = await cloudStorage.upload({
        localPath: filePath,
        cloudPath
      })
      console.log('[storage] image uploaded:', result.downloadUrl)
      return result.downloadUrl || cloudPath
    }
  } catch (e) {
    console.error('[storage] uploadImage error:', e)
    throw e
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端：返回本地路径作为模拟
  console.log('[storage] uploadImage: mock upload (non-Harmony)', filePath)
  return filePath
  // #endif
}

/**
 * 删除云端图片
 * @param url 云端图片 URL
 */
export async function deleteCloudImage(url: string): Promise<void> {
  // #ifdef APP-HARMONY
  try {
    // @ts-ignore 鸿蒙 Cloud Storage API
    if (typeof cloudStorage !== 'undefined') {
      // @ts-ignore
      await cloudStorage.delete({ cloudPath: url })
      console.log('[storage] cloud image deleted:', url)
    }
  } catch (e) {
    console.error('[storage] deleteCloudImage error:', e)
  }
  // #endif

  // #ifndef APP-HARMONY
  console.log('[storage] deleteCloudImage: mock delete (non-Harmony)', url)
  // #endif
}

/**
 * 检查同步状态
 * @returns 当前同步状态信息
 */
export function checkSyncStatus(): SyncStatus {
  try {
    const status = uni.getStorageSync(SYNC_STATUS_KEY) as SyncStatus | undefined
    return status || { lastSyncTime: 0, status: 'idle' }
  } catch (e) {
    return { lastSyncTime: 0, status: 'idle' }
  }
}

/**
 * 更新同步状态（内部使用）
 * @param status 状态值
 * @param message 状态信息
 */
function updateSyncStatus(status: SyncStatus['status'], message?: string): void {
  const syncStatus: SyncStatus = {
    lastSyncTime: Date.now(),
    status,
    message
  }
  try {
    uni.setStorageSync(SYNC_STATUS_KEY, syncStatus)
  } catch (e) {
    console.error('[storage] updateSyncStatus error:', e)
  }
}
