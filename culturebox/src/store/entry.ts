import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Entry, EntryType } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'

const COLLECTION = 'entries'

export const useEntryStore = defineStore('entry', () => {
  // state
  const entries = ref<Entry[]>([])

  // getters
  /** 按 createdAt 倒序排列的条目 */
  const sortedEntries = computed(() => {
    return [...entries.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  /** 按类型筛选 */
  const entriesByType = computed(() => {
    return (type: EntryType) => entries.value.filter(e => e.type === type)
  })

  /** 按年份筛选 */
  const entriesByYear = computed(() => {
    return (year: number) => entries.value.filter(e => {
      const entryYear = parseInt(e.date.split('-')[0], 10)
      return entryYear === year
    })
  })

  /** 按评分筛选 */
  const entriesByRating = computed(() => {
    return (rating: number) => entries.value.filter(e => e.rating === rating)
  })

  /** 按标签筛选 */
  const entriesByTag = computed(() => {
    return (tag: string) => entries.value.filter(e => e.tags.includes(tag))
  })

  /** 搜索标题或副标题 */
  const searchEntries = computed(() => {
    return (keyword: string) => {
      const lower = keyword.toLowerCase()
      return entries.value.filter(e =>
        e.title.toLowerCase().includes(lower) ||
        e.subtitle.toLowerCase().includes(lower)
      )
    }
  })

  const totalCount = computed(() => entries.value.length)
  const bookCount = computed(() => entries.value.filter(e => e.type === 'book').length)
  const movieCount = computed(() => entries.value.filter(e => e.type === 'movie').length)
  const podcastCount = computed(() => entries.value.filter(e => e.type === 'podcast').length)
  const exhibitionCount = computed(() => entries.value.filter(e => e.type === 'exhibition').length)

  // actions
  /**
   * 添加条目
   * @param entry 不包含 entryId、createdAt、updatedAt 的条目数据
   */
  function addEntry(entry: Omit<Entry, 'entryId' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now()
    const newEntry: Entry = {
      ...entry,
      entryId: generateId(),
      createdAt: now,
      updatedAt: now
    }
    entries.value.push(newEntry)
    dbSet(COLLECTION, newEntry.entryId, newEntry)
  }

  /**
   * 更新条目
   * @param entryId 条目 ID
   * @param updates 要更新的字段
   */
  function updateEntry(entryId: string, updates: Partial<Omit<Entry, 'entryId' | 'createdAt'>>) {
    const index = entries.value.findIndex(e => e.entryId === entryId)
    if (index === -1) return
    const updated: Entry = {
      ...entries.value[index],
      ...updates,
      updatedAt: Date.now()
    }
    entries.value[index] = updated
    dbSet(COLLECTION, entryId, updated)
  }

  /**
   * 删除条目
   * @param entryId 条目 ID
   */
  function deleteEntry(entryId: string) {
    const index = entries.value.findIndex(e => e.entryId === entryId)
    if (index !== -1) {
      entries.value.splice(index, 1)
    }
    dbDelete(COLLECTION, entryId)
  }

  /**
   * 切换年度精选状态
   * @param entryId 条目 ID
   */
  function toggleTopOfYear(entryId: string) {
    const entry = entries.value.find(e => e.entryId === entryId)
    if (!entry) return
    updateEntry(entryId, { isTopOfYear: !entry.isTopOfYear })
  }

  /**
   * 根据 ID 获取单条条目
   * @param entryId 条目 ID
   */
  function getEntryById(entryId: string): Entry | undefined {
    return entries.value.find(e => e.entryId === entryId)
  }

  /**
   * 从本地存储初始化恢复条目数据
   */
  function init() {
    try {
      const all = dbGetAll<Entry>(COLLECTION)
      entries.value = all.sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('init entries error:', e)
    }
  }

  return {
    entries,
    sortedEntries,
    entriesByType,
    entriesByYear,
    entriesByRating,
    entriesByTag,
    searchEntries,
    totalCount,
    bookCount,
    movieCount,
    podcastCount,
    exhibitionCount,
    addEntry,
    updateEntry,
    deleteEntry,
    toggleTopOfYear,
    getEntryById,
    init
  }
})
