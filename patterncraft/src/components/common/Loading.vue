<template>
  <view v-if="visible" class="loading-mask">
    <view class="loading-box">
      <view class="spinner" />
      <text class="loading-text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '加载中...'
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
  z-index: 1000;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg $spacing-xl;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  gap: $spacing-md;
}

.spinner {
  width: 64rpx;
  height: 64rpx;
  border: 6rpx solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
