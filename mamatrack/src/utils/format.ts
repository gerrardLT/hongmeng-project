/**
 * 格式化工具
 */

/**
 * 日期格式化
 * @param date 日期字符串或时间戳
 * @param pattern 格式模板，默认为 'YYYY-MM-DD'
 */
export function formatDate(date: string | number, pattern: string = 'YYYY-MM-DD'): string {
  try {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')

    return pattern
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hour)
      .replace('mm', minute)
  } catch (e) {
    console.error('formatDate error:', e)
    return String(date)
  }
}

/**
 * 体重格式化（保留1位小数 + kg）
 */
export function formatWeight(weight: number): string {
  try {
    return `${weight.toFixed(1)} kg`
  } catch (e) {
    console.error('formatWeight error:', e)
    return `${weight} kg`
  }
}

/**
 * 孕周格式化
 * @param week 孕周
 * @param day 孕周+天数，可选
 */
export function formatWeek(week: number, day?: number): string {
  try {
    if (day !== undefined && day > 0) {
      return `第${week}周+${day}天`
    }
    return `第${week}周`
  } catch (e) {
    console.error('formatWeek error:', e)
    return `第${week}周`
  }
}

/**
 * 增重格式化（带正负号）
 */
export function formatGain(gain: number): string {
  try {
    const sign = gain > 0 ? '+' : ''
    return `${sign}${gain.toFixed(1)} kg`
  } catch (e) {
    console.error('formatGain error:', e)
    return `${gain} kg`
  }
}

/**
 * BMI 格式化
 */
export function formatBMI(bmi: number): string {
  try {
    return bmi.toFixed(1)
  } catch (e) {
    console.error('formatBMI error:', e)
    return String(bmi)
  }
}

/**
 * 计算距目标日期的天数
 * @param targetDate 目标日期 YYYY-MM-DD
 * @returns 天数差（正数表示未来，负数表示已过去）
 */
export function formatDaysUntil(targetDate: string): number {
  try {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(targetDate)
    target.setHours(0, 0, 0, 0)

    const diff = target.getTime() - now.getTime()
    return Math.round(diff / (24 * 60 * 60 * 1000))
  } catch (e) {
    console.error('formatDaysUntil error:', e)
    return 0
  }
}
