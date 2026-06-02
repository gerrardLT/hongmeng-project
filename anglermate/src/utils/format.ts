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
 * 格式化温度
 * @param temp 温度值（摄氏度）
 */
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`
}

/**
 * 格式化气压
 * @param pressure 气压值（hPa）
 */
export function formatPressure(pressure: number): string {
  return `${Math.round(pressure)} hPa`
}

/**
 * 格式化距离
 * @param meters 距离（米）
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

/**
 * 格式化重量
 * @param kg 重量（千克）
 */
export function formatWeight(kg: number): string {
  if (kg < 1) {
    return `${Math.round(kg * 1000)} g`
  }
  return `${kg.toFixed(1)} kg`
}

/**
 * 格式化风速
 * @param speed 风速（m/s）
 */
export function formatWindSpeed(speed: number): string {
  return `${speed.toFixed(1)} m/s`
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
