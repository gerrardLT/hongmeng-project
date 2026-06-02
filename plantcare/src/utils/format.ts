/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化为相对时间（如"3天前"、"刚刚"）
 */
export function formatRelativeDate(date: Date | string | number): string {
  const now = Date.now()
  const target = new Date(date).getTime()
  const diff = now - target

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day

  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  if (diff < month) return `${Math.floor(diff / (7 * day))}周前`
  return formatDate(date)
}

/**
 * 格式化到期天数（如"还有2天"、"已过期1天"）
 */
export function formatDaysUntil(date: Date | string | number): string {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diff = target.getTime() - now.getTime()
  const days = Math.round(diff / (24 * 60 * 60 * 1000))

  if (days === 0) return '今天'
  if (days === 1) return '明天'
  if (days > 1) return `还有${days}天`
  if (days === -1) return '昨天'
  return `已过期${Math.abs(days)}天`
}

/**
 * 数量格式化（超过一定数量缩写）
 */
export function formatCount(n: number): string {
  if (n < 1000) return String(n)
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`
  return `${(n / 10000).toFixed(1)}w`
}
