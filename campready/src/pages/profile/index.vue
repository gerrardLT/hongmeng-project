<template>
  <view class="profile-page">
    <!-- 用户信息区域 -->
    <view class="user-section card">
      <view class="avatar-wrap">
        <text class="avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || '⛺' }}</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userStore.userInfo?.nickname || '未登录' }}</text>
        <text class="user-id" v-if="userStore.isLoggedIn">ID: {{ userStore.userInfo?.userId?.slice(0, 8) }}</text>
      </view>
      <view v-if="!userStore.isLoggedIn" class="btn-login-small" @click="goLogin">
        <text class="btn-login-text">去登录</text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section card">
      <view class="stat-item">
        <text class="stat-value">{{ checklistsStore.checklists.length }}</text>
        <text class="stat-label">清单</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ gearStore.gears.length }}</text>
        <text class="stat-label">装备</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ completedCount }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="divider" />
      <view class="menu-item" @click="openPrivacy">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="divider" />
      <view class="menu-item" @click="openAgreement">
        <text class="menu-icon">📄</text>
        <text class="menu-text">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="divider" />
      <view class="menu-item" @click="openSDKList">
        <text class="menu-icon">📋</text>
        <text class="menu-text">第三方 SDK 目录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="userStore.isLoggedIn" class="logout-section">
      <view class="btn-logout" @click="handleLogout">
        <text class="btn-logout-text">退出登录</text>
      </view>
      <view class="btn-delete" @click="handleDeleteAccount">
        <text class="btn-delete-text">注销账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useChecklistsStore } from '@/store/checklists'
import { useGearStore } from '@/store/gear'
import { logout } from '@/services/auth'

const userStore = useUserStore()
const checklistsStore = useChecklistsStore()
const gearStore = useGearStore()

/** 已完成清单数量 */
const completedCount = computed(() =>
  checklistsStore.checklists.filter(c => c.status === 'completed').length
)

/** 跳转登录 */
function goLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

/** 跳转设置 */
function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

/** 打开隐私政策 */
function openPrivacy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/privacy-policy.html'
  })
}

/** 打开用户协议 */
function openAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/user-agreement.html'
  })
}

/** 打开第三方SDK目录 */
function openSDKList() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/third-party-sdk.html'
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

/** 注销账号 */
function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后将清除所有数据且无法恢复，确定要注销吗？',
    confirmColor: '#e74c3c',
    success: async (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '此操作不可撤销，是否继续？',
          confirmColor: '#e74c3c',
          success: async (res2) => {
            if (res2.confirm) {
              await logout()
              userStore.logout()
              uni.showToast({ title: '账号已注销', icon: 'success' })
            }
          }
        })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 60rpx;
  box-sizing: border-box;
}

.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 用户信息区域 */
.user-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 36rpx 32rpx;
}

.avatar-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background-color: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 28rpx;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 44rpx;
  color: #2E7D32;
  font-weight: 600;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 34rpx;
  font-weight: 600;
  color: #212121;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999999;
}

.btn-login-small {
  padding: 14rpx 36rpx;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 32rpx;
  flex-shrink: 0;
}

.btn-login-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

/* 数据统计 */
.stats-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 32rpx 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 2rpx;
  height: 48rpx;
  background-color: #E0E0E0;
}

/* 功能菜单 */
.menu-section {
  overflow: hidden;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 32rpx 32rpx;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #cccccc;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  margin: 0 32rpx;
}

/* 退出登录 */
.logout-section {
  margin-top: 24rpx;
}

.btn-logout {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn-logout-text {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: 500;
}

.btn-delete {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.btn-delete-text {
  font-size: 28rpx;
  color: #999999;
}
</style>
