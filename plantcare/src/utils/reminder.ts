import type { Plant } from '@/types/models'
import { formatDate } from '@/utils/format'

/**
 * 获取季节调整系数
 * 春秋：1.0（正常），夏：0.7（加快浇水），冬：1.5（减缓浇水）
 */
export function getSeasonAdjustment(): number {
  const month = new Date().getMonth() + 1 // 1-12
  if (month >= 6 && month <= 8) return 0.7   // 夏季：蒸发快，缩短间隔
  if (month >= 12 || month <= 2) return 1.5   // 冬季：休眠期，延长间隔
  return 1.0                                   // 春秋：正常间隔
}

/**
 * 计算下次浇水日期
 */
export function calculateNextWaterDate(plant: Plant): string {
  const interval = plant.reminderSettings.waterInterval
  let adjustedInterval = interval

  // 智能模式：应用季节调整
  if (plant.reminderMode === 'smart' && plant.reminderSettings.smartAdjust) {
    adjustedInterval = Math.round(interval * getSeasonAdjustment())
  }

  // 确保最少1天间隔
  adjustedInterval = Math.max(1, adjustedInterval)

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + adjustedInterval)
  return formatDate(nextDate)
}

/**
 * 判断今天是否需要浇水
 */
export function isWaterDueToday(plant: Plant): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const waterDate = new Date(plant.nextWaterDate)
  waterDate.setHours(0, 0, 0, 0)

  return waterDate.getTime() <= today.getTime()
}

/**
 * 获取距离下次浇水的天数（负数表示已过期）
 */
export function getDaysUntilWater(plant: Plant): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const waterDate = new Date(plant.nextWaterDate)
  waterDate.setHours(0, 0, 0, 0)

  const diff = waterDate.getTime() - today.getTime()
  return Math.round(diff / (24 * 60 * 60 * 1000))
}

/**
 * 计算下次施肥日期
 */
export function calculateNextFertilizeDate(plant: Plant): string | undefined {
  if (!plant.reminderSettings.fertilizeInterval) return undefined

  const interval = plant.reminderSettings.fertilizeInterval
  let adjustedInterval = interval

  // 冬季休眠不施肥
  const month = new Date().getMonth() + 1
  if (month >= 12 || month <= 2) {
    adjustedInterval = Math.round(interval * 2)
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + adjustedInterval)
  return formatDate(nextDate)
}
