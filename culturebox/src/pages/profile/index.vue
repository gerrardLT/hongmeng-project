<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="handleLogin">
        <view class="user-avatar-wrap">
          <image
            v-if="userStore.userInfo?.avatar"
            class="user-avatar"
            :src="userStore.userInfo.avatar"
          />
          <text v-else class="user-avatar-placeholder">👤</text>
        </view>
        <view class="user-meta">
          <text class="user-name">{{ userStore.isLoggedIn ? userStore.userInfo?.nickname : '未登录' }}</text>
        </view>
        <view
          v-if="!userStore.isLoggedIn"
          class="login-btn"
          @click.stop="handleLogin"
        >
          <text class="login-btn-text">登录</text>
        </view>
        <view
          v-else
          class="logout-btn-small"
          @click.stop="handleLogout"
        >
          <text class="logout-btn-text">注销</text>
        </view>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ entryStore.totalCount }}</text>
        <text class="stat-label">条目总数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ tagStore.tags.length }}</text>
        <text class="stat-label">标签数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-value">{{ exchangeStore.receivedLists.length }}</text>
        <text class="stat-label">收到书单</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-card">
      <!-- 标签管理 -->
      <view class="menu-item" @click="toggleTagManager">
        <text class="menu-icon">📦</text>
        <view class="menu-content">
          <text class="menu-title">标签管理</text>
          <text class="menu-value">{{ tagStore.tags.length }} 个标签</text>
        </view>
        <text class="menu-arrow">{{ tagManagerExpanded ? '▾' : '›' }}</text>
      </view>
      <!-- 标签管理展开区域 -->
      <view v-if="tagManagerExpanded" class="tag-manager">
        <view
          v-for="tag in tagStore.sortedTags"
          :key="tag.tagId"
          class="tag-row"
        >
          <view class="tag-info">
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.count }} 次使用</text>
          </view>
          <text class="tag-delete" @click="confirmDeleteTag(tag.tagId, tag.name)">删除</text>
        </view>
        <Empty
          v-if="tagStore.tags.length === 0"
          icon="🏷️"
          text="暂无标签"
        />
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">☁️</text>
        <view class="menu-content">
          <text class="menu-title">云同步设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="openWebview('user-agreement.html', '用户协议')">
        <text class="menu-icon">📋</text>
        <view class="menu-content">
          <text class="menu-title">用户协议</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="openWebview('privacy-policy.html', '隐私政策')">
        <text class="menu-icon">🔒</text>
        <view class="menu-content">
          <text class="menu-title">隐私政策</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="openWebview('disclaimer.html', '免责声明')">
        <text class="menu-icon">⚠️</text>
        <view class="menu-content">
          <text class="menu-title">免责声明</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="exportData">
        <text class="menu-icon">📤</text>
        <view class="menu-content">
          <text class="menu-title">导出数据</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="confirmClearData">
        <text class="menu-icon">🗑️</text>
        <view class="menu-content">
          <text class="menu-title">清除数据</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-divider" />

      <view class="menu-item" @click="confirmDeleteAccount">
        <text class="menu-icon">🚪</text>
        <view class="menu-content">
          <text class="menu-title">注销账号</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 清除数据确认弹窗 -->
    <Dialog
      :visible="clearDataDialogVisible"
      title="清除数据"
      content="确定要清除所有本地数据吗？此操作不可恢复。"
      confirm-text="清除"
      @update:visible="clearDataDialogVisible = $event"
      @confirm="doClearData"
    />

    <!-- 注销账号确认弹窗 -->
    <Dialog
      :visible="deleteAccountDialogVisible"
      title="注销账号"
      content="注销后将清除所有数据并退出登录，确定要继续吗？"
      confirm-text="确认注销"
      @update:visible="deleteAccountDialogVisible = $event"
      @confirm="doDeleteAccount"
    />

    <!-- 删除标签确认弹窗 -->
    <Dialog
      :visible="deleteTagDialogVisible"
      title="删除标签"
      :content="'确定要删除标签「' + deleteTagName + '"吗？'"
      confirm-text="删除"
      @update:visible="deleteTagDialogVisible = $event"
      @confirm="doDeleteTag"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useEntryStore } from '@/store/entry'
import { useExchangeStore } from '@/store/exchange'
import { useTagStore } from '@/store/tag'
import { clearAllData } from '@/services/storage'
import Dialog from '@/components/common/Dialog.vue'
import Empty from '@/components/common/Empty.vue'

const userStore = useUserStore()
const entryStore = useEntryStore()
const exchangeStore = useExchangeStore()
const tagStore = useTagStore()

// 标签管理展开
const tagManagerExpanded = ref(false)

// 弹窗状态
const clearDataDialogVisible = ref(false)
const deleteAccountDialogVisible = ref(false)
const deleteTagDialogVisible = ref(false)
const deleteTagId = ref('')
const deleteTagName = ref('')

function handleLogin() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认注销',
    content: '确定要退出当前账号吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

function toggleTagManager() {
  tagManagerExpanded.value = !tagManagerExpanded.value
}

function confirmDeleteTag(tagId: string, tagName: string) {
  deleteTagId.value = tagId
  deleteTagName.value = tagName
  deleteTagDialogVisible.value = true
}

function doDeleteTag() {
  if (deleteTagId.value) {
    tagStore.removeTag(deleteTagId.value)
    uni.showToast({ title: '标签已删除', icon: 'success' })
  }
  deleteTagId.value = ''
  deleteTagName.value = ''
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function openWebview(filename: string, title: string) {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/' + filename) + '&title=' + encodeURIComponent(title)
  })
}

function exportData() {
  try {
    const data = JSON.stringify(entryStore.entries, null, 2)
    const fileName = `culturebox-export-${Date.now()}.json`

    // #ifdef APP-HARMONY || APP-PLUS
    uni.saveFile({
      tempFilePath: '',
      success: () => {
        uni.showToast({ title: '导出成功', icon: 'success' })
      },
      fail: () => {
        // 降级：复制到剪贴板
        uni.setClipboardData({
          data,
          success: () => {
            uni.showToast({ title: '数据已复制到剪贴板', icon: 'success' })
          }
        })
      }
    })
    // #endif

    // #ifndef APP-HARMONY
    // 非App端，直接复制到剪贴板
    uni.setClipboardData({
      data,
      success: () => {
        uni.showToast({ title: '数据已复制到剪贴板', icon: 'success' })
      }
    })
    // #endif
  } catch (e) {
    uni.showToast({ title: '导出失败', icon: 'none' })
  }
}

function confirmClearData() {
  clearDataDialogVisible.value = true
}

function doClearData() {
  clearAllData()
  entryStore.entries.splice(0, entryStore.entries.length)
  exchangeStore.receivedLists.splice(0, exchangeStore.receivedLists.length)
  exchangeStore.savedEntries.splice(0, exchangeStore.savedEntries.length)
  tagStore.tags.splice(0, tagStore.tags.length)
  uni.showToast({ title: '数据已清除', icon: 'success' })
}

function confirmDeleteAccount() {
  deleteAccountDialogVisible.value = true
}

function doDeleteAccount() {
  clearAllData()
  userStore.logout()
  entryStore.entries.splice(0, entryStore.entries.length)
  exchangeStore.receivedLists.splice(0, exchangeStore.receivedLists.length)
  exchangeStore.savedEntries.splice(0, exchangeStore.savedEntries.length)
  tagStore.tags.splice(0, tagStore.tags.length)
  uni.showToast({ title: '账号已注销', icon: 'success' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' })
  }, 1500)
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
}

.user-card {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.user-info {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.user-avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
}

.user-avatar-placeholder {
  font-size: 56rpx;
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.user-name {
  font-size: $font-xl;
  font-weight: 600;
  color: #FFFFFF;
}

.login-btn {
  padding: $spacing-xs $spacing-lg;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: $radius-pill;
}

.login-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
}

.logout-btn-small {
  padding: $spacing-xs $spacing-lg;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: $radius-pill;
}

.logout-btn-text {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.9);
}

.stats-card {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-sm;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stat-value {
  font-size: $font-xxl;
  font-weight: 700;
  color: $primary-color;
}

.stat-label {
  font-size: $font-xs;
  color: $text-secondary;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: $border-color;
  align-self: center;
}

.menu-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  gap: $spacing-md;

  &:active {
    background-color: $bg-color;
  }
}

.menu-icon {
  font-size: 40rpx;
  width: 48rpx;
  text-align: center;
}

.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.menu-title {
  font-size: $font-md;
  color: $text-primary;
}

.menu-value {
  font-size: $font-sm;
  color: $text-secondary;
}

.menu-arrow {
  font-size: $font-lg;
  color: $text-hint;
}

.menu-divider {
  height: 1rpx;
  background-color: $border-color;
  margin-left: 88rpx;
}

.tag-manager {
  padding: $spacing-sm $spacing-lg $spacing-md 88rpx;
  background-color: $bg-color;
}

.tag-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.tag-name {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 500;
}

.tag-count {
  font-size: $font-xs;
  color: $text-hint;
}

.tag-delete {
  font-size: $font-xs;
  color: $error-color;
  padding: 4rpx $spacing-sm;
}
</style>
