<template>
  <view class="privacy-page">
    <!-- 权限管理 -->
    <view class="section-title">权限管理</view>
    <view class="menu-section">
      <view class="permission-item" v-for="perm in permissions" :key="perm.key" @click="openPermissionSetting(perm.key)">
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

    <!-- 个人信息管理 -->
    <view class="section-title">个人信息管理</view>
    <view class="menu-section">
      <view class="menu-item" @click="exportData">
        <text class="menu-icon">📤</text>
        <text class="menu-text">数据导出</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 数据删除说明 -->
    <view class="section-title">数据说明</view>
    <view class="info-card">
      <text class="info-text">
        我们重视您的隐私权。根据相关法律法规，您有权访问、更正和删除您的个人信息。SealCraft 收集的信息仅用于提供印章定制服务，我们不会将您的个人信息出售给第三方。
      </text>
      <text class="info-text">
        您可以随时通过「账户管理」修改个人信息，或通过「注销账号」永久删除您的所有数据。数据删除后无法恢复，请谨慎操作。
      </text>
    </view>

    <!-- 隐私政策链接 -->
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
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { exportUserData, saveExportFile } from '@/services/export'

const userStore = useUserStore()

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
    name: '存储权限',
    desc: '用于保存印章图片',
    granted: false
  },
  {
    key: 'notification',
    icon: '🔔',
    name: '通知权限',
    desc: '用于发送预约和进度提醒',
    granted: false
  }
])

// 检查权限状态
function checkPermissions() {
  try {
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

function openPermissionSetting(key: string) {
  const scopeMap: Record<string, string> = {
    location: 'scope.userLocation',
    album: 'scope.writePhotosAlbum',
    notification: 'scope.push'
  }

  const scope = scopeMap[key]
  if (scope) {
    uni.authorize({
      scope,
      success: () => {
        const perm = permissions.value.find(p => p.key === key)
        if (perm) perm.granted = true
      },
      fail: () => {
        // 授权失败，引导用户到设置页面
        uni.showModal({
          title: '授权提示',
          content: '需要您在设置中手动开启权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({})
            }
          }
        })
      }
    })
  }
}

function exportData() {
  const userId = userStore.userId
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '导出中...' })

  exportUserData(userId)
    .then((data) => saveExportFile(data))
    .then((filePath) => {
      uni.hideLoading()
      uni.showModal({
        title: '导出成功',
        content: `数据已保存至：${filePath}`,
        showCancel: false
      })
    })
    .catch((err) => {
      uni.hideLoading()
      uni.showToast({ title: err.message || '导出失败', icon: 'none' })
    })
}

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
  padding: 24rpx 32rpx 8rpx;
  display: block;
}

.menu-section {
  margin: 0 32rpx 24rpx;
  background-color: $bg-card;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.permission-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
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
  margin-right: 24rpx;
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
    background-color: rgba(84, 139, 84, 0.12);
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
  padding: 28rpx 32rpx;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 24rpx;
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
  margin: 0 32rpx 24rpx;
  background-color: $bg-card;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.info-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.7;
  display: block;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
