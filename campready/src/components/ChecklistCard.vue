<template>
  <view class="checklist-card" @click="emit('click')">
    <view class="checklist-card__header">
      <text class="checklist-card__name">{{ checklist.name }}</text>
      <view class="checklist-card__date-wrap">
        <text class="checklist-card__date">{{ formatDate(checklist.campingDate, 'MM/DD') }}</text>
        <text class="checklist-card__countdown" :class="countdownClass">{{ countdownText }}</text>
      </view>
    </view>

    <view class="checklist-card__progress">
      <view class="checklist-card__progress-bar">
        <view class="checklist-card__progress-fill" :style="{ width: progress + '%' }" />
      </view>
      <text class="checklist-card__progress-text">{{ progress }}%</text>
    </view>

    <view class="checklist-card__footer">
      <view class="checklist-card__status" :class="`checklist-card__status--${checklist.status}`">
        <text class="checklist-card__status-text">{{ statusText }}</text>
      </view>
      <text class="checklist-card__weight">{{ formatWeightGram(checklist.totalWeight, 'kg') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Checklist } from '@/types/models'
import { formatDate, formatWeightGram, getDaysUntil, calcProgress } from '@/utils/format'

const props = withDefaults(defineProps<{
  checklist: Checklist
}>(), {})

const emit = defineEmits<{
  click: []
}>()

const progress = computed(() => calcProgress(props.checklist.items))

const daysUntil = computed(() => getDaysUntil(props.checklist.campingDate))

const countdownText = computed(() => {
  const days = daysUntil.value
  if (days > 0) return `${days}天后`
  if (days === 0) return '今天'
  return '已过期'
})

const countdownClass = computed(() => {
  if (daysUntil.value < 0) return 'checklist-card__countdown--expired'
  if (daysUntil.value <= 3) return 'checklist-card__countdown--soon'
  return ''
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    preparing: '准备中',
    completed: '已完成',
    archived: '历史'
  }
  return map[props.checklist.status] || ''
})
</script>

<style scoped lang="scss">
.checklist-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
  }

  &__name {
    font-size: 30rpx;
    font-weight: 600;
    color: #333333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__date-wrap {
    display: flex;
    align-items: center;
    margin-left: 16rpx;
    flex-shrink: 0;
  }

  &__date {
    font-size: 24rpx;
    color: #999999;
    margin-right: 10rpx;
  }

  &__countdown {
    font-size: 22rpx;
    color: #2E7D32;
    font-weight: 500;

    &--expired {
      color: #F44336;
    }

    &--soon {
      color: #FF9800;
    }
  }

  &__progress {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__progress-bar {
    flex: 1;
    height: 12rpx;
    background-color: #E8F5E9;
    border-radius: 6rpx;
    overflow: hidden;
    margin-right: 16rpx;
  }

  &__progress-fill {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 6rpx;
    transition: width 0.3s ease;
  }

  &__progress-text {
    font-size: 24rpx;
    color: #2E7D32;
    font-weight: 600;
    width: 80rpx;
    text-align: right;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__status {
    padding: 4rpx 16rpx;
    border-radius: 16rpx;

    &--preparing {
      background-color: #E8F5E9;
    }

    &--completed {
      background-color: #E3F2FD;
    }

    &--archived {
      background-color: #F5F5F5;
    }
  }

  &__status-text {
    font-size: 22rpx;

    .checklist-card__status--preparing & {
      color: #2E7D32;
    }

    .checklist-card__status--completed & {
      color: #1976D2;
    }

    .checklist-card__status--archived & {
      color: #9E9E9E;
    }
  }

  &__weight {
    font-size: 24rpx;
    color: #666666;
  }
}
</style>
