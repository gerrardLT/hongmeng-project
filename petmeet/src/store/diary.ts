import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Diary, ReactionEmoji } from '@/types/models'
import {
  createDiary as createDiaryService,
  deleteDiary as deleteDiaryService,
  getMyDiaries as getMyDiariesService,
  getFeedDiaries as getFeedDiariesService,
  getDiary as getDiaryService,
  getReaction as getReactionService,
  addReaction as addReactionService,
  removeReaction as removeReactionService,
  getFriendUserIds
} from '@/services/diary'

const PAGE_SIZE = 10

export const useDiaryStore = defineStore('diary', () => {
  // State
  const diaries = ref<Diary[]>([])
  const feedDiaries = ref<Diary[]>([])
  const currentDiary = ref<Diary | null>(null)
  const loading = ref(false)
  const hasMore = ref(true)
  const page = ref(1)

  // Getters
  const myDiaries = computed(() => {
    return [...diaries.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  const publicDiaries = computed(() => {
    return [...feedDiaries.value]
      .filter((d) => d.visibility === 'public')
      .sort((a, b) => b.createdAt - a.createdAt)
  })

  // Actions
  function loadMyDiaries(userId: string) {
    diaries.value = getMyDiariesService(userId)
  }

  function loadFeedDiaries(userId: string) {
    loading.value = true
    page.value = 1
    hasMore.value = true

    const friendUserIds = getFriendUserIds(userId)
    const result = getFeedDiariesService(userId, friendUserIds, page.value, PAGE_SIZE)

    feedDiaries.value = result.list
    hasMore.value = result.hasMore
    loading.value = false
  }

  function addDiary(diary: Diary) {
    diaries.value.unshift(diary)
    feedDiaries.value.unshift(diary)
  }

  function deleteDiary(diaryId: string) {
    const success = deleteDiaryService(diaryId)
    if (success) {
      diaries.value = diaries.value.filter((d) => d.diaryId !== diaryId)
      feedDiaries.value = feedDiaries.value.filter((d) => d.diaryId !== diaryId)
      if (currentDiary.value?.diaryId === diaryId) {
        currentDiary.value = null
      }
    }
  }

  function addReaction(diaryId: string, userId: string, emoji: ReactionEmoji) {
    addReactionService(diaryId, userId, emoji)

    // 从 service 重新读取最新 reactionCount
    const updated = getDiaryService(diaryId)
    if (!updated) return

    const updateDiary = (d: Diary) => {
      if (d.diaryId === diaryId) {
        return { ...d, reactionCount: { ...updated.reactionCount } }
      }
      return d
    }

    diaries.value = diaries.value.map(updateDiary)
    feedDiaries.value = feedDiaries.value.map(updateDiary)
    if (currentDiary.value?.diaryId === diaryId) {
      currentDiary.value = { ...currentDiary.value, reactionCount: { ...updated.reactionCount } }
    }
  }

  function removeReaction(diaryId: string, userId: string) {
    removeReactionService(diaryId, userId)

    // 从 service 重新读取最新 reactionCount
    const updated = getDiaryService(diaryId)
    if (!updated) return

    const updateDiary = (d: Diary) => {
      if (d.diaryId === diaryId) {
        return { ...d, reactionCount: { ...updated.reactionCount } }
      }
      return d
    }

    diaries.value = diaries.value.map(updateDiary)
    feedDiaries.value = feedDiaries.value.map(updateDiary)
    if (currentDiary.value?.diaryId === diaryId) {
      currentDiary.value = { ...currentDiary.value, reactionCount: { ...updated.reactionCount } }
    }
  }

  function getReactionByUser(diaryId: string, userId: string): ReactionEmoji | null {
    const reaction = getReactionService(diaryId, userId)
    return reaction?.emoji || null
  }

  function refreshFeed() {
    const userId = getCurrentUserId()
    loadFeedDiaries(userId)
  }

  function loadMore() {
    if (loading.value || !hasMore.value) return

    loading.value = true
    const userId = getCurrentUserId()
    const friendUserIds = getFriendUserIds(userId)
    const nextPage = page.value + 1

    const result = getFeedDiariesService(userId, friendUserIds, nextPage, PAGE_SIZE)

    feedDiaries.value.push(...result.list)
    hasMore.value = result.hasMore
    page.value = nextPage
    loading.value = false
  }

  function setCurrentDiary(diary: Diary | null) {
    currentDiary.value = diary
  }

  return {
    diaries,
    feedDiaries,
    currentDiary,
    loading,
    hasMore,
    page,
    myDiaries,
    publicDiaries,
    loadMyDiaries,
    loadFeedDiaries,
    addDiary,
    deleteDiary,
    addReaction,
    removeReaction,
    getReactionByUser,
    refreshFeed,
    loadMore,
    setCurrentDiary
  }
})

function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
}
