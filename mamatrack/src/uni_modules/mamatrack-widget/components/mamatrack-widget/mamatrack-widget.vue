<template>
  <view class="widget">
    <!-- 孕周大字显示 -->
    <view class="week-area">
      <text class="week-label">当前孕周</text>
      <view class="week-row">
        <text class="week-number">{{ currentWeek }}</text>
        <text class="week-unit">周</text>
      </view>
    </view>

    <!-- 体重信息 -->
    <view class="info-area">
      <view class="info-item">
        <text class="info-label">最新体重</text>
        <text class="info-value">{{ latestWeight }} kg</text>
      </view>
      <view class="info-divider" />
      <view class="info-item">
        <text class="info-label">周增重</text>
        <text class="info-value" :class="gainStatusClass">{{ weeklyGainLabel }}</text>
      </view>
    </view>

    <!-- 增重状态标识 -->
    <view class="status-bar">
      <view class="status-dot" :class="'status-dot--' + gainStatus" />
      <text class="status-text">{{ gainStatusLabel }}</text>
    </view>

    <!-- 快捷入口 -->
    <view class="action-btn" @click="onRecordWeight">
      <text class="action-btn-text">记录体重</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePregnancyStore } from '@/store/pregnancy'
import type { GainStatus } from '@/types/models'

const pregnancyStore = usePregnancyStore()

const currentWeek = computed(() => {
  return pregnancyStore.currentWeek.week || 0
})

const latestWeight = computed(() => {
  const w = pregnancyStore.latestWeight?.weight
  return w ? w.toFixed(1) : '--'
})

const weeklyGain = computed(() => {
  const profile = pregnancyStore.currentProfile
  const records = pregnancyStore.sortedRecords
  const week = pregnancyStore.currentWeek.week
  if (!profile || records.length === 0) return 0

  const thisWeekRecords = records.filter((r) => r.week === week)
  const lastWeekRecords = records.filter((r) => r.week === week - 1)
  if (thisWeekRecords.length === 0) return 0

  const startWeight = lastWeekRecords.length > 0
    ? lastWeekRecords[lastWeekRecords.length - 1].weight
    : profile.preWeight
  return Number((thisWeekRecords[thisWeekRecords.length - 1].weight - startWeight).toFixed(1))
})

const weeklyGainLabel = computed(() => {
  if (weeklyGain.value === 0) return '0.0 kg'
  return `${weeklyGain.value > 0 ? '+' : ''}${weeklyGain.value} kg`
})

const gainStatus = computed<GainStatus>(() => {
  return pregnancyStore.gainStatus
})

const gainStatusLabel = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '偏低',
    normal: '正常',
    high: '偏高'
  }
  return map[gainStatus.value]
})

const gainStatusClass = computed(() => {
  const map: Record<GainStatus, string> = {
    low: 'info-value--low',
    normal: 'info-value--normal',
    high: 'info-value--high'
  }
  return map[gainStatus.value]
})

function onRecordWeight() {
  uni.navigateTo({ url: '/pages/weight/add' })
}

onMounted(() => {
  pregnancyStore.init()
})
</script>

<style scoped lang="scss">
.widget {
  background: linear-gradient(135deg, #E91E8C, #FF6EB4);
  border-radius: 24rpx;
  padding: 24rpx;
  color: #FFFFFF;
}

.week-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.week-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 4rpx;
}

.week-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.week-number {
  font-size: 72rpx;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1;
}

.week-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 8rpx;
}

.info-area {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16rpx;
  padding: 16rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4rpx;
}

.info-value {
  font-size: 26rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.info-value--low {
  color: #B3E5FC;
}

.info-value--normal {
  color: #FFFFFF;
}

.info-value--high {
  color: #FFE0B2;
}

.info-divider {
  width: 1rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.25);
}

.status-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.status-dot--low {
  background: #B3E5FC;
}

.status-dot--normal {
  background: #C8E6C9;
}

.status-dot--high {
  background: #FFE0B2;
}

.status-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.action-btn {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 32rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: bold;
}
</style>
