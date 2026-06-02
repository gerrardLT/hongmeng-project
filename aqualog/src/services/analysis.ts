/**
 * AquaLog 趋势分析服务
 * 参数趋势、健康评分、维护统计、总览统计
 */
import type { TrendSummary, TrendDataPoint, AquariumStats, TrendPeriod } from '@/types/models'
import { useRecordStore } from '@/store/record'
import { useAquariumStore } from '@/store/aquarium'
import { useAlertStore } from '@/store/alert'
import { checkParamStatus } from '@/utils/paramRanges'
import { formatDate } from '@/utils/format'

/**
 * 趋势周期转换为天数
 */
function periodToDays(period: TrendPeriod): number {
  const map: Record<TrendPeriod, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  return map[period]
}

/**
 * 获取参数趋势数据
 */
export function getParamTrend(aquariumId: string, paramName: string, period: TrendPeriod): TrendSummary {
  const recordStore = useRecordStore()
  const days = periodToDays(period)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  const records = recordStore.getRecordsByAquarium(aquariumId)
    .filter((r) => r.createdAt >= cutoff)
    .sort((a, b) => a.createdAt - b.createdAt)

  const dataPoints: TrendDataPoint[] = []
  const values: number[] = []

  for (const record of records) {
    const value = (record as any)[paramName] as number | null
    if (value !== null && value !== undefined) {
      dataPoints.push({
        date: record.date,
        value
      })
      values.push(value)
    }
  }

  if (values.length === 0) {
    return { avg: 0, min: 0, max: 0, dataPoints: [] }
  }

  const avg = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) / 100
  const min = Math.round(Math.min(...values) * 100) / 100
  const max = Math.round(Math.max(...values) * 100) / 100

  return { avg, min, max, dataPoints }
}

/**
 * 计算健康评分（0-100）
 * 基于参数稳定性和是否在安全范围内
 */
export function calculateHealthScore(aquariumId: string): number {
  const recordStore = useRecordStore()
  const aquariumStore = useAquariumStore()

  const aquarium = aquariumStore.getAquariumById(aquariumId)
  if (!aquarium) return 0

  // 最近7天的记录
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000
  const records = recordStore.getRecordsByAquarium(aquariumId)
    .filter((r) => r.createdAt >= cutoff)

  if (records.length === 0) return 50 // 无记录时给中间分

  let totalScore = 0
  let paramCount = 0
  const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'phosphate']

  for (const param of paramNames) {
    const values = records
      .map((r) => (r as any)[param] as number | null)
      .filter((v): v is number => v !== null && v !== undefined)

    if (values.length === 0) continue
    paramCount++

    // 1. 范围内得分 (0-60)
    const latestValue = values[0]
    const status = checkParamStatus(param, latestValue, aquarium.safeRanges)
    const rangeScore = status === 'normal' ? 60 : status === 'warning' ? 30 : 0

    // 2. 稳定性得分 (0-40)：标准差越小越稳定
    let stabilityScore = 40
    if (values.length >= 2) {
      const avg = values.reduce((s, v) => s + v, 0) / values.length
      const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)
      const range = (aquarium.safeRanges as any)[param]
      if (range) {
        const span = range.max - range.min
        const cvRatio = span > 0 ? stdDev / span : 0
        stabilityScore = Math.max(0, Math.round(40 * (1 - cvRatio * 2)))
      }
    }

    totalScore += rangeScore + stabilityScore
  }

  if (paramCount === 0) return 50
  return Math.round(totalScore / paramCount)
}

/**
 * 换水频率/喂食规律统计
 */
export function getMaintenanceStats(aquariumId: string, period: TrendPeriod): {
  waterChangeCount: number
  feedingCount: number
  filterCount: number
  avgWaterChangeInterval: number
} {
  const recordStore = useRecordStore()
  const days = periodToDays(period)
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

  const logs = recordStore.getLogsByAquarium(aquariumId)
    .filter((l) => l.createdAt >= cutoff)

  const waterChangeLogs = logs.filter((l) => l.type === 'waterChange')
  const feedingLogs = logs.filter((l) => l.type === 'feeding')
  const filterLogs = logs.filter((l) => l.type === 'filter')

  // 计算平均换水间隔
  let avgWaterChangeInterval = 0
  if (waterChangeLogs.length >= 2) {
    const sorted = waterChangeLogs.sort((a, b) => a.createdAt - b.createdAt)
    let totalInterval = 0
    for (let i = 1; i < sorted.length; i++) {
      totalInterval += sorted[i].createdAt - sorted[i - 1].createdAt
    }
    avgWaterChangeInterval = Math.round(totalInterval / (sorted.length - 1) / (24 * 60 * 60 * 1000))
  }

  return {
    waterChangeCount: waterChangeLogs.length,
    feedingCount: feedingLogs.length,
    filterCount: filterLogs.length,
    avgWaterChangeInterval
  }
}

/**
 * 获取总览统计
 */
export function getOverviewStats(userId: string): AquariumStats {
  const aquariumStore = useAquariumStore()
  const recordStore = useRecordStore()
  const alertStore = useAlertStore()

  const totalAquariums = aquariumStore.aquariums.length
  const totalRecords = recordStore.parameterRecords.length
  const todayAlerts = alertStore.alerts.filter((a) => !a.dismissed).length

  // 计算综合健康评分（所有水族箱的平均值）
  let healthScore = 100
  if (totalAquariums > 0) {
    let totalHealth = 0
    for (const aquarium of aquariumStore.aquariums) {
      totalHealth += calculateHealthScore(aquarium.aquariumId)
    }
    healthScore = Math.round(totalHealth / totalAquariums)
  }

  return {
    totalAquariums,
    totalRecords,
    todayAlerts,
    healthScore
  }
}
