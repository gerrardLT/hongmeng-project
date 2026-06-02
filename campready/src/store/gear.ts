import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Gear, GearCategory } from '@/types/models'
import { setItem, getItem } from '@/utils/db'

const STORAGE_KEY = 'gears'

export const useGearStore = defineStore('gear', () => {
  // state
  const gears = ref<Gear[]>([])
  const searchKeyword = ref('')
  const filterCategory = ref<GearCategory | 'all'>('all')
  const filterLocation = ref('')

  // getters
  const filteredGears = computed(() => {
    let result = gears.value

    // 搜索过滤
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      result = result.filter(g =>
        g.name.toLowerCase().includes(kw) ||
        g.note.toLowerCase().includes(kw) ||
        g.storageLocation.toLowerCase().includes(kw)
      )
    }

    // 分类过滤
    if (filterCategory.value !== 'all') {
      result = result.filter(g => g.category === filterCategory.value)
    }

    // 存放位置过滤
    if (filterLocation.value) {
      result = result.filter(g => g.storageLocation === filterLocation.value)
    }

    return result
  })

  const gearsByCategory = computed(() => {
    const map = new Map<GearCategory, Gear[]>()
    gears.value.forEach(g => {
      const list = map.get(g.category) || []
      list.push(g)
      map.set(g.category, list)
    })
    return map
  })

  const allLocations = computed(() => {
    const locations = new Set<string>()
    gears.value.forEach(g => {
      if (g.storageLocation) {
        locations.add(g.storageLocation)
      }
    })
    return Array.from(locations).sort()
  })

  const totalWeight = computed(() =>
    gears.value.reduce((sum, g) => sum + g.weight * g.quantity, 0)
  )

  const totalCount = computed(() =>
    gears.value.reduce((sum, g) => sum + g.quantity, 0)
  )

  const categoryStats = computed(() => {
    const stats: { category: GearCategory; count: number; weight: number }[] = []
    const map = new Map<GearCategory, { count: number; weight: number }>()

    gears.value.forEach(g => {
      const existing = map.get(g.category) || { count: 0, weight: 0 }
      existing.count += g.quantity
      existing.weight += g.weight * g.quantity
      map.set(g.category, existing)
    })

    map.forEach((value, key) => {
      stats.push({ category: key, ...value })
    })

    return stats
  })

  // actions
  function addGear(gear: Gear) {
    gears.value.unshift(gear)
    persist()
  }

  function updateGear(id: string, data: Partial<Gear>) {
    const index = gears.value.findIndex(g => g.gearId === id)
    if (index !== -1) {
      gears.value[index] = {
        ...gears.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      persist()
    }
  }

  function deleteGear(id: string) {
    gears.value = gears.value.filter(g => g.gearId !== id)
    persist()
  }

  function setFilter(category: GearCategory | 'all') {
    filterCategory.value = category
  }

  function setSearch(keyword: string) {
    searchKeyword.value = keyword
  }

  function getGearById(id: string): Gear | undefined {
    return gears.value.find(g => g.gearId === id)
  }

  function persist() {
    setItem(STORAGE_KEY, gears.value)
  }

  function init() {
    const saved = getItem<Gear[]>(STORAGE_KEY)
    if (saved) {
      gears.value = saved
    }
  }

  return {
    gears,
    searchKeyword,
    filterCategory,
    filterLocation,
    filteredGears,
    gearsByCategory,
    allLocations,
    totalWeight,
    totalCount,
    categoryStats,
    addGear,
    updateGear,
    deleteGear,
    setFilter,
    setSearch,
    getGearById,
    init,
    persist
  }
})
