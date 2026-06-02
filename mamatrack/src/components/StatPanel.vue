<template>
  <view class="stat-panel">
    <view class="stat-panel__item">
      <text class="stat-panel__icon">📈</text>
      <text class="stat-panel__value">{{ formatGainValue(totalGain) }}</text>
      <text class="stat-panel__label">总增重</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">📊</text>
      <text class="stat-panel__value stat-panel__value--weekly">{{ formatGainValue(weeklyAvgGain) }}</text>
      <text class="stat-panel__label">周均增重</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">{{ statusIcon }}</text>
      <text class="stat-panel__value" :class="statusClass">{{ statusText }}</text>
      <text class="stat-panel__label">增重状态</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">📅</text>
      <text class="stat-panel__value stat-panel__value--week">{{ currentWeek }}周</text>
      <text class="stat-panel__label">当前孕周</text>
    </view>
    <view v-if="estimatedTotal !== undefined" class="stat-panel__item">
      <text class="stat-panel__icon">🎯</text>
      <text class="stat-panel__value stat-panel__value--estimate">{{ formatGainValue(estimatedTotal) }}</text>
      <text class="stat-panel__label">预估总增重</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GainStatus } from '@/types/models'

const props = withDefaults(defineProps<{
  totalGain: number
  weeklyAvgGain: number
  gainStatus: GainStatus
  currentWeek: number
  estimatedTotal?: number
}>(), {})

const statusText = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '偏低',
    normal: '正常',
    high: '偏高'
  }
  return map[props.gainStatus]
})

const statusIcon = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '💙',
    normal: '✅',
    high: '⚠️'
  }
  return map[props.gainStatus]
})

const statusClass = computed(() => {
  const map: Record<GainStatus, string> = {
    low: 'stat-panel__value--low',
    normal: 'stat-panel__value--normal',
    high: 'stat-panel__value--high'
  }
  return map[props.gainStatus]
})

function formatGainValue(val: number): string {
  const sign = val > 0 ? '+' : ''
  return `${sign}${val.toFixed(1)}kg`
}
</script>

<style scoped lang="scss">
.stat-panel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);

  &__item {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12rpx 0;
  }

  &__icon {
    font-size: 40rpx;
    margin-bottom: 8rpx;
  }

  &__value {
    font-size: 36rpx;
    font-weight: 700;
    color: #E91E8C;
    line-height: 1.2;

    &--weekly {
      color: #2196F3;
    }

    &--week {
      color: #FF9800;
    }

    &--estimate {
      color: #9C27B0;
    }

    &--low {
      color: #2196F3;
    }

    &--normal {
      color: #4CAF50;
    }

    &--high {
      color: #FF9800;
    }
  }

  &__label {
    font-size: 24rpx;
    color: #999999;
    margin-top: 4rpx;
  }
}
</style>
