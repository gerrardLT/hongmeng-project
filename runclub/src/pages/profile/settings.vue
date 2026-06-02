<template>
  <view class="page">
    <!-- 账号信息 -->
    <view class="section">
      <text class="section-title">账号信息</text>
      <view class="card">
        <view class="info-row">
          <text class="info-label">昵称</text>
          <text class="info-value">{{ userStore.nickname || '未设置' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">用户ID</text>
          <text class="info-value">{{ userStore.userId || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="card">
        <view class="menu-item" @click="onSyncData">
          <text class="menu-label">数据同步</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @click="onClearCache">
          <text class="menu-label">清除缓存</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 通知设置 -->
    <view class="section">
      <text class="section-title">通知设置</text>
      <view class="card">
        <view class="switch-row">
          <text class="switch-label">活动提醒</text>
          <switch :checked="activityReminder" color="#FF5722" @change="activityReminder = $event.detail.value" />
        </view>
        <view class="switch-row">
          <text class="switch-label">训练提醒</text>
          <switch :checked="trainingReminder" color="#FF5722" @change="trainingReminder = $event.detail.value" />
        </view>
      </view>
    </view>

    <!-- 版本 -->
    <view class="section">
      <view class="card">
        <view class="info-row">
          <text class="info-label">当前版本</text>
          <text class="info-value">v1.0.0</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="userStore.isLoggedIn" class="section">
      <view class="btn-logout" @click="onLogout">
        <text class="btn-logout-text">退出登录</text>
      </view>
    </view>

    <!-- 注销账号 -->
    <view v-if="userStore.isLoggedIn" class="section">
      <view class="btn-deactivate" @click="onDeactivate">
        <text class="btn-deactivate-text">注销账号</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { syncData, clearAllData } from '@/services/storage'
import { logout as authLogout } from '@/services/auth'

const userStore = useUserStore()

const activityReminder = ref(true)
const trainingReminder = ref(true)

async function onSyncData() {
  uni.showLoading({ title: '同步中...' })
  try {
    await syncData()
    uni.hideLoading()
    uni.showToast({ title: '同步完成', icon: 'success' })
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '同步失败', icon: 'none' })
  }
}

function onClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除本地缓存数据吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await clearAllData()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function onLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await authLogout()
          userStore.logout()
          uni.reLaunch({ url: '/pages/login/index' })
        } catch (e) {
          uni.showToast({ title: '退出失败', icon: 'none' })
        }
      }
    }
  })
}

function onDeactivate() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被永久删除，且无法恢复。确定要注销账号吗？',
    confirmColor: '#F44336',
    success: (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '请再次确认：您即将永久删除账号和所有数据。',
          confirmColor: '#F44336',
          success: async (res2) => {
            if (res2.confirm) {
              try {
                await clearAllData()
                userStore.logout()
                uni.reLaunch({ url: '/pages/login/index' })
                uni.showToast({ title: '账号已注销', icon: 'none' })
              } catch (e) {
                uni.showToast({ title: '注销失败', icon: 'none' })
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
  background: #F5F5F5;
  padding: 24rpx;
  padding-bottom: 60rpx;
}

.section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.info-row {
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

.info-label {
  font-size: 28rpx;
  color: #333333;
}

.info-value {
  font-size: 28rpx;
  color: #999999;
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

.menu-label {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 30rpx;
  color: #CCCCCC;
}

.switch-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
  &:last-child {
    border-bottom: none;
  }
}

.switch-label {
  font-size: 28rpx;
  color: #333333;
}

.btn-logout {
  height: 88rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-logout-text {
  font-size: 30rpx;
  color: #F44336;
  font-weight: 600;
}

.btn-deactivate {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-deactivate-text {
  font-size: 26rpx;
  color: #CCCCCC;
}
</style>
