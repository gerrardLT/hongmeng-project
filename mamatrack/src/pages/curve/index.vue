<template>
  <view class="page">
    <!-- 顶部切换栏 -->
    <view class="tab-bar">
      <view
        class="tab-bar__item"
        :class="mode === 'weight' ? 'tab-bar__item--active' : ''"
        @click="switchMode('weight')"
      >
        <text class="tab-bar__text">体重曲线</text>
        <view v-if="mode === 'weight'" class="tab-bar__indicator" />
      </view>
      <view
        class="tab-bar__item"
        :class="mode === 'gain' ? 'tab-bar__item--active' : ''"
        @click="switchMode('gain')"
      >
        <text class="tab-bar__text">增重曲线</text>
        <view v-if="mode === 'gain'" class="tab-bar__indicator" />
      </view>
    </view>

    <!-- 主图表区 -->
    <view class="chart-section">
      <CurveChart
        :personal-points="personalPoints"
        :standard-range="standardRange"
        :population-curve="populationCurve"
        :mode="mode"
        :pre-weight="preWeight"
        :width="700"
        :height="420"
        @point-click="onPointClick"
      />
    </view>

    <!-- 统计面板 -->
    <view class="section">
      <StatPanel
        :total-gain="totalGain"
        :weekly-avg-gain="weeklyAvgGain"
        :gain-status="gainStatus"
        :current-week="currentWeek.week"
        :estimated-total="estimatedTotal"
      />
    </view>

    <!-- 健康评估卡片 -->
    <view class="section">
      <view class="eval-card" :class="evalCardClass">
        <view class="eval-card__header">
          <text class="eval-card__icon">{{ evalIcon }}</text>
          <text class="eval-card__title">{{ evalTitle }}</text>
        </view>
        <text class="eval-card__desc">{{ evalDesc }}</text>
        <view class="eval-card__range">
          <text class="eval-card__range-label">推荐增重范围：</text>
          <text class="eval-card__range-value">{{ recommendRange }}</text>
        </view>
      </view>
    </view>

    <!-- 最近记录列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近记录</text>
        <text class="section-more" @click="goWeightList">查看全部 ></text>
      </view>
      <view class="record-list">
        <WeightCard
          v-for="record in recentRecords"
          :key="record.recordId"
          :record="record"
          @click="onRecordClick(record)"
          @delete="onDeleteRecord(record.recordId)"
        />
      </view>
    </view>

    <!-- 数据点详情弹窗 -->
    <view v-if="detailVisible" class="detail-popup" @click="closeDetail">
      <view class="detail-popup__mask" />
      <view class="detail-popup__content" @click.stop>
        <view class="detail-popup__header">
          <text class="detail-popup__title">数据详情</text>
          <text class="detail-popup__close" @click="closeDetail">×</text>
        </view>
        <view class="detail-popup__body">
          <view class="detail-popup__row">
            <text class="detail-popup__label">日期</text>
            <text class="detail-popup__value">{{ detailInfo.date }}</text>
          </view>
          <view class="detail-popup__row">
            <text class="detail-popup__label">孕周</text>
            <text class="detail-popup__value">{{ detailInfo.week }}</text>
          </view>
          <view class="detail-popup__row">
            <text class="detail-popup__label">体重</text>
            <text class="detail-popup__value">{{ detailInfo.weight }}</text>
          </view>
          <view class="detail-popup__row">
            <text class="detail-popup__label">增重</text>
            <text class="detail-popup__value">{{ detailInfo.gain }}</text>
          </view>
          <view class="detail-popup__row">
            <text class="detail-popup__label">状态</text>
            <text class="detail-popup__value" :class="detailInfo.statusClass">{{ detailInfo.status }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePregnancyStore } from '@/store/pregnancy'
import { recordsToWeightPoints, recordsToGainPoints } from '@/utils/chart'
import { generateStandardCurve, generatePopulationCurve, getRecommendedGainRange, estimateTotalGain } from '@/utils/pregnancy'
import { formatDate, formatWeek } from '@/utils/format'
import { getWeightStats, deleteWeightRecord } from '@/services/weight'
import type { ChartPoint } from '@/utils/chart'
import type { GainStatus } from '@/types/models'
import CurveChart from '@/components/CurveChart.vue'
import StatPanel from '@/components/StatPanel.vue'
import WeightCard from '@/components/WeightCard.vue'

const pregnancyStore = usePregnancyStore()

const mode = ref<'weight' | 'gain'>('weight')
const detailVisible = ref(false)
const detailPoint = ref<ChartPoint | null>(null)

const currentProfile = computed(() => pregnancyStore.currentProfile)
const currentWeek = computed(() => pregnancyStore.currentWeek)
const totalGain = computed(() => pregnancyStore.totalGain)
const weeklyAvgGain = computed(() => pregnancyStore.weeklyAvgGain)
const gainStatus = computed(() => pregnancyStore.gainStatus)
const sortedRecords = computed(() => pregnancyStore.sortedRecords)

const preWeight = computed(() => currentProfile.value?.preWeight || 0)

const estimatedTotal = computed(() => {
  if (!currentProfile.value) return 0
  return estimateTotalGain(totalGain.value, currentWeek.value.week, currentProfile.value.bmiCategory)
})

const personalPoints = computed(() => {
  if (!sortedRecords.value.length) return []
  if (mode.value === 'weight') {
    return recordsToWeightPoints(sortedRecords.value)
  }
  return recordsToGainPoints(sortedRecords.value)
})

const standardRange = computed(() => {
  if (!currentProfile.value) return []
  if (mode.value === 'weight') {
    const base = preWeight.value
    const gainRange = generateStandardCurve(currentProfile.value.bmiCategory)
    return gainRange.map((item) => ({
      week: item.week,
      min: parseFloat((item.min + base).toFixed(2)),
      max: parseFloat((item.max + base).toFixed(2))
    }))
  }
  return generateStandardCurve(currentProfile.value.bmiCategory)
})

const populationCurve = computed(() => {
  if (!currentProfile.value) return []
  if (mode.value === 'weight') {
    const base = preWeight.value
    const gainCurve = generatePopulationCurve(currentProfile.value.bmiCategory)
    return gainCurve.map((item) => ({
      week: item.week,
      avg: parseFloat((item.avg + base).toFixed(2))
    }))
  }
  return generatePopulationCurve(currentProfile.value.bmiCategory)
})

const recentRecords = computed(() => {
  const reversed = [...sortedRecords.value].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  return reversed.slice(0, 5)
})

const recommendRange = computed(() => {
  if (!currentProfile.value) return '--'
  const range = getRecommendedGainRange(currentProfile.value.bmiCategory)
  return `${range.min} ~ ${range.max} kg`
})

const evalCardClass = computed(() => {
  const map: Record<GainStatus, string> = {
    low: 'eval-card--low',
    normal: 'eval-card--normal',
    high: 'eval-card--high'
  }
  return map[gainStatus.value]
})

const evalIcon = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '💙',
    normal: '✅',
    high: '⚠️'
  }
  return map[gainStatus.value]
})

const evalTitle = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '增重偏低',
    normal: '增重正常',
    high: '增重偏高'
  }
  return map[gainStatus.value]
})

const evalDesc = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '当前增重低于推荐范围，建议适当增加营养摄入，保证胎儿发育所需。如有疑虑请咨询医生。',
    normal: '当前增重处于推荐范围内，继续保持良好的饮食和运动习惯，定期产检。',
    high: '当前增重高于推荐范围，建议适当控制饮食，增加适度运动，避免体重增长过快。'
  }
  return map[gainStatus.value]
})

const detailInfo = computed(() => {
  if (!detailPoint.value) {
    return { date: '', week: '', weight: '', gain: '', status: '', statusClass: '' }
  }
  const point = detailPoint.value
  const record = sortedRecords.value.find(
    (r) => {
      const xMatch = Math.abs(r.week + (r.weekDay || 0) / 7 - point.x) < 0.01
      const yMatch = mode.value === 'weight'
        ? Math.abs(r.weight - point.y) < 0.01
        : Math.abs(r.gainFromPre - point.y) < 0.01
      return xMatch && yMatch
    }
  )
  if (record) {
    const stats = getWeightStats()
    return {
      date: formatDate(record.date),
      week: formatWeek(record.week, record.weekDay),
      weight: `${record.weight.toFixed(1)} kg`,
      gain: `${record.gainFromPre > 0 ? '+' : ''}${record.gainFromPre.toFixed(1)} kg`,
      status: stats.gainStatus === 'low' ? '偏低' : stats.gainStatus === 'high' ? '偏高' : '正常',
      statusClass: stats.gainStatus === 'low' ? 'status--low' : stats.gainStatus === 'high' ? 'status--high' : 'status--normal'
    }
  }

  const weekNum = Math.floor(point.x)
  const weekDay = Math.round((point.x - weekNum) * 7)
  const actualWeight = mode.value === 'weight' ? point.y : preWeight.value + point.y
  const actualGain = mode.value === 'weight' ? point.y - preWeight.value : point.y
  return {
    date: point.label || '',
    week: formatWeek(weekNum, weekDay),
    weight: `${actualWeight.toFixed(1)} kg`,
    gain: `${actualGain > 0 ? '+' : ''}${actualGain.toFixed(1)} kg`,
    status: '正常',
    statusClass: 'status--normal'
  }
})

function switchMode(newMode: 'weight' | 'gain') {
  mode.value = newMode
}

function onPointClick(point: ChartPoint) {
  detailPoint.value = point
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  detailPoint.value = null
}

function onRecordClick(record: { recordId: string }) {
  uni.showToast({ title: '记录详情功能开发中', icon: 'none' })
}

function onDeleteRecord(recordId: string) {
  deleteWeightRecord(recordId)
  uni.showToast({ title: '已删除', icon: 'none' })
  pregnancyStore.init()
}

function goWeightList() {
  uni.showToast({ title: '全部记录功能开发中', icon: 'none' })
}

onShow(() => {
  pregnancyStore.init()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

// 顶部切换栏
.tab-bar {
  display: flex;
  flex-direction: row;
  background: #ffffff;
  padding: 0 32rpx;
  border-bottom: 1rpx solid $border-color;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 0 16rpx;
    position: relative;

    &--active {
      .tab-bar__text {
        color: $primary-color;
        font-weight: 700;
      }
    }
  }

  &__text {
    font-size: $font-md;
    color: $text-secondary;
  }

  &__indicator {
    position: absolute;
    bottom: 0;
    width: 64rpx;
    height: 6rpx;
    background: $primary-color;
    border-radius: 3rpx;
  }
}

// 图表区
.chart-section {
  background: #ffffff;
  padding: 24rpx 0;
  margin-bottom: 16rpx;
}

// 分区
.section {
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: $font-lg;
  font-weight: 700;
  color: $text-primary;
}

.section-more {
  font-size: $font-sm;
  color: $primary-color;
}

// 记录列表
.record-list {
  display: flex;
  flex-direction: column;
}

// 健康评估卡片
.eval-card {
  background: #ffffff;
  border-radius: $border-radius;
  padding: 28rpx;
  box-shadow: $shadow-sm;
  border-left: 8rpx solid $success-color;

  &--low {
    border-left-color: $info-color;
  }

  &--normal {
    border-left-color: $success-color;
  }

  &--high {
    border-left-color: $warning-color;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__icon {
    font-size: 36rpx;
    margin-right: 10rpx;
  }

  &__title {
    font-size: $font-md;
    font-weight: 700;
    color: $text-primary;
  }

  &__desc {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: 16rpx;
  }

  &__range {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  &__range-label {
    font-size: $font-sm;
    color: $text-hint;
  }

  &__range-value {
    font-size: $font-sm;
    color: $primary-color;
    font-weight: 600;
  }
}

// 数据点详情弹窗
.detail-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  &__mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
  }

  &__content {
    position: relative;
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx;
    animation: slideUp 0.25s ease-out;
  }

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: $font-lg;
    font-weight: 700;
    color: $text-primary;
  }

  &__close {
    font-size: 48rpx;
    color: $text-hint;
    line-height: 1;
    padding: 0 8rpx;
  }

  &__body {
    display: flex;
    flex-direction: column;
  }

  &__row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid $border-color;

    &:last-child {
      border-bottom: none;
    }
  }

  &__label {
    font-size: $font-base;
    color: $text-secondary;
  }

  &__value {
    font-size: $font-base;
    font-weight: 600;
    color: $text-primary;

    &.status--low {
      color: $info-color;
    }

    &.status--normal {
      color: $success-color;
    }

    &.status--high {
      color: $warning-color;
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
