<template>
  <view class="privacy-page">
    <!-- 权限管理 -->
    <view class="section-title">权限管理</view>
    <view class="menu-section">
      <view class="permission-item" v-for="perm in permissions" :key="perm.key">
        <view class="perm-left">
          <text class="perm-icon">{{ perm.icon }}</text>
          <view class="perm-info">
            <text class="perm-name">{{ perm.name }}</text>
            <text class="perm-desc">{{ perm.desc }}</text>
          </view>
        </view>
        <view class="perm-status" :class="perm.granted ? 'granted' : 'denied'">
          <text class="status-text">{{ perm.granted ? '已授权' : '未授权' }}</text>
        </view>
      </view>
    </view>

    <!-- 隐私文件 -->
    <view class="section-title">隐私文件</view>
    <view class="menu-section">
      <view class="menu-item" @click="goWebView('/static/legal/privacy-policy.html', '隐私政策')">
        <text class="menu-icon">🔒</text>
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="goWebView('/static/legal/user-agreement.html', '用户协议')">
        <text class="menu-icon">📄</text>
        <text class="menu-text">用户协议</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 个人信息管理 -->
    <view class="section-title">个人信息管理</view>
    <view class="info-card">
      <text class="info-text">
        我们重视您的隐私权。根据相关法律法规，您有权访问、更正和删除您的个人信息。PetMemorial 收集的信息仅用于提供更好的服务体验，我们不会将您的个人信息出售给第三方。
      </text>
      <text class="info-text">
        您可以随时通过「账户管理」修改个人信息，或通过「注销账号」永久删除您的所有数据。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const permissions = ref([
  {
    key: 'location',
    icon: '📍',
    name: '位置权限',
    desc: '用于查找附近工作室',
    granted: false
  },
  {
    key: 'album',
    icon: '🖼',
    name: '相册权限',
    desc: '用于上传宠物照片',
    granted: false
  },
  {
    key: 'notification',
    icon: '🔔',
    name: '通知权限',
    desc: '用于发送纪念日提醒',
    granted: false
  }
])

// 检查权限状态
function checkPermissions() {
  try {
    // 通知权限
    uni.getSetting({
      success: (res: any) => {
        permissions.value[0].granted = !!res.authSetting['scope.userLocation']
        permissions.value[1].granted = !!res.authSetting['scope.writePhotosAlbum']
        permissions.value[2].granted = !!res.authSetting['scope.push']
      }
    })
  } catch (e) {
    console.error('checkPermissions error:', e)
  }
}

checkPermissions()

function goWebView(url: string, title: string) {
  uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` })
}
</script>

<style scoped lang="scss">
.privacy-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 60rpx;
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

.permission-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.perm-left {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.perm-icon {
  font-size: 36rpx;
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.perm-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.perm-name {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.perm-desc {
  font-size: 22rpx;
  color: $text-secondary;
  margin-top: 4rpx;
}

.perm-status {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;

  &.granted {
    background-color: rgba(76, 175, 80, 0.12);
  }

  &.denied {
    background-color: rgba(0, 0, 0, 0.06);
  }
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.perm-status.granted .status-text {
  color: $success;
}

.perm-status.denied .status-text {
  color: $text-hint;
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
  font-size: 32rpx;
  margin-right: $spacing-md;
  width: 48rpx;
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

.info-card {
  margin: 0 $spacing-lg $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.info-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.7;
  display: block;
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
