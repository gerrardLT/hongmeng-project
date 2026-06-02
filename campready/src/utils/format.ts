/**
 * 格式化日期
 * @param date 日期字符串或时间戳
 * @param format 格式模板，默认 'YYYY-MM-DD'
 */
export function formatDate(date: string | number | Date, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化重量（千克为单位输入）
 * @param kg 重量（千克）
 */
export function formatWeight(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`
  }
  return `${kg.toFixed(1)} kg`
}

/**
 * 格式化重量（克为单位输入）
 * @param gram 重量（克）
 * @param unit 显示单位偏好
 */
export function formatWeightGram(gram: number, unit: 'g' | 'kg' = 'g'): string {
  if (unit === 'kg') {
    return gram >= 1000 ? `${(gram / 1000).toFixed(1)} kg` : `${gram} g`
  }
  return gram >= 1000 ? `${(gram / 1000).toFixed(1)} kg` : `${gram} g`
}

/**
 * 获取星期几
 * @param date 日期字符串或时间戳
 */
export function getWeekday(date: string | number | Date): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return weekdays[d.getDay()]
}

/**
 * 获取相对时间描述
 * @param date 日期字符串或时间戳
 */
export function getRelativeTime(date: string | number | Date): string {
  const now = Date.now()
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const diff = now - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

/**
 * 获取距离目标日期的天数
 * @param dateStr 目标日期字符串
 */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 计算准备进度百分比
 * @param items 含 isChecked 的项目数组
 */
export function calcProgress(items: { isChecked: boolean }[]): number {
  if (!items.length) return 0
  const checked = items.filter(i => i.isChecked).length
  return Math.round((checked / items.length) * 100)
}
