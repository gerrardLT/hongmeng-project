<template>
  <view class="page">
    <!-- 顶部用户卡片 -->
    <view class="user-header">
      <view class="user-card" @click="onEditProfile">
        <view class="avatar-wrapper">
          <image v-if="userStore.userInfo?.avatar" class="avatar" :src="userStore.userInfo.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ (userStore.nickname || '?').slice(0, 1) }}</text>
          </view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.nickname || '未登录' }}</text>
          <text class="edit-hint">编辑资料 ›</text>
        </view>
      </view>
    </view>

    <!-- 跑友名片预览入口 -->
    <view v-if="userStore.isLoggedIn" class="card-entry" @click="navigateTo('/pages/profile/runner-card')">
      <view class="card-entry-left">
        <text class="card-icon">🏃</text>
        <text class="card-entry-text">我的跑友名片</text>
      </view>
      <text class="card-arrow">›</text>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.path"
        class="menu-item"
        @click="onMenuClick(item)"
      >
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-label">{{ item.label }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 底部版本号 -->
    <view class="version-section">
      <text class="version-text">RunClub v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

interface MenuItem {
  icon: string
  label: string
  path: string
  needLogin?: boolean
}

const menuItems: MenuItem[] = [
  { icon: '👥', label: '跑友录', path: '/pages/profile/friends', needLogin: true },
  { icon: '📋', label: '训练计划', path: '/pages/records/training', needLogin: true },
  { icon: '🔄', label: '数据同步', path: 'sync', needLogin: true },
  { icon: '⚙️', label: '设置', path: '/pages/profile/settings' },
  { icon: '🔒', label: '隐私政策', path: '/pages/webview/index?url=privacy' },
  { icon: '📄', label: '用户协议', path: '/pages/webview/index?url=terms' },
  { icon: 'ℹ️', label: '关于', path: 'about' }
]

function navigateTo(path: string) {
  uni.navigateTo({ url: path })
}

function onEditProfile() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/profile/runner-card' })
}

function onMenuClick(item: MenuItem) {
  if (item.needLogin && !userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  if (item.path === 'sync') {
    uni.showLoading({ title: '同步中...' })
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({ title: '同步完成', icon: 'success' })
    }, 1500)
    return
  }

  if (item.path === 'about') {
    uni.showModal({
      title: '关于 RunClub',
      content: 'RunClub v1.0.0\n跑团活动管理，让跑步更有趣\n\n© 2026 RunClub Team',
      showCancel: false
    })
    return
  }

  uni.navigateTo({ url: item.path })
}

onShow(() => {
  userStore.checkLoginStatus()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.user-header {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  padding: 48rpx 32rpx 56rpx;
}

.user-card {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.avatar-wrapper {
  margin-right: 24rpx;
  flex-shrink: 0;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 44rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.edit-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 名片入口 */
.card-entry {
  margin: -28rpx 24rpx 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-entry-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.card-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.card-entry-text {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.card-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

/* 菜单 */
.menu-section {
  margin: 0 24rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.menu-label {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 30rpx;
  color: #CCCCCC;
}

/* 版本号 */
.version-section {
  padding: 48rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.version-text {
  font-size: 22rpx;
  color: #CCCCCC;
}
</style>
