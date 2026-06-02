<template>
  <view v-if="visible" class="privacy-overlay" @click.stop>
    <view class="privacy-card">
      <text class="privacy-title">用户协议与隐私政策</text>
      <view class="privacy-content">
        <text class="privacy-desc">
          欢迎使用 MamaTrack 孕期体重追踪！为了向您提供更好的服务，我们需要收集和使用您的部分信息，包括：设备信息、通知权限（用于称重和产检提醒）、相机和相册权限（用于孕期拍照记录）等。
        </text>
        <view class="privacy-links">
          <text class="privacy-desc">请您在使用前仔细阅读</text>
          <text class="link-text" @click="onViewDetail('agreement')">《用户协议》</text>
          <text class="privacy-desc">和</text>
          <text class="link-text" @click="onViewDetail('privacy')">《隐私政策》</text>
          <text class="privacy-desc">，点击"同意并继续"即表示您已充分理解并同意上述条款。</text>
        </view>
        <view class="privacy-notice">
          <text class="privacy-notice-text">⚠️ 本应用数据仅供参考，不构成医疗建议，如有健康疑问请咨询专业医生。</text>
        </view>
      </view>
      <view class="privacy-actions">
        <view class="btn-reject" @click="onReject">
          <text class="btn-reject-text">不同意</text>
        </view>
        <view class="btn-agree" @click="onAgree">
          <text class="btn-agree-text">同意并继续</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  visible: boolean
}>(), {})

const emit = defineEmits<{
  agree: []
  close: []
}>()

function onViewDetail(type: 'privacy' | 'agreement') {
  const urls: Record<string, string> = {
    privacy: '/pages/webview/index?url=privacy',
    agreement: '/pages/webview/index?url=agreement'
  }
  uni.navigateTo({ url: urls[type] })
}

function onAgree() {
  emit('agree')
}

function onReject() {
  uni.showModal({
    title: '提示',
    content: '不同意将无法使用本应用，确认退出吗？',
    confirmText: '确认退出',
    cancelText: '返回',
    success(res) {
      if (res.confirm) {
        emit('close')
        // #ifdef APP-PLUS
        plus.runtime.quit()
        // #endif
      }
    }
  })
}
</script>

<style scoped lang="scss">
.privacy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.privacy-card {
  width: 620rpx;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privacy-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #333333;
  margin-bottom: 40rpx;
}

.privacy-content {
  width: 100%;
  margin-bottom: 40rpx;
}

.privacy-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.8;
}

.privacy-links {
  margin-top: 16rpx;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
}

.link-text {
  font-size: 26rpx;
  color: #E91E8C;
  font-weight: 500;
}

.privacy-notice {
  margin-top: 20rpx;
  padding: 16rpx 20rpx;
  background-color: #FFF5F8;
  border-radius: 12rpx;
  border-left: 6rpx solid #E91E8C;
}

.privacy-notice-text {
  font-size: 24rpx;
  color: #E91E8C;
  line-height: 1.6;
}

.privacy-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 32rpx;
}

.btn-reject {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  border-radius: 44rpx;
}

.btn-reject-text {
  font-size: 30rpx;
  color: #999999;
  font-weight: 500;
}

.btn-agree {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #E91E8C, #FF6EB4);
  border-radius: 44rpx;
  box-shadow: 0 4rpx 16rpx rgba(233, 30, 140, 0.3);
}

.btn-agree-text {
  font-size: 30rpx;
  color: #ffffff;
  font-weight: 700;
}
</style>
