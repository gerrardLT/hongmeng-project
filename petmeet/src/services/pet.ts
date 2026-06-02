import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import type { Pet } from '@/types/models'

const COLLECTION = 'pets'

function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
}

export function createPet(
  petData: Omit<Pet, 'petId' | 'createdAt' | 'updatedAt'>
): Pet {
  const now = Date.now()
  const pet: Pet = {
    ...petData,
    petId: generateId(),
    createdAt: now,
    updatedAt: now
  }
  dbSet(COLLECTION, pet.petId, pet)
  return pet
}

export function updatePet(petId: string, data: Partial<Pet>): Pet | null {
  const existing = dbGet<Pet>(COLLECTION, petId)
  if (!existing) return null

  const updated: Pet = {
    ...existing,
    ...data,
    petId: existing.petId,
    userId: existing.userId,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  }
  dbSet(COLLECTION, petId, updated)
  return updated
}

export function deletePet(petId: string): boolean {
  const existing = dbGet<Pet>(COLLECTION, petId)
  if (!existing) return false
  dbDelete(COLLECTION, petId)
  return true
}

export function getPet(petId: string): Pet | null {
  return dbGet<Pet>(COLLECTION, petId)
}

export function getMyPets(userId?: string): Pet[] {
  const uid = userId || getCurrentUserId()
  return dbQuery<Pet>(COLLECTION, (item) => item.userId === uid)
}
