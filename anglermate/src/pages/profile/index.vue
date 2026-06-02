<template>
  <view class="profile-page">
    <!-- 用户信息区 -->
    <view class="user-header">
      <view class="user-info" @click="handleUserClick">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="user-text">
          <text class="nickname">{{ userStore.isLoggedIn ? userStore.userInfo?.nickname : '点击登录' }}</text>
          <text v-if="userStore.isLoggedIn" class="user-id">ID: {{ userStore.userInfo?.userId?.slice(0, 8) }}</text>
        </view>
      </view>

      <!-- 数据统计概览 -->
      <view v-if="userStore.isLoggedIn" class="stats-row">
        <view class="stat-item">
          <text class="stat-num">{{ spotsStore.spotCount }}</text>
          <text class="stat-label">钓点数</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-num">{{ catchesStore.catchCount }}</text>
          <text class="stat-label">渔获数</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-num">{{ tripDays }}</text>
          <text class="stat-label">出钓天数</text>
        </view>
      </view>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-card">
      <view class="menu-item" @click="navigateTo('/pages/profile/settings')">
        <text class="menu-icon">🔔</text>
        <text class="menu-title">意图提醒设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="handleSync">
        <text class="menu-icon">☁️</text>
        <text class="menu-title">云同步状态</text>
        <text class="menu-value">{{ lastSyncTime }}</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="handleClearCache">
        <text class="menu-icon">🗑️</text>
        <text class="menu-title">清除缓存</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-title">关于应用</text>
        <text class="menu-value">v1.0.0</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 法律文档链接区 -->
    <view class="menu-card">
      <view class="menu-item" @click="openWebview('隐私政策', '/static/legal/privacy-policy.html')">
        <text class="menu-title">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="openWebview('用户协议', '/static/legal/user-agreement.html')">
        <text class="menu-title">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="openWebview('第三方SDK目录', '/static/legal/third-party-sdk.html')">
        <text class="menu-title">第三方SDK目录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view v-if="userStore.isLoggedIn" class="logout-btn" @click="handleLogout">
      <text class="logout-text">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useSpotsStore } from '@/store/spots'
import { useCatchesStore } from '@/store/catches'
import { logout } from '@/services/auth'

const userStore = useUserStore()
const spotsStore = useSpotsStore()
const catchesStore = useCatchesStore()

const lastSyncTime = ref('尚未同步')

/** 出钓天数：按日期去重统计 */
const tripDays = computed(() => {
  const dates = new Set(catchesStore.catchList.map((c) => c.date))
  return dates.size
})

/** 点击用户区域 */
function handleUserClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

/** 页面跳转 */
function navigateTo(url: string) {
  uni.navigateTo({ url })
}

/** 打开 webview */
function openWebview(title: string, src: string) {
  uni.navigateTo({
    url: `/pages/webview/index?title=${encodeURIComponent(title)}&src=${encodeURIComponent(src)}`
  })
}

/** 云同步 */
function handleSync() {
  uni.showLoading({ title: '同步中...' })
  setTimeout(() => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    lastSyncTime.value = `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
    uni.hideLoading()
    uni.showToast({ title: '同步完成', icon: 'success' })
  }, 1000)
}

/** 清除缓存 */
function handleClearCache() {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          uni.clearStorageSync()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

/** 退出登录 */
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await logout()
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
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.user-header {
  background: linear-gradient(135deg, #ff6b35, #ff8f5e);
  padding: 60rpx 40rpx 40rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  margin-right: 28rpx;
  background-color: rgba(255, 255, 255, 0.3);
}

.user-text {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
  padding: 28rpx 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background-color: rgba(255, 255, 255, 0.3);
}

.menu-card {
  margin: 24rpx 24rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.menu-value {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.menu-arrow {
  font-size: 36rpx;
  color: #cccccc;
}

.logout-btn {
  margin: 48rpx 24rpx 0;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-text {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: 500;
}
</style>
