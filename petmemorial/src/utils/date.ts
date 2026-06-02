/**
 * 格式化日期
 * @param timestamp 时间戳（毫秒）
 * @param format 格式模板，默认 'YYYY-MM-DD'，支持 YYYY、MM、DD、HH、mm、ss
 * @returns 格式化后的日期字符串
 */
export function formatDate(timestamp: number, format: string = 'YYYY-MM-DD'): string {
  const date = new Date(timestamp)
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
 * 格式化相对时间
 * @param timestamp 时间戳（毫秒）
 * @returns 相对时间字符串，如 刚刚、5分钟前、3小时前、昨天、2024-01-15
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
  if (diff < 2 * day) {
    return '昨天'
  }

  return formatDate(timestamp)
}

/**
 * 根据日期计算宠物年龄
 * @param date 日期字符串，如 '2020-06-15'
 * @returns 年龄字符串，如 4岁3月
 */
export function getPetAge(date: string): string {
  const birth = new Date(date)
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  if (years <= 0) {
    return `${months}月`
  }
  return `${years}岁${months}月`
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
 * 计算距离某日还有几天
 * @param dateStr 日期字符串，如 '2024-12-25'
 * @returns 距离天数（负数表示已过去）
 */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  // 清除时分秒
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (24 * 60 * 60 * 1000))
}

/**
 * 获取即将到来的纪念日列表
 * @param anniversaries 纪念日数组，每项包含 date 字段
 * @param daysAhead 提前天数，默认 30
 * @returns 即将到来的纪念日数组
 */
export function getUpcomingAnniversaries<T extends { date: string }>(
  anniversaries: T[],
  daysAhead: number = 30
): T[] {
  return anniversaries.filter((item) => {
    const days = getDaysUntil(item.date)
    return days >= 0 && days <= daysAhead
  }).sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
}

/**
 * 格式化日期范围
 * @param startDate 开始日期字符串
 * @param endDate 结束日期字符串
 * @returns 格式化后的范围字符串，如 2024.01.01 - 2024.02.01
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = startDate.replace(/-/g, '.')
  const end = endDate.replace(/-/g, '.')
  return `${start} - ${end}`
}
