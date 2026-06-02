<template>
  <view class="record-item" @click="emit('click', record.recordId)">
    <view class="record-date">
      <text class="date-text">{{ record.date }}</text>
      <view class="source-tag">
        <text class="source-text">{{ record.source === 'health' ? '健康同步' : '手动录入' }}</text>
      </view>
    </view>

    <view class="record-body">
      <view class="record-main">
        <text class="distance-value">{{ record.distance.toFixed(2) }}</text>
        <text class="distance-unit">km</text>
      </view>

      <view class="record-details">
        <view class="detail-item">
          <text class="detail-label">用时</text>
          <text class="detail-value">{{ formatDuration(record.duration) }}</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">配速</text>
          <text class="detail-value">{{ record.pace }}</text>
          <text class="detail-sub">min/km</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { RunRecord } from '@/types/models'

defineProps<{
  record: RunRecord
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
.record-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.record-date {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.date-text {
  font-size: 24rpx;
  color: #999999;
}

.source-tag {
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
  background: rgba(33, 150, 243, 0.1);
}

.source-text {
  font-size: 20rpx;
  color: #2196F3;
}

.record-body {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.record-main {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.distance-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #212121;
}

.distance-unit {
  font-size: 24rpx;
  color: #999999;
  margin-left: 6rpx;
}

.record-details {
  display: flex;
  flex-direction: row;
  gap: 32rpx;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.detail-label {
  font-size: 20rpx;
  color: #BDBDBD;
  margin-bottom: 4rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
}

.detail-sub {
  font-size: 18rpx;
  color: #BDBDBD;
}
</style>
