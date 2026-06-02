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
          <text class="nickname">{{ userStore.userInfo?.nickname || 'GlassCraft 用户' }}</text>
          <text class="user-id">ID: {{ userStore.userId.slice(0, 12) }}</text>
        </view>
        <view v-else class="login-trigger">
          <text class="nickname">点击登录</text>
          <text class="login-hint">登录后享受完整服务</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view v-if="userStore.isLoggedIn" class="stats-card">
      <view class="stat-item">
        <text class="stat-num">{{ bookingStats.total }}</text>
        <text class="stat-label">预约总数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ bookingStats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ artworkStats.total }}</text>
        <text class="stat-label">作品数量</text>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-group">
      <view class="menu-item" @click="goToBookings">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的预约</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToArtworks">
        <text class="menu-icon">🎨</text>
        <text class="menu-text">我的作品</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="menu-group">
      <view class="menu-item" @click="goToPrivacy">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToAccount">
        <text class="menu-icon">👤</text>
        <text class="menu-text">账户管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getBookingStats, getArtworkStats } from '@/services/user'

const userStore = useUserStore()

const bookingStats = ref({ total: 0, completed: 0, pending: 0, confirmed: 0, cancelled: 0 })
const artworkStats = ref({ total: 0, thisMonth: 0 })

onShow(() => {
  if (userStore.isLoggedIn) {
    loadStats()
  }
})

async function loadStats() {
  const userId = userStore.userId
  if (!userId) return
  try {
    bookingStats.value = await getBookingStats(userId)
    artworkStats.value = await getArtworkStats(userId)
  } catch (e) {
    console.error('load stats error:', e)
  }
}

function onUserCardClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function goToBookings() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.switchTab({ url: '/pages/booking/index' })
}

function goToArtworks() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.switchTab({ url: '/pages/artwork/index' })
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function goToAccount() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/profile/account' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
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

/* 统计卡片 */
.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: -40rpx $spacing-lg $spacing-lg;
  padding: $spacing-md 0;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  flex: 1;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: $primary;
}

.stat-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: $border-color;
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
