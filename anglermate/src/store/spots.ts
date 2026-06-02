import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FishingSpot } from '@/types/models'

const STORAGE_KEY = 'anglermate_spots'

interface SpotsStorageState {
  spotList: FishingSpot[]
  currentSpot: FishingSpot | null
  total: number
}

export const useSpotsStore = defineStore('spots', () => {
  // state
  const spotList = ref<FishingSpot[]>([])
  const currentSpot = ref<FishingSpot | null>(null)
  const total = ref(0)

  // getters
  const spotCount = computed(() => spotList.value.length)

  // 持久化到本地存储
  function persist() {
    const state: SpotsStorageState = {
      spotList: spotList.value,
      currentSpot: currentSpot.value,
      total: total.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist spots state error:', e)
    }
  }

  // actions
  function setSpotList(data: FishingSpot[], totalCount?: number) {
    spotList.value = data
    if (totalCount !== undefined) {
      total.value = totalCount
    }
    persist()
  }

  function addSpot(spot: FishingSpot) {
    spotList.value.unshift(spot)
    total.value++
    persist()
  }

  function updateSpot(spotId: string, data: Partial<FishingSpot>) {
    const index = spotList.value.findIndex((s) => s.spotId === spotId)
    if (index !== -1) {
      spotList.value[index] = { ...spotList.value[index], ...data }
      if (currentSpot.value?.spotId === spotId) {
        currentSpot.value = { ...currentSpot.value, ...data }
      }
    }
    persist()
  }

  function removeSpot(spotId: string) {
    const index = spotList.value.findIndex((s) => s.spotId === spotId)
    if (index !== -1) {
      spotList.value.splice(index, 1)
      total.value = Math.max(0, total.value - 1)
    }
    if (currentSpot.value?.spotId === spotId) {
      currentSpot.value = null
    }
    persist()
  }

  function setCurrentSpot(spot: FishingSpot | null) {
    currentSpot.value = spot
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as SpotsStorageState | undefined
      if (state) {
        spotList.value = state.spotList || []
        currentSpot.value = state.currentSpot || null
        total.value = state.total || 0
      }
    } catch (e) {
      console.error('init spots state error:', e)
    }
  }

  return {
    spotList,
    currentSpot,
    total,
    spotCount,
    setSpotList,
    addSpot,
    updateSpot,
    removeSpot,
    setCurrentSpot,
    init
  }
})
