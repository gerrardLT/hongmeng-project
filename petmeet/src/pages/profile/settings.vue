<template>
  <view class="settings-page">
    <NavBar title="设置" />

    <!-- 账号管理 -->
    <view class="section">
      <view class="section-title">账号管理</view>
      <view class="cell">
        <text class="cell-label">当前账号</text>
        <text class="cell-value">{{ maskedAccount }}</text>
      </view>
    </view>

    <!-- 通用设置 -->
    <view class="section">
      <view class="section-title">通用设置</view>
      <view class="cell" @click="onClearCache">
        <text class="cell-label">清除缓存</text>
        <view class="cell-right">
          <text class="cell-value">{{ cacheSize }}</text>
          <text class="cell-arrow">&gt;</text>
        </view>
      </view>
      <view class="cell">
        <text class="cell-label">消息通知</text>
        <switch
          :checked="notificationEnabled"
          color="#FF6B35"
          @change="onNotificationChange"
        />
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <view class="section-title">关于</view>
      <view class="cell">
        <text class="cell-label">当前版本</text>
        <text class="cell-value">v1.0.0</text>
      </view>
      <view class="cell" @click="goToPrivacy">
        <text class="cell-label">用户协议</text>
        <text class="cell-arrow">&gt;</text>
      </view>
      <view class="cell" @click="goToPrivacy">
        <text class="cell-label">隐私政策</text>
        <text class="cell-arrow">&gt;</text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer-actions">
      <button class="logout-btn" @click="onLogout">退出登录</button>
      <text class="delete-account-link" @click="onDeleteAccount">注销账号</text>
    </view>

    <!-- 退出登录确认对话框 -->
    <Dialog
      :visible="logoutDialogVisible"
      title="提示"
      content="确定要退出登录吗？"
      :show-cancel="true"
      @confirm="confirmLogout"
      @cancel="logoutDialogVisible = false"
      @close="logoutDialogVisible = false"
    />

    <!-- 注销账号警告对话框 -->
    <Dialog
      :visible="deleteDialogVisible"
      title="严重警告"
      content="注销账号将删除所有数据，且无法恢复，确定要注销吗？"
      :show-cancel="true"
      confirm-text="确定注销"
      @confirm="confirmDeleteWarning"
      @cancel="deleteDialogVisible = false"
      @close="deleteDialogVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onShow } from 'vue'
import { useUserStore } from '@/store/user'
import { logout as authLogout } from '@/services/auth'
import NavBar from '@/components/common/NavBar.vue'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()

const cacheSize = ref('0 KB')
const notificationEnabled = ref(true)
const logoutDialogVisible = ref(false)
const deleteDialogVisible = ref(false)

const SETTINGS_KEY = 'petmeet_settings'

const maskedAccount = computed(() => {
  const userId = userStore.userInfo?.userId || ''
  if (!userId) return '未登录'

  if (userId.startsWith('phone_')) {
    const suffix = userId.split('_')[1] || ''
    return `1********${suffix}`
  }

  if (userId.startsWith('hw_')) {
    const suffix = userId.slice(-4)
    return `华为用户 ****${suffix}`
  }

  return `用户 ${userId.slice(0, 8)}...`
})

function loadSettings() {
  try {
    const settings = uni.getStorageSync(SETTINGS_KEY) as { notification?: boolean } | undefined
    if (settings && typeof settings.notification === 'boolean') {
      notificationEnabled.value = settings.notification
    }
  } catch (e) {
    console.error('load settings error:', e)
  }
}

function saveSettings() {
  try {
    uni.setStorageSync(SETTINGS_KEY, { notification: notificationEnabled.value })
  } catch (e) {
    console.error('save settings error:', e)
  }
}

function calcCacheSize() {
  uni.getStorageInfo({
    success: (res) => {
      const size = res.currentSize || 0
      if (size < 1024) {
        cacheSize.value = `${size.toFixed(2)} KB`
      } else {
        cacheSize.value = `${(size / 1024).toFixed(2)} MB`
      }
    },
    fail: () => {
      cacheSize.value = '未知'
    }
  })
}

onShow(() => {
  loadSettings()
  calcCacheSize()
})

function onClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: `当前缓存大小 ${cacheSize.value}，确定要清除吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          // 备份用户登录状态
          const userState = uni.getStorageSync('petmeet_user')
          const token = uni.getStorageSync('token')
          const settings = uni.getStorageSync(SETTINGS_KEY)

          // 清除所有存储
          uni.clearStorageSync()

          // 恢复用户登录状态和设置
          if (userState) uni.setStorageSync('petmeet_user', userState)
          if (token) uni.setStorageSync('token', token)
          if (settings) uni.setStorageSync(SETTINGS_KEY, settings)

          // 刷新状态
          userStore.checkLoginStatus()
          calcCacheSize()

          uni.showToast({ title: '清除成功', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function onNotificationChange(e: any) {
  notificationEnabled.value = e.detail.value
  saveSettings()
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function onLogout() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '当前未登录', icon: 'none' })
    return
  }
  logoutDialogVisible.value = true
}

async function confirmLogout() {
  logoutDialogVisible.value = false
  userStore.logout()
  await authLogout()
  uni.reLaunch({ url: '/pages/login/index' })
}

function onDeleteAccount() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '当前未登录', icon: 'none' })
    return
  }
  deleteDialogVisible.value = true
}

function confirmDeleteWarning() {
  deleteDialogVisible.value = false
  setTimeout(() => {
    uni.showModal({
      title: '安全验证',
      content: '请输入"确认注销"四个字以继续',
      editable: true,
      placeholderText: '确认注销',
      success: (res) => {
        if (res.confirm && res.content === '确认注销') {
          // 执行注销：清除所有数据
          try {
            uni.clearStorageSync()
          } catch (e) {
            console.error('clear storage error:', e)
          }
          userStore.logout()
          uni.showToast({ title: '账号已注销', icon: 'success' })
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/login/index' })
          }, 1200)
        } else if (res.confirm) {
          uni.showToast({ title: '输入不正确，注销已取消', icon: 'none' })
        }
      }
    })
  }, 300)
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding-bottom: 48rpx;
}

.section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 24rpx;
  color: #636E72;
  padding: 24rpx 32rpx 12rpx;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 32rpx;
  background-color: #FFFFFF;
  border-bottom: 2rpx solid #F8F9FA;
}

.cell:last-child {
  border-bottom: none;
}

.cell-label {
  font-size: 28rpx;
  color: #2D3436;
}

.cell-value {
  font-size: 28rpx;
  color: #636E72;
}

.cell-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.cell-arrow {
  font-size: 28rpx;
  color: #B2BEC3;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 64rpx;
  gap: 32rpx;
}

.logout-btn {
  width: 80%;
  height: 88rpx;
  background-color: #FFFFFF;
  color: #FF4D4F;
  font-size: 32rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.logout-btn::after {
  border: none;
}

.delete-account-link {
  font-size: 24rpx;
  color: #B2BEC3;
}
</style>
