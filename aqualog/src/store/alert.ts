/**
 * AquaLog 预警状态管理
 * 管理水质参数预警、维护提醒等
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AlertItem, AlertType, AlertLevel, ParameterRecord } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { checkParamStatus, getParamLabel } from '@/utils/paramRanges'
import { formatDate } from '@/utils/format'
import { useAquariumStore } from './aquarium'
import { useRecordStore } from './record'
import { useSettingsStore } from './settings'

const STORAGE_KEY = 'aqualog_alerts'

export const useAlertStore = defineStore('alert', () => {
  // state
  const alerts = ref<AlertItem[]>([])

  // actions
  function checkAlerts(aquariumId: string) {
    const aquariumStore = useAquariumStore()
    const recordStore = useRecordStore()
    const settingsStore = useSettingsStore()

    const aquarium = aquariumStore.getAquariumById(aquariumId)
    if (!aquarium) return

    // 清除此水族箱旧的未消除预警
    alerts.value = alerts.value.filter(
      (a) => a.aquariumId !== aquariumId || a.dismissed
    )

    const now = Date.now()
    const newAlerts: AlertItem[] = []

    // 1. 参数超出安全范围检查
    const latestRecord = recordStore.getLatestRecord(aquariumId)
    if (latestRecord) {
      const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'salinity', 'phosphate']
      for (const param of paramNames) {
        const value = (latestRecord as any)[param] as number | null
        if (value === null || value === undefined) continue

        const status = checkParamStatus(param, value, aquarium.safeRanges)
        if (status === 'danger' || status === 'warning') {
          const label = getParamLabel(param)
          const range = (aquarium.safeRanges as any)[param]
          newAlerts.push({
            alertId: generateId(),
            aquariumId,
            type: 'paramOutOfRange',
            level: status === 'danger' ? 'danger' : 'warning',
            title: `${label}${status === 'danger' ? '超标' : '接近临界'}`,
            message: `${aquarium.name}的${label}为${value}，安全范围${range.min}-${range.max}`,
            suggestion: status === 'danger'
              ? `请立即检查${label}并采取措施`
              : `请关注${label}变化趋势`,
            paramName: param,
            paramValue: value,
            dismissed: false,
            createdAt: now
          })
        }
      }
    }

    // 2. 距上次换水超过周期
    if (settingsStore.waterChangeReminder) {
      const lastWaterChange = recordStore.getLatestWaterChange(aquariumId)
      const interval = settingsStore.waterChangeInterval * 24 * 60 * 60 * 1000
      if (lastWaterChange) {
        const lastTime = lastWaterChange.createdAt
        if (now - lastTime > interval) {
          const daysSince = Math.floor((now - lastTime) / (24 * 60 * 60 * 1000))
          newAlerts.push({
            alertId: generateId(),
            aquariumId,
            type: 'maintenanceDue',
            level: daysSince > settingsStore.waterChangeInterval * 1.5 ? 'danger' : 'warning',
            title: '换水提醒',
            message: `${aquarium.name}已${daysSince}天未换水`,
            suggestion: `建议每${settingsStore.waterChangeInterval}天换水一次，换水量25%-30%`,
            dismissed: false,
            createdAt: now
          })
        }
      }
    }

    // 3. 连续多日未记录
    if (settingsStore.noRecordReminder) {
      const records = recordStore.getRecordsByAquarium(aquariumId)
      const noRecordThreshold = settingsStore.noRecordDays * 24 * 60 * 60 * 1000
      if (records.length === 0) {
        // 从创建时间算起
        if (now - aquarium.createdAt > noRecordThreshold) {
          newAlerts.push({
            alertId: generateId(),
            aquariumId,
            type: 'noRecordDays',
            level: 'info',
            title: '记录提醒',
            message: `${aquarium.name}尚无水质记录`,
            suggestion: '定期记录水质参数有助于掌握水族箱状态',
            dismissed: false,
            createdAt: now
          })
        }
      } else {
        const lastRecordTime = records[0].createdAt
        if (now - lastRecordTime > noRecordThreshold) {
          const daysSince = Math.floor((now - lastRecordTime) / (24 * 60 * 60 * 1000))
          newAlerts.push({
            alertId: generateId(),
            aquariumId,
            type: 'noRecordDays',
            level: 'info',
            title: '记录提醒',
            message: `${aquarium.name}已${daysSince}天未记录水质参数`,
            suggestion: '定期记录水质参数有助于及时发现问题',
            dismissed: false,
            createdAt: now
          })
        }
      }
    }

    alerts.value.push(...newAlerts)
    persist()
  }

  function checkAllAlerts() {
    const aquariumStore = useAquariumStore()
    for (const aquarium of aquariumStore.aquariums) {
      checkAlerts(aquarium.aquariumId)
    }
  }

  function dismissAlert(alertId: string) {
    const alert = alerts.value.find((a) => a.alertId === alertId)
    if (alert) {
      alert.dismissed = true
      persist()
    }
  }

  function getAlertsByAquarium(aquariumId: string): AlertItem[] {
    return alerts.value.filter(
      (a) => a.aquariumId === aquariumId && !a.dismissed
    )
  }

  function getActiveAlertCount(): number {
    return alerts.value.filter((a) => !a.dismissed).length
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, alerts.value)
    } catch (e) {
      console.error('[alert store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as AlertItem[] | undefined
      if (stored && Array.isArray(stored)) {
        alerts.value = stored
      }
    } catch (e) {
      console.error('[alert store] init error:', e)
    }
  }

  return {
    alerts,
    checkAlerts,
    checkAllAlerts,
    dismissAlert,
    getAlertsByAquarium,
    getActiveAlertCount,
    init,
    persist
  }
})
