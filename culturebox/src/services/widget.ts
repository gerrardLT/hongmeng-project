/**
 * CultureBox 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用运行时平台检测确保非鸿蒙端不会引入 UTS 相关依赖。
 */

import { dbGetAll } from '@/utils/db'
import { isHarmony } from '@/utils/platform'
import type { Entry } from '@/types/models'

interface WidgetData {
  monthCount: number
  recentBooks: { title: string; subtitle: string }[]
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  const entries = dbGetAll<Entry>('entries')
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthCount = entries.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth
  }).length

  const recentBooks = entries
    .filter((e) => e.type === 'book')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)
    .map((e) => ({
      title: e.title,
      subtitle: e.subtitle
    }))

  return {
    monthCount,
    recentBooks
  }
}

/**
 * 获取服务卡片数据
 * @returns 当前卡片展示数据
 */
export function getWidgetData(): WidgetData {
  if (isHarmony()) {
    return buildWidgetData()
  }
  return {
    monthCount: 0,
    recentBooks: []
  }
}

// #ifdef APP-HARMONY
/**
 * 更新服务卡片数据
 * @param data 卡片数据
 */
export function updateWidget(data: WidgetData): void {
  if (!isHarmony()) return

  try {
    // @ts-ignore - require 用于动态加载 UTS 模块
    const widgetModule = require('@/uni_modules/culturebox-widget/utssdk/app-harmony/index.uts')

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget updated:', data.monthCount, data.recentBooks.length)
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateWidget error:', e)
  }
}
// #endif

// #ifndef APP-HARMONY
/**
 * 非鸿蒙端：更新服务卡片数据（空实现）
 */
export function updateWidget(data: WidgetData): void {
  // 非鸿蒙端无操作
}
// #endif
