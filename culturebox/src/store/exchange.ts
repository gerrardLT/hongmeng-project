import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ReceivedList, SavedEntry } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'

const RECEIVED_LISTS_COLLECTION = 'receivedLists'
const SAVED_ENTRIES_COLLECTION = 'savedEntries'

export const useExchangeStore = defineStore('exchange', () => {
  // state
  const receivedLists = ref<ReceivedList[]>([])
  const savedEntries = ref<SavedEntry[]>([])

  // getters
  /** 按 meetTime 倒序排列的收到书单 */
  const sortedReceivedLists = computed(() => {
    return [...receivedLists.value].sort((a, b) => b.meetTime - a.meetTime)
  })

  /** 状态为 pending 的保存条目 */
  const pendingSavedEntries = computed(() => {
    return savedEntries.value.filter(e => e.status === 'pending')
  })

  /** 状态为 done 的保存条目 */
  const doneSavedEntries = computed(() => {
    return savedEntries.value.filter(e => e.status === 'done')
  })

  // actions
  /**
   * 添加收到的书单
   * @param list 书单数据（不含 listId、createdAt）
   */
  function addReceivedList(list: Omit<ReceivedList, 'listId' | 'createdAt'>) {
    const newList: ReceivedList = {
      ...list,
      listId: generateId(),
      createdAt: Date.now()
    }
    receivedLists.value.push(newList)
    dbSet(RECEIVED_LISTS_COLLECTION, newList.listId, newList)
  }

  /**
   * 删除书单
   * @param listId 书单 ID
   */
  function deleteReceivedList(listId: string) {
    const index = receivedLists.value.findIndex(l => l.listId === listId)
    if (index !== -1) {
      receivedLists.value.splice(index, 1)
    }
    dbDelete(RECEIVED_LISTS_COLLECTION, listId)
  }

  /**
   * 保存条目到收藏
   * @param entry 保存的条目
   */
  function saveEntry(entry: SavedEntry) {
    savedEntries.value.push(entry)
    dbSet(SAVED_ENTRIES_COLLECTION, entry.savedId, entry)
  }

  /**
   * 更新保存条目的状态
   * @param savedId 保存条目 ID
   * @param status 新状态
   */
  function updateSavedEntryStatus(savedId: string, status: 'pending' | 'done') {
    const entry = savedEntries.value.find(e => e.savedId === savedId)
    if (!entry) return
    entry.status = status
    dbSet(SAVED_ENTRIES_COLLECTION, savedId, entry)
  }

  /**
   * 更新保存条目的备注
   * @param savedId 保存条目 ID
   * @param remark 备注内容
   */
  function updateSavedEntryRemark(savedId: string, remark: string) {
    const entry = savedEntries.value.find(e => e.savedId === savedId)
    if (!entry) return
    entry.remark = remark
    dbSet(SAVED_ENTRIES_COLLECTION, savedId, entry)
  }

  /**
   * 删除保存的条目
   * @param savedId 保存条目 ID
   */
  function deleteSavedEntry(savedId: string) {
    const index = savedEntries.value.findIndex(e => e.savedId === savedId)
    if (index !== -1) {
      savedEntries.value.splice(index, 1)
    }
    dbDelete(SAVED_ENTRIES_COLLECTION, savedId)
  }

  /**
   * 从本地存储初始化恢复交换/收藏数据
   */
  function init() {
    try {
      const lists = dbGetAll<ReceivedList>(RECEIVED_LISTS_COLLECTION)
      receivedLists.value = lists.sort((a, b) => b.meetTime - a.meetTime)
      const entries = dbGetAll<SavedEntry>(SAVED_ENTRIES_COLLECTION)
      savedEntries.value = entries.sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('init exchange error:', e)
    }
  }

  return {
    receivedLists,
    savedEntries,
    sortedReceivedLists,
    pendingSavedEntries,
    doneSavedEntries,
    addReceivedList,
    deleteReceivedList,
    saveEntry,
    updateSavedEntryStatus,
    updateSavedEntryRemark,
    deleteSavedEntry,
    init
  }
})
