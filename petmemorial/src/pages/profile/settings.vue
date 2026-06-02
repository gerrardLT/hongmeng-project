<template>
  <view class="settings-page">
    <!-- 通用设置 -->
    <view class="section-title">通用</view>
    <view class="menu-section">
      <view class="menu-item" @click="goAccount">
        <text class="menu-icon">👤</text>
        <text class="menu-text">账户管理</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">🔔</text>
        <text class="menu-text">通知设置</text>
        <view class="switch-wrap">
          <switch
            :checked="notificationEnabled"
            color="#8B5CF6"
            @change="onNotificationChange"
          />
        </view>
      </view>
    </view>

    <!-- 法律信息 -->
    <view class="section-title">法律与隐私</view>
    <view class="menu-section">
      <view class="menu-item" @click="goWebView('/static/legal/privacy-policy.html', '隐私政策')">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goWebView('/static/legal/user-agreement.html', '用户协议')">
        <text class="menu-icon">📄</text>
        <text class="menu-text">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goWebView('/static/legal/third-party-sdk.html', '第三方SDK目录')">
        <text class="menu-icon">📦</text>
        <text class="menu-text">第三方SDK目录</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 存储 -->
    <view class="section-title">存储</view>
    <view class="menu-section">
      <view class="menu-item" @click="clearCache">
        <text class="menu-icon">🗑</text>
        <text class="menu-text">清除缓存</text>
        <view class="menu-right">
          <text class="cache-size">{{ cacheSize }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section-title">关于</view>
    <view class="menu-section">
      <view class="menu-item">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于 PetMemorial</text>
        <view class="menu-right">
          <text class="version-badge">v1.0.0</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-wrap" v-if="userStore.isLoggedIn">
      <view class="logout-btn" @click="confirmLogout">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <!-- 退出确认弹窗 -->
    <Dialog
      :visible="showLogoutDialog"
      title="退出登录"
      content="确定要退出登录吗？"
      confirmText="退出"
      cancelText="取消"
      :showCancel="true"
      @confirm="onLogoutConfirm"
      @cancel="showLogoutDialog = false"
      @close="showLogoutDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { logout } from '@/services/auth'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const showLogoutDialog = ref(false)
const notificationEnabled = ref(userStore.userInfo?.notificationEnabled ?? true)
const cacheSize = ref('计算中...')

// 计算缓存大小（模拟）
function calcCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const kb = info.currentSize || 0
    if (kb < 1024) {
      cacheSize.value = `${kb} KB`
    } else {
      cacheSize.value = `${(kb / 1024).toFixed(1)} MB`
    }
  } catch (e) {
    cacheSize.value = '未知'
  }
}

calcCacheSize()

function onNotificationChange(e: any) {
  notificationEnabled.value = e.detail.value
  if (userStore.userInfo) {
    userStore.setUserInfo({ ...userStore.userInfo, notificationEnabled: e.detail.value })
  }
}

function goAccount() {
  uni.navigateTo({ url: '/pages/profile/account' })
}

function goWebView(url: string, title: string) {
  uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` })
}

function clearCache() {
  uni.showModal({
    title: '清除缓存',
    content: `当前缓存大小：${cacheSize.value}，确定清除吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          // 保留登录状态和用户数据，只清除临时缓存
          uni.showLoading({ title: '清除中...' })
          setTimeout(() => {
            uni.hideLoading()
            cacheSize.value = '0 KB'
            uni.showToast({ title: '缓存已清除', icon: 'success' })
          }, 800)
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function confirmLogout() {
  showLogoutDialog.value = true
}

async function onLogoutConfirm() {
  try {
    await logout()
    userStore.logout()
    showLogoutDialog.value = false
    uni.reLaunch({ url: '/pages/login/index' })
  } catch (e) {
    uni.showToast({ title: '退出失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 60rpx;
}

.section-title {
  font-size: 24rpx;
  color: $text-hint;
  padding: $spacing-md $spacing-xl $spacing-xs;
  display: block;
}

.menu-section {
  margin: 0 $spacing-lg $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 32rpx;
  margin-right: $spacing-md;
  width: 48rpx;
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

.menu-right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.cache-size {
  font-size: 24rpx;
  color: $text-hint;
}

.version-badge {
  font-size: 24rpx;
  color: $text-hint;
  background-color: $bg-page;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.switch-wrap {
  flex-shrink: 0;
}

.logout-wrap {
  margin: $spacing-xl $spacing-lg 0;
}

.logout-btn {
  height: 88rpx;
  background-color: $bg-card;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $error;
}

.logout-text {
  font-size: 30rpx;
  color: $error;
  font-weight: 500;
}
</style>
