/**
 * AquaLog 参数记录 + 维护日志服务
 * 封装记录保存、历史查询、Mock数据生成
 */
import type { ParameterRecord, MaintenanceLog } from '@/types/models'
import { useRecordStore } from '@/store/record'
import { useAquariumStore } from '@/store/aquarium'
import { useAlertStore } from '@/store/alert'
import { formatDate } from '@/utils/format'
import { generateId } from '@/utils/db'

/**
 * 保存参数记录（保存后触发预警检查 + 更新水族箱状态）
 */
export function saveParameterRecord(data: Omit<ParameterRecord, 'recordId' | 'createdAt'>): ParameterRecord {
  const recordStore = useRecordStore()
  const aquariumStore = useAquariumStore()
  const alertStore = useAlertStore()

  const record = recordStore.addParameterRecord(data)

  // 更新水族箱状态
  aquariumStore.updateStatus(data.aquariumId, record)

  // 触发预警检查
  alertStore.checkAlerts(data.aquariumId)

  return record
}

/**
 * 保存维护日志
 */
export function saveMaintenanceLog(data: Omit<MaintenanceLog, 'logId' | 'createdAt'>): MaintenanceLog {
  const recordStore = useRecordStore()
  const alertStore = useAlertStore()

  const log = recordStore.addMaintenanceLog(data)

  // 换水后重新检查预警
  if (data.type === 'waterChange') {
    alertStore.checkAlerts(data.aquariumId)
  }

  return log
}

/**
 * 获取指定天数内的参数历史
 */
export function getParameterHistory(aquariumId: string, days: number = 30): ParameterRecord[] {
  const recordStore = useRecordStore()
  const records = recordStore.getRecordsByAquarium(aquariumId)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return records.filter((r) => r.createdAt >= cutoff)
}

/**
 * 获取维护历史
 */
export function getMaintenanceHistory(aquariumId: string, days: number = 30): MaintenanceLog[] {
  const recordStore = useRecordStore()
  const logs = recordStore.getLogsByAquarium(aquariumId)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return logs.filter((l) => l.createdAt >= cutoff)
}

/**
 * 生成 Mock 参数记录数据（用于演示）
 */
export function generateMockRecords(aquariumId: string, count: number = 30): void {
  const recordStore = useRecordStore()
  const aquariumStore = useAquariumStore()
  const aquarium = aquariumStore.getAquariumById(aquariumId)
  if (!aquarium) return

  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = count - 1; i >= 0; i--) {
    const time = now - i * dayMs
    const date = formatDate(new Date(time))

    // 基于安全范围生成随机值（±15%波动）
    const ranges = aquarium.safeRanges
    const randomInRange = (min: number, max: number) => {
      const mid = (min + max) / 2
      const span = max - min
      return Math.round((mid + (Math.random() - 0.5) * span * 1.3) * 100) / 100
    }

    const record: Omit<ParameterRecord, 'recordId' | 'createdAt'> = {
      aquariumId,
      date,
      time: '10:00',
      temperature: randomInRange(ranges.temperature.min, ranges.temperature.max),
      ph: randomInRange(ranges.ph.min, ranges.ph.max),
      ammonia: randomInRange(ranges.ammonia.min, ranges.ammonia.max),
      nitrite: randomInRange(ranges.nitrite.min, ranges.nitrite.max),
      nitrate: randomInRange(ranges.nitrate.min, ranges.nitrate.max),
      gh: randomInRange(ranges.gh.min, ranges.gh.max),
      kh: randomInRange(ranges.kh.min, ranges.kh.max),
      salinity: ranges.salinity ? randomInRange(ranges.salinity.min, ranges.salinity.max) : null,
      phosphate: randomInRange(ranges.phosphate.min, ranges.phosphate.max),
      photoUrl: '',
      note: ''
    }
    recordStore.addParameterRecord(record)
  }

  // 生成一些维护日志
  for (let i = 0; i < Math.floor(count / 7); i++) {
    const time = now - i * 7 * dayMs
    const date = formatDate(new Date(time))

    recordStore.addMaintenanceLog({
      aquariumId,
      type: 'waterChange',
      date,
      details: {
        percentage: 25 + Math.floor(Math.random() * 10),
        volume: Math.floor(aquarium.volume * 0.25),
        filterCleaned: Math.random() > 0.7,
        trimmedPlants: Math.random() > 0.8
      },
      note: ''
    })
  }

  // 更新水族箱状态
  const latestRecord = recordStore.getLatestRecord(aquariumId)
  if (latestRecord) {
    aquariumStore.updateStatus(aquariumId, latestRecord)
  }
}
