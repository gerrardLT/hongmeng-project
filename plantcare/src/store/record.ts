/**
 * PlantCare 记录状态管理
 * 管理养护记录、生长记录及统计数据
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CareRecord, GrowthRecord, CareStats } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { formatDate } from '@/utils/format'

export const useRecordStore = defineStore('record', () => {
  // state
  const careRecords = ref<CareRecord[]>([])
  const growthRecords = ref<GrowthRecord[]>([])

  // getters
  const recentCareRecords = computed(() => {
    return [...careRecords.value]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
  })

  const recentGrowthRecords = computed(() => {
    return [...growthRecords.value]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20)
  })

  const careStats = computed<CareStats>(() => {
    const now = new Date()
    const today = formatDate(now)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // 本周完成的养护次数
    const weekCompleted = careRecords.value.filter(
      (r) => new Date(r.date) >= weekAgo
    ).length

    // 计算连续养护天数
    const dates = [...new Set(careRecords.value.map((r) => r.date))].sort().reverse()
    let consecutiveDays = 0
    let checkDate = today
    for (const date of dates) {
      if (date === checkDate) {
        consecutiveDays++
        const prev = new Date(checkDate)
        prev.setDate(prev.getDate() - 1)
        checkDate = formatDate(prev)
      } else {
        break
      }
    }

    return {
      totalPlants: 0, // 由 service 层结合 plant store 填充
      todayNeedWater: 0, // 由 service 层结合 plant store 填充
      weekCompleted,
      consecutiveDays
    }
  })

  // actions
  function addCareRecord(data: Omit<CareRecord, 'recordId' | 'createdAt'>) {
    const record: CareRecord = {
      ...data,
      recordId: generateId(),
      createdAt: Date.now()
    }
    dbSet('care_records', record.recordId, record)
    careRecords.value.unshift(record)
    return record
  }

  function addGrowthRecord(data: Omit<GrowthRecord, 'recordId' | 'createdAt'>) {
    const record: GrowthRecord = {
      ...data,
      recordId: generateId(),
      createdAt: Date.now()
    }
    dbSet('growth_records', record.recordId, record)
    growthRecords.value.unshift(record)
    return record
  }

  function deleteGrowthRecord(recordId: string) {
    dbDelete('growth_records', recordId)
    growthRecords.value = growthRecords.value.filter((r) => r.recordId !== recordId)
  }

  function getRecordsByPlant(plantId: string) {
    return {
      care: careRecords.value.filter((r) => r.plantId === plantId),
      growth: growthRecords.value.filter((r) => r.plantId === plantId)
    }
  }

  function persist() {
    // 数据通过 db 工具已持久化，此处为辅助方法
  }

  function init() {
    try {
      careRecords.value = dbGetAll<CareRecord>('care_records')
        .sort((a, b) => b.createdAt - a.createdAt)
      growthRecords.value = dbGetAll<GrowthRecord>('growth_records')
        .sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('[record store] init error:', e)
    }
  }

  return {
    careRecords,
    growthRecords,
    recentCareRecords,
    recentGrowthRecords,
    careStats,
    addCareRecord,
    addGrowthRecord,
    deleteGrowthRecord,
    getRecordsByPlant,
    init,
    persist
  }
})
