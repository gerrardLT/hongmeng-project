<template>
  <view v-if="visible" class="privacy-overlay" @click.stop>
    <view class="privacy-card">
      <text class="privacy-title">隐私政策与用户协议</text>
      <view class="privacy-content">
        <text class="privacy-desc">
          欢迎使用 PlantCare 养花浇水提醒！为了向您提供更好的服务，我们需要收集和使用您的部分信息，包括：设备信息、通知权限（用于浇水施肥提醒）、相机和相册权限（用于植物拍照记录）、位置信息（用于天气数据获取）等。
        </text>
        <view class="privacy-links">
          <text class="privacy-desc">请您在使用前仔细阅读</text>
          <text class="link-text" @click="onViewDetail('privacy')">《隐私政策》</text>
          <text class="privacy-desc">和</text>
          <text class="link-text" @click="onViewDetail('agreement')">《用户协议》</text>
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
withDefaults(defineProps<{
  visible: boolean
}>(), {})

const emit = defineEmits<{
  'agree': []
  'viewDetail': [type: 'privacy' | 'agreement']
  'update:visible': [value: boolean]
}>()

function onViewDetail(type: 'privacy' | 'agreement') {
  emit('viewDetail', type)
}

function onAgree() {
  emit('agree')
  emit('update:visible', false)
}

function onReject() {
  uni.showModal({
    title: '提示',
    content: '不同意将无法使用本应用，确认退出吗？',
    confirmText: '确认退出',
    cancelText: '返回',
    success(res) {
      if (res.confirm) {
        emit('update:visible', false)
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
  background: $bg-card;
  border-radius: $radius-lg;
  padding: 48rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.privacy-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-lg;
}

.privacy-content {
  width: 100%;
  margin-bottom: 40rpx;
}

.privacy-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
}

.privacy-links {
  margin-top: $spacing-sm;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
}

.link-text {
  font-size: 26rpx;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.privacy-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: $spacing-md;
}

.btn-reject {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-grey;
  border-radius: $radius-xl;
}

.btn-reject-text {
  font-size: $font-md;
  color: $text-light;
  font-weight: $font-weight-medium;
}

.btn-agree {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-xl;
  box-shadow: $shadow-primary;
}

.btn-agree-text {
  font-size: $font-md;
  color: $text-white;
  font-weight: $font-weight-bold;
}
</style>
