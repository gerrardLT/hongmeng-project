import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CatchRecord, CatchStats } from '@/types/models'

const STORAGE_KEY = 'anglermate_catches'

interface CatchesStorageState {
  catchList: CatchRecord[]
  currentCatch: CatchRecord | null
  stats: CatchStats | null
  total: number
  filterSpotId: string
  filterSpecies: string
  filterDateRange: string[]
}

export const useCatchesStore = defineStore('catches', () => {
  // state
  const catchList = ref<CatchRecord[]>([])
  const currentCatch = ref<CatchRecord | null>(null)
  const stats = ref<CatchStats | null>(null)
  const total = ref(0)
  const filterSpotId = ref('')
  const filterSpecies = ref('')
  const filterDateRange = ref<string[]>([])

  // getters
  const filteredList = computed(() => {
    let list = catchList.value

    if (filterSpotId.value) {
      list = list.filter((c) => c.spotId === filterSpotId.value)
    }

    if (filterSpecies.value) {
      list = list.filter((c) => c.fishSpecies === filterSpecies.value)
    }

    if (filterDateRange.value.length === 2) {
      const [start, end] = filterDateRange.value
      list = list.filter((c) => c.date >= start && c.date <= end)
    }

    return list
  })

  const catchCount = computed(() => catchList.value.length)

  // 持久化到本地存储
  function persist() {
    const state: CatchesStorageState = {
      catchList: catchList.value,
      currentCatch: currentCatch.value,
      stats: stats.value,
      total: total.value,
      filterSpotId: filterSpotId.value,
      filterSpecies: filterSpecies.value,
      filterDateRange: filterDateRange.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist catches state error:', e)
    }
  }

  // actions
  function setCatchList(data: CatchRecord[], totalCount?: number) {
    catchList.value = data
    if (totalCount !== undefined) {
      total.value = totalCount
    }
    persist()
  }

  function addCatch(record: CatchRecord) {
    catchList.value.unshift(record)
    total.value++
    persist()
  }

  function updateCatch(recordId: string, data: Partial<CatchRecord>) {
    const index = catchList.value.findIndex((c) => c.recordId === recordId)
    if (index !== -1) {
      catchList.value[index] = { ...catchList.value[index], ...data }
      if (currentCatch.value?.recordId === recordId) {
        currentCatch.value = { ...currentCatch.value, ...data }
      }
    }
    persist()
  }

  function removeCatch(recordId: string) {
    const index = catchList.value.findIndex((c) => c.recordId === recordId)
    if (index !== -1) {
      catchList.value.splice(index, 1)
      total.value = Math.max(0, total.value - 1)
    }
    if (currentCatch.value?.recordId === recordId) {
      currentCatch.value = null
    }
    persist()
  }

  function setCurrentCatch(record: CatchRecord | null) {
    currentCatch.value = record
  }

  function setStats(data: CatchStats) {
    stats.value = data
    persist()
  }

  function setFilters(params: { spotId?: string; species?: string; dateRange?: string[] }) {
    if (params.spotId !== undefined) filterSpotId.value = params.spotId
    if (params.species !== undefined) filterSpecies.value = params.species
    if (params.dateRange !== undefined) filterDateRange.value = params.dateRange
  }

  function clearFilters() {
    filterSpotId.value = ''
    filterSpecies.value = ''
    filterDateRange.value = []
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as CatchesStorageState | undefined
      if (state) {
        catchList.value = state.catchList || []
        currentCatch.value = state.currentCatch || null
        stats.value = state.stats || null
        total.value = state.total || 0
        filterSpotId.value = state.filterSpotId || ''
        filterSpecies.value = state.filterSpecies || ''
        filterDateRange.value = state.filterDateRange || []
      }
    } catch (e) {
      console.error('init catches state error:', e)
    }
  }

  return {
    catchList,
    currentCatch,
    stats,
    total,
    filterSpotId,
    filterSpecies,
    filterDateRange,
    filteredList,
    catchCount,
    setCatchList,
    addCatch,
    updateCatch,
    removeCatch,
    setCurrentCatch,
    setStats,
    setFilters,
    clearFilters,
    init
  }
})
