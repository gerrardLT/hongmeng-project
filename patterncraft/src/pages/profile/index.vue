<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="handleLogin">
        <image
          class="user-avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
        />
        <view class="user-meta">
          <text class="user-name">{{ userStore.isLoggedIn ? userStore.userInfo?.nickname : '点击登录' }}</text>
          <text class="user-id" v-if="userStore.isLoggedIn">ID: {{ userStore.userInfo?.userId }}</text>
        </view>
        <text v-if="userStore.isLoggedIn" class="user-arrow">›</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-card">
      <view class="menu-item" @click="goFavorites">
        <text class="menu-icon">⭐</text>
        <view class="menu-content">
          <text class="menu-title">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="goCustomColor">
        <text class="menu-icon">🎨</text>
        <view class="menu-content">
          <text class="menu-title">自定义配色</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">☁️</text>
        <view class="menu-content">
          <text class="menu-title">云同步设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于区域 -->
    <view class="menu-card">
      <view class="menu-item" @click="openPrivacyPolicy">
        <text class="menu-icon">🔒</text>
        <view class="menu-content">
          <text class="menu-title">隐私政策</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="openUserAgreement">
        <text class="menu-icon">📋</text>
        <view class="menu-content">
          <text class="menu-title">用户协议</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="openDisclaimer">
        <text class="menu-icon">⚠️</text>
        <view class="menu-content">
          <text class="menu-title">免责声明</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">🏮</text>
        <view class="menu-content">
          <text class="menu-title">关于 PatternCraft</text>
          <text class="menu-value">v1.0.0</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <button
      v-if="userStore.isLoggedIn"
      class="logout-btn"
      @click="handleLogout"
    >
      退出登录
    </button>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

function handleLogin() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function goFavorites() {
  uni.navigateTo({ url: '/pages/works/index' })
}

function goCustomColor() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/privacy-policy.html')
  })
}

function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/user-agreement.html')
  })
}

function openDisclaimer() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/disclaimer.html')
  })
}

function showAbout() {
  uni.showModal({
    title: '关于 PatternCraft',
    content: 'PatternCraft v1.0.0\n中式纹样设计工具\n\n传承东方美学，创造无限可能',
    showCancel: false
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
}

.user-card {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.user-name {
  font-size: $font-xl;
  font-weight: 600;
  color: #FFFFFF;
}

.user-id {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
}

.user-arrow {
  font-size: $font-xl;
  color: rgba(255, 255, 255, 0.6);
}

.menu-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  gap: $spacing-md;

  &:active {
    background-color: $bg-secondary;
  }
}

.menu-icon {
  font-size: 40rpx;
  width: 48rpx;
  text-align: center;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-title {
  font-size: $font-md;
  color: $text-primary;
}

.menu-value {
  font-size: $font-sm;
  color: $text-secondary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-hint;
}

.menu-divider {
  height: 1rpx;
  background-color: $border-color;
  margin-left: 88rpx;
}

.logout-btn {
  margin-top: $spacing-xl;
  background-color: $bg-card;
  color: $error-color;
  border: none;
  border-radius: $radius-lg;
  height: 96rpx;
  line-height: 96rpx;
  font-size: $font-md;

  &::after {
    border: none;
  }
}
</style>
