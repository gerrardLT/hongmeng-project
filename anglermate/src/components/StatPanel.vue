<template>
  <view class="stat-panel">
    <view class="stat-grid">
      <view class="stat-cell">
        <text class="stat-value">{{ stats.totalTrips }}</text>
        <text class="stat-label">出钓次数</text>
      </view>
      <view class="stat-cell">
        <text class="stat-value">{{ stats.totalCount }}</text>
        <text class="stat-label">总渔获数</text>
      </view>
      <view class="stat-cell">
        <text class="stat-value">{{ stats.totalWeight.toFixed(1) }}</text>
        <text class="stat-label">总重量(kg)</text>
      </view>
      <view class="stat-cell">
        <text class="stat-value">{{ stats.maxSingleWeight.toFixed(1) }}</text>
        <text class="stat-label">最重单条(kg)</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CatchStats } from '@/types/models'

defineProps<{
  stats: CatchStats
}>()
</script>

<style scoped lang="scss">
.stat-panel {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stat-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.stat-cell {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
  box-sizing: border-box;
}

.stat-value {
  font-size: 44rpx;
  font-weight: 700;
  color: #FF6B35;
  line-height: 1.2;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
</style>
