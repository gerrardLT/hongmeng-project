/**
 * ColorAid 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用运行时平台检测确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 颜色识别后
 * - 滤镜模式切换后
 * - 设置变更后
 */

import { dbGetAll } from '@/utils/db'
import { isHarmony } from '@/utils/platform'
import type { ColorHistory } from '@/types/models'

interface WidgetData {
  filterMode: string
  filterStrength: number
  recentColors: { hex: string; name: string }[]
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  // 1. 获取当前滤镜设置
  const settings = uni.getStorageSync('coloraid_settings') as
    | { filterMode?: string | null; filterStrength?: number }
    | undefined

  const filterMode = settings?.filterMode || '未开启'
  const filterStrength = settings?.filterStrength || 5

  // 2. 获取最近 3 个识别颜色
  const histories = dbGetAll<ColorHistory>('color_histories')
  const recentColors = histories
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3)
    .map((h) => ({
      hex: h.color.hex,
      name: h.color.name || '未知颜色'
    }))

  return {
    filterMode,
    filterStrength,
    recentColors
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
    filterMode: '未开启',
    filterStrength: 5,
    recentColors: []
  }
}

/**
 * 刷新服务卡片数据
 *
 * 在以下业务时机调用：
 * - 颜色识别完成后
 * - 切换滤镜模式后
 * - 修改设置后
 */
export function refreshWidget(): void {
  if (!isHarmony()) {
    // 非鸿蒙端无操作
    return
  }

  try {
    // 动态导入 UTS 插件，避免非鸿蒙端编译错误
    // @ts-ignore - require 用于动态加载 UTS 模块
    const widgetModule = require('@/uni_modules/coloraid-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed:', data.filterMode, data.recentColors.length)
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] refreshWidget error:', e)
  }
}
