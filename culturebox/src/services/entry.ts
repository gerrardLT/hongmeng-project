import type { Entry } from '@/types/models'
import { dbSet, dbGet, dbGetAll, dbDelete, dbQuery, generateId } from '@/utils/db'

const COLLECTION = 'entries'

/**
 * 创建条目
 * @param data 条目数据（不含 entryId、createdAt、updatedAt）
 * @returns 创建后的完整条目
 */
export function createEntry(data: Omit<Entry, 'entryId' | 'createdAt' | 'updatedAt'>): Entry {
  const now = Date.now()
  const entry: Entry = {
    ...data,
    entryId: generateId(),
    createdAt: now,
    updatedAt: now
  }
  dbSet(COLLECTION, entry.entryId, entry)
  return entry
}

/**
 * 更新条目
 * @param entryId 条目ID
 * @param updates 要更新的字段
 * @returns 更新后的条目或 null
 */
export function updateEntry(entryId: string, updates: Partial<Omit<Entry, 'entryId' | 'createdAt'>>): Entry | null {
  const existing = dbGet<Entry>(COLLECTION, entryId)
  if (!existing) return null

  const updated: Entry = {
    ...existing,
    ...updates,
    updatedAt: Date.now()
  }
  dbSet(COLLECTION, entryId, updated)
  return updated
}

/**
 * 删除条目
 * @param entryId 条目ID
 */
export function deleteEntry(entryId: string): void {
  dbDelete(COLLECTION, entryId)
}

/**
 * 获取单条条目
 * @param entryId 条目ID
 * @returns 条目或 null
 */
export function getEntry(entryId: string): Entry | null {
  return dbGet<Entry>(COLLECTION, entryId)
}

/**
 * 获取所有条目
 * @returns 条目数组
 */
export function getAllEntries(): Entry[] {
  return dbGetAll<Entry>(COLLECTION)
}

/**
 * 搜索条目（匹配 title 或 subtitle）
 * @param keyword 关键词
 * @returns 匹配的条目数组
 */
export function searchEntries(keyword: string): Entry[] {
  const lower = keyword.trim().toLowerCase()
  if (!lower) return []
  return dbQuery<Entry>(COLLECTION, (item) =>
    item.title.toLowerCase().includes(lower) ||
    item.subtitle.toLowerCase().includes(lower)
  )
}

/**
 * 按类型筛选条目
 * @param type 条目类型
 * @returns 符合条件的条目数组
 */
export function getEntriesByType(type: Entry['type']): Entry[] {
  return dbQuery<Entry>(COLLECTION, (item) => item.type === type)
}

/**
 * 按年份筛选条目
 * @param year 年份
 * @returns 符合条件的条目数组
 */
export function getEntriesByYear(year: number): Entry[] {
  return dbQuery<Entry>(COLLECTION, (item) => {
    const itemYear = new Date(item.date).getFullYear()
    return itemYear === year
  })
}
