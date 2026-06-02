<template>
  <view v-if="loading" class="loading-mask" :class="{ 'loading-local': mode === 'local' }" @touchmove.stop.prevent>
    <view class="loading-content">
      <view class="spinner" />
      <text class="loading-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  loading: boolean
  text?: string
  mode?: 'fullscreen' | 'local'
}>(), {
  text: '加载中...',
  mode: 'fullscreen'
})
</script>

<style scoped lang="scss">
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-local {
  position: relative;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: $radius-lg;
  min-height: 200rpx;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #FFFFFF;
  border-radius: $radius-lg;
  padding: 48rpx 64rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 56rpx;
  height: 56rpx;
  border: 6rpx solid #F0F0F0;
  border-top-color: $primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 26rpx;
  color: $text-secondary;
}
</style>
