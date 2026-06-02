<template>
  <view class="profile-page">
    <!-- 用户卡片 -->
    <view class="user-card">
      <view class="user-info" @click="!isLoggedIn && goLogin()">
        <view class="avatar">
          <text class="avatar-text">{{ avatarText }}</text>
        </view>
        <view class="info-content">
          <text class="nickname">{{ nickname }}</text>
          <text class="desc">{{ isLoggedIn ? `已管理 ${aquariumCount} 个水族箱` : '点击登录' }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view v-for="(group, gIdx) in menuGroups" :key="gIdx" class="menu-group">
      <view
        v-for="item in group.items"
        :key="item.action"
        class="menu-item"
        @click="handleMenu(item.action)"
      >
        <view class="menu-left">
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-title">{{ item.title }}</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="isLoggedIn" class="logout-section">
      <view class="btn-logout" @click="handleLogout">
        <text class="btn-logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useAquariumStore } from '@/store/aquarium'

const userStore = useUserStore()
const aquariumStore = useAquariumStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)
const nickname = computed(() => userStore.userInfo?.nickname || '未登录')
const avatarText = computed(() => {
  const name = userStore.userInfo?.nickname
  return name ? name.charAt(0) : '?'
})
const aquariumCount = computed(() => aquariumStore.aquariums.length)

const menuGroups = [
  {
    items: [
      { title: '提醒设置', icon: '⏰', action: 'settings' },
      { title: '云同步', icon: '☁️', action: 'sync' },
      { title: '数据导出', icon: '📤', action: 'export' }
    ]
  },
  {
    items: [
      { title: '隐私政策', icon: '🔒', action: 'privacy' },
      { title: '用户协议', icon: '📄', action: 'agreement' },
      { title: '第三方SDK目录', icon: '📋', action: 'sdk' },
      { title: '关于AquaLog', icon: 'ℹ️', action: 'about' }
    ]
  }
]

onShow(() => {
  userStore.init()
  aquariumStore.init()
})

function handleMenu(action: string) {
  switch (action) {
    case 'settings':
      uni.navigateTo({ url: '/pages/profile/settings' })
      break
    case 'sync':
      uni.showToast({ title: '云同步开发中', icon: 'none' })
      break
    case 'export':
      uni.showToast({ title: '数据导出开发中', icon: 'none' })
      break
    case 'privacy':
      uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/privacy') })
      break
    case 'agreement':
      uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/agreement') })
      break
    case 'sdk':
      uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/sdk-list') })
      break
    case 'about':
      uni.showModal({
        title: '关于AquaLog',
        content: '版本 1.0.0\n水族箱智能管家',
        showCancel: false
      })
      break
  }
}

function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.switchTab({ url: '/pages/index/index' })
      }
    }
  })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background-color: $bg-grey;
}

.user-card {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: $spacing-xl $spacing-lg;
  padding-top: calc(var(--status-bar-height, 44px) + #{$spacing-xl});
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: $font-xl;
  color: #ffffff;
  font-weight: bold;
}

.info-content {
  margin-left: $spacing-md;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: $font-lg;
  color: #ffffff;
  font-weight: bold;
}

.desc {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
  margin-top: $spacing-xs;
}

.menu-group {
  background-color: $bg-card;
  margin: $spacing-md $spacing-md 0;
  border-radius: $radius-md;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: $font-md;
  margin-right: $spacing-sm;
}

.menu-title {
  font-size: $font-md;
  color: $text-primary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.logout-section {
  margin: $spacing-xl $spacing-md;
}

.btn-logout {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout-text {
  font-size: $font-md;
  color: $error-color;
}
</style>
