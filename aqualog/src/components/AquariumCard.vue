<template>
  <view class="aquarium-card" @click="onTap">
    <view class="card-header">
      <view class="card-info">
        <text class="aquarium-name text-ellipsis">{{ aquarium.name }}</text>
        <view class="type-tag">
          <text class="type-tag-text">{{ formatAquariumType(aquarium.type) }}</text>
        </view>
      </view>
      <view class="status-dot" :class="'status-' + aquarium.status" />
    </view>
    <view class="card-body">
      <view class="stat-item">
        <text class="stat-label">容量</text>
        <text class="stat-value">{{ aquarium.volume }}升</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">开缸天数</text>
        <text class="stat-value">{{ setupDays }}天</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">最近记录</text>
        <text class="stat-value">{{ lastRecordText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Aquarium } from '@/types/models'
import { formatAquariumType } from '@/utils/format'

const props = withDefaults(defineProps<{
  aquarium: Aquarium
  lastRecordTime?: number | null
}>(), {
  lastRecordTime: null
})

const emit = defineEmits<{
  'tap': [aquariumId: string]
}>()

const setupDays = computed(() => {
  const now = new Date()
  const setup = new Date(props.aquarium.setupDate)
  const diff = now.getTime() - setup.getTime()
  return Math.max(0, Math.floor(diff / (24 * 60 * 60 * 1000)))
})

const lastRecordText = computed(() => {
  if (!props.lastRecordTime) return '暂无'
  const now = Date.now()
  const diff = now - props.lastRecordTime
  const day = 24 * 60 * 60 * 1000
  const hour = 60 * 60 * 1000
  const minute = 60 * 1000
  if (diff < minute) return '刚刚'
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
  if (diff < day) return `${Math.floor(diff / hour)}小时前`
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`
  return `${Math.floor(diff / (7 * day))}周前`
})

function onTap() {
  emit('tap', props.aquarium.aquariumId)
}
</script>

<style scoped lang="scss">
.aquarium-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
  position: relative;

  &:active {
    opacity: 0.9;
    transform: scale(0.99);
  }
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.card-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  overflow: hidden;
}

.aquarium-name {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  max-width: 320rpx;
}

.type-tag {
  margin-left: $spacing-sm;
  background: $primary-lighter;
  border-radius: $radius-pill;
  padding: 4rpx 16rpx;
}

.type-tag-text {
  font-size: $font-xs;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.status-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: $radius-round;
  margin-top: 8rpx;
  flex-shrink: 0;

  &.status-normal {
    background: $success-color;
    box-shadow: 0 0 8rpx rgba(39, 174, 96, 0.4);
  }

  &.status-warning {
    background: $warning-color;
    box-shadow: 0 0 8rpx rgba(243, 156, 18, 0.4);
  }

  &.status-danger {
    background: $error-color;
    box-shadow: 0 0 8rpx rgba(231, 76, 60, 0.4);
  }
}

.card-body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: $font-xs;
  color: $text-light;
  margin-bottom: 4rpx;
}

.stat-value {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: $font-weight-medium;
}
</style>
