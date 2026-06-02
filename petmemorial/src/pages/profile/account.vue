<template>
  <view class="account-page">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrap" @click="changeAvatar">
        <image
          class="avatar"
          :src="avatarUrl || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="avatar-badge">
          <text class="badge-icon">📷</text>
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 账户信息 -->
    <view class="section-title">账户信息</view>
    <view class="menu-section">
      <view class="menu-item">
        <text class="menu-label">昵称</text>
        <input
          v-model="nickname"
          class="menu-input"
          placeholder="请输入昵称"
          placeholder-class="input-placeholder"
          @blur="saveNickname"
        />
      </view>
      <view class="menu-item" v-if="userStore.userInfo?.phoneNumber">
        <text class="menu-label">手机号</text>
        <text class="menu-value">{{ maskedPhone }}</text>
      </view>
      <view class="menu-item" v-if="userStore.userInfo?.harmonyAccountId">
        <text class="menu-label">华为账号</text>
        <text class="menu-value">已绑定</text>
      </view>
    </view>

    <!-- 注销账号 -->
    <view class="danger-section">
      <view class="danger-btn" @click="showDeleteDialog = true">
        <text class="danger-text">注销账号</text>
      </view>
    </view>

    <!-- 注销确认弹窗 -->
    <Dialog
      :visible="showDeleteDialog"
      title="注销账号"
      content="注销后，您的所有数据将被永久删除，包括宠物档案、预约记录等，且无法恢复。"
      confirmText="确认注销"
      cancelText="取消"
      :showCancel="true"
      @confirm="onDeleteConfirm"
      @cancel="showDeleteDialog = false"
      @close="showDeleteDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { deleteAccount } from '@/services/auth'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const showDeleteDialog = ref(false)

const avatarUrl = ref(userStore.userInfo?.avatar || '')
const nickname = ref(userStore.userInfo?.nickname || '')

const maskedPhone = computed(() => {
  const phone = userStore.userInfo?.phoneNumber
  if (!phone) return ''
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

function changeAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      avatarUrl.value = res.tempFilePaths[0]
      if (userStore.userInfo) {
        userStore.setUserInfo({ ...userStore.userInfo, avatar: avatarUrl.value })
      }
      uni.showToast({ title: '头像已更新', icon: 'success' })
    }
  })
}

function saveNickname() {
  const trimmed = nickname.value.trim()
  if (!trimmed) {
    nickname.value = userStore.userInfo?.nickname || ''
    return
  }
  if (userStore.userInfo) {
    userStore.setUserInfo({ ...userStore.userInfo, nickname: trimmed })
    uni.showToast({ title: '保存成功', icon: 'success' })
  }
}

async function onDeleteConfirm() {
  try {
    uni.showLoading({ title: '注销中...' })
    await deleteAccount()
    userStore.logout()
    uni.hideLoading()
    showDeleteDialog.value = false
    uni.showToast({ title: '账号已注销', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/index' })
    }, 1200)
  } catch (e: any) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '注销失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.account-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 60rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl 0 $spacing-md;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.avatar-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: visible;
  position: relative;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 48rpx;
  height: 48rpx;
  background-color: $primary-dark;
  border-radius: 50%;
  border: 3rpx solid #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  font-size: 22rpx;
}

.avatar-tip {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: $spacing-sm;
}

.section-title {
  font-size: 24rpx;
  color: $text-hint;
  padding: $spacing-md $spacing-xl $spacing-xs;
  display: block;
}

.menu-section {
  margin: 0 $spacing-lg $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;
  min-height: 96rpx;

  &:last-child {
    border-bottom: none;
  }
}

.menu-label {
  font-size: 28rpx;
  color: $text-secondary;
  width: 160rpx;
  flex-shrink: 0;
}

.menu-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  text-align: right;
}

.input-placeholder {
  color: $text-hint;
}

.menu-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  text-align: right;
}

.danger-section {
  margin: $spacing-xl $spacing-lg 0;
}

.danger-btn {
  height: 88rpx;
  background-color: $bg-card;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $error;
}

.danger-text {
  font-size: 30rpx;
  color: $error;
  font-weight: 500;
}
</style>
