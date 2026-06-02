/**
 * AquaLog 水族箱状态管理
 * 管理水族箱列表、当前选中水族箱、状态更新等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Aquarium, AquariumType } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { getDefaultSafeRanges, checkParamStatus } from '@/utils/paramRanges'
import { formatDate } from '@/utils/format'

const CURRENT_KEY = 'aqualog_current_aquarium'

export const useAquariumStore = defineStore('aquarium', () => {
  // state
  const aquariums = ref<Aquarium[]>([])
  const currentAquariumId = ref<string>('')

  // getters
  const currentAquarium = computed(() => {
    return aquariums.value.find((a) => a.aquariumId === currentAquariumId.value) || null
  })

  const aquariumCount = computed(() => aquariums.value.length)

  // actions
  function addAquarium(data: Omit<Aquarium, 'aquariumId' | 'safeRanges' | 'status' | 'createdAt' | 'updatedAt'>) {
    const aquarium: Aquarium = {
      ...data,
      aquariumId: generateId(),
      safeRanges: getDefaultSafeRanges(data.type),
      status: 'normal',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    dbSet('aquariums', aquarium.aquariumId, aquarium)
    aquariums.value.unshift(aquarium)

    // 如果是第一个水族箱，自动设为当前
    if (aquariums.value.length === 1) {
      currentAquariumId.value = aquarium.aquariumId
    }
    persist()
    return aquarium
  }

  function updateAquarium(id: string, data: Partial<Aquarium>) {
    const index = aquariums.value.findIndex((a) => a.aquariumId === id)
    if (index === -1) return null

    const updated: Aquarium = {
      ...aquariums.value[index],
      ...data,
      updatedAt: Date.now()
    }
    aquariums.value[index] = updated
    dbSet('aquariums', id, updated)
    persist()
    return updated
  }

  function deleteAquarium(id: string) {
    dbDelete('aquariums', id)
    aquariums.value = aquariums.value.filter((a) => a.aquariumId !== id)

    if (currentAquariumId.value === id) {
      currentAquariumId.value = aquariums.value.length > 0 ? aquariums.value[0].aquariumId : ''
    }
    persist()
  }

  function setCurrentAquarium(id: string) {
    currentAquariumId.value = id
    persist()
  }

  function getAquariumById(id: string): Aquarium | null {
    return aquariums.value.find((a) => a.aquariumId === id) || null
  }

  function updateStatus(id: string, latestRecord?: any) {
    const aquarium = aquariums.value.find((a) => a.aquariumId === id)
    if (!aquarium) return

    if (!latestRecord) {
      updateAquarium(id, { status: 'normal' })
      return
    }

    const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'salinity', 'phosphate']
    let hasDanger = false
    let hasWarning = false

    for (const param of paramNames) {
      const value = (latestRecord as any)[param]
      if (value === null || value === undefined) continue
      const status = checkParamStatus(param, value, aquarium.safeRanges)
      if (status === 'danger') hasDanger = true
      if (status === 'warning') hasWarning = true
    }

    const newStatus = hasDanger ? 'danger' : hasWarning ? 'warning' : 'normal'
    updateAquarium(id, { status: newStatus })
  }

  function persist() {
    try {
      uni.setStorageSync(CURRENT_KEY, {
        currentAquariumId: currentAquariumId.value
      })
    } catch (e) {
      console.error('[aquarium store] persist error:', e)
    }
  }

  function init() {
    try {
      aquariums.value = dbGetAll<Aquarium>('aquariums').sort((a, b) => b.createdAt - a.createdAt)

      const stored = uni.getStorageSync(CURRENT_KEY) as { currentAquariumId?: string } | undefined
      if (stored?.currentAquariumId) {
        currentAquariumId.value = stored.currentAquariumId
      } else if (aquariums.value.length > 0) {
        currentAquariumId.value = aquariums.value[0].aquariumId
      }
    } catch (e) {
      console.error('[aquarium store] init error:', e)
    }
  }

  return {
    aquariums,
    currentAquariumId,
    currentAquarium,
    aquariumCount,
    addAquarium,
    updateAquarium,
    deleteAquarium,
    setCurrentAquarium,
    getAquariumById,
    updateStatus,
    init,
    persist
  }
})
