/**
 * 格式化日期
 * @param timestamp 时间戳（毫秒）或日期字符串
 * @param format 格式模板，默认 'YYYY-MM-DD'，支持 YYYY、MM、DD、HH、mm、ss
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number | string, format: string = 'YYYY-MM-DD'): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp.replace(/-/g, '/')) : new Date(timestamp)
  const year = date.getFullYear().toString()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时间
 * @param timestamp 时间戳（毫秒）或日期字符串
 * @returns 格式化后的时间字符串，如 14:30
 */
export function formatTime(timestamp: number | string): string {
  return formatDate(timestamp, 'HH:mm')
}

/**
 * 格式化日期时间
 * @param timestamp 时间戳（毫秒）或日期字符串
 * @returns 格式化后的日期时间字符串，如 2024-01-15 14:30
 */
export function formatDateTime(timestamp: number | string): string {
  return formatDate(timestamp, 'YYYY-MM-DD HH:mm')
}

/**
 * 格式化相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串，如 刚刚、5分钟前、3小时前、昨天、2024-01-15
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return '刚刚'
  }
  if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  }
  if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  }
  if (diff < 2 * day) {
    return '昨天'
  }

  return formatDate(timestamp)
}

/**
 * 判断时间戳是否为今天
 * @param timestamp 时间戳（毫秒）
 * @returns 是否为今天
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
}

/**
 * 判断日期是否在未来
 * @param dateStr 日期字符串，如 '2024-12-25'
 * @returns 是否在未来
 */
export function isFuture(dateStr: string): boolean {
  const target = new Date(dateStr.replace(/-/g, '/'))
  const now = new Date()
  // 清除时分秒
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return target.getTime() > now.getTime()
}
