<template>
  <view v-if="show" class="privacy-overlay" @click.stop>
    <view class="privacy-card">
      <text class="privacy-title">隐私政策与用户协议</text>
      <view class="privacy-content">
        <text class="privacy-desc">
          欢迎使用 AnglerMate 钓鱼天气钓点记录！为了向您提供更好的服务，我们需要收集和使用您的部分信息，包括：位置信息（用于获取天气和钓点定位）、设备信息、存储权限（用于保存照片）等。
        </text>
        <view class="privacy-links">
          <text class="privacy-desc">请您在使用前仔细阅读</text>
          <text class="link-text" @click="openPrivacy">《隐私政策》</text>
          <text class="privacy-desc">和</text>
          <text class="link-text" @click="openAgreement">《用户协议》</text>
          <text class="privacy-desc">，点击"同意并继续"即表示您已充分理解并同意上述条款。</text>
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
defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  agree: []
  reject: []
}>()

function openPrivacy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/privacy-policy.html'
  })
}

function openAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/user-agreement.html'
  })
}

function onAgree() {
  emit('agree')
}

function onReject() {
  emit('reject')
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
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privacy-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #212121;
  margin-bottom: 32rpx;
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
  color: #FF6B35;
  font-weight: 500;
}

.privacy-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 24rpx;
}

.btn-reject {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F0F0F0;
  border-radius: 40rpx;
}

.btn-reject-text {
  font-size: 28rpx;
  color: #999999;
  font-weight: 500;
}

.btn-agree {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  border-radius: 40rpx;
  box-shadow: 0 6rpx 20rpx rgba(255, 107, 53, 0.3);
}

.btn-agree-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
