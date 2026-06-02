/**
 * CampReady 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 清单数据变更后
 * - 装备准备进度更新后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

/**
 * 更新清单卡片数据
 */
export function updateChecklistWidget(data: {
  checklistName: string
  campingDate: string
  progress: number
}): void {
  try {
    const widgetModule = require('@/uni_modules/campready-widget/utssdk/app-harmony/index.uts')
    if (widgetModule && typeof widgetModule.updateChecklistWidget === 'function') {
      widgetModule.updateChecklistWidget(data)
      console.log('[widget service] checklist widget refreshed:', data.checklistName, data.progress)
    } else {
      console.warn('[widget service] updateChecklistWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateChecklistWidget error:', e)
  }
}

/**
 * 更新装备统计卡片数据
 */
export function updateGearWidget(data: {
  totalGears: number
  totalWeight: number
}): void {
  try {
    const widgetModule = require('@/uni_modules/campready-widget/utssdk/app-harmony/index.uts')
    if (widgetModule && typeof widgetModule.updateGearWidget === 'function') {
      widgetModule.updateGearWidget(data)
      console.log('[widget service] gear widget refreshed:', data.totalGears)
    } else {
      console.warn('[widget service] updateGearWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateGearWidget error:', e)
  }
}

/**
 * 初始化服务卡片
 */
export function initWidget(): void {
  try {
    const widgetModule = require('@/uni_modules/campready-widget/utssdk/app-harmony/index.uts')
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
export function updateChecklistWidget(_data: {
  checklistName: string
  campingDate: string
  progress: number
}): void {
  // 非鸿蒙端无操作
}

export function updateGearWidget(_data: {
  totalGears: number
  totalWeight: number
}): void {
  // 非鸿蒙端无操作
}

export function initWidget(): void {
  // 非鸿蒙端无操作
}

// #endif
