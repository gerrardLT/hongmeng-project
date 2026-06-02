/**
 * AquaLog 参数记录 + 维护日志状态管理
 * 管理水质参数记录和维护日志
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ParameterRecord, MaintenanceLog } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

export const useRecordStore = defineStore('record', () => {
  // state
  const parameterRecords = ref<ParameterRecord[]>([])
  const maintenanceLogs = ref<MaintenanceLog[]>([])

  // actions
  function addParameterRecord(data: Omit<ParameterRecord, 'recordId' | 'createdAt'>) {
    const record: ParameterRecord = {
      ...data,
      recordId: generateId(),
      createdAt: Date.now()
    }
    dbSet('parameter_records', record.recordId, record)
    parameterRecords.value.unshift(record)
    return record
  }

  function addMaintenanceLog(data: Omit<MaintenanceLog, 'logId' | 'createdAt'>) {
    const log: MaintenanceLog = {
      ...data,
      logId: generateId(),
      createdAt: Date.now()
    }
    dbSet('maintenance_logs', log.logId, log)
    maintenanceLogs.value.unshift(log)
    return log
  }

  function getRecordsByAquarium(aquariumId: string): ParameterRecord[] {
    return parameterRecords.value
      .filter((r) => r.aquariumId === aquariumId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  function getLogsByAquarium(aquariumId: string): MaintenanceLog[] {
    return maintenanceLogs.value
      .filter((l) => l.aquariumId === aquariumId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  function getLatestRecord(aquariumId: string): ParameterRecord | null {
    const records = getRecordsByAquarium(aquariumId)
    return records.length > 0 ? records[0] : null
  }

  function getLatestWaterChange(aquariumId: string): MaintenanceLog | null {
    const waterChanges = maintenanceLogs.value
      .filter((l) => l.aquariumId === aquariumId && l.type === 'waterChange')
      .sort((a, b) => b.createdAt - a.createdAt)
    return waterChanges.length > 0 ? waterChanges[0] : null
  }

  function deleteRecordsByAquarium(aquariumId: string) {
    // 删除参数记录
    const recordsToDelete = parameterRecords.value.filter((r) => r.aquariumId === aquariumId)
    for (const record of recordsToDelete) {
      dbDelete('parameter_records', record.recordId)
    }
    parameterRecords.value = parameterRecords.value.filter((r) => r.aquariumId !== aquariumId)

    // 删除维护日志
    const logsToDelete = maintenanceLogs.value.filter((l) => l.aquariumId === aquariumId)
    for (const log of logsToDelete) {
      dbDelete('maintenance_logs', log.logId)
    }
    maintenanceLogs.value = maintenanceLogs.value.filter((l) => l.aquariumId !== aquariumId)
  }

  function persist() {
    // 数据通过 db 工具已持久化，此处为辅助方法
  }

  function init() {
    try {
      parameterRecords.value = dbGetAll<ParameterRecord>('parameter_records')
        .sort((a, b) => b.createdAt - a.createdAt)
      maintenanceLogs.value = dbGetAll<MaintenanceLog>('maintenance_logs')
        .sort((a, b) => b.createdAt - a.createdAt)
    } catch (e) {
      console.error('[record store] init error:', e)
    }
  }

  return {
    parameterRecords,
    maintenanceLogs,
    addParameterRecord,
    addMaintenanceLog,
    getRecordsByAquarium,
    getLogsByAquarium,
    getLatestRecord,
    getLatestWaterChange,
    deleteRecordsByAquarium,
    init,
    persist
  }
})
