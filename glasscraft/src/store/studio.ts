import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Studio, StudioFilter } from '@/types/models'

const STORAGE_KEY = 'glasscraft_studios'

interface StudioStorageState {
  studioList: Studio[]
  currentStudio: Studio | null
  filter: StudioFilter
}

const defaultFilter: StudioFilter = {
  sortBy: 'distance'
}

export const useStudioStore = defineStore('studio', () => {
  // state
  const studioList = ref<Studio[]>([])
  const currentStudio = ref<Studio | null>(null)
  const filter = ref<StudioFilter>({ ...defaultFilter })
  const loading = ref(false)

  // getters
  const filteredStudios = computed(() => {
    let list = [...studioList.value]

    // 按最低评分筛选
    if (filter.value.minRating !== undefined) {
      list = list.filter((s) => s.rating >= filter.value.minRating!)
    }

    // 按价格区间筛选
    if (filter.value.priceRange) {
      const [min, max] = filter.value.priceRange
      list = list.filter((s) => {
        // priceRange 是字符串如 "100-200"，需要解析
        const prices = s.priceRange.match(/\d+/g)
        if (!prices || prices.length === 0) return true
        const avgPrice = prices.reduce((a, b) => a + Number(b), 0) / prices.length
        return avgPrice >= min && avgPrice <= max
      })
    }

    // 排序
    const sortBy = filter.value.sortBy
    list.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance ?? Infinity) - (b.distance ?? Infinity)
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating
      }
      if (sortBy === 'price') {
        const pricesA = a.priceRange.match(/\d+/g)
        const pricesB = b.priceRange.match(/\d+/g)
        const avgA = pricesA ? pricesA.reduce((s, p) => s + Number(p), 0) / pricesA.length : Infinity
        const avgB = pricesB ? pricesB.reduce((s, p) => s + Number(p), 0) / pricesB.length : Infinity
        return avgA - avgB
      }
      return 0
    })

    return list
  })

  // 持久化到本地存储
  function persist() {
    const state: StudioStorageState = {
      studioList: studioList.value,
      currentStudio: currentStudio.value,
      filter: filter.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist studios state error:', e)
    }
  }

  // actions
  function setStudios(list: Studio[]) {
    studioList.value = list
    persist()
  }

  function setCurrentStudio(studio: Studio | null) {
    currentStudio.value = studio
    persist()
  }

  function setFilter(newFilter: Partial<StudioFilter>) {
    filter.value = { ...filter.value, ...newFilter }
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as StudioStorageState | undefined
      if (state) {
        studioList.value = state.studioList || []
        currentStudio.value = state.currentStudio || null
        filter.value = state.filter || { ...defaultFilter }
      }
    } catch (e) {
      console.error('init studios state error:', e)
    }
  }

  return {
    studioList,
    currentStudio,
    filter,
    loading,
    filteredStudios,
    setStudios,
    setCurrentStudio,
    setFilter,
    init,
    persist
  }
})
