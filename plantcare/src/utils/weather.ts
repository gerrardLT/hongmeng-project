import type { WeatherData } from '@/types/models'

/**
 * 根据天气数据获取浇水调整系数
 * 下雨天延长浇水间隔，高温干燥天缩短间隔
 */
export function getWeatherAdjustment(weather: WeatherData): number {
  const { condition, temperature, humidity } = weather

  // 雨天：大幅延长浇水间隔
  const rainyConditions = ['雨', '阵雨', '暴雨', '雷阵雨', '小雨', '中雨', '大雨']
  if (rainyConditions.some(c => condition.includes(c))) {
    return 2.0
  }

  // 高温低湿：缩短浇水间隔
  if (temperature > 35 && humidity < 40) {
    return 0.5
  }

  // 高温：适当缩短
  if (temperature > 30) {
    return 0.7
  }

  // 阴天高湿：适当延长
  if (condition.includes('阴') && humidity > 70) {
    return 1.3
  }

  return 1.0
}

/**
 * 格式化天气信息为展示文案
 */
export function formatWeather(data: WeatherData): string {
  return `${data.city} ${data.condition} ${data.temperature}°C 湿度${data.humidity}%`
}

/**
 * 获取天气对应的养护建议
 */
export function getWeatherCareTip(weather: WeatherData): string {
  const { condition, temperature, humidity } = weather

  if (condition.includes('雨')) {
    return '今天有雨，室外植物无需浇水'
  }
  if (temperature > 35) {
    return '高温天气，注意给植物遮阴避暑'
  }
  if (temperature < 5) {
    return '低温天气，注意植物防寒保暖'
  }
  if (humidity < 30) {
    return '空气干燥，建议给叶片喷水增湿'
  }
  if (humidity > 80) {
    return '空气潮湿，注意通风防止病虫害'
  }
  return '天气适宜，正常养护即可'
}
