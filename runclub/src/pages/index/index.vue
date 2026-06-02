<template>
  <view class="page">
    <!-- 未登录引导 -->
    <view v-if="!userStore.isLoggedIn" class="login-guide">
      <view class="login-content">
        <text class="login-emoji">🏃</text>
        <text class="login-title">欢迎来到 RunClub</text>
        <text class="login-desc">登录后开启你的跑步之旅</text>
        <view class="login-btn" @click="goLogin">
          <text class="login-btn-text">立即登录</text>
        </view>
      </view>
    </view>

    <!-- 已登录内容 -->
    <view v-else>
      <!-- 欢迎语区域 -->
      <view class="welcome-section">
        <view class="welcome-content">
          <text class="welcome-hello">你好，{{ userStore.nickname || '跑友' }}！</text>
          <text class="welcome-sub">今天也要加油跑步 💪</text>
        </view>
      </view>

      <!-- 即将开始的活动 -->
      <view class="section" v-if="upcomingList.length > 0">
        <view class="section-header">
          <text class="section-title">即将开始的活动</text>
          <text class="section-link" @click="goActivities">查看全部</text>
        </view>
        <ActivityCard
          v-for="item in upcomingList"
          :key="item.activityId"
          :activity="item"
          @click="goActivityDetail"
        />
      </view>

      <!-- 今日训练卡片 -->
      <view class="section" v-if="trainingStore.activePlan && trainingStore.todayTraining">
        <view class="section-header">
          <text class="section-title">今日训练</text>
        </view>
        <view class="today-training-card">
          <view class="training-info">
            <view class="training-type-badge">
              <text class="training-type-text">{{ trainingTypeMap[trainingStore.todayTraining.type] }}</text>
            </view>
            <text class="training-desc">{{ trainingStore.todayTraining.description }}</text>
            <text v-if="trainingStore.todayTraining.distance" class="training-distance">
              目标距离：{{ trainingStore.todayTraining.distance }}km
            </text>
          </view>
          <view class="training-action">
            <view
              v-if="!trainingStore.todayTraining.completed"
              class="checkin-btn"
              @click="goTraining"
            >
              <text class="checkin-btn-text">去打卡</text>
            </view>
            <view v-else class="completed-tag">
              <text class="completed-tag-text">✅ 已完成</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷入口 -->
      <view class="section">
        <view class="shortcuts">
          <view class="shortcut-item" @click="goCreateActivity">
            <text class="shortcut-icon">📝</text>
            <text class="shortcut-label">创建活动</text>
          </view>
          <view class="shortcut-item" @click="goActivities">
            <text class="shortcut-icon">✅</text>
            <text class="shortcut-label">签到</text>
          </view>
          <view class="shortcut-item" @click="goRanking">
            <text class="shortcut-icon">🏆</text>
            <text class="shortcut-label">排名</text>
          </view>
          <view class="shortcut-item" @click="goTraining">
            <text class="shortcut-icon">📋</text>
            <text class="shortcut-label">训练计划</text>
          </view>
        </view>
      </view>

      <!-- 跑步数据概览 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">跑步数据</text>
        </view>
        <StatPanel :items="statItems" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useActivityStore } from '@/store/activity'
import { useTrainingStore } from '@/store/training'
import { useRecordStore } from '@/store/record'
import ActivityCard from '@/components/ActivityCard.vue'
import StatPanel from '@/components/StatPanel.vue'
import type { TrainingType } from '@/types/models'

const userStore = useUserStore()
const activityStore = useActivityStore()
const trainingStore = useTrainingStore()
const recordStore = useRecordStore()

const trainingTypeMap: Record<TrainingType, string> = {
  rest: '休息日',
  easy: '轻松跑',
  tempo: '节奏跑',
  long: '长距离',
  interval: '间歇跑',
  recovery: '恢复跑'
}

const upcomingList = computed(() => activityStore.upcomingActivities.slice(0, 3))

const statItems = computed(() => [
  { label: '本月跑量', value: recordStore.statistics.monthlyDistance.toFixed(1), unit: 'km' },
  { label: '总里程', value: recordStore.statistics.totalDistance.toFixed(1), unit: 'km' },
  { label: '参与活动', value: activityStore.activities.length, unit: '次' }
])

onShow(() => {
  if (userStore.isLoggedIn) {
    activityStore.loadActivities()
    trainingStore.loadPlans()
    recordStore.loadStatistics()
  }
})

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goActivities() {
  uni.switchTab({ url: '/pages/activities/index' })
}

function goActivityDetail(id: string) {
  uni.navigateTo({ url: `/pages/activities/detail?activityId=${id}` })
}

function goCreateActivity() {
  uni.navigateTo({ url: '/pages/activities/create' })
}

function goRanking() {
  uni.navigateTo({ url: '/pages/club/ranking' })
}

function goTraining() {
  uni.navigateTo({ url: '/pages/records/training' })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.login-guide {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #FF5722, #FF7043);
}

.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
}

.login-emoji {
  font-size: 120rpx;
  margin-bottom: 40rpx;
}

.login-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 16rpx;
}

.login-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 60rpx;
}

.login-btn {
  padding: 24rpx 80rpx;
  background: #FFFFFF;
  border-radius: 48rpx;
}

.login-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF5722;
}

.welcome-section {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  padding: 48rpx 32rpx 40rpx;
}

.welcome-content {
  display: flex;
  flex-direction: column;
}

.welcome-hello {
  font-size: 40rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.welcome-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.section {
  padding: 24rpx 24rpx 0;
}

.section-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #212121;
}

.section-link {
  font-size: 26rpx;
  color: #FF5722;
}

.today-training-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.training-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.training-type-badge {
  align-self: flex-start;
  background: rgba(33, 150, 243, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.training-type-text {
  font-size: 22rpx;
  color: #2196F3;
  font-weight: 500;
}

.training-desc {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.training-distance {
  font-size: 24rpx;
  color: #666666;
}

.training-action {
  flex-shrink: 0;
  margin-left: 20rpx;
}

.checkin-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 32rpx;
}

.checkin-btn-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.completed-tag {
  padding: 16rpx 24rpx;
}

.completed-tag-text {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 500;
}

.shortcuts {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 0;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.shortcut-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.shortcut-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.shortcut-label {
  font-size: 24rpx;
  color: #666666;
}
</style>
