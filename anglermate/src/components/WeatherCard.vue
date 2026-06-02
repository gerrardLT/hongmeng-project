<template>
  <view class="weather-card">
    <view class="weather-main">
      <view class="temp-wrap">
        <text class="temp">{{ weather.temperature }}°</text>
        <text v-if="weather.feelsLike !== undefined" class="feels-like">体感 {{ weather.feelsLike }}°</text>
      </view>
      <view class="condition-wrap">
        <text class="condition-text">{{ weather.conditionText }}</text>
        <text class="update-time">{{ weather.updateTime }}</text>
      </view>
    </view>

    <view class="weather-detail">
      <view class="detail-item">
        <text class="detail-label">湿度</text>
        <text class="detail-value">{{ weather.humidity }}%</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">气压</text>
        <text class="detail-value">{{ weather.pressure }}hPa</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">风速</text>
        <text class="detail-value">{{ weather.windSpeed }}m/s</text>
      </view>
      <view class="detail-item">
        <text class="detail-label">风向</text>
        <text class="detail-value">{{ weather.windDirection }}</text>
      </view>
    </view>

    <view class="fishing-index-wrap">
      <view class="index-row">
        <text class="index-label">钓鱼指数</text>
        <text class="index-stars">{{ stars }}</text>
      </view>
      <text v-if="indexDesc" class="index-desc">{{ indexDesc }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeatherData } from '@/types/models'

const props = defineProps<{
  weather: WeatherData
}>()

const indexDescMap: Record<number, string> = {
  1: '不宜垂钓，建议在家休息',
  2: '钓况一般，注意天气变化',
  3: '适合垂钓，注意防晒防雨',
  4: '非常适合垂钓，鱼口活跃',
  5: '绝佳钓鱼天气，不可错过！'
}

const stars = computed(() => {
  const idx = Math.min(5, Math.max(1, props.weather.fishingIndex))
  return '★'.repeat(idx) + '☆'.repeat(5 - idx)
})

const indexDesc = computed(() => {
  const idx = Math.min(5, Math.max(1, props.weather.fishingIndex))
  return indexDescMap[idx] || ''
})
</script>

<style scoped lang="scss">
.weather-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.weather-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.temp-wrap {
  display: flex;
  flex-direction: column;
}

.temp {
  font-size: 80rpx;
  font-weight: 700;
  color: #212121;
  line-height: 1;
}

.feels-like {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}

.condition-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.condition-text {
  font-size: 32rpx;
  color: #212121;
  font-weight: 500;
}

.update-time {
  font-size: 22rpx;
  color: #BDBDBD;
  margin-top: 8rpx;
}

.weather-detail {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  border-top: 1rpx solid #F0F0F0;
  border-bottom: 1rpx solid #F0F0F0;
  padding: 24rpx 0;
  margin-bottom: 24rpx;
}

.detail-item {
  width: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 16rpx;
  box-sizing: border-box;
}

.detail-label {
  font-size: 26rpx;
  color: #999999;
}

.detail-value {
  font-size: 26rpx;
  color: #212121;
  font-weight: 500;
}

.fishing-index-wrap {
  display: flex;
  flex-direction: column;
}

.index-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.index-label {
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
}

.index-stars {
  font-size: 32rpx;
  color: #FF6B35;
  letter-spacing: 4rpx;
}

.index-desc {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
</style>
