<template>
  <view class="profile-page">
    <!-- 用户卡片 -->
    <view class="user-card" @click="onUserCardClick">
      <view class="avatar-wrap">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
      </view>
      <view class="user-info">
        <text class="nickname" v-if="userStore.isLoggedIn">{{ userStore.userInfo?.nickname || '用户' }}</text>
        <text class="nickname guest" v-else>点击登录</text>
        <text class="user-id" v-if="userStore.isLoggedIn">UID: {{ userStore.userId.slice(0, 12) }}...</text>
        <text class="login-hint" v-else>登录后查看更多功能</text>
      </view>
      <text class="arrow">›</text>
    </view>

    <!-- 宠物档案入口 -->
    <view class="pets-entry" @click="goPetList">
      <view class="pets-entry-left">
        <text class="pets-icon">🐾</text>
        <view class="pets-info">
          <text class="pets-title">我的宠物档案</text>
          <text class="pets-count">{{ petStore.petCount > 0 ? `共 ${petStore.petCount} 只宠物` : '还没有宠物，快来添加吧' }}</text>
        </view>
      </view>
      <text class="arrow">›</text>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="goBooking">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的预约</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goPetList">
        <text class="menu-icon">🐱</text>
        <text class="menu-text">宠物档案</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goNotification">
        <text class="menu-icon">🔔</text>
        <text class="menu-text">消息通知</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 版本号 -->
    <view class="version-footer">
      <text class="version-text">v1.0.0</text>
      <text class="app-name">PetMemorial</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { usePetStore } from '@/store/pet'
import { getPets } from '@/services/pet'

const userStore = useUserStore()
const petStore = usePetStore()

onShow(() => {
  if (userStore.isLoggedIn) {
    const pets = getPets(userStore.userId)
    petStore.pets = pets
    petStore.persist()
  }
})

function onUserCardClick() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
  } else {
    uni.navigateTo({ url: '/pages/profile/account' })
  }
}

function goPetList() {
  uni.switchTab({ url: '/pages/pet/index' })
}

function goBooking() {
  uni.navigateTo({ url: '/pages/booking/index' })
}

function goNotification() {
  uni.showToast({ title: '功能即将上线', icon: 'none' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}
</script>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background-color: $bg-page;
}

.user-card {
  display: flex;
  align-items: center;
  padding: $spacing-xl $spacing-xl $spacing-lg;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
  margin-right: $spacing-md;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.nickname {
  font-size: 34rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 6rpx;

  &.guest {
    font-size: 30rpx;
  }
}

.user-id {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

.login-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.arrow {
  font-size: 36rpx;
  color: rgba(255, 255, 255, 0.7);
}

.pets-entry {
  margin: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.pets-entry-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.pets-icon {
  font-size: 48rpx;
  margin-right: $spacing-md;
}

.pets-info {
  display: flex;
  flex-direction: column;
}

.pets-title {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.pets-count {
  font-size: 24rpx;
  color: $text-secondary;
}

.menu-section {
  margin: 0 $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: $spacing-md;
  width: 52rpx;
  text-align: center;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.menu-arrow {
  font-size: 32rpx;
  color: $text-hint;
}

.version-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
  margin-top: $spacing-lg;
}

.app-name {
  font-size: 24rpx;
  color: $text-hint;
  margin-bottom: 4rpx;
}

.version-text {
  font-size: 22rpx;
  color: $text-disabled;
}
</style>
