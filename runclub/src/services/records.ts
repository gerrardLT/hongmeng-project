import type { RunRecord } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { formatDate } from '@/utils/format'

/**
 * 添加跑步记录
 */
export async function addRecord(data: Omit<RunRecord, 'recordId' | 'createdAt'>): Promise<RunRecord> {
  const record: RunRecord = {
    ...data,
    recordId: generateId(),
    createdAt: Date.now()
  }
  dbSet('records', record.recordId, record)
  return record
}

/**
 * 获取跑步记录列表
 */
export async function getRecords(userId?: string): Promise<RunRecord[]> {
  const all = dbGetAll<RunRecord>('records')
  const filtered = userId ? all.filter((r) => r.userId === userId) : all
  return filtered.sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 删除跑步记录
 */
export async function deleteRecord(recordId: string): Promise<void> {
  dbDelete('records', recordId)
}

// ===== 统计分析 =====

interface PeriodStats {
  totalDistance: number
  totalRuns: number
  totalDuration: number
  avgPace: string
  avgDistance: number
}

function calculatePeriodStats(records: RunRecord[]): PeriodStats {
  if (records.length === 0) {
    return { totalDistance: 0, totalRuns: 0, totalDuration: 0, avgPace: '--', avgDistance: 0 }
  }

  const totalDistance = records.reduce((sum, r) => sum + r.distance, 0)
  const totalDuration = records.reduce((sum, r) => sum + r.duration, 0)
  const avgDistance = totalDistance / records.length

  // 计算平均配速
  let avgPace = '--'
  if (totalDistance > 0) {
    const paceSeconds = totalDuration / totalDistance
    const paceMin = Math.floor(paceSeconds / 60)
    const paceSec = Math.floor(paceSeconds % 60)
    avgPace = `${paceMin}:${String(paceSec).padStart(2, '0')}`
  }

  return {
    totalDistance: Math.round(totalDistance * 10) / 10,
    totalRuns: records.length,
    totalDuration,
    avgPace,
    avgDistance: Math.round(avgDistance * 10) / 10
  }
}

/**
 * 获取本周统计
 */
export async function getWeeklyStats(userId: string): Promise<PeriodStats> {
  const all = dbGetAll<RunRecord>('records')
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const records = all.filter((r) => r.userId === userId && new Date(r.date) >= weekAgo)
  return calculatePeriodStats(records)
}

/**
 * 获取本月统计
 */
export async function getMonthlyStats(userId: string): Promise<PeriodStats> {
  const all = dbGetAll<RunRecord>('records')
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const records = all.filter((r) => r.userId === userId && new Date(r.date) >= monthStart)
  return calculatePeriodStats(records)
}

/**
 * 获取本年统计
 */
export async function getYearlyStats(userId: string): Promise<PeriodStats> {
  const all = dbGetAll<RunRecord>('records')
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const records = all.filter((r) => r.userId === userId && new Date(r.date) >= yearStart)
  return calculatePeriodStats(records)
}

/**
 * 获取总计统计
 */
export async function getTotalStats(userId: string): Promise<PeriodStats> {
  const all = dbGetAll<RunRecord>('records')
  const records = all.filter((r) => r.userId === userId)
  return calculatePeriodStats(records)
}

// ===== 成就系统 =====

/**
 * 获取成就里程碑
 */
export async function getMilestones(userId: string): Promise<string[]> {
  const records = dbGetAll<RunRecord>('records').filter((r) => r.userId === userId)
  const totalDistance = records.reduce((sum, r) => sum + r.distance, 0)
  const achieved: string[] = []

  if (totalDistance >= 10) achieved.push('10km')
  if (totalDistance >= 42.195) achieved.push('马拉松')
  if (totalDistance >= 100) achieved.push('百公里')
  if (totalDistance >= 500) achieved.push('500公里')
  if (totalDistance >= 1000) achieved.push('千里之行')
  if (totalDistance >= 5000) achieved.push('五千公里')

  return achieved
}

/**
 * 获取个人最佳记录
 */
export async function getPersonalBest(userId: string): Promise<RunRecord | null> {
  const records = dbGetAll<RunRecord>('records').filter((r) => r.userId === userId)
  if (records.length === 0) return null

  return records.sort((a, b) => {
    const paceA = a.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
    const paceB = b.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
    return paceA - paceB
  })[0]
}

/**
 * 获取连续跑步天数
 */
export async function getStreakDays(userId: string): Promise<number> {
  const records = dbGetAll<RunRecord>('records').filter((r) => r.userId === userId)
  if (records.length === 0) return 0

  const dates = [...new Set(records.map((r) => r.date))].sort().reverse()
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
}
