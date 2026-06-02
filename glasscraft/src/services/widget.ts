/**
 * GlassCraft 鸿蒙服务卡片服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 创建/更新预约后
 * - 上传/更新作品后
 */

// #ifdef APP-HARMONY
import type {
  BookingWidgetData,
  ArtworkWidgetData
} from '@/uni_modules/glasscraft-widget/utssdk/app-harmony/index.uts'
// #endif

import type { Booking, Artwork } from '@/types/models'

/**
 * 更新预约提醒卡片
 * @param booking 预约数据
 */
export async function updateBookingWidget(booking: Booking): Promise<void> {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/glasscraft-widget/utssdk/app-harmony/index.uts')

    const date = new Date(booking.date)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const data: BookingWidgetData = {
      studioName: booking.studioName || '未命名工作室',
      bookingTime: `${month}-${day} ${booking.timeSlot}`,
      projectName: booking.projectName || '未选择项目'
    }

    if (widgetModule && typeof widgetModule.updateBookingWidget === 'function') {
      widgetModule.updateBookingWidget(data)
      console.log('[widget service] booking widget updated')
    } else {
      console.warn('[widget service] updateBookingWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateBookingWidget error:', e)
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端无操作
  // #endif
}

/**
 * 更新作品展示卡片
 * @param artwork 作品数据
 */
export async function updateArtworkWidget(artwork: Artwork): Promise<void> {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/glasscraft-widget/utssdk/app-harmony/index.uts')

    const date = new Date(artwork.createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const data: ArtworkWidgetData = {
      artworkPhoto: artwork.photos[0] || '',
      studioName: artwork.studioName || '未关联工作室',
      createdDate: `${year}-${month}-${day}`
    }

    if (widgetModule && typeof widgetModule.updateArtworkWidget === 'function') {
      widgetModule.updateArtworkWidget(data)
      console.log('[widget service] artwork widget updated')
    } else {
      console.warn('[widget service] updateArtworkWidget not available')
    }
  } catch (e) {
    console.error('[widget service] updateArtworkWidget error:', e)
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端无操作
  // #endif
}

/**
 * 清除卡片数据
 */
export async function clearWidget(): Promise<void> {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/glasscraft-widget/utssdk/app-harmony/index.uts')

    if (widgetModule && typeof widgetModule.onWidgetDestroy === 'function') {
      widgetModule.onWidgetDestroy()
      console.log('[widget service] widget cleared')
    }
  } catch (e) {
    console.error('[widget service] clearWidget error:', e)
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端无操作
  // #endif
}
