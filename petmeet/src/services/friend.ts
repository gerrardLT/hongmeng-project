import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import type { Friendship, Pet, FriendshipStatus } from '@/types/models'

const COLLECTION = 'friendships'

export function addFriend(userId: string, friendUserId: string, friendPet: Pet, meetLocation?: string): Friendship {
  const friendship: Friendship = {
    friendshipId: generateId(),
    userId,
    friendUserId,
    friendPet,
    meetTime: Date.now(),
    meetLocation: meetLocation || '',
    remark: '',
    status: 'active',
    createdAt: Date.now()
  }
  dbSet<Friendship>(COLLECTION, friendship.friendshipId, friendship)
  return friendship
}

export function updateFriendRemark(friendshipId: string, remark: string): Friendship | null {
  const f = dbGet<Friendship>(COLLECTION, friendshipId)
  if (!f) return null
  f.remark = remark
  dbSet<Friendship>(COLLECTION, friendshipId, f)
  return f
}

export function deleteFriend(friendshipId: string): boolean {
  const f = dbGet<Friendship>(COLLECTION, friendshipId)
  if (!f) return false
  f.status = 'deleted'
  dbSet<Friendship>(COLLECTION, friendshipId, f)
  return true
}

export function blockFriend(friendshipId: string): boolean {
  const f = dbGet<Friendship>(COLLECTION, friendshipId)
  if (!f) return false
  f.status = 'blocked'
  dbSet<Friendship>(COLLECTION, friendshipId, f)
  return true
}

export function getFriend(friendshipId: string): Friendship | null {
  return dbGet<Friendship>(COLLECTION, friendshipId)
}

export function getFriendsByUserId(userId: string): Friendship[] {
  return dbQuery<Friendship>(COLLECTION, (item) => item.userId === userId && item.status === 'active')
}

export function isFriend(userId: string, friendUserId: string): boolean {
  const result = dbQuery<Friendship>(COLLECTION, (item) => item.userId === userId && item.friendUserId === friendUserId && item.status === 'active')
  return result.length > 0
}
