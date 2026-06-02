/**
 * PlantCare 植物状态管理
 * 管理植物列表、选中植物、按位置分组等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Plant } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { isWaterDueToday } from '@/utils/reminder'
import { formatDate } from '@/utils/format'

const STORAGE_KEY = 'plantcare_plants'

export const usePlantStore = defineStore('plant', () => {
  // state
  const plants = ref<Plant[]>([])
  const selectedPlantId = ref<string>('')
  const loading = ref(false)

  // getters
  const selectedPlant = computed(() => {
    return plants.value.find((p) => p.plantId === selectedPlantId.value) || null
  })

  const plantsNeedingWater = computed(() => {
    return plants.value.filter((p) => isWaterDueToday(p))
  })

  const plantsByLocation = computed(() => {
    const groups: Record<string, Plant[]> = {}
    for (const plant of plants.value) {
      const loc = plant.location || '未分类'
      if (!groups[loc]) groups[loc] = []
      groups[loc].push(plant)
    }
    return groups
  })

  const totalPlants = computed(() => plants.value.length)

  // actions
  function addPlant(data: Omit<Plant, 'plantId' | 'createdAt'>) {
    const plant: Plant = {
      ...data,
      plantId: generateId(),
      createdAt: Date.now()
    }
    dbSet('plants', plant.plantId, plant)
    plants.value.unshift(plant)
    persist()
    return plant
  }

  function updatePlant(plantId: string, data: Partial<Plant>) {
    const index = plants.value.findIndex((p) => p.plantId === plantId)
    if (index === -1) return

    const updated: Plant = {
      ...plants.value[index],
      ...data,
      updatedAt: Date.now()
    }
    plants.value[index] = updated
    dbSet('plants', plantId, updated)
    persist()
    return updated
  }

  function deletePlant(plantId: string) {
    dbDelete('plants', plantId)
    plants.value = plants.value.filter((p) => p.plantId !== plantId)
    if (selectedPlantId.value === plantId) {
      selectedPlantId.value = ''
    }
    persist()
  }

  function setSelectedPlant(plantId: string) {
    selectedPlantId.value = plantId
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        selectedPlantId: selectedPlantId.value
      })
    } catch (e) {
      console.error('[plant store] persist error:', e)
    }
  }

  function init() {
    try {
      plants.value = dbGetAll<Plant>('plants').sort((a, b) => b.createdAt - a.createdAt)

      const stored = uni.getStorageSync(STORAGE_KEY) as { selectedPlantId?: string } | undefined
      if (stored?.selectedPlantId) {
        selectedPlantId.value = stored.selectedPlantId
      }
    } catch (e) {
      console.error('[plant store] init error:', e)
    }
  }

  return {
    plants,
    selectedPlantId,
    loading,
    selectedPlant,
    plantsNeedingWater,
    plantsByLocation,
    totalPlants,
    addPlant,
    updatePlant,
    deletePlant,
    setSelectedPlant,
    init,
    persist
  }
})
