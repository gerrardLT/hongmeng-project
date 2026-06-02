import type { WeightRecord } from '@/types/models'

/**
 * 图表数据点
 */
export interface ChartPoint {
  x: number
  y: number
  label?: string
}

/**
 * 图表范围数据
 */
export interface ChartRange {
  week: number
  min: number
  max: number
}

/**
 * 体重记录转为绝对体重数据点
 */
export function recordsToWeightPoints(records: WeightRecord[]): ChartPoint[] {
  try {
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return sorted.map((r) => ({
      x: r.week + (r.weekDay || 0) / 7,
      y: r.weight,
      label: r.date
    }))
  } catch (e) {
    console.error('recordsToWeightPoints error:', e)
    return []
  }
}

/**
 * 体重记录转为增重数据点
 */
export function recordsToGainPoints(records: WeightRecord[]): ChartPoint[] {
  try {
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    return sorted.map((r) => ({
      x: r.week + (r.weekDay || 0) / 7,
      y: r.gainFromPre,
      label: r.date
    }))
  } catch (e) {
    console.error('recordsToGainPoints error:', e)
    return []
  }
}

/**
 * 计算 Y 轴范围
 * @param points 数据点数组
 * @param ranges 范围数组，可选
 */
export function calculateYRange(
  points: ChartPoint[],
  ranges?: ChartRange[]
): { min: number; max: number; step: number } {
  try {
    let minVal = Infinity
    let maxVal = -Infinity

    points.forEach((p) => {
      if (p.y < minVal) minVal = p.y
      if (p.y > maxVal) maxVal = p.y
    })

    if (ranges && ranges.length > 0) {
      ranges.forEach((r) => {
        if (r.min < minVal) minVal = r.min
        if (r.max > maxVal) maxVal = r.max
      })
    }

    if (minVal === Infinity || maxVal === -Infinity) {
      return { min: 0, max: 100, step: 20 }
    }

    const padding = (maxVal - minVal) * 0.1
    let min = Math.floor(minVal - padding)
    let max = Math.ceil(maxVal + padding)

    if (min < 0 && minVal >= 0) min = 0

    const diff = max - min
    const steps = [1, 2, 5, 10, 20, 25, 50, 100]
    let step = 10
    for (const s of steps) {
      if (diff / s <= 10) {
        step = s
        break
      }
    }

    min = Math.floor(min / step) * step
    max = Math.ceil(max / step) * step

    return { min, max, step }
  } catch (e) {
    console.error('calculateYRange error:', e)
    return { min: 0, max: 100, step: 20 }
  }
}

/**
 * 获取最近 N 周的体重记录
 */
export function getRecentWeeksData(records: WeightRecord[], weeks: number = 8): WeightRecord[] {
  try {
    if (records.length === 0) return []

    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const mostRecent = sorted[0]
    const mostRecentDate = new Date(mostRecent.date)
    mostRecentDate.setHours(0, 0, 0, 0)

    const cutoffDate = new Date(mostRecentDate)
    cutoffDate.setDate(cutoffDate.getDate() - weeks * 7)

    return records
      .filter((r) => new Date(r.date).getTime() >= cutoffDate.getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (e) {
    console.error('getRecentWeeksData error:', e)
    return []
  }
}
