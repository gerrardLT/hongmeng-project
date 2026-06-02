import type { WeatherData, HourlyWeather, DailyWeather, WeatherAlert, WeatherCondition } from '@/types/models'
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
 * 和风天气 API 请求封装
 * 文档：https://dev.qweather.com/docs/api/
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
 * 获取当前天气
 * 接口：/weather/now
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const location = buildLocation(lat, lng)
  return qweatherGet<WeatherData>('/weather/now', { location })
}

/**
 * 获取24小时逐小时天气预报
 * 接口：/weather/24h
 */
export async function getHourlyForecast(lat: number, lng: number): Promise<HourlyWeather[]> {
  const location = buildLocation(lat, lng)
  return qweatherGet<HourlyWeather[]>('/weather/24h', { location })
}

/**
 * 获取7天天气预报
 * 接口：/weather/7d
 */
export async function getDailyForecast(lat: number, lng: number): Promise<DailyWeather[]> {
  const location = buildLocation(lat, lng)
  return qweatherGet<DailyWeather[]>('/weather/7d', { location })
}

/**
 * 获取天气预警
 * 接口：/warning/now
 */
export async function getWeatherAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
  const location = buildLocation(lat, lng)
  return qweatherGet<WeatherAlert[]>('/warning/now', { location })
}

/**
 * 计算钓鱼指数
 *
 * 权重分配：气压 40% + 温度 20% + 湿度 15% + 风速 15% + 天气 10%
 * 最终映射到 1-5 星
 */
export function calculateFishingIndex(weather: WeatherData): { index: number; desc: string } {
  // 气压评分（0-100）：1000-1030hPa 最佳
  const pressureScore = calculatePressureScore(weather.pressure)

  // 温度评分（0-100）：15-28°C 最佳
  const tempScore = calculateTemperatureScore(weather.temperature)

  // 湿度评分（0-100）：40-80% 最佳
  const humidityScore = calculateHumidityScore(weather.humidity)

  // 风速评分（0-100）：0-15km/h 最佳
  const windScore = calculateWindScore(weather.windSpeed)

  // 天气状况评分（0-100）
  const conditionScore = calculateConditionScore(weather.condition)

  // 加权总分
  const totalScore =
    pressureScore * 0.4 +
    tempScore * 0.2 +
    humidityScore * 0.15 +
    windScore * 0.15 +
    conditionScore * 0.1

  // 映射到 1-5 星
  const index = Math.max(1, Math.min(5, Math.round(totalScore / 20)))

  const descMap: Record<number, string> = {
    1: '不宜钓鱼',
    2: '一般',
    3: '适合钓鱼',
    4: '非常适合',
    5: '绝佳时机'
  }

  return { index, desc: descMap[index] || '一般' }
}

/** 气压评分：1000-1030hPa 最佳 */
function calculatePressureScore(pressure: number): number {
  if (pressure >= 1005 && pressure <= 1025) return 100
  if (pressure >= 1000 && pressure <= 1030) return 80
  if (pressure >= 990 && pressure <= 1040) return 50
  return 20
}

/** 温度评分：15-28°C 最佳 */
function calculateTemperatureScore(temperature: number): number {
  if (temperature >= 18 && temperature <= 25) return 100
  if (temperature >= 15 && temperature <= 28) return 80
  if (temperature >= 10 && temperature <= 32) return 50
  if (temperature >= 5 && temperature <= 35) return 30
  return 10
}

/** 湿度评分：40-80% 最佳 */
function calculateHumidityScore(humidity: number): number {
  if (humidity >= 50 && humidity <= 70) return 100
  if (humidity >= 40 && humidity <= 80) return 80
  if (humidity >= 30 && humidity <= 90) return 50
  return 20
}

/** 风速评分：0-15km/h 最佳 */
function calculateWindScore(windSpeed: number): number {
  if (windSpeed <= 10) return 100
  if (windSpeed <= 15) return 80
  if (windSpeed <= 25) return 50
  if (windSpeed <= 35) return 30
  return 10
}

/** 天气状况评分 */
function calculateConditionScore(condition: WeatherCondition): number {
  const scoreMap: Record<WeatherCondition, number> = {
    cloudy: 100,
    overcast: 90,
    light_rain: 80,
    sunny: 70,
    windy: 50,
    moderate_rain: 40,
    fog: 30,
    heavy_rain: 20,
    thunderstorm: 10,
    snow: 10
  }
  return scoreMap[condition] ?? 50
}
