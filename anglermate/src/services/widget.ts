/**
 * AnglerMate 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 天气数据刷新后
 * - 钓点信息变更后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

/**
 * 更新天气卡片数据
 */
export function updateWeatherWidget(data: {
  fishingIndex: number
  temperature: number
  condition: string
}): void {
  try {
    const widgetModule = require('@/uni_modules/anglermate-widget/utssdk/app-harmony/index.uts')
    if (widgetModule && typeof widgetModule.updateWeatherWidget === 'function') {
      widgetModule.updateWeatherWidget(data)
      console.log('[widget service] weather widget refreshed:', data.fishingIndex, data.condition)
    } else {
      console.warn('[widget service] updateWeatherWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateWeatherWidget error:', e)
  }
}

/**
 * 更新钓点卡片数据
 */
export function updateSpotWidget(data: {
  spotName: string
  latitude: number
  longitude: number
}): void {
  try {
    const widgetModule = require('@/uni_modules/anglermate-widget/utssdk/app-harmony/index.uts')
    if (widgetModule && typeof widgetModule.updateSpotWidget === 'function') {
      widgetModule.updateSpotWidget(data)
      console.log('[widget service] spot widget refreshed:', data.spotName)
    } else {
      console.warn('[widget service] updateSpotWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateSpotWidget error:', e)
  }
}

/**
 * 初始化服务卡片
 */
export function initWidget(): void {
  try {
    const widgetModule = require('@/uni_modules/anglermate-widget/utssdk/app-harmony/index.uts')
    if (widgetModule && typeof widgetModule.initWidget === 'function') {
      widgetModule.initWidget()
      console.log('[widget service] widget initialized')
    } else {
      console.warn('[widget service] initWidget not available')
    }
  } catch (e) {
    console.error('[widget service] initWidget error:', e)
  }
}

// #endif

// ============================================
// 通用端空实现（避免编译错误）
// ============================================

// #ifndef APP-HARMONY

/**
 * 非鸿蒙端空实现
 */
export function updateWeatherWidget(_data: {
  fishingIndex: number
  temperature: number
  condition: string
}): void {
  // 非鸿蒙端无操作
}

export function updateSpotWidget(_data: {
  spotName: string
  latitude: number
  longitude: number
}): void {
  // 非鸿蒙端无操作
}

export function initWidget(): void {
  // 非鸿蒙端无操作
}

// #endif
