<template>
  <view class="page">
    <!-- 用户信息区 -->
    <view class="user-header">
      <view class="user-card">
        <view class="avatar-wrapper">
          <image v-if="userStore.userInfo?.avatar" class="avatar" :src="userStore.userInfo.avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-text">{{ (userStore.nickname || '妈').slice(0, 1) }}</text>
          </view>
        </view>
        <view class="user-info">
          <view class="nickname-row">
            <text class="nickname">{{ userStore.isLoggedIn ? userStore.nickname : '未登录' }}</text>
            <view v-if="pregnancyStore.hasProfile" class="status-tag">
              <text class="status-tag-text">孕{{ pregnancyStore.currentWeek.week }}周</text>
            </view>
          </view>
          <text v-if="pregnancyStore.hasProfile" class="due-date">预产期 {{ pregnancyStore.currentProfile?.dueDate }}</text>
          <text v-else class="due-date">完善孕期档案，获得专业指导</text>
        </view>
      </view>
    </view>

    <!-- 孕期档案信息卡片 -->
    <view v-if="pregnancyStore.hasProfile" class="profile-card">
      <view class="profile-header">
        <text class="profile-title">孕期档案</text>
        <view class="edit-btn" @click="onEditProfile">
          <text class="edit-btn-text">编辑</text>
        </view>
      </view>
      <view class="profile-grid">
        <view class="profile-item">
          <text class="profile-value">{{ pregnancyStore.currentProfile?.height || '-' }}</text>
          <text class="profile-label">身高(cm)</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ pregnancyStore.currentProfile?.preWeight || '-' }}</text>
          <text class="profile-label">孕前体重(kg)</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ formatBMI(pregnancyStore.currentProfile?.preBMI || 0) }}</text>
          <text class="profile-label">孕前BMI</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ pregnancyStore.currentProfile?.dueDate || '-' }}</text>
          <text class="profile-label">预产期</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ pregnancyStore.currentWeek.week }}+{{ pregnancyStore.currentWeek.day }}</text>
          <text class="profile-label">当前孕周</text>
        </view>
        <view class="profile-item">
          <text class="profile-value">{{ pregnancyStore.currentProfile?.targetGainMin }}-{{ pregnancyStore.currentProfile?.targetGainMax }}</text>
          <text class="profile-label">推荐增重(kg)</text>
        </view>
      </view>
    </view>

    <!-- 功能入口列表 -->
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

    <!-- 底部操作 -->
    <view class="bottom-section">
      <view v-if="userStore.isLoggedIn" class="logout-btn" @click="onLogout">
        <text class="logout-text">退出登录</text>
      </view>
      <view v-if="userStore.isLoggedIn" class="delete-account" @click="onDeleteAccount">
        <text class="delete-account-text">注销账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { usePregnancyStore } from '@/store/pregnancy'
import { formatBMI } from '@/utils/format'
import { exportData } from '@/services/storage'

const userStore = useUserStore()
const pregnancyStore = usePregnancyStore()

interface MenuItem {
  id: string
  icon: string
  label: string
  action: string
  needLogin?: boolean
}

const menuItems: MenuItem[] = [
  { id: 'family', icon: '👨‍👩‍👧', label: '家人共享', action: 'navigate:/pages/profile/family', needLogin: true },
  { id: 'settings', icon: '⏰', label: '提醒设置', action: 'navigate:/pages/profile/settings' },
  { id: 'checkup', icon: '🏥', label: '产检记录', action: 'navigate:/pages/checkup/add' },
  { id: 'export', icon: '📤', label: '数据导出', action: 'export' },
  { id: 'privacy', icon: '🔒', label: '隐私政策', action: 'webview:privacy-policy.html' },
  { id: 'agreement', icon: '📄', label: '用户协议', action: 'webview:user-agreement.html' },
  { id: 'sdk', icon: '📦', label: '第三方SDK目录', action: 'webview:third-party-sdk.html' },
  { id: 'about', icon: 'ℹ️', label: '关于应用', action: 'about' }
]

onShow(() => {
  userStore.init()
  pregnancyStore.init()
})

function onEditProfile() {
  uni.navigateTo({ url: '/pages/setup/index' })
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

  if (action === 'export') {
    handleExport()
    return
  }

  if (action === 'about') {
    uni.showModal({
      title: '关于 MamaTrack',
      content: 'MamaTrack v1.0.0\n孕期体重追踪与健康管理\n\n© 2026 MamaTrack Team',
      showCancel: false
    })
  }
}

function handleExport() {
  uni.showLoading({ title: '导出中...' })
  exportData().then((json) => {
    uni.hideLoading()
    uni.showModal({
      title: '导出成功',
      content: `数据已导出，共 ${json.length} 字符。数据已复制到剪贴板。`,
      showCancel: false
    })
    uni.setClipboardData({
      data: json,
      success() {
        uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
      }
    })
  }).catch(() => {
    uni.hideLoading()
    uni.showToast({ title: '导出失败', icon: 'none' })
  })
}

function onLogout() {
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

function onDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被永久删除，且无法恢复。确定要继续吗？',
    confirmColor: '#F44336',
    success(res) {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '请再次确认：注销账号后数据不可恢复！',
          confirmText: '确认注销',
          confirmColor: '#F44336',
          success(res2) {
            if (res2.confirm) {
              try {
                uni.clearStorageSync()
                userStore.logout()
                uni.navigateTo({ url: '/pages/login/index' })
              } catch (e) {
                uni.showToast({ title: '操作失败', icon: 'none' })
              }
            }
          }
        })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding-bottom: 120rpx;
}

/* 用户信息区 */
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
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 8rpx;
}

.nickname {
  font-size: $font-xl;
  font-weight: bold;
  color: #FFFFFF;
  margin-right: $spacing-sm;
}

.status-tag {
  background: rgba(255, 255, 255, 0.25);
  border-radius: $border-radius-round;
  padding: 4rpx 16rpx;
}

.status-tag-text {
  font-size: $font-xs;
  color: #FFFFFF;
}

.due-date {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.75);
}

/* 孕期档案信息卡片 */
.profile-card {
  margin: -28rpx $spacing-md $spacing-md;
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-md;
}

.profile-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.profile-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
}

.edit-btn {
  padding: 8rpx 24rpx;
  border-radius: $border-radius-round;
  border: 1rpx solid $primary-color;
}

.edit-btn-text {
  font-size: $font-sm;
  color: $primary-color;
}

.profile-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.profile-item {
  width: 33.33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm 0;
}

.profile-value {
  font-size: $font-lg;
  font-weight: bold;
  color: $primary-color;
  margin-bottom: 4rpx;
}

.profile-label {
  font-size: $font-xs;
  color: $text-hint;
}

/* 功能入口列表 */
.menu-section {
  margin: 0 $spacing-md;
  background: $bg-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.menu-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx $spacing-md;
  border-bottom: 1rpx solid $border-color;

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
  color: $text-hint;
}

/* 底部操作 */
.bottom-section {
  margin-top: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logout-btn {
  width: 80%;
  height: 88rpx;
  border-radius: $border-radius-round;
  border: 1rpx solid $danger-color;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.logout-text {
  font-size: $font-md;
  color: $danger-color;
}

.delete-account {
  padding: $spacing-sm;
}

.delete-account-text {
  font-size: $font-sm;
  color: $text-hint;
  text-decoration: underline;
}
</style>
