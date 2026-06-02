import type { PetProfile, PetType, PetGender } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const PET_COLLECTION = 'pets'

/**
 * 创建宠物档案
 * @param data 宠物档案数据
 * @returns 创建的宠物档案
 */
export function createPet(data: {
  userId: string
  name: string
  type: PetType
  breed: string
  gender: PetGender
  birthday: string
  adoptDate: string
  avatar: string
  personality?: string
}): PetProfile {
  const now = Date.now()
  const pet: PetProfile = {
    petId: generateId(),
    userId: data.userId,
    name: data.name,
    type: data.type,
    breed: data.breed,
    gender: data.gender,
    birthday: data.birthday,
    adoptDate: data.adoptDate,
    avatar: data.avatar,
    photos: data.avatar ? [data.avatar] : [],
    personality: data.personality || '',
    createdAt: now,
    updatedAt: now
  }

  dbSet(PET_COLLECTION, pet.petId, pet)

  // 更新用户的 petIds
  const user = dbGet<{ userId: string; petIds: string[] }>('users', data.userId)
  if (user) {
    const updatedUser = {
      ...user,
      petIds: [...user.petIds, pet.petId],
      updatedAt: Date.now()
    }
    dbSet('users', data.userId, updatedUser)
  }

  return pet
}

/**
 * 获取用户宠物列表
 * @param userId 用户 ID
 * @returns 宠物档案列表
 */
export function getPets(userId: string): PetProfile[] {
  return dbQuery<PetProfile>(PET_COLLECTION, (p) => p.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取宠物详情
 * @param petId 宠物 ID
 * @returns 宠物档案详情或 null
 */
export function getPetById(petId: string): PetProfile | null {
  return dbGet<PetProfile>(PET_COLLECTION, petId)
}

/**
 * 更新宠物信息
 * @param petId 宠物 ID
 * @param data 需要更新的字段
 * @returns 更新后的宠物档案或 null
 */
export function updatePet(petId: string, data: Partial<Omit<PetProfile, 'petId' | 'userId' | 'createdAt'>>): PetProfile | null {
  const existing = dbGet<PetProfile>(PET_COLLECTION, petId)
  if (!existing) return null

  const updated: PetProfile = {
    ...existing,
    ...data,
    petId: existing.petId,
    userId: existing.userId,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  }

  dbSet(PET_COLLECTION, petId, updated)
  return updated
}

/**
 * 删除宠物档案
 * @param petId 宠物 ID
 * @returns 是否删除成功
 */
export function deletePet(petId: string): boolean {
  const existing = dbGet<PetProfile>(PET_COLLECTION, petId)
  if (!existing) return false

  // 从用户的 petIds 中移除
  const user = dbGet<{ userId: string; petIds: string[] }>('users', existing.userId)
  if (user) {
    const updatedUser = {
      ...user,
      petIds: user.petIds.filter((id) => id !== petId),
      updatedAt: Date.now()
    }
    dbSet('users', existing.userId, updatedUser)
  }

  dbDelete(PET_COLLECTION, petId)
  return true
}

/**
 * 添加宠物照片
 * @param petId 宠物 ID
 * @param photoUrl 照片 URL
 * @returns 更新后的宠物档案或 null
 */
export function addPetPhoto(petId: string, photoUrl: string): PetProfile | null {
  const existing = dbGet<PetProfile>(PET_COLLECTION, petId)
  if (!existing) return null

  const updated: PetProfile = {
    ...existing,
    photos: [...existing.photos, photoUrl],
    updatedAt: Date.now()
  }

  dbSet(PET_COLLECTION, petId, updated)
  return updated
}
