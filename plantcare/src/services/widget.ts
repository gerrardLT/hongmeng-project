/**
 * PlantCare 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 植物添加/删除后
 * - 养护完成后
 * - 提醒状态变更后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

import { dbGetAll } from '@/utils/db'
import type { Plant } from '@/types/models'
import { isWaterDueToday } from '@/utils/reminder'

interface WidgetData {
  todayNeedWater: number
  plantNames: string[]
  nextReminderTime: string
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  const plants = dbGetAll<Plant>('plants')

  // 1. 今日需浇水的植物
  const needWater = plants.filter((p) => isWaterDueToday(p))

  // 2. 需浇水植物名称列表（最多3个）
  const plantNames = needWater.slice(0, 3).map((p) => p.nickname)

  // 3. 最近的下次提醒时间
  const nextDates = plants
    .map((p) => p.nextWaterDate)
    .filter(Boolean)
    .sort()
  const nextReminderTime = nextDates.length > 0 ? nextDates[0] : ''

  return {
    todayNeedWater: needWater.length,
    plantNames,
    nextReminderTime
  }
}

/**
 * 刷新服务卡片数据
 */
export function refreshWidget(): void {
  try {
    const widgetModule = require('@/uni_modules/plantcare-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed:', data.todayNeedWater, 'plants need water')
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] refreshWidget error:', e)
  }
}

// #endif

// ============================================
// 通用端空实现（避免编译错误）
// ============================================

// #ifndef APP-HARMONY

/**
 * 非鸿蒙端空实现
 * 确保其他平台编译时不会报错
 */
export function refreshWidget(): void {
  // 非鸿蒙端无操作
}

// #endif
