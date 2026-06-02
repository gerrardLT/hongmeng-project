import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Progress } from '@/types/models'

const STORAGE_KEY = 'petmemorial_progress'

interface ProgressStorageState {
  progressList: Progress[]
}

export const useProgressStore = defineStore('progress', () => {
  // state
  const progressList = ref<Progress[]>([])
  const currentProgress = ref<Progress | null>(null)

  // getters
  const activeProgress = computed(() => {
    return progressList.value
      .filter((p) => p.stage !== 'shipped')
      .sort((a, b) => b.updateTime - a.updateTime)
  })

  const completedProgress = computed(() => {
    return progressList.value
      .filter((p) => p.stage === 'shipped')
      .sort((a, b) => b.updateTime - a.updateTime)
  })

  const getProgressByBookingId = computed(() => (bookingId: string) => {
    return progressList.value
      .filter((p) => p.bookingId === bookingId)
      .sort((a, b) => b.updateTime - a.updateTime)
  })

  // 持久化到本地存储
  function persist() {
    const state: ProgressStorageState = {
      progressList: progressList.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist progress error:', e)
    }
  }

  // actions
  function setProgressList(list: Progress[]) {
    progressList.value = list
    persist()
  }

  function addProgress(progress: Progress) {
    progressList.value.push(progress)
    persist()
  }

  function updateProgress(progressId: string, data: Partial<Progress>) {
    const index = progressList.value.findIndex((p) => p.progressId === progressId)
    if (index !== -1) {
      progressList.value[index] = {
        ...progressList.value[index],
        ...data,
        updateTime: Date.now()
      }
      if (currentProgress.value?.progressId === progressId) {
        currentProgress.value = {
          ...currentProgress.value,
          ...data,
          updateTime: Date.now()
        }
      }
      persist()
    }
  }

  function setCurrentProgress(progress: Progress | null) {
    currentProgress.value = progress
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as ProgressStorageState | undefined
      if (state) {
        progressList.value = state.progressList || []
      }
    } catch (e) {
      console.error('init progress error:', e)
    }
  }

  return {
    progressList,
    currentProgress,
    activeProgress,
    completedProgress,
    getProgressByBookingId,
    setProgressList,
    addProgress,
    updateProgress,
    setCurrentProgress,
    init,
    persist
  }
})
