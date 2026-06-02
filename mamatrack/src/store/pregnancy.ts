/**
 * MamaTrack 孕期档案和体重数据状态管理
 * 管理孕期档案、体重记录及增重统计
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PregnancyProfile, WeightRecord, GainStatus } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { calculateCurrentWeek, evaluateGainStatus } from '@/utils/pregnancy'

const STORAGE_KEY = 'mamatrack_pregnancy'

export const usePregnancyStore = defineStore('pregnancy', () => {
  // state
  const currentProfile = ref<PregnancyProfile | null>(null)
  const weightRecords = ref<WeightRecord[]>([])
  const loading = ref(false)

  // getters
  const hasProfile = computed(() => !!currentProfile.value)

  const currentWeek = computed(() => {
    if (!currentProfile.value) return { week: 0, day: 0 }
    return calculateCurrentWeek(currentProfile.value.dueDate)
  })

  const latestWeight = computed(() => {
    if (weightRecords.value.length === 0) return null
    const sorted = [...weightRecords.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    return sorted[0]
  })

  const totalGain = computed(() => {
    if (!latestWeight.value || !currentProfile.value) return 0
    return Number((latestWeight.value.weight - currentProfile.value.preWeight).toFixed(2))
  })

  const weeklyAvgGain = computed(() => {
    const week = currentWeek.value.week
    if (week <= 0) return 0
    return Number((totalGain.value / week).toFixed(2))
  })

  const gainStatus = computed<GainStatus>(() => {
    if (!currentProfile.value) return 'normal'
    return evaluateGainStatus(totalGain.value, currentWeek.value.week, currentProfile.value.bmiCategory)
  })

  const sortedRecords = computed(() => {
    return [...weightRecords.value].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  })

  // actions
  function createProfile(data: Omit<PregnancyProfile, 'profileId' | 'createdAt' | 'updatedAt'>) {
    const profile: PregnancyProfile = {
      ...data,
      profileId: generateId(),
      createdAt: Date.now()
    }
    currentProfile.value = profile
    dbSet('profiles', profile.profileId, profile)
    persist()
    return profile
  }

  function updateProfile(data: Partial<PregnancyProfile>) {
    if (!currentProfile.value) return
    const updated: PregnancyProfile = {
      ...currentProfile.value,
      ...data,
      updatedAt: Date.now()
    }
    currentProfile.value = updated
    dbSet('profiles', updated.profileId, updated)
    persist()
    return updated
  }

  function addWeightRecord(data: Omit<WeightRecord, 'recordId' | 'gainFromPre' | 'gainFromLast' | 'createdAt'>) {
    const profile = currentProfile.value
    if (!profile) return null

    const gainFromPre = Number((data.weight - profile.preWeight).toFixed(2))

    const sorted = [...weightRecords.value].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const lastRecord = sorted[sorted.length - 1]
    const gainFromLast = lastRecord
      ? Number((data.weight - lastRecord.weight).toFixed(2))
      : gainFromPre

    const record: WeightRecord = {
      ...data,
      recordId: generateId(),
      gainFromPre,
      gainFromLast,
      createdAt: Date.now()
    }
    dbSet('weight_records', record.recordId, record)
    weightRecords.value.push(record)
    persist()
    return record
  }

  function updateWeightRecord(recordId: string, data: Partial<WeightRecord>) {
    const index = weightRecords.value.findIndex((r) => r.recordId === recordId)
    if (index === -1) return

    const updated: WeightRecord = {
      ...weightRecords.value[index],
      ...data
    }
    weightRecords.value[index] = updated
    dbSet('weight_records', recordId, updated)
    persist()
    return updated
  }

  function deleteWeightRecord(recordId: string) {
    dbDelete('weight_records', recordId)
    weightRecords.value = weightRecords.value.filter((r) => r.recordId !== recordId)
    persist()
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        currentProfile: currentProfile.value,
        weightRecords: weightRecords.value
      })
    } catch (e) {
      console.error('[pregnancy store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as {
        currentProfile?: PregnancyProfile | null
        weightRecords?: WeightRecord[]
      } | undefined

      if (stored) {
        if (stored.currentProfile !== undefined) currentProfile.value = stored.currentProfile
        if (stored.weightRecords) weightRecords.value = stored.weightRecords
      }

      // 同时从 db 加载记录（去重合并）
      const dbRecords = dbGetAll<WeightRecord>('weight_records')
      if (dbRecords.length > 0) {
        const existingIds = new Set(weightRecords.value.map((r) => r.recordId))
        for (const record of dbRecords) {
          if (!existingIds.has(record.recordId)) {
            weightRecords.value.push(record)
          }
        }
      }

      // 从 db 加载档案
      const dbProfiles = dbGetAll<PregnancyProfile>('profiles')
      if (dbProfiles.length > 0 && !currentProfile.value) {
        currentProfile.value = dbProfiles[0]
      }
    } catch (e) {
      console.error('[pregnancy store] init error:', e)
    }
  }

  return {
    currentProfile,
    weightRecords,
    loading,
    hasProfile,
    currentWeek,
    latestWeight,
    totalGain,
    weeklyAvgGain,
    gainStatus,
    sortedRecords,
    createProfile,
    updateProfile,
    addWeightRecord,
    updateWeightRecord,
    deleteWeightRecord,
    init,
    persist
  }
})
