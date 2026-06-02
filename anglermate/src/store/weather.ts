import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WeatherData, HourlyWeather, DailyWeather, WeatherAlert } from '@/types/models'

const STORAGE_KEY = 'anglermate_weather'
const REFRESH_INTERVAL = 30 * 60 * 1000 // 30分钟

interface WeatherStorageState {
  currentWeather: WeatherData | null
  hourlyList: HourlyWeather[]
  dailyList: DailyWeather[]
  alerts: WeatherAlert[]
  lastUpdateTime: number
}

export const useWeatherStore = defineStore('weather', () => {
  // state
  const currentWeather = ref<WeatherData | null>(null)
  const hourlyList = ref<HourlyWeather[]>([])
  const dailyList = ref<DailyWeather[]>([])
  const alerts = ref<WeatherAlert[]>([])
  const lastUpdateTime = ref(0)

  // getters
  const fishingIndex = computed(() => {
    if (!currentWeather.value) return 0
    return currentWeather.value.fishingIndex
  })

  const needsRefresh = computed(() => {
    if (lastUpdateTime.value === 0) return true
    return Date.now() - lastUpdateTime.value > REFRESH_INTERVAL
  })

  // 持久化到本地存储
  function persist() {
    const state: WeatherStorageState = {
      currentWeather: currentWeather.value,
      hourlyList: hourlyList.value,
      dailyList: dailyList.value,
      alerts: alerts.value,
      lastUpdateTime: lastUpdateTime.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist weather state error:', e)
    }
  }

  // actions
  function setCurrentWeather(data: WeatherData) {
    currentWeather.value = data
    lastUpdateTime.value = Date.now()
    persist()
  }

  function setHourlyList(data: HourlyWeather[]) {
    hourlyList.value = data
    persist()
  }

  function setDailyList(data: DailyWeather[]) {
    dailyList.value = data
    persist()
  }

  function setAlerts(data: WeatherAlert[]) {
    alerts.value = data
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as WeatherStorageState | undefined
      if (state) {
        currentWeather.value = state.currentWeather || null
        hourlyList.value = state.hourlyList || []
        dailyList.value = state.dailyList || []
        alerts.value = state.alerts || []
        lastUpdateTime.value = state.lastUpdateTime || 0
      }
    } catch (e) {
      console.error('init weather state error:', e)
    }
  }

  return {
    currentWeather,
    hourlyList,
    dailyList,
    alerts,
    lastUpdateTime,
    fishingIndex,
    needsRefresh,
    setCurrentWeather,
    setHourlyList,
    setDailyList,
    setAlerts,
    init
  }
})
