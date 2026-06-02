import type { Artwork } from '@/types/models'
import { dbGet, dbSet, dbList, dbDelete, generateId } from '@/utils/db'

const ARTWORK_COLLECTION = 'artworks'

/**
 * 上传/保存作品
 * @param data 作品数据
 * @returns 保存的作品记录
 */
export async function uploadArtwork(data: {
  userId: string
  bookingId?: string
  studioId?: string
  studioName?: string
  projectId?: string
  projectName?: string
  photos: string[]
  description?: string
}): Promise<Artwork> {
  const artworkId = generateId()
  const now = Date.now()

  const artwork: Artwork = {
    artworkId,
    userId: data.userId,
    bookingId: data.bookingId,
    studioId: data.studioId,
    studioName: data.studioName,
    projectId: data.projectId,
    projectName: data.projectName,
    photos: data.photos,
    description: data.description || '',
    createdAt: now
  }

  dbSet(ARTWORK_COLLECTION, artworkId, artwork)
  return artwork
}

/**
 * 获取用户作品列表
 * @param userId 用户 ID
 * @returns 作品列表（按创建时间倒序）
 */
export async function getArtworkList(userId: string): Promise<Artwork[]> {
  const artworks = dbList<Artwork>(ARTWORK_COLLECTION)
  return artworks
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取作品详情
 * @param artworkId 作品 ID
 * @returns 作品详情或 null
 */
export async function getArtworkDetail(artworkId: string): Promise<Artwork | null> {
  return dbGet<Artwork>(ARTWORK_COLLECTION, artworkId)
}

/**
 * 删除作品
 * @param artworkId 作品 ID
 * @returns 是否删除成功
 */
export async function deleteArtwork(artworkId: string): Promise<boolean> {
  const existing = dbGet<Artwork>(ARTWORK_COLLECTION, artworkId)
  if (!existing) return false

  dbDelete(ARTWORK_COLLECTION, artworkId)
  return true
}

/**
 * 生成分享卡片数据
 * @param artwork 作品数据
 * @returns 分享卡片数据对象
 */
export async function generateShareCard(artwork: Artwork): Promise<{
  title: string
  description: string
  imageUrl: string
  path: string
}> {
  const title = artwork.projectName
    ? `我在${artwork.studioName || '工作室'}制作了${artwork.projectName}`
    : '我的烧玻璃作品'

  const description = artwork.description || '亲手制作的玻璃艺术品，每一道纹路都是独一无二的记忆。'

  return {
    title,
    description,
    imageUrl: artwork.photos[0] || '/static/default-artwork.png',
    path: `/pages/artwork/detail?id=${artwork.artworkId}`
  }
}
