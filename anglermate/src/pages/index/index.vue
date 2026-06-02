<template>
  <view class="page">
    <!-- 天气预警提示条 -->
    <view
      v-for="alert in weatherStore.alerts"
      :key="alert.id"
      class="alert-bar"
      :class="alert.level === '红色' ? 'alert-red' : 'alert-orange'"
    >
      <text class="alert-icon">⚠️</text>
      <text class="alert-text">{{ alert.title }}</text>
    </view>

    <!-- 顶部定位信息 -->
    <view class="location-bar">
      <view class="location-left">
        <text class="location-icon">📍</text>
        <text class="location-name">{{ locationName }}</text>
      </view>
      <text class="update-hint">{{ updateTimeText }}</text>
    </view>

    <!-- 加载中 -->
    <Loading :show="loading" text="获取天气中..." />

    <!-- 无数据 -->
    <Empty v-if="!loading && !weatherStore.currentWeather" icon="🌤️" text="暂无天气数据，请检查网络和定位权限" />

    <template v-if="weatherStore.currentWeather">
      <!-- 天气卡片 -->
      <view class="section">
        <WeatherCard :weather="weatherStore.currentWeather" />
      </view>

      <!-- 钓鱼指数区域 -->
      <view class="section card">
        <view class="section-header">
          <text class="section-title">钓鱼指数</text>
        </view>
        <view class="fishing-row">
          <FishingIndex :index="fishingResult.index" :desc="fishingResult.desc" />
        </view>
        <text class="fishing-advice">{{ fishingAdvice }}</text>
      </view>

      <!-- 24小时趋势 -->
      <view class="section card">
        <view class="section-header">
          <text class="section-title">24小时趋势</text>
        </view>
        <scroll-view scroll-x class="hourly-scroll">
          <view class="hourly-list">
            <view
              v-for="(h, idx) in weatherStore.hourlyList"
              :key="idx"
              class="hourly-item"
            >
              <text class="hourly-time">{{ formatHour(h.time) }}</text>
              <text class="hourly-condition">{{ conditionIcon(h.condition) }}</text>
              <text class="hourly-cond-text">{{ h.conditionText }}</text>
              <text class="hourly-temp">{{ Math.round(h.temperature) }}°</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 7天预报列表 -->
      <view class="section card">
        <view class="section-header">
          <text class="section-title">7天预报</text>
        </view>
        <view class="daily-list">
          <view
            v-for="(d, idx) in weatherStore.dailyList"
            :key="idx"
            class="daily-row"
          >
            <view class="daily-date-col">
              <text class="daily-date">{{ formatDayLabel(d.date, idx) }}</text>
              <text class="daily-weekday">{{ getWeekday(d.date) }}</text>
            </view>
            <text class="daily-condition">{{ d.conditionText }}</text>
            <view class="daily-temp-col">
              <text class="daily-temp-low">{{ Math.round(d.tempMin) }}°</text>
              <view class="temp-bar">
                <view class="temp-bar-fill" :style="tempBarStyle(d.tempMin, d.tempMax)" />
              </view>
              <text class="daily-temp-high">{{ Math.round(d.tempMax) }}°</text>
            </view>
            <view class="daily-index-col">
              <text class="daily-index-star">{{ miniStars(d.fishingIndex) }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useWeatherStore } from '@/store/weather'
import { getCurrentWeather, getHourlyForecast, getDailyForecast, getWeatherAlerts, calculateFishingIndex } from '@/services/weather'
import { getCurrentLocation } from '@/utils/location'
import { formatDate, getWeekday } from '@/utils/format'
import type { WeatherCondition } from '@/types/models'
import WeatherCard from '@/components/WeatherCard.vue'
import FishingIndex from '@/components/FishingIndex.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const weatherStore = useWeatherStore()

const loading = ref(false)
const locationName = ref('定位中...')
const lat = ref(0)
const lng = ref(0)

// 钓鱼指数
const fishingResult = computed(() => {
  if (!weatherStore.currentWeather) return { index: 0, desc: '' }
  return calculateFishingIndex(weatherStore.currentWeather)
})

const fishingAdvice = computed(() => {
  const idx = fishingResult.value.index
  const adviceMap: Record<number, string> = {
    1: '今天天气不太适合钓鱼，建议在家整理渔具或学习钓技。',
    2: '钓况一般，如果出钓请注意天气变化，做好防护。',
    3: '适合出钓！建议选择背风水域，注意防晒防雨。',
    4: '非常适合钓鱼！鱼口活跃，建议尽早出发抢占好钓位。',
    5: '绝佳的钓鱼天气！气压温度俱佳，千万不要错过！'
  }
  return adviceMap[idx] || ''
})

const updateTimeText = computed(() => {
  if (!weatherStore.lastUpdateTime) return ''
  return '更新于 ' + formatDate(weatherStore.lastUpdateTime, 'HH:mm')
})

// 天气图标映射
const conditionIconMap: Record<WeatherCondition, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  overcast: '☁️',
  light_rain: '🌦️',
  moderate_rain: '🌧️',
  heavy_rain: '⛈️',
  thunderstorm: '🌩️',
  snow: '❄️',
  fog: '🌫️',
  windy: '💨'
}

function conditionIcon(c: WeatherCondition): string {
  return conditionIconMap[c] || '🌤️'
}

function formatHour(time: string): string {
  if (!time) return ''
  // time 格式可能为 "2026-04-27 14:00" 或 "14:00"
  const parts = time.split(' ')
  const timePart = parts.length > 1 ? parts[1] : parts[0]
  return timePart.substring(0, 5)
}

function formatDayLabel(date: string, idx: number): string {
  if (idx === 0) return '今天'
  if (idx === 1) return '明天'
  return formatDate(date, 'MM/DD')
}

// 温度条样式：基于全局最低/最高来计算位置
function tempBarStyle(min: number, max: number) {
  const allTemps = weatherStore.dailyList
  if (!allTemps.length) return {}
  const globalMin = Math.min(...allTemps.map(d => d.tempMin))
  const globalMax = Math.max(...allTemps.map(d => d.tempMax))
  const range = globalMax - globalMin || 1
  const left = ((min - globalMin) / range) * 100
  const width = ((max - min) / range) * 100
  return {
    left: `${left}%`,
    width: `${Math.max(width, 8)}%`
  }
}

function miniStars(idx: number): string {
  const v = Math.min(5, Math.max(1, idx))
  return '★'.repeat(v) + '☆'.repeat(5 - v)
}

// 获取天气数据
async function fetchWeatherData() {
  loading.value = true
  try {
    const loc = await getCurrentLocation()
    lat.value = loc.latitude
    lng.value = loc.longitude
    locationName.value = loc.address || `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`

    const [weather, hourly, daily, alerts] = await Promise.all([
      getCurrentWeather(lat.value, lng.value),
      getHourlyForecast(lat.value, lng.value),
      getDailyForecast(lat.value, lng.value),
      getWeatherAlerts(lat.value, lng.value)
    ])

    weatherStore.setCurrentWeather(weather)
    weatherStore.setHourlyList(hourly)
    weatherStore.setDailyList(daily)
    weatherStore.setAlerts(alerts)
  } catch (e: any) {
    console.error('获取天气数据失败:', e)
    uni.showToast({ title: e.message || '获取天气失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  weatherStore.init()
  if (weatherStore.needsRefresh) {
    fetchWeatherData()
  } else {
    // 已有缓存，尝试解析地址
    if (!locationName.value || locationName.value === '定位中...') {
      getCurrentLocation()
        .then(loc => {
          locationName.value = loc.address || `${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`
        })
        .catch(() => {
          locationName.value = '未知位置'
        })
    }
  }
})

onPullDownRefresh(async () => {
  await fetchWeatherData()
  uni.stopPullDownRefresh()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 0 24rpx 48rpx;
}

/* 预警条 */
.alert-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  margin-top: 24rpx;
}

.alert-orange {
  background: #FFF3E0;
}

.alert-red {
  background: #FFEBEE;
}

.alert-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.alert-text {
  font-size: 26rpx;
  color: #E65100;
  flex: 1;
}

.alert-red .alert-text {
  color: #C62828;
}

/* 定位栏 */
.location-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0 16rpx;
}

.location-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
}

.location-icon {
  font-size: 28rpx;
}

.location-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  max-width: 400rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.update-hint {
  font-size: 24rpx;
  color: #BDBDBD;
}

/* 区域 */
.section {
  margin-top: 24rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
}

/* 钓鱼指数 */
.fishing-row {
  margin-bottom: 16rpx;
}

.fishing-advice {
  font-size: 24rpx;
  color: #757575;
  line-height: 1.6;
}

/* 24h 趋势 */
.hourly-scroll {
  white-space: nowrap;
  margin: 0 -32rpx;
  padding: 0 32rpx;
}

.hourly-list {
  display: inline-flex;
  flex-direction: row;
  gap: 0;
}

.hourly-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  padding: 16rpx 0;
  flex-shrink: 0;
}

.hourly-time {
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 12rpx;
}

.hourly-condition {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.hourly-cond-text {
  font-size: 20rpx;
  color: #BDBDBD;
  margin-bottom: 12rpx;
}

.hourly-temp {
  font-size: 28rpx;
  color: #212121;
  font-weight: 600;
}

/* 7天预报 */
.daily-list {
  display: flex;
  flex-direction: column;
}

.daily-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }
}

.daily-date-col {
  width: 130rpx;
  display: flex;
  flex-direction: column;
}

.daily-date {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
}

.daily-weekday {
  font-size: 22rpx;
  color: #BDBDBD;
  margin-top: 4rpx;
}

.daily-condition {
  width: 100rpx;
  font-size: 24rpx;
  color: #757575;
  text-align: center;
}

.daily-temp-col {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  padding: 0 16rpx;
}

.daily-temp-low {
  font-size: 24rpx;
  color: #999999;
  width: 60rpx;
  text-align: right;
}

.daily-temp-high {
  font-size: 24rpx;
  color: #212121;
  font-weight: 600;
  width: 60rpx;
}

.temp-bar {
  flex: 1;
  height: 8rpx;
  background: #F0F0F0;
  border-radius: 4rpx;
  position: relative;
}

.temp-bar-fill {
  position: absolute;
  top: 0;
  height: 8rpx;
  border-radius: 4rpx;
  background: linear-gradient(90deg, #42A5F5, #FF6B35);
}

.daily-index-col {
  width: 140rpx;
  text-align: right;
}

.daily-index-star {
  font-size: 18rpx;
  color: #FF6B35;
  letter-spacing: 2rpx;
}
</style>
