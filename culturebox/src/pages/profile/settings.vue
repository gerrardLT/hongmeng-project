<template>
  <view class="settings-page">
    <!-- 同步设置 -->
    <view class="section">
      <text class="section-title">同步设置</text>
      <view class="setting-card">
        <view class="setting-row">
          <text class="setting-label">Wi-Fi 下自动同步</text>
          <switch
            :checked="settings.syncOnWifi"
            color="#8B6914"
            @change="onWifiSyncChange"
          />
        </view>
        <view class="setting-divider" />
        <view class="setting-row">
          <text class="setting-label">移动网络同步</text>
          <switch
            :checked="settings.syncOnMobile"
            color="#8B6914"
            @change="onMobileSyncChange"
          />
        </view>
        <view class="setting-divider" />
        <view class="sync-action" :class="{ loading: syncLoading }" @click="handleSyncNow">
          <text class="sync-action-text">{{ syncLoading ? '同步中...' : '立即同步' }}</text>
        </view>
      </view>
    </view>

    <!-- 关于 CultureBox -->
    <view class="section">
      <text class="section-title">关于 CultureBox</text>
      <view class="setting-card">
        <view class="setting-row">
          <text class="setting-label">版本号</text>
          <text class="setting-value">1.0.0</text>
        </view>
        <view class="setting-divider" />
        <view class="setting-row">
          <text class="setting-label">应用介绍</text>
          <text class="setting-value">个人文化收藏应用</text>
        </view>
      </view>
    </view>

    <!-- 底部链接 -->
    <view class="footer">
      <text class="footer-link" @click="openAboutUs">关于我们</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { saveSettings, loadSettings, syncToCloud } from '@/services/storage'
import type { UserSettings } from '@/types/models'

const settings = ref<UserSettings>({
  syncOnWifi: true,
  syncOnMobile: false
})

const syncLoading = ref(false)

// 初始化加载设置
function initSettings() {
  const saved = loadSettings()
  if (saved) {
    settings.value = { ...saved }
  }
}
initSettings()

function persistSettings() {
  saveSettings({ ...settings.value })
}

function onWifiSyncChange(e: any) {
  settings.value.syncOnWifi = e.detail.value
  persistSettings()
}

function onMobileSyncChange(e: any) {
  settings.value.syncOnMobile = e.detail.value
  persistSettings()
}

async function handleSyncNow() {
  if (syncLoading.value) return
  syncLoading.value = true
  try {
    await syncToCloud()
    uni.showToast({ title: '同步完成', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '同步失败', icon: 'none' })
  } finally {
    syncLoading.value = false
  }
}

function openAboutUs() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/about-us.html') + '&title=' + encodeURIComponent('关于我们')
  })
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  display: block;
  padding-left: $spacing-sm;
}

.setting-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md $spacing-lg;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;
}

.setting-value {
  font-size: $font-sm;
  color: $text-hint;
}

.setting-divider {
  height: 1rpx;
  background-color: $border-color;
}

.sync-action {
  padding: $spacing-md 0;
  text-align: center;
  margin-top: $spacing-sm;
  border-radius: $radius-md;
  background-color: rgba($primary-color, 0.06);
  transition: all $transition-fast;

  &:active {
    opacity: 0.7;
  }

  &.loading {
    opacity: 0.6;
    pointer-events: none;
  }
}

.sync-action-text {
  font-size: $font-md;
  color: $primary-color;
  font-weight: 500;
}

.footer {
  display: flex;
  justify-content: center;
  padding: $spacing-xl 0;
}

.footer-link {
  font-size: $font-md;
  color: $primary-color;
  text-decoration: underline;
}
</style>
