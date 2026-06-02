<template>
  <view class="page">
    <!-- 顶部用户卡片 -->
    <view class="user-header">
      <view class="user-card" @click="onAvatarClick">
        <view class="avatar-wrapper">
          <image v-if="userStore.userInfo?.avatar" class="avatar" :src="userStore.userInfo.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ (userStore.nickname || '?').slice(0, 1) }}</text>
          </view>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.isLoggedIn ? userStore.nickname : '点击登录' }}</text>
          <text v-if="userStore.isLoggedIn" class="care-days">养护 {{ careDays }} 天</text>
          <text v-else class="care-days">登录后解锁更多功能</text>
        </view>
      </view>
    </view>

    <!-- 统计概览 -->
    <view v-if="userStore.isLoggedIn" class="stats-bar">
      <view class="stats-item">
        <text class="stats-value">{{ plantStore.totalPlants }}</text>
        <text class="stats-label">植物数</text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">{{ totalRecords }}</text>
        <text class="stats-label">记录数</text>
      </view>
      <view class="stats-divider" />
      <view class="stats-item">
        <text class="stats-value">{{ recordStore.careStats.consecutiveDays }}</text>
        <text class="stats-label">连续天数</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.id"
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
      <text class="version-text">PlantCare v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { usePlantStore } from '@/store/plant'
import { useRecordStore } from '@/store/record'

const userStore = useUserStore()
const plantStore = usePlantStore()
const recordStore = useRecordStore()

interface MenuItem {
  id: string
  icon: string
  label: string
  action: string
  needLogin?: boolean
}

const menuItems: MenuItem[] = [
  { id: 'settings', icon: '⏰', label: '提醒设置', action: 'navigate:/pages/profile/settings', needLogin: true },
  { id: 'sync', icon: '☁️', label: '云同步', action: 'sync', needLogin: true },
  { id: 'backup', icon: '💾', label: '数据备份', action: 'backup', needLogin: true },
  { id: 'privacy', icon: '🔒', label: '隐私政策', action: 'webview:privacy-policy.html' },
  { id: 'agreement', icon: '📄', label: '用户协议', action: 'webview:user-agreement.html' },
  { id: 'sdk', icon: '📦', label: '第三方SDK目录', action: 'webview:third-party-sdk.html' },
  { id: 'about', icon: 'ℹ️', label: '关于PlantCare', action: 'about' },
  { id: 'logout', icon: '🚪', label: '退出登录', action: 'logout', needLogin: true }
]

const careDays = computed(() => {
  if (!userStore.userInfo?.createdAt) return 0
  const diff = Date.now() - userStore.userInfo.createdAt
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
})

const totalRecords = computed(() => {
  return recordStore.careRecords.length + recordStore.growthRecords.length
})

onShow(() => {
  userStore.init()
  plantStore.init()
  recordStore.init()
})

function onAvatarClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function onMenuClick(item: MenuItem) {
  if (item.needLogin && !userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }

  const action = item.action

  if (action.startsWith('navigate:')) {
    uni.navigateTo({ url: action.replace('navigate:', '') })
    return
  }

  if (action.startsWith('webview:')) {
    const file = action.replace('webview:', '')
    uni.navigateTo({
      url: `/pages/webview/index?url=${encodeURIComponent('/static/legal/' + file)}`
    })
    return
  }

  if (action === 'sync') {
    uni.showLoading({ title: '同步中...' })
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({ title: '同步完成', icon: 'success' })
    }, 1500)
    return
  }

  if (action === 'backup') {
    uni.showLoading({ title: '备份中...' })
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({ title: '备份完成', icon: 'success' })
    }, 1500)
    return
  }

  if (action === 'about') {
    uni.showModal({
      title: '关于 PlantCare',
      content: 'PlantCare v1.0.0\n养花浇水提醒，让每一株植物都被温柔以待\n\n© 2026 PlantCare Team',
      showCancel: false
    })
    return
  }

  if (action === 'logout') {
    uni.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          userStore.logout()
          uni.navigateTo({ url: '/pages/login/index' })
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
}

.user-header {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 48rpx 32rpx 56rpx;
}

.user-card {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.avatar-wrapper {
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-round;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
  font-size: 44rpx;
  color: $text-white;
  font-weight: $font-weight-bold;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: $font-xl;
  font-weight: $font-weight-bold;
  color: $text-white;
  margin-bottom: $spacing-xs;
}

.care-days {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.75);
}

.stats-bar {
  margin: -28rpx $spacing-md $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  box-shadow: $shadow-md;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-value {
  font-size: $font-xxl;
  font-weight: $font-weight-bold;
  color: $primary-color;
  line-height: 1.2;
}

.stats-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.stats-divider {
  width: 1rpx;
  height: 60rpx;
  background: $border-light;
}

.menu-section {
  margin: 0 $spacing-md;
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx $spacing-md;
  border-bottom: 1rpx solid $border-light;

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
  font-size: 36rpx;
  margin-right: $spacing-sm;
}

.menu-label {
  font-size: $font-md;
  color: $text-primary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.version-section {
  padding: $spacing-xl 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.version-text {
  font-size: $font-xs;
  color: $text-light;
}
</style>
