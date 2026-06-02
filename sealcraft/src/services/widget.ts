/**
 * SealCraft 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 创建/更新预约后
 * - 制作进度变化后
 * - 印章知识推荐更新时
 */

// ============================================
// 类型导入（仅在鸿蒙端有效）
// ============================================

// #ifdef APP-HARMONY
import type {
  PickupReminderData,
  ProgressCardData,
  KnowledgeCardData
} from '@/uni_modules/sealcraft-widget/utssdk/app-harmony/index.uts'
// #endif

import { dbGetAll, dbQuery } from '@/utils/db'
import type { Booking, Progress, SealType, Material, FontStyle } from '@/types/models'

/**
 * 获取当前用户 ID
 */
function getCurrentUserId(): string {
  const userInfo = uni.getStorageSync('sealcraft_auth') as { userId?: string } | undefined
  return userInfo?.userId || ''
}

/**
 * 格式化日期为 MM-DD HH:mm 格式
 */
function formatDateTime(dateStr: string, timeSlot: string): string {
  try {
    const date = new Date(dateStr)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day} ${timeSlot}`
  } catch (e) {
    return '--'
  }
}

/**
 * 获取取件提醒卡片数据
 * @returns 最近的待取件订单卡片数据
 */
export function getPickupReminderData(): PickupReminderData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  // 查找状态为 ready-pickup 或 shipped 的订单
  const bookings = dbQuery<Booking>('bookings', (b) => b.userId === userId)
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => b.createdAt - a.createdAt)

  // 找到最近的待取件订单
  const targetBooking = bookings.find((b) => {
    const progresses = dbQuery<Progress>('progresses', (p) => p.bookingId === b.bookingId)
    return progresses.some((p) => p.stage === 'ready-pickup' && p.status === 'active')
  })

  if (!targetBooking) return null

  const studios = dbGetAll<{ studioId: string; name: string }>('studios')
  const studio = studios.find((s) => (s as any).studioId === targetBooking.studioId)

  const sealTypes = dbGetAll<SealType>('seal_types')
  const sealType = sealTypes.find((st) => st.typeId === targetBooking.sealTypeId)

  return {
    sealContent: targetBooking.content,
    studioName: (studio as any)?.name || '未知工作室',
    pickupDate: formatDateTime(targetBooking.date, targetBooking.timeSlot || '--'),
    status: targetBooking.deliveryType === 'pickup' ? '待取件' : '快递配送'
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
export function getProgressCardData(): ProgressCardData | null {
  // #ifdef APP-HARMONY
  const userId = getCurrentUserId()
  if (!userId) return null

  const bookings = dbQuery<Booking>('bookings', (b) => b.userId === userId)
    .filter((b) => b.status !== 'cancelled')
    .sort((a, b) => b.createdAt - a.createdAt)

  for (const booking of bookings) {
    const progresses = dbQuery<Progress>('progresses', (p) => p.bookingId === booking.bookingId)

    if (progresses.length === 0) continue

    // 找到当前活跃的进度
    const activeProgress = progresses.find((p) => p.status === 'active')
    if (!activeProgress) continue

    const stageLabels: Record<string, string> = {
      'design-confirmed': '设计确认',
      'material-prepared': '备料中',
      'carving': '刻制中',
      'polishing': '打磨中',
      'quality-check': '质检中',
      'ready-pickup': '待取件',
      'shipped': '已发货'
    }

    const percentMap: Record<string, number> = {
      'design-confirmed': 14,
      'material-prepared': 28,
      'carving': 43,
      'polishing': 57,
      'quality-check': 71,
      'ready-pickup': 85,
      'shipped': 100
    }

    const percent = percentMap[activeProgress.stage] || 0
    const completion = activeProgress.estimatedCompletionTime
      ? new Date(activeProgress.estimatedCompletionTime)
      : null

    return {
      sealContent: booking.content,
      currentStage: stageLabels[activeProgress.stage] || '制作中',
      progressPercent: percent,
      estimatedTime: completion
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
 * 获取每日印章知识推荐卡片数据
 * @returns 印章知识推荐卡片数据
 */
export function getKnowledgeCardData(): KnowledgeCardData | null {
  // #ifdef APP-HARMONY
  // Mock 每日知识推荐，按日期轮换
  const knowledgeItems = [
    {
      title: '篆书入印',
      summary: '篆书是篆刻最正统的字体，"以篆入印"传统延续两千余年。秦小篆笔画匀称，结体修长，最适合姓名章和收藏章。',
      category: '字体知识'
    },
    {
      title: '寿山石鉴赏',
      summary: '寿山石产自福建福州，以田黄为最贵。石质温润细腻，受刀爽利，是篆刻首选石料，位列四大名石之首。',
      category: '材质知识'
    },
    {
      title: '闲章之美',
      summary: '闲章不拘于姓名，而以表达志趣为旨。"淡泊明志""厚德载物"等常用内容，方寸之间尽显主人情怀。',
      category: '印章类型'
    },
    {
      title: '印泥讲究',
      summary: '朱砂印泥以艾绒、朱砂、蓖麻油调制，色泽沉稳浓郁。好的印泥"冬不凝固，夏不渗油"，盖印效果清晰饱满。',
      category: '使用知识'
    },
    {
      title: '藏书章溯源',
      summary: '藏书章始于宋代，盛于明清。"某某藏书""某某珍藏"钤于扉页，既是归属标识，也是文化传承的见证。',
      category: '印章类型'
    },
    {
      title: '青田石特色',
      summary: '青田石产自浙江青田，刀感脆爽利落。封门青色淡雅如玉，灯光冻晶莹透亮，为篆刻界四大名石之一。',
      category: '材质知识'
    },
    {
      title: '姓名章礼仪',
      summary: '姓名章自古为身份标识，书画落款、信函签署不可或缺。刻制时讲究"白文朱文"之分，白文端庄，朱文秀丽。',
      category: '使用知识'
    }
  ]

  // 按星期几轮换内容
  const dayIndex = new Date().getDay() % knowledgeItems.length
  const item = knowledgeItems[dayIndex]

  return {
    title: item.title,
    content: item.summary,
    category: item.category
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
 * - 印章知识推荐更新时
 */
export function refreshWidget(): void {
  // #ifdef APP-HARMONY
  try {
    const widgetModule = require('@/uni_modules/sealcraft-widget/utssdk/app-harmony/index.uts')

    const pickupData = getPickupReminderData()
    const progressData = getProgressCardData()
    const knowledgeData = getKnowledgeCardData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget({
        pickup: pickupData,
        progress: progressData,
        knowledge: knowledgeData
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
  pickup: PickupReminderData | null
  progress: ProgressCardData | null
  knowledge: KnowledgeCardData | null
} {
  // #ifdef APP-HARMONY
  return {
    pickup: getPickupReminderData(),
    progress: getProgressCardData(),
    knowledge: getKnowledgeCardData()
  }
  // #endif

  // #ifndef APP-HARMONY
  return {
    pickup: null,
    progress: null,
    knowledge: null
  }
  // #endif
}
