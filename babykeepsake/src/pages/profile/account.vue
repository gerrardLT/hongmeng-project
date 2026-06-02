<template>
  <view class="account-page">
    <!-- 账户信息 -->
    <view class="section">
      <text class="section-title">账户信息</text>
      <view class="cell">
        <text class="cell-label">手机号</text>
        <text class="cell-value">{{ maskedPhone }}</text>
      </view>
      <view class="cell">
        <text class="cell-label">注册时间</text>
        <text class="cell-value">{{ registerTime }}</text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="section">
      <view class="action-btn logout-btn" @click="onLogout">
        <text class="action-text">退出登录</text>
      </view>
    </view>

    <!-- 注销账户 -->
    <view class="section">
      <view class="action-btn delete-btn" @click="onDeleteAccount">
        <text class="action-text danger">注销账户</text>
      </view>
      <text class="delete-hint">注销后所有数据将被永久删除且无法恢复</text>
    </view>

    <!-- 退出登录确认 -->
    <Dialog
      :visible="logoutDialogVisible"
      title="提示"
      content="确定要退出登录吗？"
      :show-cancel="true"
      @confirm="confirmLogout"
      @cancel="logoutDialogVisible = false"
      @close="logoutDialogVisible = false"
    />

    <!-- 注销账户警告（第一次确认） -->
    <Dialog
      :visible="deleteWarningVisible"
      title="严重警告"
      content="注销账户将永久删除您的所有数据，包括宝宝信息、预约记录、里程碑等，此操作不可恢复！确定要继续吗？"
      :show-cancel="true"
      confirm-text="继续注销"
      @confirm="confirmDeleteWarning"
      @cancel="deleteWarningVisible = false"
      @close="deleteWarningVisible = false"
    />

    <!-- 注销账户二次确认 -->
    <Dialog
      :visible="deleteConfirmVisible"
      title="最终确认"
      content="您正在注销账户，所有数据将立即删除且无法恢复。此操作不可逆！"
      :show-cancel="true"
      confirm-text="确认注销"
      @confirm="confirmDeleteAccount"
      @cancel="deleteConfirmVisible = false"
      @close="deleteConfirmVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { logout as authLogout, deleteAccount } from '@/services/auth'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()

const logoutDialogVisible = ref(false)
const deleteWarningVisible = ref(false)
const deleteConfirmVisible = ref(false)

const maskedPhone = computed(() => {
  const phone = userStore.userInfo?.phoneNumber
  if (!phone) return '未绑定'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

const registerTime = computed(() => {
  const createdAt = userStore.userInfo?.createdAt
  if (!createdAt) return '未知'
  const date = new Date(createdAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

function onLogout() {
  logoutDialogVisible.value = true
}

async function confirmLogout() {
  logoutDialogVisible.value = false
  userStore.logout()
  await authLogout()
  uni.showToast({ title: '已退出登录', icon: 'none' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 1200)
}

function onDeleteAccount() {
  deleteWarningVisible.value = true
}

function confirmDeleteWarning() {
  deleteWarningVisible.value = false
  // 二次确认
  deleteConfirmVisible.value = true
}

async function confirmDeleteAccount() {
  deleteConfirmVisible.value = false

  try {
    await deleteAccount()
  } catch (e) {
    console.error('delete account error:', e)
  }

  // 清除本地所有数据
  try {
    uni.clearStorageSync()
  } catch (e) {
    console.error('clear storage error:', e)
  }

  userStore.logout()

  uni.showToast({ title: '账户已注销', icon: 'none' })
  setTimeout(() => {
    uni.reLaunch({ url: '/pages/index/index' })
  }, 1200)
}
</script>

<style scoped lang="scss">
.account-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: $spacing-md 0;
}

.section {
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: 24rpx;
  color: $text-secondary;
  padding: $spacing-sm $spacing-lg;
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

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  margin: 0 $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
}

.logout-btn {
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.action-text {
  font-size: 30rpx;
  color: $text-primary;
}

.action-text.danger {
  color: $error;
}

.delete-hint {
  font-size: 22rpx;
  color: $text-hint;
  text-align: center;
  margin-top: $spacing-xs;
  display: block;
}
</style>
