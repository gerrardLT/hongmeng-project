/**
 * MamaTrack 孕期拍照记录状态管理
 * 管理孕期各周拍照记录
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PregnancyLog } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'

const STORAGE_KEY = 'mamatrack_record'

export const useRecordStore = defineStore('record', () => {
  // state
  const logs = ref<PregnancyLog[]>([])

  // getters
  const logsByWeek = computed(() => {
    const groups: Record<number, PregnancyLog[]> = {}
    for (const log of logs.value) {
      if (!groups[log.week]) groups[log.week] = []
      groups[log.week].push(log)
    }
    return groups
  })

  const logCount = computed(() => logs.value.length)

  const sortedLogs = computed(() => {
    return [...logs.value].sort((a, b) => b.week - a.week)
  })

  // actions
  function addLog(data: Omit<PregnancyLog, 'logId' | 'createdAt'>) {
    const log: PregnancyLog = {
      ...data,
      logId: generateId(),
      createdAt: Date.now()
    }
    dbSet('pregnancy_logs', log.logId, log)
    logs.value.unshift(log)
    persist()
    return log
  }

  function deleteLog(logId: string) {
    dbDelete('pregnancy_logs', logId)
    logs.value = logs.value.filter((log) => log.logId !== logId)
    persist()
  }

  function getLogByWeek(week: number) {
    return logs.value.filter((log) => log.week === week)
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        logs: logs.value
      })
    } catch (e) {
      console.error('[record store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as { logs?: PregnancyLog[] } | undefined
      if (stored?.logs) {
        logs.value = stored.logs
      }
      // 同时从 db 加载（去重合并）
      const dbLogs = dbGetAll<PregnancyLog>('pregnancy_logs')
      if (dbLogs.length > 0) {
        const existingIds = new Set(logs.value.map((l) => l.logId))
        for (const log of dbLogs) {
          if (!existingIds.has(log.logId)) {
            logs.value.push(log)
          }
        }
      }
    } catch (e) {
      console.error('[record store] init error:', e)
    }
  }

  return {
    logs,
    logsByWeek,
    logCount,
    sortedLogs,
    addLog,
    deleteLog,
    getLogByWeek,
    init,
    persist
  }
})
