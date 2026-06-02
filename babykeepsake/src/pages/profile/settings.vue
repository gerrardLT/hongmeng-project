<template>
  <view class="settings-page">
    <!-- 通知与权限 -->
    <view class="section">
      <text class="section-title">通知与权限</text>
      <view class="cell">
        <text class="cell-label">消息通知</text>
        <switch
          :checked="settingsStore.notificationEnabled"
          color="#FF6B35"
          @change="onNotificationChange"
        />
      </view>
      <view class="cell">
        <text class="cell-label">位置权限</text>
        <switch
          :checked="settingsStore.locationEnabled"
          color="#FF6B35"
          @change="onLocationChange"
        />
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <text class="section-title">关于</text>
      <view class="cell">
        <text class="cell-label">应用版本</text>
        <text class="cell-value">v1.0.0</text>
      </view>
      <view class="cell">
        <text class="cell-label">开发者</text>
        <text class="cell-value">BabyKeepsake Team</text>
      </view>
    </view>

    <!-- 存储 -->
    <view class="section">
      <text class="section-title">存储</text>
      <view class="cell" @click="onClearCache">
        <text class="cell-label">清除缓存</text>
        <view class="cell-right">
          <text class="cell-value">{{ cacheSize }}</text>
          <text class="cell-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 更新 -->
    <view class="section">
      <text class="section-title">更新</text>
      <view class="cell" @click="onCheckUpdate">
        <text class="cell-label">检查更新</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store/settings'

const settingsStore = useSettingsStore()
const cacheSize = ref('0 KB')

onShow(() => {
  calcCacheSize()
})

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

function onNotificationChange(e: any) {
  const enabled = e.detail.value
  if (enabled) {
    settingsStore.toggleNotification()
    if (!settingsStore.notificationEnabled) settingsStore.toggleNotification()
  } else {
    if (settingsStore.notificationEnabled) settingsStore.toggleNotification()
  }
}

function onLocationChange(e: any) {
  const enabled = e.detail.value
  if (enabled) {
    settingsStore.toggleLocation()
    if (!settingsStore.locationEnabled) settingsStore.toggleLocation()
  } else {
    if (settingsStore.locationEnabled) settingsStore.toggleLocation()
  }
}

function onClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: `当前缓存大小 ${cacheSize.value}，确定要清除吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          // 备份关键数据
          const userState = uni.getStorageSync('babykeepsake_user')
          const settingsState = uni.getStorageSync('babykeepsake_settings')
          const privacyState = uni.getStorageSync('privacy_agreed')

          // 清除所有存储
          uni.clearStorageSync()

          // 恢复关键数据
          if (userState) uni.setStorageSync('babykeepsake_user', userState)
          if (settingsState) uni.setStorageSync('babykeepsake_settings', settingsState)
          if (privacyState) uni.setStorageSync('privacy_agreed', privacyState)

          calcCacheSize()
          uni.showToast({ title: '清除成功', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function onCheckUpdate() {
  uni.showLoading({ title: '检查中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '已是最新版本', icon: 'none' })
  }, 1500)
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 48rpx;
}

.section {
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: 24rpx;
  color: $text-secondary;
  padding: $spacing-md $spacing-lg $spacing-xs;
  display: block;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 $spacing-lg;
  background-color: $bg-card;
  border-bottom: 2rpx solid $bg-page;
}

.cell:first-of-type {
  border-radius: $radius-lg $radius-lg 0 0;
}

.cell:last-of-type {
  border-bottom: none;
  border-radius: 0 0 $radius-lg $radius-lg;
}

.cell:only-of-type {
  border-radius: $radius-lg;
}

.cell-label {
  font-size: 28rpx;
  color: $text-primary;
}

.cell-value {
  font-size: 28rpx;
  color: $text-secondary;
}

.cell-right {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
}

.cell-arrow {
  font-size: 28rpx;
  color: $text-hint;
}
</style>
