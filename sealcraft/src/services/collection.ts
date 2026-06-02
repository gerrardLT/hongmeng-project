import type { SealCollection } from '@/types/models'
import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const COLLECTION_COLLECTION = 'collections'

/**
 * 添加印章到收藏
 * @param data 收藏数据
 * @returns 创建的收藏记录
 */
export function addToCollection(data: {
  userId: string
  bookingId: string
  name: string
  sealTypeId: string
  materialId: string
  fontId: string
  photos: string[]
  inkEffects: string[]
  notes?: string
}): SealCollection {
  const collection: SealCollection = {
    collectionId: generateId(),
    userId: data.userId,
    bookingId: data.bookingId,
    name: data.name,
    sealTypeId: data.sealTypeId,
    materialId: data.materialId,
    fontId: data.fontId,
    photos: data.photos,
    inkEffects: data.inkEffects,
    createdAt: new Date().toISOString(),
    notes: data.notes
  }

  dbSet(COLLECTION_COLLECTION, collection.collectionId, collection)
  return collection
}

/**
 * 获取用户收藏列表
 * @param userId 用户 ID
 * @returns 收藏列表（按创建时间倒序）
 */
export function getCollections(userId: string): SealCollection[] {
  return dbQuery<SealCollection>(COLLECTION_COLLECTION, (item) => item.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * 获取收藏详情
 * @param id 收藏 ID
 * @returns 收藏详情或 null
 */
export function getCollectionById(id: string): SealCollection | null {
  return dbGet<SealCollection>(COLLECTION_COLLECTION, id)
}

/**
 * 更新收藏信息
 * @param id 收藏 ID
 * @param data 需要更新的字段
 * @returns 更新后的收藏或 null
 */
export function updateCollection(id: string, data: Partial<Omit<SealCollection, 'collectionId' | 'userId' | 'createdAt'>>): SealCollection | null {
  const existing = dbGet<SealCollection>(COLLECTION_COLLECTION, id)
  if (!existing) return null

  const updated: SealCollection = {
    ...existing,
    ...data,
    collectionId: existing.collectionId,
    userId: existing.userId,
    createdAt: existing.createdAt
  }

  dbSet(COLLECTION_COLLECTION, id, updated)
  return updated
}

/**
 * 删除收藏
 * @param id 收藏 ID
 * @returns 是否删除成功
 */
export function deleteCollection(id: string): boolean {
  const existing = dbGet<SealCollection>(COLLECTION_COLLECTION, id)
  if (!existing) return false

  dbDelete(COLLECTION_COLLECTION, id)
  return true
}
