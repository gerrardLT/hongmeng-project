import type { User } from '@/types/models'
import { dbGet, dbSet } from '@/utils/db'

const USER_COLLECTION = 'users'

/**
 * 获取用户信息
 * @param userId 用户 ID
 * @returns 用户信息或 null
 */
export function getUserInfo(userId: string): User | null {
  return dbGet<User>(USER_COLLECTION, userId)
}

/**
 * 更新用户信息
 * @param userId 用户 ID
 * @param data 需要更新的字段
 * @returns 更新后的用户信息或 null
 */
export function updateUserInfo(userId: string, data: Partial<Omit<User, 'userId' | 'createdAt'>>): User | null {
  const existing = dbGet<User>(USER_COLLECTION, userId)
  if (!existing) return null

  const updated: User = {
    ...existing,
    ...data,
    userId: existing.userId,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  }

  dbSet(USER_COLLECTION, userId, updated)
  return updated
}

/**
 * 更新头像
 * @param userId 用户 ID
 * @param avatarUrl 头像 URL
 * @returns 更新后的用户信息或 null
 */
export function updateAvatar(userId: string, avatarUrl: string): User | null {
  const existing = dbGet<User>(USER_COLLECTION, userId)
  if (!existing) return null

  const updated: User = {
    ...existing,
    avatar: avatarUrl,
    updatedAt: Date.now()
  }

  dbSet(USER_COLLECTION, userId, updated)
  return updated
}
