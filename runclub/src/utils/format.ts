/**
 * 格式化日期 YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化时间 HH:MM
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化日期时间 YYYY-MM-DD HH:MM
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

/**
 * 格式化配速 X'XX"/km
 */
export function formatPace(pace: string): string {
  if (!pace) return '--'
  const parts = pace.split(':')
  if (parts.length === 2) {
    return `${parts[0]}'${parts[1]}"/km`
  }
  return `${pace}/km`
}

/**
 * 格式化距离 X.X km
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  }
  return `${km.toFixed(1)} km`
}

/**
 * 格式化时长 HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * 格式化相对时间
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
  if (diff < 30 * day) {
    return `${Math.floor(diff / day)}天前`
  }

  return formatDate(timestamp)
}

/**
 * 格式化完成时间
 */
export function formatFinishTime(time: string): string {
  if (!time) return '--'
  const parts = time.split(':')
  if (parts.length === 3) {
    const h = parseInt(parts[0])
    const m = parts[1]
    const s = parts[2]
    if (h > 0) {
      return `${h}小时${m}分${s}秒`
    }
    return `${parseInt(m)}分${s}秒`
  }
  return time
}
