<template>
  <view class="settings-page">
    <!-- 通知设置 -->
    <view class="section">
      <text class="section-title">通知设置</text>
      <view class="cell">
        <text class="cell-label">预约提醒通知</text>
        <switch
          :checked="settingsStore.notificationEnabled"
          color="#FF6B6B"
          @change="onNotificationChange"
        />
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

    <!-- 法律文档 -->
    <view class="section">
      <text class="section-title">法律文档</text>
      <view class="cell" @click="openLegalPage('privacy-policy', '隐私政策')">
        <text class="cell-label">隐私政策</text>
        <text class="cell-arrow">›</text>
      </view>
      <view class="cell" @click="openLegalPage('user-agreement', '用户协议')">
        <text class="cell-label">用户协议</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <text class="section-title">关于</text>
      <view class="cell">
        <text class="cell-label">应用版本</text>
        <text class="cell-value">v{{ settingsStore.appVersion }}</text>
      </view>
      <view class="cell">
        <text class="cell-label">关于 GlassCraft</text>
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
  settingsStore.setNotification(enabled)
}

function onClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: `当前缓存大小 ${cacheSize.value}，确定要清除吗？`,
    success: (res) => {
      if (res.confirm) {
        try {
          settingsStore.clearCache()
          calcCacheSize()
          uni.showToast({ title: '清除成功', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function openLegalPage(filename: string, title: string) {
  uni.navigateTo({
    url: `/pages/webview/index?url=/static/legal/${filename}.html&title=${encodeURIComponent(title)}`
  })
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
