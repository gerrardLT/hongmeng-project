<template>
  <view class="profile-page">
    <!-- 自定义导航栏 -->
    <NavBar title="我的" :showBack="false" bgColor="#C41A1A" textColor="#FFFFFF" />

    <!-- 用户卡片 -->
    <view class="user-card" @click="onUserCardClick">
      <view class="avatar-wrap">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
      </view>
      <view class="user-info">
        <text class="nickname" v-if="userStore.isLoggedIn">{{ userStore.userInfo?.nickname || '用户' }}</text>
        <text class="nickname guest" v-else>请登录</text>
        <text class="user-id" v-if="userStore.isLoggedIn">UID: {{ userStore.userId.slice(0, 12) }}</text>
        <text class="login-hint" v-else>登录后查看更多功能</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item" @click="goCollection">
        <text class="stat-num">{{ sealCount }}</text>
        <text class="stat-label">印章数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goBooking">
        <text class="stat-num">{{ bookingCount }}</text>
        <text class="stat-label">预约数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goCollection">
        <text class="stat-num">{{ favoriteCount }}</text>
        <text class="stat-label">收藏数</text>
      </view>
    </view>

    <!-- 功能入口列表 -->
    <view class="menu-section">
      <view class="menu-item" @click="goCollection">
        <text class="menu-icon">🟥</text>
        <text class="menu-text">我的印章库</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goProgress">
        <text class="menu-icon">🔨</text>
        <text class="menu-text">制作进度</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goAccount">
        <text class="menu-icon">👤</text>
        <text class="menu-text">账户管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPrivacy">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showAboutDialog">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于 SealCraft</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 版本号 -->
    <view class="version-footer">
      <text class="version-text">SealCraft v1.0.0</text>
    </view>

    <!-- 关于弹窗 -->
    <Dialog
      :visible="aboutVisible"
      title="关于 SealCraft"
      content="SealCraft - 个人印章定制工具 v1.0.0&#10;匠心独运，方寸之间见乾坤"
      confirmText="知道了"
      :showCancel="false"
      @confirm="aboutVisible = false"
      @close="aboutVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getCollections } from '@/services/collection'
import { getBookings } from '@/services/booking'
import NavBar from '@/components/common/NavBar.vue'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const aboutVisible = ref(false)

const sealCount = ref(0)
const bookingCount = ref(0)
const favoriteCount = ref(0)

onShow(() => {
  if (userStore.isLoggedIn) {
    const collections = getCollections(userStore.userId)
    const bookings = getBookings(userStore.userId)
    sealCount.value = collections.length
    bookingCount.value = bookings.length
    favoriteCount.value = collections.length
  } else {
    sealCount.value = 0
    bookingCount.value = 0
    favoriteCount.value = 0
  }
})

function onUserCardClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  } else {
    uni.navigateTo({ url: '/pages/profile/account' })
  }
}

function goCollection() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/collection/index' })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function goProgress() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/progress/index' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function goAccount() {
  uni.navigateTo({ url: '/pages/profile/account' })
}

function goPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function showAboutDialog() {
  aboutVisible.value = true
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx 40rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  margin-right: 24rpx;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nickname {
  font-size: 34rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 6rpx;

  &.guest {
    font-size: 30rpx;
  }
}

.user-id {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.login-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.arrow {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.7);
}

.stats-card {
  margin: -20rpx 32rpx 24rpx;
  background-color: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx 0;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: $primary;
  margin-bottom: 6rpx;
}

.stat-label {
  font-size: 22rpx;
  color: $text-secondary;
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background-color: $border-color;
}

.menu-section {
  margin: 0 32rpx;
  background-color: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 24rpx;
  width: 52rpx;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.menu-arrow {
  font-size: 32rpx;
  color: $text-hint;
}

.version-footer {
  display: flex;
  justify-content: center;
  padding: 48rpx 0;
}

.version-text {
  font-size: 22rpx;
  color: $text-hint;
}
</style>
