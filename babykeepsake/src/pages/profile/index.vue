<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="onUserCardClick">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <view v-if="userStore.isLoggedIn" class="user-text">
          <text class="nickname">{{ userStore.userInfo?.nickname || 'BabyKeepsake 用户' }}</text>
          <text class="user-id">ID: {{ userStore.userId.slice(0, 12) }}</text>
        </view>
        <view v-else class="login-trigger">
          <text class="nickname">点击登录</text>
          <text class="login-hint">登录后享受完整服务</text>
        </view>
      </view>
    </view>

    <!-- 宝宝信息卡片 -->
    <view v-if="userStore.isLoggedIn && currentBaby" class="baby-card" @click="goToBabyInfo">
      <view class="baby-info">
        <image
          class="baby-avatar"
          :src="currentBaby.avatar || '/static/default-baby.png'"
          mode="aspectFill"
        />
        <view class="baby-text">
          <text class="baby-name">{{ currentBaby.name }}</text>
          <text class="baby-age">{{ getBabyAge(currentBaby.birthDate) }}</text>
        </view>
      </view>
      <text class="card-arrow">›</text>
    </view>
    <view v-else-if="userStore.isLoggedIn && !currentBaby" class="baby-card add-baby" @click="goToBabyInfo">
      <text class="add-icon">＋</text>
      <text class="add-text">添加宝宝信息</text>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-group">
      <view class="menu-item" @click="goToBabyInfo">
        <text class="menu-icon">👶</text>
        <text class="menu-text">宝宝信息管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToTimeline">
        <text class="menu-icon">📊</text>
        <text class="menu-text">成长时间轴</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToKnowledge">
        <text class="menu-icon">📖</text>
        <text class="menu-text">知识库</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToBooking">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的预约</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="goToPrivacy">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">应用设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToAccount">
        <text class="menu-icon">👤</text>
        <text class="menu-text">账户管理</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const currentBaby = computed(() => userStore.selectedBaby)

onShow(() => {
  // 刷新用户数据
})

function getBabyAge(birthDate: string): string {
  if (!birthDate) return '年龄未知'
  const birth = new Date(birthDate)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (months < 1) return '新生儿'
  if (months < 12) return `${months}个月`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years}岁${remainMonths}个月` : `${years}岁`
}

function onUserCardClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function goToBabyInfo() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/profile/baby-info' })
}

function goToTimeline() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/record/timeline' })
}

function goToKnowledge() {
  uni.navigateTo({ url: '/pages/knowledge/index' })
}

function goToBooking() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.switchTab({ url: '/pages/booking/index' })
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function goToAccount() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/profile/account' })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 48rpx;
}

/* 用户信息卡片 */
.user-card {
  height: 300rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 0 0 $radius-xl $radius-xl;
  display: flex;
  align-items: center;
  padding: 0 $spacing-xl;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  background-color: #FFFFFF;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.user-text {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

.login-trigger {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.login-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 宝宝信息卡片 */
.baby-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: -40rpx $spacing-lg $spacing-lg;
  padding: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.baby-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.baby-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #FFF3EB;
}

.baby-text {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.baby-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.baby-age {
  font-size: 24rpx;
  color: $text-secondary;
}

.card-arrow {
  font-size: 36rpx;
  color: $text-hint;
}

.add-baby {
  justify-content: center;
  gap: $spacing-sm;
}

.add-icon {
  font-size: 40rpx;
  color: $primary;
  font-weight: bold;
}

.add-text {
  font-size: 28rpx;
  color: $primary;
}

/* 功能菜单列表 */
.menu-group {
  margin: 0 $spacing-lg $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 $spacing-lg;
  border-bottom: 2rpx solid $bg-page;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: $spacing-sm;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.menu-arrow {
  font-size: 28rpx;
  color: $text-hint;
}
</style>
