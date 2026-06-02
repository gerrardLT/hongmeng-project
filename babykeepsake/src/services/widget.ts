/**
 * BabyKeepsake 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 创建/更新预约后
 * - 制作进度变化后
 * - 添加里程碑后
 */

// ============================================
// 类型导入（仅在鸿蒙端有效）
// ============================================

// #ifdef APP-HARMONY
import type {
  BookingWidgetData,
  ProgressWidgetData,
  MilestoneWidgetData
} from '@/uni_modules/babykeepsake-widget/utssdk/app-harmony/index.uts'
// #endif

import { dbGetAll, dbQuery } from '@/utils/db'
import type { Booking, Progress, Milestone } from '@/types/models'

/**
 * 获取当前用户 ID
 */
function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('babykeepsake_auth') as { userId?: string } | undefined
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
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())

  const nearest = bookings[0]
  if (!nearest) return null

  const studios = dbGetAll<{ studioId: string; name: string }>('studios')
  const studio = studios.find((s) => (s as any).studioId === nearest.studioId)

  const keepsakes = dbGetAll<{ typeId: string; name: string }>('keepsakes')
  const keepsake = keepsakes.find((k) => (k as any).typeId === nearest.typeId)

  const date = new Date(nearest.appointmentDate)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return {
    studioName: (studio as any)?.name || '未知工作室',
    bookingTime: `${month}-${day} ${nearest.appointmentTime}`,
    keepsakeType: (keepsake as any)?.name || '定制纪念品'
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
      'ready-pickup': '已完成',
      shipped: '已发货'
    }

    const percentMap: Record<string, number> = {
      collected: 20,
      'design-confirmed': 40,
      manufacturing: 60,
      'quality-check': 80,
      'ready-pickup': 95,
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
 * 获取里程碑提醒卡片数据
 * @returns 即将到来的里程碑卡片数据
 */
export function getMilestoneWidgetData(): MilestoneWidgetData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  const milestones = dbQuery<Milestone>('milestones', (m) => m.userId === userId)
    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())

  const latest = milestones[milestones.length - 1]
  if (!latest) return null

  const now = new Date()
  const recordDate = new Date(latest.recordDate)
  const diffMonths = (now.getFullYear() - recordDate.getFullYear()) * 12 + (now.getMonth() - recordDate.getMonth())
  const babyAge = diffMonths > 0 ? `${diffMonths}个月` : '新生儿'

  const nextCollect = new Date(now)
  nextCollect.setMonth(nextCollect.getMonth() + 3)
  const nextMonth = (nextCollect.getMonth() + 1).toString().padStart(2, '0')
  const nextDay = nextCollect.getDate().toString().padStart(2, '0')

  const milestoneLabels: Record<string, string> = {
    first_handprint: '手印纪念',
    first_hair_cut: '胎毛收藏',
    first_tooth: '乳牙收藏',
    birthday: '生日纪念'
  }

  return {
    milestoneName: milestoneLabels[latest.type] || '成长纪念',
    babyAge,
    nextCollectTime: `${nextMonth}-${nextDay}`
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
 * - 添加里程碑后
 */
export function refreshWidget(): void {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/babykeepsake-widget/utssdk/app-harmony/index.uts')

    const bookingData = getBookingWidgetData()
    const progressData = getProgressWidgetData()
    const milestoneData = getMilestoneWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget({
        booking: bookingData,
        progress: progressData,
        milestone: milestoneData
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
