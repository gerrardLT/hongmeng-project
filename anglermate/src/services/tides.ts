import type { TideData, MoonPhase } from '@/types/models'
import { QWEATHER_CONFIG } from '@/utils/config'
import { getQWeatherToken } from '@/utils/jwt'

/** 获取和风天气 JWT 认证请求头 */
function getAuthHeader(): Record<string, string> {
  const token = getQWeatherToken(
    QWEATHER_CONFIG.CREDENTIAL_ID,
    QWEATHER_CONFIG.PROJECT_ID,
    QWEATHER_CONFIG.PRIVATE_KEY
  )
  return { 'Authorization': `Bearer ${token}` }
}

/**
 * 和风天气海洋/天文 API 请求封装
 * 潮汐接口文档：https://dev.qweather.com/docs/api/ocean/tide/
 * 月相接口文档：https://dev.qweather.com/docs/api/astronomy/moon/
 * location 参数格式为「经度,纬度」（如 116.41,39.92）
 * 使用 JWT Bearer Token 认证
 */
function qweatherGet<T = any>(path: string, params: Record<string, any> = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${QWEATHER_CONFIG.BASE_URL}${path}`,
      method: 'GET',
      data: params,
      header: getAuthHeader(),
      success: (res) => {
        const data = res.data as any
        if (data && data.code === '200') {
          resolve(data as T)
        } else {
          reject(new Error(`和风天气请求失败: code=${data?.code}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '和风天气网络请求失败'))
      }
    })
  })
}

/** 构建和风天气 location 参数（经度,纬度） */
function buildLocation(lat: number, lng: number): string {
  return `${lng},${lat}`
}

/**
 * 获取潮汐数据
 * 接口：/ocean/tide
 */
export async function getTideData(lat: number, lng: number, date?: string): Promise<TideData> {
  const params: Record<string, any> = { location: buildLocation(lat, lng) }
  if (date) params.date = date
  return qweatherGet<TideData>('/ocean/tide', params)
}

/**
 * 获取潮汐预报（未来多日）
 * 接口：/ocean/tide，通过传入不同 date 参数获取多日数据
 */
export async function getTideForecast(lat: number, lng: number): Promise<TideData[]> {
  const location = buildLocation(lat, lng)
  const dates: string[] = []
  const now = new Date()
  for (let i = 0; i < 3; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''))
  }
  const results = await Promise.all(
    dates.map(date => qweatherGet<TideData>('/ocean/tide', { location, date }))
  )
  return results
}

/**
 * 获取月相信息
 * 接口：/astronomy/moon
 */
export async function getMoonPhase(date?: string): Promise<MoonPhase> {
  const params: Record<string, any> = {}
  // 月相接口需要 location 参数，默认使用北京
  params.location = '116.41,39.92'
  if (date) params.date = date
  return qweatherGet<MoonPhase>('/astronomy/moon', params)
}

/**
 * 获取指定月份的月相列表
 * 通过遍历每天调用 /astronomy/moon 获取整月数据
 */
export async function getMonthMoonPhases(year: number, month: number): Promise<MoonPhase[]> {
  const daysInMonth = new Date(year, month, 0).getDate()
  const dates: string[] = []
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}${String(month).padStart(2, '0')}${String(d).padStart(2, '0')}`
    dates.push(dateStr)
  }
  // 每隔7天采样一次，减少请求次数
  const sampledDates = dates.filter((_, i) => i % 7 === 0)
  const results = await Promise.all(
    sampledDates.map(date => qweatherGet<MoonPhase>('/astronomy/moon', {
      location: '116.41,39.92',
      date
    }))
  )
  return results
}
