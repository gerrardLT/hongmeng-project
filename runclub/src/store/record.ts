import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RunRecord } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import { formatDate } from '@/utils/format'

interface RunStatistics {
  weeklyDistance: number
  monthlyDistance: number
  yearlyDistance: number
  totalDistance: number
  totalRuns: number
}

export const useRecordStore = defineStore('record', () => {
  // state
  const records = ref<RunRecord[]>([])
  const statistics = ref<RunStatistics>({
    weeklyDistance: 0,
    monthlyDistance: 0,
    yearlyDistance: 0,
    totalDistance: 0,
    totalRuns: 0
  })

  // getters
  const personalBest = computed(() => {
    if (records.value.length === 0) return null
    const sorted = [...records.value].sort((a, b) => {
      const paceA = a.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
      const paceB = b.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
      return paceA - paceB
    })
    return sorted[0]
  })

  const milestones = computed(() => {
    const total = statistics.value.totalDistance
    const achieved: string[] = []
    if (total >= 10) achieved.push('10km')
    if (total >= 42.195) achieved.push('马拉松')
    if (total >= 100) achieved.push('百公里')
    if (total >= 500) achieved.push('500公里')
    if (total >= 1000) achieved.push('千里之行')
    return achieved
  })

  const streakDays = computed(() => {
    if (records.value.length === 0) return 0
    const dates = [...new Set(records.value.map((r) => r.date))].sort().reverse()
    let streak = 0
    const today = formatDate(Date.now())
    let checkDate = today

    for (const date of dates) {
      if (date === checkDate) {
        streak++
        const prev = new Date(checkDate)
        prev.setDate(prev.getDate() - 1)
        checkDate = formatDate(prev.getTime())
      } else {
        break
      }
    }
    return streak
  })

  // actions
  async function loadRecords() {
    records.value = dbGetAll<RunRecord>('records')
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  async function addRecord(data: Omit<RunRecord, 'recordId' | 'createdAt'>) {
    const record: RunRecord = {
      ...data,
      recordId: generateId(),
      createdAt: Date.now()
    }
    dbSet('records', record.recordId, record)
    records.value.unshift(record)
    await loadStatistics()
    return record
  }

  async function deleteRecord(recordId: string) {
    dbDelete('records', recordId)
    records.value = records.value.filter((r) => r.recordId !== recordId)
    await loadStatistics()
  }

  async function loadStatistics() {
    const allRecords = dbGetAll<RunRecord>('records')
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const weeklyRecords = allRecords.filter((r) => new Date(r.date) >= weekAgo)
    const monthlyRecords = allRecords.filter((r) => new Date(r.date) >= monthStart)
    const yearlyRecords = allRecords.filter((r) => new Date(r.date) >= yearStart)

    statistics.value = {
      weeklyDistance: weeklyRecords.reduce((sum, r) => sum + r.distance, 0),
      monthlyDistance: monthlyRecords.reduce((sum, r) => sum + r.distance, 0),
      yearlyDistance: yearlyRecords.reduce((sum, r) => sum + r.distance, 0),
      totalDistance: allRecords.reduce((sum, r) => sum + r.distance, 0),
      totalRuns: allRecords.length
    }
  }

  return {
    records,
    statistics,
    personalBest,
    milestones,
    streakDays,
    loadRecords,
    addRecord,
    deleteRecord,
    loadStatistics
  }
})
