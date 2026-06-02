import type { Artwork, SceneType, PatternParameters, ColorScheme } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

/** 作品集合名 */
const ARTWORKS_COLLECTION = 'artworks'

/**
 * 创建新作品
 * @param data 作品基础数据（不含 artworkId、createdAt、updatedAt）
 * @returns 创建后的完整作品对象
 */
export function createArtwork(data: Omit<Artwork, 'artworkId' | 'createdAt' | 'updatedAt'>): Artwork {
  try {
    const now = Date.now()
    const artwork: Artwork = {
      ...data,
      artworkId: generateId(),
      createdAt: now,
      updatedAt: now
    }
    dbSet<Artwork>(ARTWORKS_COLLECTION, artwork.artworkId, artwork)
    console.log('[artwork] created:', artwork.artworkId)
    return artwork
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ArtworkService] createArtwork failed:', message)
    uni.showToast({ title: '创建作品失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 更新作品
 * @param id 作品 ID
 * @param data 要更新的字段
 * @returns 更新后的作品对象或 null
 */
export function updateArtwork(id: string, data: Partial<Omit<Artwork, 'artworkId' | 'createdAt'>>): Artwork | null {
  try {
    const existing = dbGet<Artwork>(ARTWORKS_COLLECTION, id)
    if (!existing) {
      console.warn('[artwork] not found for update:', id)
      return null
    }

    const updated: Artwork = {
      ...existing,
      ...data,
      artworkId: id,
      createdAt: existing.createdAt,
      updatedAt: Date.now()
    }
    dbSet<Artwork>(ARTWORKS_COLLECTION, id, updated)
    console.log('[artwork] updated:', id)
    return updated
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ArtworkService] updateArtwork failed:', message)
    uni.showToast({ title: '更新作品失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 删除作品
 * @param id 作品 ID
 */
export function deleteArtwork(id: string): void {
  try {
    dbDelete(ARTWORKS_COLLECTION, id)
    console.log('[artwork] deleted:', id)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ArtworkService] deleteArtwork failed:', message)
    uni.showToast({ title: '删除作品失败，请重试', icon: 'none' })
    throw e
  }
}

/**
 * 获取所有作品（按更新时间倒序）
 * @returns 作品数组
 */
export function getArtworks(): Artwork[] {
  const artworks = dbGetAll<Artwork>(ARTWORKS_COLLECTION)
  return artworks.sort((a, b) => b.updatedAt - a.updatedAt)
}

/**
 * 根据 ID 获取单个作品
 * @param id 作品 ID
 * @returns 作品对象或 null
 */
export function getArtworkById(id: string): Artwork | null {
  return dbGet<Artwork>(ARTWORKS_COLLECTION, id)
}

/**
 * 按应用场景筛选作品
 * @param sceneType 场景类型
 * @returns 该场景下的作品数组
 */
export function getArtworksByScene(sceneType: SceneType): Artwork[] {
  const artworks = dbQuery<Artwork>(ARTWORKS_COLLECTION, (a) => a.sceneType === sceneType)
  return artworks.sort((a, b) => b.updatedAt - a.updatedAt)
}
