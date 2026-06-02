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

    <!-- 数据管理说明 -->
    <view class="section">
      <text class="section-title">数据管理说明</text>
      <view class="info-card">
        <text class="info-paragraph">BabyKeepsake 重视您的隐私保护。以下是您的数据管理权利说明：</text>
        <text class="info-item">1. 查询/访问权：您可随时在应用内查看您的个人信息和宝宝数据。</text>
        <text class="info-item">2. 修正/删除权：您可修改或删除您的个人信息，删除后数据不可恢复。</text>
        <text class="info-item">3. 导出权：您可申请导出您的个人数据副本。</text>
        <text class="info-item">4. 撤销同意权：您可随时撤回对隐私政策的同意，撤回后应用将清除您的数据并退出登录。</text>
        <text class="info-item">5. 数据保留期限：一般数据保留30天，订单数据保留2年，注销后30天内删除所有数据。</text>
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

  // 清除所有数据
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('clear storage error:', e)
  }

  // 退出登录
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

.info-paragraph {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
  display: block;
  margin-bottom: $spacing-sm;
}

.info-item {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
  display: block;
  margin-bottom: $spacing-xs;
}
</style>
