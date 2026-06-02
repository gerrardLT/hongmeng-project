<template>
  <view class="plan-card" @click="emit('click', plan.planId)">
    <view class="plan-header">
      <text class="plan-name">{{ plan.name }}</text>
      <view class="plan-status" :class="`status-${plan.status}`">
        <text class="plan-status-text">{{ statusMap[plan.status] }}</text>
      </view>
    </view>

    <view class="plan-meta">
      <view class="meta-item">
        <text class="meta-label">周期</text>
        <text class="meta-value">{{ plan.duration }}周</text>
      </view>
      <view v-if="plan.targetRace" class="meta-item">
        <text class="meta-label">目标赛事</text>
        <text class="meta-value">{{ plan.targetRace }}</text>
      </view>
      <view class="meta-item">
        <text class="meta-label">开始日期</text>
        <text class="meta-value">{{ plan.startDate }}</text>
      </view>
    </view>

    <view class="progress-section">
      <view class="progress-header">
        <text class="progress-label">训练进度</text>
        <text class="progress-text">{{ completedDays }}/{{ totalDays }}天</text>
      </view>
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TrainingPlan, TrainingStatus } from '@/types/models'

const props = defineProps<{
  plan: TrainingPlan
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const statusMap: Record<TrainingStatus, string> = {
  active: '进行中',
  completed: '已完成',
  paused: '已暂停'
}

const totalDays = computed(() => props.plan.schedule.length)
const completedDays = computed(() => props.plan.schedule.filter(d => d.completed).length)
const progressPercent = computed(() => {
  if (totalDays.value === 0) return 0
  return Math.round((completedDays.value / totalDays.value) * 100)
})
</script>

<style scoped lang="scss">
.plan-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.plan-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.plan-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #212121;
  flex: 1;
  margin-right: 16rpx;
}

.plan-status {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.plan-status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.status-active {
  background: #FFF3E0;
  .plan-status-text { color: #FF9800; }
}

.status-completed {
  background: #E8F5E9;
  .plan-status-text { color: #4CAF50; }
}

.status-paused {
  background: #F5F5F5;
  .plan-status-text { color: #9E9E9E; }
}

.plan-meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.meta-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

.progress-section {
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.progress-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #666666;
}

.progress-text {
  font-size: 24rpx;
  color: #FF5722;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5722, #FF7043);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}
</style>
