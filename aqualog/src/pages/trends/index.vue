<template>
  <view class="trends-page">
    <!-- 空状态 -->
    <EmptyState
      v-if="!hasAquariums"
      icon="📊"
      title="暂无水族箱"
      description="请先添加水族箱后查看趋势分析"
    />

    <template v-else>
      <!-- 水族箱选择器 -->
      <picker
        :range="aquariumNames"
        :value="aquariumIndex"
        @change="onAquariumChange"
      >
        <view class="picker-bar">
          <text class="picker-label">当前水族箱</text>
          <view class="picker-value-wrap">
            <text class="picker-value">{{ currentAquariumName }}</text>
            <text class="picker-arrow">▾</text>
          </view>
        </view>
      </picker>

      <!-- 健康评分卡片 -->
      <view class="card score-card">
        <view class="score-ring">
          <canvas canvas-id="scoreCanvas" class="score-canvas" />
          <text class="score-value" :style="{ color: scoreColor }">{{ healthScore }}</text>
        </view>
        <view class="score-info">
          <text class="score-label" :style="{ color: scoreColor }">{{ scoreLabel }}</text>
          <text class="score-desc">综合健康评分</text>
        </view>
      </view>

      <!-- 参数趋势 -->
      <view class="card trend-card">
        <text class="section-title">参数趋势</text>
        <!-- 参数横向滚动标签 -->
        <scroll-view scroll-x class="param-tabs">
          <view
            v-for="p in paramOptions"
            :key="p.key"
            class="param-tab"
            :class="{ active: selectedParam === p.key }"
            @click="selectParam(p.key)"
          >
            <text class="param-tab-text">{{ p.label }}</text>
          </view>
        </scroll-view>
        <!-- 时间范围按钮组 -->
        <view class="period-group">
          <view
            v-for="pd in periods"
            :key="pd.value"
            class="period-btn"
            :class="{ active: selectedPeriod === pd.value }"
            @click="selectPeriod(pd.value)"
          >
            <text class="period-btn-text">{{ pd.label }}</text>
          </view>
        </view>
        <!-- Canvas 折线图 -->
        <canvas canvas-id="trendCanvas" class="trend-canvas" />
        <!-- 统计摘要 -->
        <view class="summary-row" v-if="trendData && trendData.dataPoints.length > 0">
          <view class="summary-item">
            <text class="summary-label">平均</text>
            <text class="summary-value">{{ formatValue(trendData.avg) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">最高</text>
            <text class="summary-value highlight-max">{{ formatValue(trendData.max) }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">最低</text>
            <text class="summary-value highlight-min">{{ formatValue(trendData.min) }}</text>
          </view>
        </view>
        <view v-if="!trendData || trendData.dataPoints.length === 0" class="no-data">
          <text class="no-data-text">暂无该参数的记录数据</text>
        </view>
      </view>

      <!-- 维护统计 -->
      <view class="card maintenance-card">
        <text class="section-title">维护统计</text>
        <view class="maintenance-grid">
          <view class="maintenance-item">
            <text class="maintenance-num">{{ maintenanceStats.waterChangeCount }}</text>
            <text class="maintenance-label">换水次数</text>
          </view>
          <view class="maintenance-item">
            <text class="maintenance-num">{{ maintenanceStats.feedingCount }}</text>
            <text class="maintenance-label">喂食次数</text>
          </view>
          <view class="maintenance-item">
            <text class="maintenance-num">{{ maintenanceStats.filterCount }}</text>
            <text class="maintenance-label">滤材维护</text>
          </view>
          <view class="maintenance-item">
            <text class="maintenance-num">{{ maintenanceStats.avgWaterChangeInterval || '--' }}</text>
            <text class="maintenance-label">换水间隔(天)</text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance, nextTick } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { TrendSummary, TrendPeriod } from '@/types/models'
import { useAquariumStore } from '@/store/aquarium'
import { getParamTrend, calculateHealthScore, getMaintenanceStats } from '@/services/analysis'
import { getParamLabel, getParamUnit } from '@/utils/paramRanges'
import { formatParamValue } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const instance = getCurrentInstance()
const aquariumStore = useAquariumStore()

// 参数选项
const paramOptions = [
  { key: 'temperature', label: '温度' },
  { key: 'ph', label: 'pH' },
  { key: 'ammonia', label: '氨氮' },
  { key: 'nitrite', label: '亚硝酸盐' },
  { key: 'nitrate', label: '硝酸盐' },
  { key: 'gh', label: 'GH' },
  { key: 'kh', label: 'KH' },
  { key: 'phosphate', label: '磷酸盐' }
]

// 时间范围选项
const periods: { label: string; value: TrendPeriod }[] = [
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' },
  { label: '90天', value: '90d' },
  { label: '1年', value: '1y' }
]

// 状态
const selectedParam = ref('temperature')
const selectedPeriod = ref<TrendPeriod>('7d')
const healthScore = ref(0)
const trendData = ref<TrendSummary | null>(null)
const maintenanceStats = ref({
  waterChangeCount: 0,
  feedingCount: 0,
  filterCount: 0,
  avgWaterChangeInterval: 0
})

// 水族箱选择
const aquariumIndex = ref(0)
const hasAquariums = computed(() => aquariumStore.aquariums.length > 0)
const aquariumNames = computed(() => aquariumStore.aquariums.map((a) => a.name))
const currentAquariumName = computed(() => {
  const list = aquariumStore.aquariums
  return list.length > 0 ? list[aquariumIndex.value]?.name || '' : ''
})
const currentAquariumId = computed(() => {
  const list = aquariumStore.aquariums
  return list.length > 0 ? list[aquariumIndex.value]?.aquariumId || '' : ''
})

// 评分标签与颜色
const scoreLabel = computed(() => {
  const s = healthScore.value
  if (s >= 80) return '优秀'
  if (s >= 60) return '良好'
  if (s >= 40) return '一般'
  return '较差'
})

const scoreColor = computed(() => {
  const s = healthScore.value
  if (s >= 80) return '#27AE60'
  if (s >= 60) return '#F39C12'
  return '#E74C3C'
})

function onAquariumChange(e: any) {
  aquariumIndex.value = Number(e.detail.value)
  loadData()
}

function selectParam(key: string) {
  selectedParam.value = key
}

function selectPeriod(value: TrendPeriod) {
  selectedPeriod.value = value
}

function formatValue(val: number): string {
  const unit = getParamUnit(selectedParam.value)
  return formatParamValue(val, unit)
}

// 数据加载
function loadData() {
  if (!currentAquariumId.value) return

  healthScore.value = calculateHealthScore(currentAquariumId.value)
  trendData.value = getParamTrend(currentAquariumId.value, selectedParam.value, selectedPeriod.value)
  maintenanceStats.value = getMaintenanceStats(currentAquariumId.value, selectedPeriod.value)

  nextTick(() => {
    drawScoreRing()
    drawTrendChart()
  })
}

// 绘制健康评分圆环
function drawScoreRing() {
  const ctx = uni.createCanvasContext('scoreCanvas', instance)
  const size = 80 // canvas 逻辑尺寸对应 160rpx
  const center = size / 2
  const radius = 32
  const lineWidth = 8
  const score = healthScore.value

  ctx.clearRect(0, 0, size, size)

  // 背景环
  ctx.setLineWidth(lineWidth)
  ctx.setStrokeStyle('#EEEEEE')
  ctx.setLineCap('round')
  ctx.beginPath()
  ctx.arc(center, center, radius, -Math.PI / 2, Math.PI * 1.5)
  ctx.stroke()

  // 进度环
  if (score > 0) {
    const endAngle = -Math.PI / 2 + (Math.PI * 2 * score) / 100
    const color = score >= 80 ? '#27AE60' : score >= 60 ? '#F39C12' : '#E74C3C'
    ctx.setLineWidth(lineWidth)
    ctx.setStrokeStyle(color)
    ctx.setLineCap('round')
    ctx.beginPath()
    ctx.arc(center, center, radius, -Math.PI / 2, endAngle)
    ctx.stroke()
  }

  ctx.draw()
}

// 绘制趋势折线图
function drawTrendChart() {
  const ctx = uni.createCanvasContext('trendCanvas', instance)
  const sysInfo = uni.getSystemInfoSync()
  const canvasWidth = sysInfo.windowWidth - 64 // 左右各 32px padding
  const canvasHeight = 200

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const points = trendData.value?.dataPoints || []
  if (points.length === 0) {
    ctx.draw()
    return
  }

  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40
  const chartWidth = canvasWidth - paddingLeft - paddingRight
  const chartHeight = canvasHeight - paddingTop - paddingBottom

  const values = points.map((p) => p.value)
  let minVal = Math.min(...values)
  let maxVal = Math.max(...values)
  // 避免 min === max
  if (minVal === maxVal) {
    minVal = minVal - 1
    maxVal = maxVal + 1
  }
  const valRange = maxVal - minVal

  // 获取安全范围
  const aquarium = aquariumStore.aquariums[aquariumIndex.value]
  const safeRange = aquarium ? (aquarium.safeRanges as any)[selectedParam.value] : null

  // 坐标转换
  function toX(i: number): number {
    return paddingLeft + (i / Math.max(points.length - 1, 1)) * chartWidth
  }
  function toY(v: number): number {
    return paddingTop + chartHeight - ((v - minVal) / valRange) * chartHeight
  }

  // 绘制坐标轴
  ctx.setStrokeStyle('#E0E0E0')
  ctx.setLineWidth(1)
  ctx.beginPath()
  ctx.moveTo(paddingLeft, paddingTop)
  ctx.lineTo(paddingLeft, paddingTop + chartHeight)
  ctx.lineTo(paddingLeft + chartWidth, paddingTop + chartHeight)
  ctx.stroke()

  // 绘制安全范围区域
  if (safeRange) {
    const safeMinY = toY(Math.max(safeRange.min, minVal))
    const safeMaxY = toY(Math.min(safeRange.max, maxVal))
    ctx.setFillStyle('rgba(30, 136, 229, 0.08)')
    ctx.fillRect(paddingLeft, safeMaxY, chartWidth, safeMinY - safeMaxY)
  }

  // 绘制网格线
  const gridCount = 4
  ctx.setStrokeStyle('#F5F5F5')
  ctx.setLineWidth(0.5)
  ctx.setFontSize(10)
  ctx.setFillStyle('#999999')
  for (let i = 0; i <= gridCount; i++) {
    const yVal = minVal + (valRange * i) / gridCount
    const y = toY(yVal)
    ctx.beginPath()
    ctx.moveTo(paddingLeft, y)
    ctx.lineTo(paddingLeft + chartWidth, y)
    ctx.stroke()
    ctx.setTextAlign('right')
    ctx.fillText(yVal.toFixed(1), paddingLeft - 6, y + 4)
  }

  // 绘制折线
  ctx.setStrokeStyle('#1E88E5')
  ctx.setLineWidth(2)
  ctx.setLineJoin('round')
  ctx.beginPath()
  points.forEach((p, i) => {
    const x = toX(i)
    const y = toY(p.value)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  // 绘制数据点
  points.forEach((p, i) => {
    const x = toX(i)
    const y = toY(p.value)
    ctx.setFillStyle('#FFFFFF')
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.setStrokeStyle('#1E88E5')
    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.stroke()
  })

  // 绘制平均线（虚线）
  if (trendData.value) {
    const avgY = toY(trendData.value.avg)
    ctx.setStrokeStyle('#F39C12')
    ctx.setLineWidth(1)
    ctx.setLineDash([6, 4], 0)
    ctx.beginPath()
    ctx.moveTo(paddingLeft, avgY)
    ctx.lineTo(paddingLeft + chartWidth, avgY)
    ctx.stroke()
    ctx.setLineDash([], 0)

    // 平均值标签
    ctx.setFillStyle('#F39C12')
    ctx.setFontSize(9)
    ctx.setTextAlign('left')
    ctx.fillText(`均:${trendData.value.avg}`, paddingLeft + chartWidth + 2, avgY + 3)
  }

  // 绘制日期标签
  ctx.setFillStyle('#999999')
  ctx.setFontSize(9)
  ctx.setTextAlign('center')
  const labelStep = Math.max(1, Math.floor(points.length / 5))
  points.forEach((p, i) => {
    if (i % labelStep === 0 || i === points.length - 1) {
      const x = toX(i)
      const dateStr = p.date.slice(5) // MM-DD
      ctx.fillText(dateStr, x, paddingTop + chartHeight + 16)
    }
  })

  ctx.draw()
}

// 监听参数和周期变化
watch([selectedParam, selectedPeriod], () => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.trends-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
}

.picker-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.picker-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.picker-value-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.picker-value {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-right: 8rpx;
}

.picker-arrow {
  font-size: $font-sm;
  color: $text-light;
}

.card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

/* 健康评分卡片 */
.score-card {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.score-ring {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-right: $spacing-lg;
}

.score-canvas {
  width: 160rpx;
  height: 160rpx;
}

.score-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48rpx;
  font-weight: $font-weight-bold;
}

.score-info {
  display: flex;
  flex-direction: column;
}

.score-label {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  margin-bottom: 8rpx;
}

.score-desc {
  font-size: $font-sm;
  color: $text-light;
}

/* 参数标签 */
.param-tabs {
  white-space: nowrap;
  margin-bottom: $spacing-sm;
}

.param-tab {
  display: inline-flex;
  padding: 12rpx 24rpx;
  border-radius: $radius-pill;
  margin-right: 16rpx;
  background: #F0F0F0;
  transition: all 0.2s;

  &.active {
    background: $primary-color;
  }
}

.param-tab-text {
  font-size: $font-sm;
  color: $text-secondary;

  .param-tab.active & {
    color: #FFFFFF;
    font-weight: $font-weight-medium;
  }
}

/* 时间范围 */
.period-group {
  display: flex;
  flex-direction: row;
  margin-bottom: $spacing-md;
}

.period-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 0;
  border: 2rpx solid #E0E0E0;
  margin-right: -2rpx;

  &:first-child {
    border-radius: $radius-sm 0 0 $radius-sm;
  }
  &:last-child {
    border-radius: 0 $radius-sm $radius-sm 0;
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    z-index: 1;
  }
}

.period-btn-text {
  font-size: $font-xs;
  color: $text-secondary;

  .period-btn.active & {
    color: #FFFFFF;
    font-weight: $font-weight-medium;
  }
}

/* 折线图画布 */
.trend-canvas {
  width: 100%;
  height: 400rpx;
  margin-bottom: $spacing-sm;
}

/* 统计摘要 */
.summary-row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: $spacing-sm;
  border-top: 2rpx solid #F0F0F0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: $font-xs;
  color: $text-light;
  margin-bottom: 4rpx;
}

.summary-value {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.highlight-max {
  color: $error-color;
}

.highlight-min {
  color: $primary-color;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
}

.no-data-text {
  font-size: $font-sm;
  color: $text-light;
}

/* 维护统计 */
.maintenance-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.maintenance-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm 0;
}

.maintenance-num {
  font-size: 48rpx;
  font-weight: $font-weight-bold;
  color: $primary-color;
  margin-bottom: 4rpx;
}

.maintenance-label {
  font-size: $font-xs;
  color: $text-secondary;
}
</style>
