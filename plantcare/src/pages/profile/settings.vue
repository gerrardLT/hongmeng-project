<template>
  <view class="page">
    <!-- 提醒时间设置 -->
    <view class="section">
      <text class="section-title">提醒设置</text>
      <view class="setting-card">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">⏰</text>
            <text class="setting-label">提醒时间</text>
          </view>
          <picker mode="time" :value="reminderTime" @change="onTimeChange">
            <text class="setting-value">{{ reminderTime }} ›</text>
          </picker>
        </view>
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🧠</text>
            <text class="setting-label">智能提醒</text>
          </view>
          <switch :checked="smartReminder" color="#4CAF50" @change="onSmartChange" />
        </view>
      </view>
    </view>

    <!-- 同步设置 -->
    <view class="section">
      <text class="section-title">数据</text>
      <view class="setting-card">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">☁️</text>
            <text class="setting-label">云同步</text>
          </view>
          <switch :checked="cloudSync" color="#4CAF50" @change="onSyncChange" />
        </view>
        <view class="setting-item" @click="handleClearCache">
          <view class="setting-left">
            <text class="setting-icon">🗑️</text>
            <text class="setting-label">清除缓存</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 账号 -->
    <view class="section">
      <text class="section-title">账号</text>
      <view class="setting-card">
        <view class="setting-item danger-item" @click="handleDeleteAccount">
          <view class="setting-left">
            <text class="setting-icon">⚠️</text>
            <text class="setting-label setting-label--danger">注销账号</text>
          </view>
          <text class="setting-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-section">
      <text class="version-text">PlantCare v1.0.0</text>
      <text class="version-build">Build 2026.04</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const reminderTime = ref('08:00')
const smartReminder = ref(false)
const cloudSync = ref(false)

const SETTINGS_KEY = 'plantcare_settings'

onLoad(() => {
  loadSettings()
})

function loadSettings() {
  try {
    const stored = uni.getStorageSync(SETTINGS_KEY) as {
      reminderTime?: string
      smartReminder?: boolean
      cloudSync?: boolean
    } | undefined
    if (stored) {
      reminderTime.value = stored.reminderTime || '08:00'
      smartReminder.value = stored.smartReminder || false
      cloudSync.value = stored.cloudSync || false
    }
  } catch (e) {
    console.error('[settings] load error:', e)
  }
}

function saveSettings() {
  try {
    uni.setStorageSync(SETTINGS_KEY, {
      reminderTime: reminderTime.value,
      smartReminder: smartReminder.value,
      cloudSync: cloudSync.value
    })
  } catch (e) {
    console.error('[settings] save error:', e)
  }
}

function onTimeChange(e: any) {
  reminderTime.value = e.detail.value
  saveSettings()
  uni.showToast({ title: '提醒时间已更新', icon: 'none' })
}

function onSmartChange(e: any) {
  smartReminder.value = e.detail.value
  saveSettings()
}

function onSyncChange(e: any) {
  cloudSync.value = e.detail.value
  saveSettings()
}

function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除缓存数据吗？这不会影响您的植物数据。',
    success(res) {
      if (res.confirm) {
        try {
          uni.removeStorageSync('plantcare_wiki_data')
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function handleDeleteAccount() {
  uni.showModal({
    title: '注销账号',
    content: '注销后所有数据将被永久删除，且无法恢复。确定要继续吗？',
    confirmColor: '#E74C3C',
    success(res) {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '请再次确认：注销账号后数据不可恢复！',
          confirmText: '确认注销',
          confirmColor: '#E74C3C',
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

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  margin-left: $spacing-xs;
}

.setting-card {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.setting-item {
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

.setting-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.setting-icon {
  font-size: 36rpx;
  margin-right: $spacing-sm;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;

  &--danger {
    color: $error-color;
  }
}

.setting-value {
  font-size: $font-md;
  color: $text-secondary;
}

.setting-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.version-section {
  padding: $spacing-xl 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.version-text {
  font-size: $font-sm;
  color: $text-light;
  margin-bottom: 4rpx;
}

.version-build {
  font-size: $font-xs;
  color: $text-light;
}
</style>
