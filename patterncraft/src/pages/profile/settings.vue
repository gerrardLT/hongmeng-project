<template>
  <view class="settings-page">
    <!-- 云同步 -->
    <view class="section">
      <text class="section-title">云同步</text>
      <view class="setting-card">
        <view class="setting-row switch-row">
          <view class="setting-label-group">
            <text class="setting-label">云同步</text>
            <text class="setting-desc">开启后自动同步作品与配色到云端</text>
          </view>
          <switch
            :checked="settingsStore.cloudSyncEnabled"
            color="#C41A16"
            @change="onCloudSyncChange"
          />
        </view>
      </view>
    </view>

    <!-- 自定义配色管理 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">自定义配色</text>
        <text class="section-count">{{ settingsStore.customColors.length }}/10</text>
      </view>

      <!-- 配色列表 -->
      <view class="color-list" v-if="settingsStore.customColors.length > 0">
        <view
          v-for="color in settingsStore.customColors"
          :key="color.colorId"
          class="color-item"
        >
          <view class="color-preview">
            <view class="color-dot" :style="{ backgroundColor: color.primaryColor }" />
            <view class="color-dot" :style="{ backgroundColor: color.secondaryColor }" />
            <view class="color-dot" :style="{ backgroundColor: color.accentColor }" />
          </view>
          <view class="color-info">
            <text class="color-name">{{ color.name }}</text>
            <text class="color-time">{{ formatTime(color.createdAt) }}</text>
          </view>
          <view class="color-delete" @click="onDeleteColor(color.colorId)">
            <text class="delete-icon">✕</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-text">暂无自定义配色</text>
      </view>

      <!-- 添加按钮 -->
      <view
        v-if="settingsStore.customColors.length < 10"
        class="add-color-btn"
        @click="onAddColor"
      >
        <text class="add-icon">+</text>
        <text class="add-text">添加配色方案</text>
      </view>
    </view>

    <!-- 账号管理 -->
    <view class="section">
      <text class="section-title">账号管理</text>
      <view class="setting-card">
        <view class="danger-row" @click="onDeleteAccount">
          <text class="danger-text">注销账号</text>
        </view>
      </view>
      <text class="danger-hint">注销后所有数据将被永久删除，无法恢复</text>
    </view>

    <!-- 注销确认弹窗 -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      title="注销账号"
      confirm-text="确认注销"
      cancel-text="取消"
      @confirm="confirmDeleteAccount"
    >
      <view class="dialog-body">
        <text class="dialog-warn-icon">⚠️</text>
        <text class="dialog-text">确定要注销账号吗？此操作将永久删除您的所有数据，包括作品、收藏和自定义配色，且无法恢复。</text>
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/store/settings'
import { useUserStore } from '@/store/user'
import Dialog from '@/components/common/Dialog.vue'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

const deleteDialogVisible = ref(false)

/** 云同步切换 */
function onCloudSyncChange() {
  settingsStore.toggleCloudSync()
  uni.showToast({
    title: settingsStore.cloudSyncEnabled ? '已开启云同步' : '已关闭云同步',
    icon: 'none'
  })
}

/** 格式化时间 */
function formatTime(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 删除配色 */
function onDeleteColor(colorId: string) {
  uni.showModal({
    title: '删除配色',
    content: '确定要删除这个配色方案吗？',
    confirmColor: '#C41A16',
    success: (res) => {
      if (res.confirm) {
        settingsStore.deleteCustomColor(colorId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

/** 添加配色 */
function onAddColor() {
  if (settingsStore.customColors.length >= 10) {
    uni.showToast({ title: '最多保存10套配色', icon: 'none' })
    return
  }
  // 生成随机配色用于演示
  const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  const colorNames = ['朱砂', '藤黄', '石青', '花青', '赭石', '靛蓝', '胭脂', '雌黄', '铅白', '松烟']
  const usedNames = settingsStore.customColors.map(c => c.name)
  const availableNames = colorNames.filter(n => !usedNames.includes(n))
  const name = availableNames.length > 0 ? availableNames[0] : `配色${settingsStore.customColors.length + 1}`

  settingsStore.addCustomColor({
    userId: userStore.userId || 'local',
    name,
    primaryColor: randomHex(),
    secondaryColor: randomHex(),
    accentColor: randomHex()
  })
  uni.showToast({ title: '已添加配色', icon: 'success' })
}

/** 注销账号 */
function onDeleteAccount() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '当前未登录', icon: 'none' })
    return
  }
  deleteDialogVisible.value = true
}

/** 确认注销 */
function confirmDeleteAccount() {
  deleteDialogVisible.value = false
  userStore.logout()
  uni.showToast({ title: '账号已注销', icon: 'success' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 1500)
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
}

/* ===== 区块 ===== */
.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  display: block;
  padding-left: $spacing-sm;
}

.section-count {
  font-size: $font-sm;
  color: $text-hint;
  padding-right: $spacing-sm;
}

/* ===== 设置卡片 ===== */
.setting-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-row {
  gap: $spacing-md;
}

.setting-label-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.setting-desc {
  font-size: $font-sm;
  color: $text-hint;
}

/* ===== 配色列表 ===== */
.color-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.color-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
}

.color-preview {
  display: flex;
  gap: $spacing-xs;
}

.color-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
}

.color-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.color-name {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.color-time {
  font-size: $font-xs;
  color: $text-hint;
}

.color-delete {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: $bg-secondary;

  &:active {
    background-color: rgba(244, 67, 54, 0.1);
  }
}

.delete-icon {
  font-size: $font-sm;
  color: $text-hint;
}

/* ===== 空状态 ===== */
.empty-state {
  padding: $spacing-xl;
  text-align: center;
}

.empty-text {
  font-size: $font-md;
  color: $text-hint;
}

/* ===== 添加按钮 ===== */
.add-color-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  padding: $spacing-md;
  margin-top: $spacing-sm;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 2rpx dashed $border-color;
  transition: all $transition-fast;

  &:active {
    border-color: $primary-color;
    background-color: rgba(196, 26, 22, 0.03);
  }
}

.add-icon {
  font-size: $font-xl;
  color: $primary-color;
  font-weight: 300;
}

.add-text {
  font-size: $font-md;
  color: $text-secondary;
}

/* ===== 危险操作 ===== */
.danger-row {
  padding: $spacing-md 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }
}

.danger-text {
  font-size: $font-md;
  color: $error-color;
  font-weight: 500;
}

.danger-hint {
  font-size: $font-xs;
  color: $text-hint;
  display: block;
  text-align: center;
  margin-top: $spacing-xs;
}

/* ===== 弹窗 ===== */
.dialog-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md 0;
}

.dialog-warn-icon {
  font-size: 64rpx;
}

.dialog-text {
  font-size: $font-md;
  color: $text-secondary;
  line-height: 1.6;
  text-align: center;
}
</style>
