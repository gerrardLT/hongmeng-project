<template>
  <view class="privacy-page">
    <!-- 隐私政策 -->
    <view class="section">
      <text class="section-title">隐私政策</text>
      <view class="cell" @click="openLegalPage('privacy-policy', '隐私政策')">
        <text class="cell-label">查看隐私政策</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 用户协议 -->
    <view class="section">
      <text class="section-title">用户协议</text>
      <view class="cell" @click="openLegalPage('user-agreement', '用户协议')">
        <text class="cell-label">查看用户协议</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 第三方信息 -->
    <view class="section">
      <text class="section-title">第三方信息</text>
      <view class="cell" @click="openLegalPage('third-party-sdk', '第三方SDK清单')">
        <text class="cell-label">第三方 SDK 清单</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 权限使用说明 -->
    <view class="section">
      <text class="section-title">权限使用说明</text>
      <view class="info-card">
        <view class="permission-item">
          <text class="permission-name">📍 位置权限</text>
          <text class="permission-desc">用于查找附近的工作室、计算距离和导航。仅在使用工作室查找功能时申请，您可随时在系统设置中关闭。</text>
        </view>
        <view class="permission-item">
          <text class="permission-name">📷 相机权限</text>
          <text class="permission-desc">用于拍摄烧玻璃作品照片，记录您的创作成果。仅在您主动选择拍照时触发。</text>
        </view>
        <view class="permission-item">
          <text class="permission-name">💾 存储权限</text>
          <text class="permission-desc">用于保存作品照片到本地相册，以及读取已保存的图片。仅在您主动操作时触发。</text>
        </view>
      </view>
    </view>

    <!-- 撤回同意 -->
    <view class="section">
      <text class="section-title">撤回同意</text>
      <view class="cell" @click="onRevokeConsent">
        <text class="cell-label danger">撤回隐私政策同意</text>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 撤回确认弹窗 -->
    <Dialog
      :visible="revokeDialogVisible"
      title="撤回同意"
      content="撤回同意后，我们将清除您的所有数据并退出登录，此操作不可恢复。确定要撤回吗？"
      :show-cancel="true"
      confirm-text="确认撤回"
      @confirm="confirmRevoke"
      @cancel="revokeDialogVisible = false"
      @close="revokeDialogVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { logout as authLogout } from '@/services/auth'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const revokeDialogVisible = ref(false)

function openLegalPage(filename: string, title: string) {
  uni.navigateTo({
    url: `/pages/webview/index?url=/static/legal/${filename}.html&title=${encodeURIComponent(title)}`
  })
}

function onRevokeConsent() {
  revokeDialogVisible.value = true
}

async function confirmRevoke() {
  revokeDialogVisible.value = false

  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('clear storage error:', e)
  }

  userStore.logout()
  await authLogout()

  uni.showToast({ title: '已撤回同意', icon: 'none' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/login/index' })
  }, 1200)
}
</script>

<style scoped lang="scss">
.privacy-page {
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

.cell-label.danger {
  color: $error;
}

.cell-arrow {
  font-size: 28rpx;
  color: $text-hint;
}

.info-card {
  margin: 0 $spacing-lg;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
}

.permission-item {
  margin-bottom: $spacing-md;
}

.permission-item:last-child {
  margin-bottom: 0;
}

.permission-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.permission-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
  display: block;
}
</style>
