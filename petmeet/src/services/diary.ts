import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import type { Diary, Reaction, ReactionEmoji, DiaryVisibility } from '@/types/models'

const DIARY_COLLECTION = 'diaries'
const REACTION_COLLECTION = 'reactions'

function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
}

function getFriendUserIds(userId: string): string[] {
  const friendships = dbQuery<{ friendUserId: string }>('friendships', (item) => {
    const f = item as any
    return (f.userId === userId && f.status === 'active')
  })
  return friendships.map((f) => (f as any).friendUserId)
}

function createEmptyReactionCount(): Record<ReactionEmoji, number> {
  return {
    '🐾': 0,
    '❤️': 0,
    '😍': 0,
    '🤣': 0,
    '👏': 0
  }
}

// 日记 CRUD
export function createDiary(data: {
  userId: string
  petId: string
  petName: string
  petAvatar: string
  content: string
  images: string[]
  visibility: DiaryVisibility
}): Diary {
  const diary: Diary = {
    diaryId: generateId(),
    userId: data.userId,
    petId: data.petId,
    petName: data.petName,
    petAvatar: data.petAvatar,
    content: data.content,
    images: data.images,
    visibility: data.visibility,
    reactionCount: createEmptyReactionCount(),
    createdAt: Date.now()
  }
  dbSet(DIARY_COLLECTION, diary.diaryId, diary)
  return diary
}

export function deleteDiary(diaryId: string): boolean {
  const existing = dbGet<Diary>(DIARY_COLLECTION, diaryId)
  if (!existing) return false

  // 删除相关反应
  const reactions = dbQuery<Reaction>(REACTION_COLLECTION, (r) => r.diaryId === diaryId)
  reactions.forEach((r) => {
    dbDelete(REACTION_COLLECTION, r.reactionId)
  })

  dbDelete(DIARY_COLLECTION, diaryId)
  return true
}

export function getDiary(diaryId: string): Diary | null {
  return dbGet<Diary>(DIARY_COLLECTION, diaryId)
}

export function getMyDiaries(userId: string): Diary[] {
  return dbQuery<Diary>(DIARY_COLLECTION, (item) => item.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function getFeedDiaries(
  userId: string,
  friendUserIds: string[],
  page: number,
  pageSize: number
): { list: Diary[]; hasMore: boolean } {
  const allDiaries = dbGetAll<Diary>(DIARY_COLLECTION)

  const filtered = allDiaries.filter((diary) => {
    // 自己的日记：全部可见
    if (diary.userId === userId) return true
    // 朋友的日记：仅公开可见
    if (friendUserIds.includes(diary.userId) && diary.visibility === 'public') return true
    return false
  })

  const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt)

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = sorted.slice(start, end)
  const hasMore = end < sorted.length

  return { list, hasMore }
}

// 表情反应
export function addReaction(
  diaryId: string,
  userId: string,
  emoji: ReactionEmoji
): Reaction {
  // 先移除已有的反应
  removeReaction(diaryId, userId)

  const reaction: Reaction = {
    reactionId: generateId(),
    diaryId,
    userId,
    emoji,
    createdAt: Date.now()
  }
  dbSet(REACTION_COLLECTION, reaction.reactionId, reaction)
  updateDiaryReactionCount(diaryId)
  return reaction
}

export function removeReaction(diaryId: string, userId: string): boolean {
  const existing = dbQuery<Reaction>(
    REACTION_COLLECTION,
    (r) => r.diaryId === diaryId && r.userId === userId
  )[0]

  if (!existing) return false

  dbDelete(REACTION_COLLECTION, existing.reactionId)
  updateDiaryReactionCount(diaryId)
  return true
}

export function getReaction(diaryId: string, userId: string): Reaction | null {
  const reactions = dbQuery<Reaction>(
    REACTION_COLLECTION,
    (r) => r.diaryId === diaryId && r.userId === userId
  )
  return reactions[0] || null
}

export function getDiaryReactions(diaryId: string): Reaction[] {
  return dbQuery<Reaction>(REACTION_COLLECTION, (r) => r.diaryId === diaryId)
}

function updateDiaryReactionCount(diaryId: string): void {
  const diary = dbGet<Diary>(DIARY_COLLECTION, diaryId)
  if (!diary) return

  const reactions = getDiaryReactions(diaryId)
  const count = createEmptyReactionCount()

  reactions.forEach((r) => {
    if (count[r.emoji] !== undefined) {
      count[r.emoji]++
    }
  })

  diary.reactionCount = count
  dbSet(DIARY_COLLECTION, diaryId, diary)
}

export { getFriendUserIds, updateDiaryReactionCount }
