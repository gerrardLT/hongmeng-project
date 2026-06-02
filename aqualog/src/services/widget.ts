/**
 * AquaLog 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 参数记录添加后
 * - 预警状态变更后
 * - 维护日志添加后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

import { dbGetAll } from '@/utils/db'
import type { Aquarium, AlertItem } from '@/types/models'

interface WidgetData {
  currentAquariumName: string
  currentStatus: string
  todayAlerts: number
  pendingTasks: number
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  const aquariums = dbGetAll<Aquarium>('aquariums')

  // 1. 当前水族箱状态
  const current = aquariums.length > 0 ? aquariums[0] : null
  const currentAquariumName = current?.name || '未添加水族箱'
  const statusMap = { normal: '正常', warning: '警告', danger: '危险' }
  const currentStatus = current ? statusMap[current.status] || '正常' : '--'

  // 2. 今日预警数
  const alertsKey = 'aqualog_alerts'
  let todayAlerts = 0
  try {
    const alerts = uni.getStorageSync(alertsKey) as AlertItem[] | undefined
    if (alerts && Array.isArray(alerts)) {
      todayAlerts = alerts.filter((a) => !a.dismissed).length
    }
  } catch (e) {
    // ignore
  }

  // 3. 待处理任务数（未消除预警 + 状态异常的水族箱数）
  const abnormalCount = aquariums.filter((a) => a.status !== 'normal').length
  const pendingTasks = todayAlerts + abnormalCount

  return {
    currentAquariumName,
    currentStatus,
    todayAlerts,
    pendingTasks
  }
}

/**
 * 刷新服务卡片数据
 */
export function refreshWidget(): void {
  try {
    const widgetModule = require('@/uni_modules/aqualog-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed:', data.currentAquariumName, 'alerts:', data.todayAlerts)
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
