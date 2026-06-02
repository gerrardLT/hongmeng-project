/**
 * PlantCare 天气服务
 * 获取天气数据并提供基于天气的养护建议，带缓存机制
 */
import type { WeatherData } from '@/types/models'
import { getWeatherCareTip } from '@/utils/weather'

// 缓存天气数据，30分钟有效
let weatherCache: WeatherData | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30分钟

/**
 * 获取天气数据
 * 使用uni.request请求天气API，带30分钟缓存
 */
export async function fetchWeather(city?: string): Promise<WeatherData> {
  // 检查缓存
  if (weatherCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    if (!city || weatherCache.city === city) {
      return weatherCache
    }
  }

  try {
    // 模拟天气API调用（实际项目替换为真实API）
    const weather: WeatherData = await new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          temperature: 25,
          humidity: 60,
          condition: '晴',
          city: city || '北京',
          updatedAt: Date.now()
        })
      }, 300)
    })

    // 更新缓存
    weatherCache = weather
    cacheTimestamp = Date.now()

    return weather
  } catch (e) {
    console.error('[weather service] fetchWeather error:', e)
    // 返回缓存数据或默认值
    if (weatherCache) return weatherCache
    return {
      temperature: 20,
      humidity: 50,
      condition: '未知',
      city: city || '未知',
      updatedAt: Date.now()
    }
  }
}

/**
 * 获取缓存的天气数据
 */
export function getCachedWeather(): WeatherData | null {
  if (weatherCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return weatherCache
  }
  return null
}

/**
 * 基于天气的养护建议
 */
export function getWeatherBasedAdvice(weather: WeatherData): string {
  return getWeatherCareTip(weather)
}
