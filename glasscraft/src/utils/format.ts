/**
 * 格式化价格
 * @param price 价格数值（单位：元）
 * @returns 格式化后的价格字符串，如 ¥128.00
 */
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`
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
 * 格式化人数
 * @param count 人数
 * @returns 格式化后的人数字符串，如 1人、2人
 */
export function formatPeopleCount(count: number): string {
  if (count <= 0) return '0人'
  return `${count}人`
}

/**
 * 格式化时长
 * @param minutes 时长（分钟）
 * @returns 格式化后的时长字符串，如 60分钟、1.5小时
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) {
    return `${hours}小时`
  }
  return `${hours}小时${mins}分钟`
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
