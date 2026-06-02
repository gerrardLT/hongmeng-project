import type { User, BabyInfo, Gender } from '@/types/models'
import { dbGet, dbSet, dbQuery, generateId } from '@/utils/db'

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
 * 添加宝宝信息
 * @param userId 用户 ID
 * @param baby 宝宝信息
 * @returns 添加的宝宝信息
 */
export function addBabyInfo(
  userId: string,
  baby: Omit<BabyInfo, 'babyId'>
): BabyInfo | null {
  const user = dbGet<User>(USER_COLLECTION, userId)
  if (!user) return null

  const newBaby: BabyInfo = {
    ...baby,
    babyId: generateId()
  }

  const updated: User = {
    ...user,
    babyInfos: [...user.babyInfos, newBaby],
    updatedAt: Date.now()
  }

  dbSet(USER_COLLECTION, userId, updated)
  return newBaby
}

/**
 * 更新宝宝信息
 * @param userId 用户 ID
 * @param babyId 宝宝 ID
 * @param data 需要更新的字段
 * @returns 更新后的宝宝信息或 null
 */
export function updateBabyInfo(
  userId: string,
  babyId: string,
  data: Partial<Omit<BabyInfo, 'babyId'>>
): BabyInfo | null {
  const user = dbGet<User>(USER_COLLECTION, userId)
  if (!user) return null

  const babyIndex = user.babyInfos.findIndex((b) => b.babyId === babyId)
  if (babyIndex === -1) return null

  const updatedBaby: BabyInfo = {
    ...user.babyInfos[babyIndex],
    ...data,
    babyId
  }

  const updatedBabyInfos = [...user.babyInfos]
  updatedBabyInfos[babyIndex] = updatedBaby

  const updated: User = {
    ...user,
    babyInfos: updatedBabyInfos,
    updatedAt: Date.now()
  }

  dbSet(USER_COLLECTION, userId, updated)
  return updatedBaby
}

/**
 * 删除宝宝信息
 * @param userId 用户 ID
 * @param babyId 宝宝 ID
 * @returns 是否删除成功
 */
export function deleteBabyInfo(userId: string, babyId: string): boolean {
  const user = dbGet<User>(USER_COLLECTION, userId)
  if (!user) return false

  const filtered = user.babyInfos.filter((b) => b.babyId !== babyId)
  if (filtered.length === user.babyInfos.length) return false

  const updated: User = {
    ...user,
    babyInfos: filtered,
    updatedAt: Date.now()
  }

  dbSet(USER_COLLECTION, userId, updated)
  return true
}
