/**
 * PetMemorial 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 创建/更新预约后
 * - 制作进度变化后
 * - 宠物纪念日临近时
 */

// ============================================
// 类型导入（仅在鸿蒙端有效）
// ============================================

// #ifdef APP-HARMONY
import type {
  BookingWidgetData,
  ProgressWidgetData,
  AnniversaryWidgetData
} from '@/uni_modules/petmemorial-widget/utssdk/app-harmony/index.uts'
// #endif

import { dbGetAll, dbQuery } from '@/utils/db'
import type { Booking, Progress, Anniversary } from '@/types/models'

/**
 * 获取当前用户 ID
 */
function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('petmemorial_auth') as { userId?: string } | undefined
  return userInfo?.userId || ''
}

/**
 * 获取预约提醒卡片数据
 * @returns 最近的一条预约卡片数据
 */
export function getBookingWidgetData(): BookingWidgetData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  const bookings = dbQuery<Booking>('bookings', (b) => b.userId === userId)
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const nearest = bookings[0]
  if (!nearest) return null

  const studios = dbGetAll<{ studioId: string; name: string }>('studios')
  const studio = studios.find((s) => (s as any).studioId === nearest.studioId)

  const memorials = dbGetAll<{ typeId: string; name: string }>('memorials')
  const memorial = memorials.find((m) => (m as any).typeId === nearest.typeId)

  const date = new Date(nearest.date)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return {
    studioName: (studio as any)?.name || '未知工作室',
    bookingTime: `${month}-${day} ${nearest.timeSlot}`,
    memorialType: (memorial as any)?.name || '定制纪念品'
  }
  // #endif

  // #ifndef APP-HARMONY
  return null
  // #endif
}

/**
 * 获取制作进度卡片数据
 * @returns 当前进行中的进度卡片数据
 */
export function getProgressWidgetData(): ProgressWidgetData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  const bookings = dbQuery<Booking>('bookings', (b) => b.userId === userId)
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => b.createdAt - a.createdAt)

  for (const booking of bookings) {
    const progresses = dbQuery<Progress>('progresses', (p) => p.bookingId === booking.bookingId)
      .sort((a, b) => a.updateTime - b.updateTime)

    if (progresses.length === 0) continue

    const currentProgress = progresses.find((p) => p.status === 'in-progress') || progresses[progresses.length - 1]

    const stageLabels: Record<string, string> = {
      collected: '采集中',
      'design-confirmed': '设计中',
      manufacturing: '制作中',
      'quality-check': '质检中',
      'ready-pickup': '待取件',
      shipped: '已发货'
    }

    const percentMap: Record<string, number> = {
      collected: 16,
      'design-confirmed': 33,
      manufacturing: 50,
      'quality-check': 66,
      'ready-pickup': 83,
      shipped: 100
    }

    const percent = percentMap[currentProgress.stage] || 0
    const completion = currentProgress.estimatedCompletionTime
      ? new Date(currentProgress.estimatedCompletionTime)
      : null

    return {
      currentStage: stageLabels[currentProgress.stage] || '制作中',
      progressPercent: percent,
      estimatedCompletion: completion
        ? `${(completion.getMonth() + 1).toString().padStart(2, '0')}-${completion.getDate().toString().padStart(2, '0')}`
        : '--'
    }
  }

  return null
  // #endif

  // #ifndef APP-HARMONY
  return null
  // #endif
}

/**
 * 获取纪念日提醒卡片数据
 * @returns 即将到来的纪念日卡片数据
 */
export function getAnniversaryWidgetData(): AnniversaryWidgetData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  const now = new Date()
  const anniversaries = dbQuery<Anniversary>('anniversaries', (a) => a.userId === userId && a.enabled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // 找到最近的纪念日
  const upcoming = anniversaries.find((a) => {
    const annDate = new Date(a.date)
    const thisYear = new Date(now.getFullYear(), annDate.getMonth(), annDate.getDate())
    return thisYear >= now
  })

  if (!upcoming) return null

  const pets = dbGetAll<{ petId: string; name: string }>('pets')
  const pet = pets.find((p) => (p as any).petId === upcoming.petId)

  const annDate = new Date(upcoming.date)
  const thisYearAnnDate = new Date(now.getFullYear(), annDate.getMonth(), annDate.getDate())
  const diffDays = Math.ceil((thisYearAnnDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

  const typeLabels: Record<string, string> = {
    birthday: '生日',
    'adopt-day': '领养纪念日',
    'memorial-day': '纪念 日',
    custom: '纪念日'
  }

  return {
    petName: (pet as any)?.name || '爱宠',
    anniversaryType: typeLabels[upcoming.type] || '纪念日',
    daysUntil: diffDays > 0 ? `${diffDays}天后` : '今天'
  }
  // #endif

  // #ifndef APP-HARMONY
  return null
  // #endif
}

/**
 * 刷新服务卡片数据
 * 在以下业务时机调用：
 * - 创建/更新预约后
 * - 制作进度变化后
 * - 宠物纪念日临近时
 */
export function refreshWidget(): void {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/petmemorial-widget/utssdk/app-harmony/index.uts')

    const bookingData = getBookingWidgetData()
    const progressData = getProgressWidgetData()
    const anniversaryData = getAnniversaryWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget({
        booking: bookingData,
        progress: progressData,
        anniversary: anniversaryData
      })
      console.log('[widget service] widget refreshed')
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] refreshWidget error:', e)
  }
  // #endif

  // #ifndef APP-HARMONY
  // 非鸿蒙端无操作
  // #endif
}

/**
 * 获取卡片展示数据（统一入口）
 * @returns 卡片展示数据
 */
export function getWidgetData(): {
  booking: BookingWidgetData | null
  progress: ProgressWidgetData | null
  anniversary: AnniversaryWidgetData | null
} {
  // #ifdef APP-HARMONY
  return {
    booking: getBookingWidgetData(),
    progress: getProgressWidgetData(),
    anniversary: getAnniversaryWidgetData()
  }
  // #endif

  // #ifndef APP-HARMONY
  return {
    booking: null,
    progress: null,
    anniversary: null
  }
  // #endif
}
