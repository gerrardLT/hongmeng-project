<template>
  <view class="tide-forecast">
    <view class="tide-header">
      <text class="tide-title">潮汐信息</text>
      <text class="tide-location">{{ tideData.location }}</text>
    </view>

    <view class="tide-list">
      <view
        v-for="(tide, index) in tideData.tides"
        :key="index"
        class="tide-item"
      >
        <text class="tide-time">{{ tide.time }}</text>
        <view class="tide-type-badge" :class="tideTypeClass(tide.type)">
          <text class="tide-type-text">{{ tideTypeLabel(tide.type) }}</text>
        </view>
        <text class="tide-height">{{ tide.height.toFixed(2) }}m</text>
      </view>
    </view>

    <view v-if="tideData.sunrise || tideData.sunset" class="sun-info">
      <view class="sun-item">
        <text class="sun-icon">☀️</text>
        <text class="sun-label">日出</text>
        <text class="sun-time">{{ tideData.sunrise }}</text>
      </view>
      <view class="sun-item">
        <text class="sun-icon">🌅</text>
        <text class="sun-label">日落</text>
        <text class="sun-time">{{ tideData.sunset }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { TideData, TideType } from '@/types/models'

defineProps<{
  tideData: TideData
}>()

const tideTypeMap: Record<TideType, string> = {
  high: '高潮',
  low: '低潮',
  rising: '涨潮',
  falling: '退潮'
}

function tideTypeLabel(type: TideType): string {
  return tideTypeMap[type] || type
}

function tideTypeClass(type: TideType): string {
  return type === 'high' || type === 'rising' ? 'rising' : 'falling'
}
</script>

<style scoped lang="scss">
.tide-forecast {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tide-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.tide-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
}

.tide-location {
  font-size: 24rpx;
  color: #999999;
}

.tide-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.tide-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #FAFAFA;
  border-radius: 16rpx;
}

.tide-time {
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
  width: 160rpx;
}

.tide-type-badge {
  padding: 4rpx 20rpx;
  border-radius: 20rpx;
  margin: 0 24rpx;
}

.tide-type-badge.rising {
  background: rgba(255, 107, 53, 0.12);
}

.tide-type-badge.falling {
  background: rgba(33, 150, 243, 0.12);
}

.tide-type-text {
  font-size: 24rpx;
  font-weight: 500;
}

.tide-type-badge.rising .tide-type-text {
  color: #FF6B35;
}

.tide-type-badge.falling .tide-type-text {
  color: #2196F3;
}

.tide-height {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
}

.sun-info {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 1rpx solid #F0F0F0;
}

.sun-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.sun-icon {
  font-size: 32rpx;
}

.sun-label {
  font-size: 24rpx;
  color: #999999;
}

.sun-time {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
}
</style>
