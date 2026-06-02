<template>
  <view class="runner-card">
    <view class="card-bg">
      <view class="card-top">
        <view class="avatar-wrapper">
          <image v-if="card.avatar" class="avatar" :src="card.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ card.nickname.slice(0, 1) }}</text>
          </view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ card.nickname }}</text>
          <text class="running-age">跑龄 {{ card.runningAge }} 年</text>
        </view>
      </view>

      <view class="card-stats">
        <view class="stat-item">
          <text class="stat-value">{{ card.totalDistance }}</text>
          <text class="stat-label">总跑量(km)</text>
        </view>
      </view>

      <view v-if="card.motto" class="card-motto">
        <text class="motto-text">「{{ card.motto }}」</text>
      </view>

      <view v-if="card.contactVisible && card.contact" class="card-contact">
        <text class="contact-text">📱 {{ card.contact }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { RunnerCard } from '@/types/models'

defineProps<{
  card: RunnerCard
}>()
</script>

<style scoped lang="scss">
.runner-card {
  margin-bottom: 24rpx;
}

.card-bg {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 34, 0.3);
}

.card-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 28rpx;
}

.avatar-wrapper {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
}

.avatar-placeholder {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
}

.avatar-text {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 6rpx;
}

.running-age {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.card-stats {
  display: flex;
  flex-direction: row;
  margin-bottom: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 48rpx;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 4rpx;
}

.card-motto {
  padding: 16rpx 0;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.motto-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  line-height: 1.6;
}

.card-contact {
  margin-top: 12rpx;
  padding-top: 12rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.contact-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}
</style>
