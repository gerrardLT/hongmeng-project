import type { Entry, EntryType, ReceivedList, SavedEntry } from '@/types/models'
import { dbSet, dbGet, dbGetAll, dbDelete, generateId } from '@/utils/db'

const COLLECTION_RECEIVED = 'receivedLists'
const COLLECTION_SAVED = 'savedEntries'

// #ifdef APP-HARMONY
/**
 * 通过 Share Kit 发送书单
 * @param entries 条目数组
 * @param listType 书单类型
 */
export async function shareEntryList(entries: Entry[], listType: EntryType | 'all'): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.share({
      provider: 'huawei',
      type: 1,
      title: `CultureBox ${listType === 'all' ? '书单' : listType}`,
      summary: `共 ${entries.length} 条推荐`,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || '分享失败'))
    })
  })
}

/**
 * 碰一碰推荐单条
 * @param entry 单条条目
 */
export async function shareSingleEntry(entry: Entry): Promise<void> {
  return new Promise((resolve, reject) => {
    uni.share({
      provider: 'huawei',
      type: 1,
      title: entry.title,
      summary: entry.subtitle,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || '分享失败'))
    })
  })
}

/**
 * 监听接收数据
 * @param callback 收到数据时的回调
 */
export function onReceiveData(callback: (data: ReceivedList) => void): void {
  // 实际项目中应注册 Share Kit 的接收监听
  console.log('[exchange] 已注册接收数据监听')
}
// #endif

// #ifndef APP-HARMONY
/**
 * 非鸿蒙端：分享书单（模拟）
 */
export async function shareEntryList(entries: Entry[], listType: EntryType | 'all'): Promise<void> {
  uni.showToast({ title: '碰一碰功能仅在鸿蒙设备上可用', icon: 'none' })
  return Promise.resolve()
}

/**
 * 非鸿蒙端：碰一碰推荐单条（模拟）
 */
export async function shareSingleEntry(entry: Entry): Promise<void> {
  uni.showToast({ title: '碰一碰功能仅在鸿蒙设备上可用', icon: 'none' })
  return Promise.resolve()
}

/**
 * 非鸿蒙端：监听接收数据（模拟）
 */
export function onReceiveData(callback: (data: ReceivedList) => void): void {
  console.log('[exchange] 非鸿蒙端无法接收碰一碰数据')
}
// #endif

/**
 * 保存收到的书单到本地
 * @param list 收到的书单
 * @returns 保存后的书单
 */
export function saveReceivedList(list: ReceivedList): ReceivedList {
  dbSet(COLLECTION_RECEIVED, list.listId, list)
  return list
}

/**
 * 删除收到的书单
 * @param listId 书单ID
 */
export function deleteReceivedList(listId: string): void {
  dbDelete(COLLECTION_RECEIVED, listId)
}

/**
 * 从书单中保存单个条目
 * @param entry 条目数据
 * @param listId 来源书单ID
 * @param userId 当前用户ID
 * @returns 保存后的记录
 */
export function saveEntryFromList(entry: Entry, listId: string, userId: string): SavedEntry {
  const saved: SavedEntry = {
    savedId: generateId(),
    userId,
    sourceListId: listId,
    entryData: entry,
    status: 'pending',
    remark: '',
    createdAt: Date.now()
  }
  dbSet(COLLECTION_SAVED, saved.savedId, saved)
  return saved
}
