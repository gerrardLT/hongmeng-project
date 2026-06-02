/**
 * MamaTrack 体重记录服务
 * 处理体重记录的增删改查及增重统计
 */
import type { WeightRecord, GainStats, WeightSource } from '@/types/models'
import { usePregnancyStore } from '@/store/pregnancy'
import { calculateWeekForDate, evaluateGainStatus, estimateTotalGain } from '@/utils/pregnancy'
import { formatDate } from '@/utils/format'

/**
 * 添加体重记录
 * 自动计算孕周、距孕前增重、距上次增重
 */
export async function addWeightRecord(data: {
  weight: number
  date?: string
  note?: string
  source?: WeightSource
}): Promise<WeightRecord | null> {
  try {
    const pregnancyStore = usePregnancyStore()
    const profile = pregnancyStore.currentProfile

    if (!profile) {
      throw new Error('请先创建孕期档案')
    }

    const recordDate = data.date || formatDate(Date.now())

    // 计算孕周
    const { week, day: weekDay } = calculateWeekForDate(recordDate, profile.dueDate)

    const record = pregnancyStore.addWeightRecord({
      profileId: profile.profileId,
      weight: data.weight,
      date: recordDate,
      week,
      weekDay,
      source: data.source || 'manual',
      note: data.note || ''
    })

    return record
  } catch (e) {
    console.error('[weight service] addWeightRecord error:', e)
    throw new Error('添加体重记录失败')
  }
}

/**
 * 更新体重记录
 */
export async function updateWeightRecord(
  recordId: string,
  data: Partial<WeightRecord>
): Promise<WeightRecord | undefined> {
  try {
    const pregnancyStore = usePregnancyStore()

    // 如果更新了体重，需重新计算增重数据
    const updateData: Partial<WeightRecord> = { ...data }
    const profile = pregnancyStore.currentProfile

    if (profile && data.weight !== undefined) {
      updateData.gainFromPre = Number((data.weight - profile.preWeight).toFixed(2))
    }

    const updated = pregnancyStore.updateWeightRecord(recordId, updateData)
    return updated
  } catch (e) {
    console.error('[weight service] updateWeightRecord error:', e)
    throw new Error('更新体重记录失败')
  }
}

/**
 * 删除体重记录
 */
export async function deleteWeightRecord(recordId: string): Promise<void> {
  try {
    const pregnancyStore = usePregnancyStore()
    pregnancyStore.deleteWeightRecord(recordId)
  } catch (e) {
    console.error('[weight service] deleteWeightRecord error:', e)
    throw new Error('删除体重记录失败')
  }
}

/**
 * 获取体重记录列表
 * @param profileId 档案 ID，不传则使用当前档案
 */
export function getWeightRecords(profileId?: string): WeightRecord[] {
  try {
    const pregnancyStore = usePregnancyStore()
    return pregnancyStore.sortedRecords
  } catch (e) {
    console.error('[weight service] getWeightRecords error:', e)
    return []
  }
}

/**
 * 获取增重统计数据
 */
export function getWeightStats(): GainStats {
  try {
    const pregnancyStore = usePregnancyStore()
    const profile = pregnancyStore.currentProfile
    const records = pregnancyStore.sortedRecords

    if (!profile || records.length === 0) {
      return {
        totalGain: 0,
        weeklyAvgGain: 0,
        lastWeekGain: 0,
        last4WeeksTrend: [],
        gainStatus: 'normal',
        estimatedTotalGain: 0,
        currentPercentile: 50
      }
    }

    const totalGain = pregnancyStore.totalGain
    const currentWeek = pregnancyStore.currentWeek.week
    const weeklyAvgGain = pregnancyStore.weeklyAvgGain
    const gainStatus = pregnancyStore.gainStatus

    // 计算上周增重
    let lastWeekGain = 0
    const currentWeekRecords = records.filter((r) => r.week === currentWeek)
    const lastWeekRecords = records.filter((r) => r.week === currentWeek - 1)
    if (currentWeekRecords.length > 0 && lastWeekRecords.length > 0) {
      const currentWeight = currentWeekRecords[currentWeekRecords.length - 1].weight
      const lastWeight = lastWeekRecords[lastWeekRecords.length - 1].weight
      lastWeekGain = Number((currentWeight - lastWeight).toFixed(2))
    }

    // 最近4周增重趋势
    const last4WeeksTrend: number[] = []
    for (let w = Math.max(1, currentWeek - 3); w <= currentWeek; w++) {
      const weekRecords = records.filter((r) => r.week === w)
      if (weekRecords.length > 0) {
        last4WeeksTrend.push(weekRecords[weekRecords.length - 1].gainFromPre)
      }
    }

    // 预估总增重
    const estimatedTotalGain = estimateTotalGain(totalGain, currentWeek, profile.bmiCategory)

    // 当前百分位（简化计算）
    const currentPercentile = gainStatus === 'low' ? 25 : gainStatus === 'high' ? 75 : 50

    return {
      totalGain,
      weeklyAvgGain,
      lastWeekGain,
      last4WeeksTrend,
      gainStatus,
      estimatedTotalGain,
      currentPercentile
    }
  } catch (e) {
    console.error('[weight service] getWeightStats error:', e)
    return {
      totalGain: 0,
      weeklyAvgGain: 0,
      lastWeekGain: 0,
      last4WeeksTrend: [],
      gainStatus: 'normal',
      estimatedTotalGain: 0,
      currentPercentile: 50
    }
  }
}
