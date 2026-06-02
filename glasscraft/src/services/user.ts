import type { UserInfo } from '@/types/models'
import { dbGet, dbSet, dbList } from '@/utils/db'

const USER_COLLECTION = 'users'

/**
 * 获取用户信息
 * @param userId 用户 ID
 * @returns 用户信息或 null
 */
export async function getUserInfo(userId: string): Promise<UserInfo | null> {
  return dbGet<UserInfo>(USER_COLLECTION, userId)
}

/**
 * 更新用户信息
 * @param data 需要更新的字段（需包含 userId）
 * @returns 更新后的用户信息或 null
 */
export async function updateUserInfo(data: {
  userId: string
  nickname?: string
  avatar?: string
  phone?: string
}): Promise<UserInfo | null> {
  const existing = dbGet<UserInfo>(USER_COLLECTION, data.userId)
  if (!existing) return null

  const updated: UserInfo = {
    ...existing,
    ...data,
    userId: existing.userId,
    createdAt: existing.createdAt
  }

  dbSet(USER_COLLECTION, data.userId, updated)
  return updated
}

/**
 * 获取预约统计
 * @param userId 用户 ID
 * @returns 预约统计数据
 */
export async function getBookingStats(userId: string): Promise<{
  total: number
  completed: number
  pending: number
  confirmed: number
  cancelled: number
}> {
  const bookings = dbList<{ userId: string; status: string }>('bookings')
  const userBookings = bookings.filter((b) => b.userId === userId)

  return {
    total: userBookings.length,
    completed: userBookings.filter((b) => b.status === 'completed').length,
    pending: userBookings.filter((b) => b.status === 'pending').length,
    confirmed: userBookings.filter((b) => b.status === 'confirmed').length,
    cancelled: userBookings.filter((b) => b.status === 'cancelled').length
  }
}

/**
 * 获取作品统计
 * @param userId 用户 ID
 * @returns 作品统计数据
 */
export async function getArtworkStats(userId: string): Promise<{
  total: number
  thisMonth: number
}> {
  const artworks = dbList<{ userId: string; createdAt: number }>('artworks')
  const userArtworks = artworks.filter((a) => a.userId === userId)

  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

  return {
    total: userArtworks.length,
    thisMonth: userArtworks.filter((a) => a.createdAt >= currentMonthStart).length
  }
}
