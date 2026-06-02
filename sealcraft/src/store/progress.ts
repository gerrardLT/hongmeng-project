import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Progress } from '@/types/models'
import { dbGetAll, dbSet, dbQuery } from '@/utils/db'

const COLLECTION = 'progress'

export const useProgressStore = defineStore('progress', () => {
  // state
  const progressList = ref<Progress[]>([])
  const currentProgress = ref<Progress[] | null>(null)

  // actions
  function loadProgress() {
    try {
      progressList.value = dbGetAll<Progress>(COLLECTION)
    } catch (e) {
      console.error('loadProgress error:', e)
    }
  }

  function loadProgressByBooking(bookingId: string) {
    try {
      currentProgress.value = dbQuery<Progress>(
        COLLECTION,
        (p) => p.bookingId === bookingId
      ).sort((a, b) => {
        const STAGES = [
          'design-confirmed',
          'material-prepared',
          'carving',
          'polishing',
          'quality-check',
          'ready-pickup',
          'shipped'
        ]
        return STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage)
      })
    } catch (e) {
      console.error('loadProgressByBooking error:', e)
    }
  }

  function updateProgress(progressId: string, data: Partial<Progress>) {
    const index = progressList.value.findIndex((p) => p.progressId === progressId)
    if (index !== -1) {
      const updated: Progress = {
        ...progressList.value[index],
        ...data,
        updateTime: new Date().toISOString()
      }
      progressList.value[index] = updated
      try {
        dbSet<Progress>(COLLECTION, progressId, updated)
      } catch (e) {
        console.error('updateProgress dbSet error:', e)
      }
    }
    // 同步更新 currentProgress
    if (currentProgress.value) {
      const ci = currentProgress.value.findIndex((p) => p.progressId === progressId)
      if (ci !== -1) {
        currentProgress.value[ci] = {
          ...currentProgress.value[ci],
          ...data,
          updateTime: new Date().toISOString()
        }
      }
    }
  }

  function addProgress(progress: Progress) {
    progressList.value.push(progress)
    try {
      dbSet<Progress>(COLLECTION, progress.progressId, progress)
    } catch (e) {
      console.error('addProgress error:', e)
    }
  }

  function clearCurrentProgress() {
    currentProgress.value = null
  }

  return {
    progressList,
    currentProgress,
    loadProgress,
    loadProgressByBooking,
    updateProgress,
    addProgress,
    clearCurrentProgress
  }
})
