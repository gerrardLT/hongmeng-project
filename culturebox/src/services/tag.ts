import type { Tag } from '@/types/models'
import { dbSet, dbGet, dbGetAll, dbDelete, generateId } from '@/utils/db'

const COLLECTION = 'tags'

/**
 * 创建标签
 * @param userId 用户ID
 * @param name 标签名称
 * @returns 创建后的标签
 */
export function createTag(userId: string, name: string): Tag {
  const tag: Tag = {
    tagId: generateId(),
    userId,
    name: name.trim(),
    count: 0,
    createdAt: Date.now()
  }
  dbSet(COLLECTION, tag.tagId, tag)
  return tag
}

/**
 * 删除标签
 * @param tagId 标签ID
 */
export function deleteTag(tagId: string): void {
  dbDelete(COLLECTION, tagId)
}

/**
 * 获取所有标签
 * @returns 标签数组
 */
export function getAllTags(): Tag[] {
  return dbGetAll<Tag>(COLLECTION)
}

/**
 * 增加标签使用次数
 * @param tagId 标签ID
 * @returns 更新后的标签或 null
 */
export function incrementCount(tagId: string): Tag | null {
  const tag = dbGet<Tag>(COLLECTION, tagId)
  if (!tag) return null

  const updated: Tag = {
    ...tag,
    count: tag.count + 1
  }
  dbSet(COLLECTION, tagId, updated)
  return updated
}

/**
 * 减少标签使用次数
 * @param tagId 标签ID
 * @returns 更新后的标签或 null
 */
export function decrementCount(tagId: string): Tag | null {
  const tag = dbGet<Tag>(COLLECTION, tagId)
  if (!tag) return null

  const updated: Tag = {
    ...tag,
    count: Math.max(0, tag.count - 1)
  }
  dbSet(COLLECTION, tagId, updated)
  return updated
}
