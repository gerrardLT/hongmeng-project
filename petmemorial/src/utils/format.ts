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

/**
 * 格式化宠物品种名称
 * @param breed 品种字符串
 * @returns 首字母大写的品种名
 */
export function formatBreed(breed: string): string {
  if (!breed) return ''
  return breed.charAt(0).toUpperCase() + breed.slice(1)
}
