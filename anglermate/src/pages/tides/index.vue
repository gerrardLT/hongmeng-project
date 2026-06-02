<template>
  <view class="page">
    <!-- 加载中 -->
    <Loading :show="loading" text="获取潮汐数据..." />

    <!-- 日期选择 -->
    <view class="date-selector">
      <view class="date-arrow" @tap="changeDate(-1)">
        <text class="arrow-text">‹</text>
      </view>
      <view class="date-center">
        <text class="date-main">{{ displayDate }}</text>
        <text class="date-sub">{{ displayWeekday }}</text>
      </view>
      <view class="date-arrow" @tap="changeDate(1)">
        <text class="arrow-text">›</text>
      </view>
    </view>

    <!-- 无数据 -->
    <Empty v-if="!loading && !tideData" icon="🌊" text="暂无潮汐数据" />

    <template v-if="tideData">
      <!-- 今日潮汐 -->
      <view class="section">
        <TideForecast :tide-data="tideData" />
      </view>

      <!-- 潮汐趋势简易图 -->
      <view class="section card">
        <view class="section-header">
          <text class="section-title">潮汐趋势</text>
        </view>
        <view class="tide-trend">
          <view
            v-for="(tide, idx) in tideData.tides"
            :key="idx"
            class="trend-col"
          >
            <text class="trend-time">{{ formatTideTime(tide.time) }}</text>
            <view class="trend-bar-wrap">
              <view
                class="trend-bar"
                :class="tide.type === 'high' || tide.type === 'rising' ? 'bar-high' : 'bar-low'"
                :style="{ height: tideBarHeight(tide.height) }"
              />
            </view>
            <text class="trend-height">{{ tide.height.toFixed(1) }}m</text>
            <text class="trend-label" :class="tide.type === 'high' || tide.type === 'rising' ? 'label-high' : 'label-low'">
              {{ tideTypeLabel(tide.type) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 月相信息卡片 -->
      <view v-if="moonPhase" class="section card">
        <view class="section-header">
          <text class="section-title">月相信息</text>
        </view>
        <view class="moon-main">
          <view class="moon-visual">
            <view class="moon-circle" :style="moonCircleStyle" />
          </view>
          <view class="moon-info">
            <text class="moon-name">{{ moonPhase.phaseName }}</text>
            <text class="moon-age">月龄 {{ moonPhase.age.toFixed(1) }} 天</text>
          </view>
        </view>
        <view class="moon-detail">
          <view class="moon-detail-item">
            <text class="moon-detail-label">亮度</text>
            <view class="moon-progress-bar">
              <view class="moon-progress-fill" :style="{ width: moonPhase.illumination + '%' }" />
            </view>
            <text class="moon-detail-value">{{ moonPhase.illumination }}%</text>
          </view>
          <view class="moon-times">
            <view class="moon-time-item">
              <text class="moon-time-icon">🌙</text>
              <text class="moon-time-label">月出</text>
              <text class="moon-time-value">{{ moonPhase.moonrise }}</text>
            </view>
            <view class="moon-time-item">
              <text class="moon-time-icon">🌑</text>
              <text class="moon-time-label">月落</text>
              <text class="moon-time-value">{{ moonPhase.moonset }}</text>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 7天潮汐预报 -->
    <view v-if="tideForecastList.length" class="section card">
      <view class="section-header">
        <text class="section-title">7天潮汐预报</text>
      </view>
      <view class="forecast-list">
        <view
          v-for="(item, idx) in tideForecastList"
          :key="idx"
          class="forecast-row"
          @tap="selectForecastDate(item.date)"
        >
          <view class="forecast-date-col">
            <text class="forecast-date">{{ formatForecastLabel(item.date, idx) }}</text>
            <text class="forecast-weekday">{{ getWeekday(item.date) }}</text>
          </view>
          <view class="forecast-tide-col">
            <view class="forecast-tide-tag high-tag">
              <text class="forecast-tide-tag-text">高 {{ countTides(item, 'high') }}次</text>
            </view>
            <view class="forecast-tide-tag low-tag">
              <text class="forecast-tide-tag-text">低 {{ countTides(item, 'low') }}次</text>
            </view>
          </view>
          <view class="forecast-times-col">
            <text class="forecast-times">{{ tideTimeSummary(item) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 月相日历 -->
    <view v-if="monthMoonPhases.length" class="section card">
      <view class="section-header">
        <view class="calendar-header">
          <view class="cal-arrow" @tap="changeMonth(-1)">
            <text class="arrow-text">‹</text>
          </view>
          <text class="section-title">{{ calendarTitle }}</text>
          <view class="cal-arrow" @tap="changeMonth(1)">
            <text class="arrow-text">›</text>
          </view>
        </view>
      </view>
      <view class="calendar-weekdays">
        <text v-for="w in weekLabels" :key="w" class="weekday-label">{{ w }}</text>
      </view>
      <view class="calendar-grid">
        <view
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="calendar-cell"
          :class="{ 'cell-today': cell.isToday, 'cell-empty': !cell.day }"
        >
          <template v-if="cell.day">
            <text class="cell-day">{{ cell.day }}</text>
            <view
              class="cell-moon"
              :style="{
                width: '36rpx',
                height: '36rpx',
                borderRadius: '50%',
                background: moonGradient(cell.illumination)
              }"
            />
          </template>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getTideData, getTideForecast, getMoonPhase, getMonthMoonPhases } from '@/services/tides'
import { getCurrentLocation } from '@/utils/location'
import { formatDate, getWeekday } from '@/utils/format'
import type { TideData, TideType, MoonPhase } from '@/types/models'
import TideForecast from '@/components/TideForecast.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const loading = ref(false)
const lat = ref(0)
const lng = ref(0)
const selectedDate = ref(new Date())
const tideData = ref<TideData | null>(null)
const moonPhase = ref<MoonPhase | null>(null)
const tideForecastList = ref<TideData[]>([])
const monthMoonPhases = ref<MoonPhase[]>([])
const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth() + 1)

const weekLabels = ['日', '一', '二', '三', '四', '五', '六']

const displayDate = computed(() => formatDate(selectedDate.value, 'YYYY年MM月DD日'))
const displayWeekday = computed(() => getWeekday(selectedDate.value))

const calendarTitle = computed(() => `${calYear.value}年${String(calMonth.value).padStart(2, '0')}月`)

// 潮汐类型标签
const tideTypeMap: Record<TideType, string> = {
  high: '高潮',
  low: '低潮',
  rising: '涨潮',
  falling: '退潮'
}

function tideTypeLabel(type: TideType): string {
  return tideTypeMap[type] || type
}

function formatTideTime(time: string): string {
  if (!time) return ''
  const parts = time.split(' ')
  const t = parts.length > 1 ? parts[1] : parts[0]
  return t.substring(0, 5)
}

// 潮汐高度 -> 条形高度
function tideBarHeight(height: number): string {
  const maxH = 5
  const pct = Math.min(100, Math.max(10, (height / maxH) * 100))
  return pct + '%'
}

// 日期切换
function changeDate(delta: number) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta)
  selectedDate.value = d
  fetchTideForDate()
}

function selectForecastDate(dateStr: string) {
  selectedDate.value = new Date(dateStr)
  fetchTideForDate()
}

function formatForecastLabel(date: string, idx: number): string {
  if (idx === 0) return '今天'
  if (idx === 1) return '明天'
  return formatDate(date, 'MM/DD')
}

function countTides(data: TideData, type: string): number {
  return data.tides.filter(t => t.type === type).length
}

function tideTimeSummary(data: TideData): string {
  const highTides = data.tides.filter(t => t.type === 'high')
  if (highTides.length) {
    return highTides.map(t => formatTideTime(t.time)).join(' / ')
  }
  return '--'
}

// 月相圆形样式
const moonCircleStyle = computed(() => {
  if (!moonPhase.value) return {}
  const ill = moonPhase.value.illumination
  return {
    background: moonGradient(ill)
  }
})

function moonGradient(illumination: number): string {
  const brightness = Math.round(180 + (illumination / 100) * 75)
  const dark = '#2C2C3A'
  const light = `rgb(${brightness}, ${brightness}, ${Math.min(255, brightness + 20)})`
  if (illumination < 5) return dark
  if (illumination > 95) return light
  return `linear-gradient(90deg, ${dark} ${50 - illumination / 2}%, ${light} ${50 + illumination / 2}%)`
}

// 月相日历
function changeMonth(delta: number) {
  let m = calMonth.value + delta
  let y = calYear.value
  if (m < 1) { m = 12; y-- }
  if (m > 12) { m = 1; y++ }
  calMonth.value = m
  calYear.value = y
  fetchMonthMoon()
}

interface CalendarCell {
  day: number | null
  illumination: number
  isToday: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const firstDay = new Date(calYear.value, calMonth.value - 1, 1).getDay()
  const daysInMonth = new Date(calYear.value, calMonth.value, 0).getDate()
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === calYear.value && today.getMonth() + 1 === calMonth.value

  const cells: CalendarCell[] = []

  // 前置空白
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, illumination: 0, isToday: false })
  }

  // 日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear.value}-${String(calMonth.value).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const mp = monthMoonPhases.value.find(p => p.date === dateStr)
    cells.push({
      day: d,
      illumination: mp ? mp.illumination : 0,
      isToday: isCurrentMonth && today.getDate() === d
    })
  }

  return cells
})

// 数据获取
async function fetchTideForDate() {
  if (!lat.value && !lng.value) return
  try {
    const dateStr = formatDate(selectedDate.value, 'YYYY-MM-DD')
    const [tide, moon] = await Promise.all([
      getTideData(lat.value, lng.value, dateStr),
      getMoonPhase(dateStr)
    ])
    tideData.value = tide
    moonPhase.value = moon
  } catch (e: any) {
    console.error('获取潮汐数据失败:', e)
  }
}

async function fetchMonthMoon() {
  try {
    monthMoonPhases.value = await getMonthMoonPhases(calYear.value, calMonth.value)
  } catch (e: any) {
    console.error('获取月相数据失败:', e)
  }
}

async function fetchAllData() {
  loading.value = true
  try {
    const loc = await getCurrentLocation()
    lat.value = loc.latitude
    lng.value = loc.longitude

    const dateStr = formatDate(selectedDate.value, 'YYYY-MM-DD')

    const [tide, forecast, moon, moonList] = await Promise.all([
      getTideData(lat.value, lng.value, dateStr),
      getTideForecast(lat.value, lng.value),
      getMoonPhase(dateStr),
      getMonthMoonPhases(calYear.value, calMonth.value)
    ])

    tideData.value = tide
    tideForecastList.value = forecast
    moonPhase.value = moon
    monthMoonPhases.value = moonList
  } catch (e: any) {
    console.error('获取数据失败:', e)
    uni.showToast({ title: e.message || '获取潮汐数据失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllData()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 0 24rpx 48rpx;
}

/* 日期选择器 */
.date-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0 16rpx;
  gap: 40rpx;
}

.date-arrow {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.arrow-text {
  font-size: 40rpx;
  color: #FF6B35;
  font-weight: 700;
  line-height: 1;
}

.date-center {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-main {
  font-size: 32rpx;
  font-weight: 600;
  color: #212121;
}

.date-sub {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

/* 通用区域 */
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

/* 潮汐趋势条 */
.tide-trend {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  padding: 16rpx 0;
}

.trend-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.trend-time {
  font-size: 22rpx;
  color: #999999;
}

.trend-bar-wrap {
  width: 40rpx;
  height: 160rpx;
  background: #F5F5F5;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
}

.trend-bar {
  width: 100%;
  border-radius: 20rpx;
  transition: height 0.3s ease;
}

.bar-high {
  background: linear-gradient(180deg, #FF6B35, #FF8F65);
}

.bar-low {
  background: linear-gradient(180deg, #42A5F5, #90CAF9);
}

.trend-height {
  font-size: 22rpx;
  color: #212121;
  font-weight: 500;
}

.trend-label {
  font-size: 20rpx;
  font-weight: 500;
}

.label-high {
  color: #FF6B35;
}

.label-low {
  color: #42A5F5;
}

/* 月相卡片 */
.moon-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 32rpx;
}

.moon-visual {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
}

.moon-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  box-shadow: 0 0 24rpx rgba(255, 255, 200, 0.3);
}

.moon-info {
  display: flex;
  flex-direction: column;
}

.moon-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
  margin-bottom: 8rpx;
}

.moon-age {
  font-size: 24rpx;
  color: #999999;
}

.moon-detail {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.moon-detail-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
}

.moon-detail-label {
  font-size: 26rpx;
  color: #999999;
  width: 60rpx;
}

.moon-progress-bar {
  flex: 1;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.moon-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD54F, #FFA726);
  border-radius: 6rpx;
}

.moon-detail-value {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
  width: 80rpx;
  text-align: right;
}

.moon-times {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}

.moon-time-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.moon-time-icon {
  font-size: 28rpx;
}

.moon-time-label {
  font-size: 24rpx;
  color: #999999;
}

.moon-time-value {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
}

/* 7天潮汐预报 */
.forecast-list {
  display: flex;
  flex-direction: column;
}

.forecast-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }
}

.forecast-date-col {
  width: 130rpx;
  display: flex;
  flex-direction: column;
}

.forecast-date {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
}

.forecast-weekday {
  font-size: 22rpx;
  color: #BDBDBD;
  margin-top: 4rpx;
}

.forecast-tide-col {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  width: 220rpx;
}

.forecast-tide-tag {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
}

.high-tag {
  background: rgba(255, 107, 53, 0.1);
}

.low-tag {
  background: rgba(33, 150, 243, 0.1);
}

.forecast-tide-tag-text {
  font-size: 22rpx;
  font-weight: 500;
}

.high-tag .forecast-tide-tag-text {
  color: #FF6B35;
}

.low-tag .forecast-tide-tag-text {
  color: #2196F3;
}

.forecast-times-col {
  flex: 1;
  text-align: right;
}

.forecast-times {
  font-size: 24rpx;
  color: #757575;
}

/* 月相日历 */
.calendar-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
}

.cal-arrow {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-weekdays {
  display: flex;
  flex-direction: row;
  margin-bottom: 12rpx;
}

.weekday-label {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  color: #BDBDBD;
  font-weight: 500;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-cell {
  width: calc(100% / 7);
  height: 96rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  box-sizing: border-box;
}

.cell-empty {
  visibility: hidden;
}

.cell-today {
  background: rgba(255, 107, 53, 0.08);
  border-radius: 16rpx;
}

.cell-day {
  font-size: 22rpx;
  color: #757575;
}

.cell-today .cell-day {
  color: #FF6B35;
  font-weight: 600;
}

.cell-moon {
  flex-shrink: 0;
}
</style>
