/**
 * MamaTrack 鸿蒙服务卡片数据更新服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 孕期档案更新后
 * - 体重记录增删后
 * - 孕周变化后
 */

import { usePregnancyStore } from '@/store/pregnancy'
import type { GainStatus } from '@/types/models'

interface WidgetDisplayData {
  currentWeek: number
  currentWeekDay?: number
  latestWeight: number
  weeklyGain: number
  gainStatus: GainStatus
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetDisplayData {
  const pregnancyStore = usePregnancyStore()
  const profile = pregnancyStore.currentProfile
  const latest = pregnancyStore.latestWeight

  const currentWeek = pregnancyStore.currentWeek.week
  const currentWeekDay = pregnancyStore.currentWeek.day
  const latestWeight = latest?.weight ?? 0

  // 本周增重
  let weeklyGain = 0
  if (latest && profile) {
    const records = pregnancyStore.sortedRecords
    const thisWeekRecords = records.filter((r) => r.week === currentWeek)
    const lastWeekRecords = records.filter((r) => r.week === currentWeek - 1)
    if (thisWeekRecords.length > 0) {
      const startWeight = lastWeekRecords.length > 0
        ? lastWeekRecords[lastWeekRecords.length - 1].weight
        : profile.preWeight
      weeklyGain = Number((thisWeekRecords[thisWeekRecords.length - 1].weight - startWeight).toFixed(2))
    }
  }

  return {
    currentWeek,
    currentWeekDay,
    latestWeight,
    weeklyGain,
    gainStatus: pregnancyStore.gainStatus
  }
}

/**
 * 更新服务卡片数据
 * 鸿蒙端调用 UTS 模块刷新负一屏卡片，其他端为空操作
 */
export function updateWidgetData(): void {
  // #ifdef APP-HARMONY
  try {
    // eslint-disable-next-line no-eval
    const dynamicRequire = new Function('p', 'return require(p)') as (p: string) => any
    const widgetModule = dynamicRequire('@/uni_modules/mamatrack-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed, week:', data.currentWeek)
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateWidgetData error:', e)
  }
  // #endif
}

/**
 * 获取卡片展示数据
 */
export function getWidgetDisplayData(): WidgetDisplayData {
  return buildWidgetData()
}
