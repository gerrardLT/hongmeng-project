/**
 * 格式化日期
 * @param timestamp 时间戳（毫秒）
 * @param format 格式模板，默认 'yyyy-MM-dd'
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number, format = 'yyyy-MM-dd'): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('yyyy', String(year))
    .replace('MM', month)
    .replace('dd', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化为相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间描述（刚刚/x分钟前/x小时前/x天前）
 */
export function formatRelativeTime(timestamp: number): string {
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
  if (diff < 30 * day) {
    return `${Math.floor(diff / day)}天前`
  }

  return formatDate(timestamp)
}

/**
 * 数字格式化
 * @param num 数字
 * @returns 格式化后的字符串（超1000显示1k+等）
 */
export function formatNumber(num: number): string {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w+`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`
  }
  return String(num)
}

/**
 * 截断文本
 * @param str 原始字符串
 * @param maxLen 最大长度
 * @returns 截断后的字符串
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
