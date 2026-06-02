import type { BookingStatus, ProgressStage } from '@/types/models'

/**
 * 格式化价格
 * @param price 价格数值（单位：元）
 * @returns 格式化后的价格字符串，如 ¥128.00
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
}

/**
 * 格式化距离
 * @param meters 距离（单位：米）
 * @returns 格式化后的距离字符串，如 800m 或 1.5km
 */
export function formatDistance(meters: number): string {
  if (meters < 0) return '0m'
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * 格式化评分
 * @param rating 评分数值（0-5）
 * @returns 格式化后的评分字符串，如 4.8
 */
export function formatRating(rating: number): string {
  if (rating < 0) return '0.0'
  if (rating > 5) return '5.0'
  return rating.toFixed(1)
}

/**
 * 手机号脱敏
 * @param phone 手机号码
 * @returns 脱敏后的手机号，如 138****5678
 */
export function formatPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-4)
}

// 预约状态文本映射
const BOOKING_STATUS_MAP: Record<BookingStatus, string> = {
  'pending': '待确认',
  'confirmed': '已确认',
  'in-progress': '制作中',
  'completed': '已完成',
  'cancelled': '已取消'
}

// 预约状态颜色映射
const BOOKING_STATUS_COLOR_MAP: Record<BookingStatus, string> = {
  'pending': '#FF9800',
  'confirmed': '#2196F3',
  'in-progress': '#9C27B0',
  'completed': '#4CAF50',
  'cancelled': '#9E9E9E'
}

/**
 * 获取预约状态文本
 * @param status 预约状态
 * @returns 状态文本
 */
export function formatBookingStatus(status: BookingStatus): string {
  return BOOKING_STATUS_MAP[status] ?? status
}

/**
 * 获取预约状态颜色
 * @param status 预约状态
 * @returns 颜色值
 */
export function getBookingStatusColor(status: BookingStatus): string {
  return BOOKING_STATUS_COLOR_MAP[status] ?? '#9E9E9E'
}

// 制作进度阶段文本映射
const PROGRESS_STAGE_MAP: Record<ProgressStage, string> = {
  'design-confirmed': '设计确认',
  'material-prepared': '选材准备',
  'carving': '刻制中',
  'polishing': '打磨修整',
  'quality-check': '质检完成',
  'ready-pickup': '待取件',
  'shipped': '已发货'
}

// 制作进度阶段顺序
export const PROGRESS_STAGE_ORDER: ProgressStage[] = [
  'design-confirmed',
  'material-prepared',
  'carving',
  'polishing',
  'quality-check',
  'ready-pickup',
  'shipped'
]

/**
 * 获取进度阶段文本
 * @param stage 进度阶段
 * @returns 阶段文本
 */
export function formatProgressStage(stage: ProgressStage): string {
  return PROGRESS_STAGE_MAP[stage] ?? stage
}

/**
 * 获取进度阶段索引（0-based）
 * @param stage 进度阶段
 * @returns 阶段索引
 */
export function getProgressStageIndex(stage: ProgressStage): number {
  return PROGRESS_STAGE_ORDER.indexOf(stage)
}

/**
 * 计算进度百分比
 * @param stage 当前进度阶段
 * @returns 进度百分比（0-100）
 */
export function getProgressPercent(stage: ProgressStage): number {
  const index = getProgressStageIndex(stage)
  if (index < 0) return 0
  return Math.round(((index + 1) / PROGRESS_STAGE_ORDER.length) * 100)
}
