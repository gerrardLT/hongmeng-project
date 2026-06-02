<template>
  <view class="page">
    <!-- 顶部欢迎区 -->
    <view class="welcome-section">
      <view class="welcome-content">
        <text class="welcome-hello">你好，孕妈妈</text>
        <text class="welcome-date">{{ todayStr }}</text>
      </view>
      <view v-if="hasProfile" class="week-badge">
        <text class="week-badge__text">第{{ currentWeek.week }}周</text>
        <text v-if="currentWeek.day > 0" class="week-badge__sub">+{{ currentWeek.day }}天</text>
      </view>
    </view>

    <!-- 未设置档案引导 -->
    <view v-if="!hasProfile" class="guide-card">
      <text class="guide-card__icon">🤰</text>
      <text class="guide-card__title">欢迎来到 MamaTrack</text>
      <text class="guide-card__desc">记录孕期体重变化，科学管理增重，守护母婴健康</text>
      <view class="guide-card__btn" @click="goSetup">
        <text class="guide-card__btn-text">创建孕期档案</text>
      </view>
    </view>

    <!-- 已设置档案 -->
    <view v-else class="content">
      <!-- 快捷记录卡片 -->
      <view class="quick-card">
        <view class="quick-card__header">
          <text class="quick-card__title">体重记录</text>
        </view>
        <view v-if="latestWeight" class="quick-card__body">
          <view class="quick-card__info">
            <text class="quick-card__weight">{{ latestWeight.weight.toFixed(1) }}</text>
            <text class="quick-card__unit">kg</text>
            <view class="quick-card__gain" :class="latestWeight.gainFromLast > 0 ? 'quick-card__gain--up' : latestWeight.gainFromLast < 0 ? 'quick-card__gain--down' : ''">
              <text class="quick-card__gain-text">{{ formatGain(latestWeight.gainFromLast) }}</text>
            </view>
          </view>
          <text class="quick-card__date">{{ formatDate(latestWeight.date) }} 记录</text>
        </view>
        <view v-else class="quick-card__body quick-card__body--empty">
          <text class="quick-card__empty-text">还没有记录哦</text>
        </view>
        <view class="quick-card__footer">
          <view class="quick-card__btn" @click="goAddWeight">
            <text class="quick-card__btn-text">+ 记录体重</text>
          </view>
        </view>
      </view>

      <!-- 本周增重状态卡片 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">本周状态</text>
        </view>
        <view class="stats-grid">
          <view class="stats-grid__item">
            <text class="stats-grid__value">{{ currentWeightStr }}</text>
            <text class="stats-grid__label">当前体重</text>
          </view>
          <view class="stats-grid__item">
            <text class="stats-grid__value" :class="gainStatusClass">{{ totalGainStr }}</text>
            <text class="stats-grid__label">总增重</text>
          </view>
          <view class="stats-grid__item">
            <text class="stats-grid__value">{{ weeklyAvgStr }}</text>
            <text class="stats-grid__label">周均增重</text>
          </view>
          <view class="stats-grid__item">
            <text class="stats-grid__value" :class="gainStatusClass">{{ statusText }}</text>
            <text class="stats-grid__label">增重状态</text>
          </view>
        </view>
      </view>

      <!-- 体重曲线概览 -->
      <view class="section">
        <view class="section-header" @click="goCurve">
          <text class="section-title">体重趋势</text>
          <text class="section-more">查看详情 ></text>
        </view>
        <view class="chart-card">
          <CurveChart
            :personal-points="chartPoints"
            :standard-range="standardRange"
            :population-curve="populationCurve"
            mode="weight"
            :pre-weight="preWeight"
            :width="686"
            :height="320"
          />
        </view>
      </view>

      <!-- 健康小贴士 -->
      <view class="section">
        <view class="tip-card">
          <view class="tip-card__header">
            <text class="tip-card__icon">💡</text>
            <text class="tip-card__title">健康小贴士</text>
          </view>
          <text class="tip-card__content">{{ weeklyTip }}</text>
        </view>
      </view>

      <!-- 距下次产检提醒 -->
      <view v-if="nextCheckupDays !== null" class="section">
        <view class="checkup-card">
          <text class="checkup-card__icon">🏥</text>
          <text class="checkup-card__text">距下次产检还有 <text class="checkup-card__highlight">{{ nextCheckupDays }}</text> 天</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePregnancyStore } from '@/store/pregnancy'
import { useReminderStore } from '@/store/reminder'
import { formatDate, formatGain, formatDaysUntil } from '@/utils/format'
import { getWeeklyTip } from '@/utils/pregnancy'
import { recordsToWeightPoints } from '@/utils/chart'
import { generateStandardCurve, generatePopulationCurve } from '@/utils/pregnancy'
import { getRecentWeeksData } from '@/utils/chart'
import CurveChart from '@/components/CurveChart.vue'

const pregnancyStore = usePregnancyStore()
const reminderStore = useReminderStore()

const hasProfile = computed(() => pregnancyStore.hasProfile)
const currentWeek = computed(() => pregnancyStore.currentWeek)
const latestWeight = computed(() => pregnancyStore.latestWeight)
const totalGain = computed(() => pregnancyStore.totalGain)
const weeklyAvgGain = computed(() => pregnancyStore.weeklyAvgGain)
const gainStatus = computed(() => pregnancyStore.gainStatus)

const todayStr = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
})

const currentWeightStr = computed(() => {
  if (!latestWeight.value) return '--'
  return `${latestWeight.value.weight.toFixed(1)}kg`
})

const totalGainStr = computed(() => {
  const sign = totalGain.value > 0 ? '+' : ''
  return `${sign}${totalGain.value.toFixed(1)}kg`
})

const weeklyAvgStr = computed(() => {
  const sign = weeklyAvgGain.value > 0 ? '+' : ''
  return `${sign}${weeklyAvgGain.value.toFixed(1)}kg`
})

const statusText = computed(() => {
  const map = { low: '偏低', normal: '正常', high: '偏高' }
  return map[gainStatus.value]
})

const gainStatusClass = computed(() => {
  const map = { low: 'status--low', normal: 'status--normal', high: 'status--high' }
  return map[gainStatus.value]
})

const weeklyTip = computed(() => {
  return getWeeklyTip(currentWeek.value.week)
})

const nextCheckupDays = computed(() => {
  const date = reminderStore.settings.nextCheckupDate
  if (!date) return null
  const days = formatDaysUntil(date)
  return days
})

const preWeight = computed(() => pregnancyStore.currentProfile?.preWeight || 0)

const chartPoints = computed(() => {
  if (!pregnancyStore.weightRecords.length) return []
  const recent = getRecentWeeksData(pregnancyStore.weightRecords, 8)
  return recordsToWeightPoints(recent)
})

const standardRange = computed(() => {
  const profile = pregnancyStore.currentProfile
  if (!profile) return []
  return generateStandardCurve(profile.bmiCategory)
})

const populationCurve = computed(() => {
  const profile = pregnancyStore.currentProfile
  if (!profile) return []
  return generatePopulationCurve(profile.bmiCategory)
})

function goSetup() {
  uni.navigateTo({ url: '/pages/setup/index' })
}

function goAddWeight() {
  uni.navigateTo({ url: '/pages/weight/add' })
}

function goCurve() {
  uni.switchTab({ url: '/pages/curve/index' })
}

onShow(() => {
  pregnancyStore.init()
  reminderStore.init()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

// 顶部欢迎区
.welcome-section {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 48rpx 32rpx 40rpx;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  display: flex;
  flex-direction: column;
}

.welcome-hello {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.welcome-date {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.week-badge {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  &__text {
    font-size: 32rpx;
    font-weight: 700;
    color: #ffffff;
  }

  &__sub {
    font-size: 22rpx;
    color: rgba(255, 255, 255, 0.85);
    margin-top: 2rpx;
  }
}

// 引导卡片
.guide-card {
  margin: 32rpx;
  background: #ffffff;
  border-radius: $border-radius-lg;
  padding: 64rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $shadow-md;

  &__icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  &__title {
    font-size: $font-xl;
    font-weight: 700;
    color: $text-primary;
    margin-bottom: 12rpx;
  }

  &__desc {
    font-size: $font-base;
    color: $text-secondary;
    text-align: center;
    margin-bottom: 40rpx;
    line-height: 1.5;
  }

  &__btn {
    padding: 24rpx 64rpx;
    background: linear-gradient(135deg, $primary-color, $primary-light);
    border-radius: $border-radius-round;
    box-shadow: 0 4rpx 16rpx rgba(233, 30, 140, 0.3);
  }

  &__btn-text {
    font-size: $font-lg;
    color: #ffffff;
    font-weight: 700;
  }
}

// 内容区
.content {
  padding: 0 24rpx;
}

// 快捷记录卡片
.quick-card {
  margin-top: -24rpx;
  background: linear-gradient(135deg, #E91E8C, #D81B9F);
  border-radius: $border-radius-lg;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(233, 30, 140, 0.25);

  &__header {
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: $font-lg;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  &__body {
    display: flex;
    flex-direction: column;
    margin-bottom: 20rpx;

    &--empty {
      padding: 24rpx 0;
    }
  }

  &__info {
    display: flex;
    flex-direction: row;
    align-items: baseline;
  }

  &__weight {
    font-size: 64rpx;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.1;
  }

  &__unit {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-left: 8rpx;
    margin-right: 16rpx;
  }

  &__gain {
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.2);

    &--up {
      background: rgba(255, 200, 200, 0.3);
    }

    &--down {
      background: rgba(200, 255, 220, 0.3);
    }
  }

  &__gain-text {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: 500;
  }

  &__date {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 8rpx;
  }

  &__empty-text {
    font-size: 30rpx;
    color: rgba(255, 255, 255, 0.7);
  }

  &__footer {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }

  &__btn {
    padding: 14rpx 32rpx;
    background: rgba(255, 255, 255, 0.25);
    border-radius: $border-radius-round;
    border: 1rpx solid rgba(255, 255, 255, 0.4);
  }

  &__btn-text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 600;
  }
}

// 分区
.section {
  margin-top: 32rpx;
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

// 统计网格
.stats-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background: #ffffff;
  border-radius: $border-radius;
  padding: 24rpx 16rpx;
  box-shadow: $shadow-sm;

  &__item {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 0;
  }

  &__value {
    font-size: 36rpx;
    font-weight: 700;
    color: $primary-color;
    line-height: 1.2;

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

  &__label {
    font-size: 24rpx;
    color: $text-hint;
    margin-top: 6rpx;
  }
}

// 图表卡片
.chart-card {
  background: #ffffff;
  border-radius: $border-radius;
  padding: 16rpx;
  box-shadow: $shadow-sm;
}

// 健康小贴士
.tip-card {
  background: #ffffff;
  border-radius: $border-radius;
  padding: 28rpx;
  box-shadow: $shadow-sm;
  border-left: 8rpx solid $primary-color;

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__icon {
    font-size: 32rpx;
    margin-right: 10rpx;
  }

  &__title {
    font-size: $font-md;
    font-weight: 600;
    color: $text-primary;
  }

  &__content {
    font-size: $font-base;
    color: $text-secondary;
    line-height: 1.6;
  }
}

// 产检提醒
.checkup-card {
  background: linear-gradient(135deg, #FFF0F5, #FFF5F8);
  border-radius: $border-radius;
  padding: 28rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: $shadow-sm;
  border: 1rpx solid rgba(233, 30, 140, 0.1);

  &__icon {
    font-size: 40rpx;
    margin-right: 16rpx;
  }

  &__text {
    font-size: $font-base;
    color: $text-secondary;
  }

  &__highlight {
    font-size: 40rpx;
    font-weight: 700;
    color: $primary-color;
    margin: 0 4rpx;
  }
}
</style>
