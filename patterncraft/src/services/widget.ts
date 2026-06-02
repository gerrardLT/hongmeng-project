/**
 * PatternCraft 服务卡片数据服务
 *
 * 负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用运行时平台检测确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 每日纹样更新后
 * - 创建/编辑作品后
 * - 收藏纹样后
 */

import { isHarmony } from '@/utils/platform'
import { getDailyPattern, getRecentPatterns } from '@/services/pattern'
import type { Pattern } from '@/types/models'

/** 卡片展示数据结构 */
interface WidgetData {
  dailyPatternName: string
  dailyPatternPreview: string
  recentPatterns: { name: string; previewUrl: string }[]
}

/**
 * 从本地存储组装最新的卡片展示数据
 * @returns 卡片数据
 */
export function buildWidgetData(): WidgetData {
  // 1. 获取每日纹样
  const daily = getDailyPattern()
  const dailyPatternName = daily?.name || '暂无推荐'
  const dailyPatternPreview = daily?.previewUrl || ''

  // 2. 获取最近使用的纹样（最多 3 个）
  const recents = getRecentPatterns(3)
  const recentPatterns = recents.map((p) => ({
    name: p.name,
    previewUrl: p.previewUrl
  }))

  return {
    dailyPatternName,
    dailyPatternPreview,
    recentPatterns
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
    dailyPatternName: '暂无推荐',
    dailyPatternPreview: '',
    recentPatterns: []
  }
}

/**
 * 更新服务卡片数据
 * @param data 卡片数据（可选，不传则自动构建）
 */
export function updateWidget(data?: WidgetData): void {
  if (!isHarmony()) return

  const widgetData = data || buildWidgetData()

  // #ifdef APP-HARMONY
  try {
    // 动态导入 UTS 插件，避免非鸿蒙端编译错误
    // @ts-ignore - require 用于动态加载 UTS 模块
    const widgetModule = require('@/uni_modules/pet-widget/utssdk/app-harmony/index.uts')

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(widgetData)
      console.log('[widget service] widget updated:', widgetData.dailyPatternName)
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateWidget error:', e)
  }
  // #endif
}

/**
 * 刷新服务卡片数据
 *
 * 在以下业务时机调用：
 * - 每日纹样更新后
 * - 创建/编辑作品后
 * - 收藏纹样变更后
 */
export function refreshWidget(): void {
  if (!isHarmony()) {
    // 非鸿蒙端无操作
    return
  }

  const data = buildWidgetData()
  updateWidget(data)
}
