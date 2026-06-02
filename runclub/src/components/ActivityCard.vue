<template>
  <view class="activity-card" @click="emit('click', activity.activityId)">
    <view class="card-header">
      <text class="activity-name">{{ activity.name }}</text>
      <view class="status-tag" :class="`status-${activity.status}`">
        <text class="status-text">{{ statusMap[activity.status] }}</text>
      </view>
    </view>

    <view class="card-tags">
      <view class="type-badge">
        <text class="type-text">{{ typeMap[activity.type] }}</text>
      </view>
    </view>

    <view class="card-info">
      <view class="info-row">
        <text class="info-label">🕐</text>
        <text class="info-value">{{ activity.date }} {{ activity.time }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">📍</text>
        <text class="info-value">{{ activity.location.name }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">📏</text>
        <text class="info-value">{{ activity.distance }}km</text>
      </view>
    </view>

    <view class="card-footer">
      <text class="footer-text">报名截止：{{ activity.registrationDeadline }}</text>
      <text v-if="activity.maxParticipants" class="footer-text">限{{ activity.maxParticipants }}人</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Activity, ActivityType, ActivityStatus } from '@/types/models'

defineProps<{
  activity: Activity
}>()

const emit = defineEmits<{
  click: [id: string]
}>()

const typeMap: Record<ActivityType, string> = {
  regular: '例跑',
  training: '拉练',
  race: '比赛',
  casual: '休闲'
}

const statusMap: Record<ActivityStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
  cancelled: '已取消'
}
</script>

<style scoped lang="scss">
.activity-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.activity-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #212121;
  flex: 1;
  margin-right: 16rpx;
}

.status-tag {
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.status-upcoming {
  background: #E8F5E9;
  .status-text { color: #4CAF50; }
}

.status-ongoing {
  background: #FFF3E0;
  .status-text { color: #FF9800; }
}

.status-completed {
  background: #F5F5F5;
  .status-text { color: #9E9E9E; }
}

.status-cancelled {
  background: #FFEBEE;
  .status-text { color: #F44336; }
}

.card-tags {
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
}

.type-badge {
  background: rgba(255, 87, 34, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.type-text {
  font-size: 22rpx;
  color: #FF5722;
  font-weight: 500;
}

.card-info {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 24rpx;
  margin-right: 8rpx;
}

.info-value {
  font-size: 26rpx;
  color: #666666;
}

.card-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.footer-text {
  font-size: 22rpx;
  color: #999999;
}
</style>
