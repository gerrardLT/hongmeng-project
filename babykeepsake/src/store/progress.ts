import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Progress, ProgressStage } from '@/types/models'

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

  // actions
  function setProgressList(list: Progress[]) {
    progressList.value = list
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
    }
  }

  function setCurrentProgress(progress: Progress | null) {
    currentProgress.value = progress
  }

  return {
    progressList,
    currentProgress,
    activeProgress,
    completedProgress,
    setProgressList,
    updateProgress,
    setCurrentProgress
  }
})
