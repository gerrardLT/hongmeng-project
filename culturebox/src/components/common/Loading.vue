<template>
  <view v-if="loading" class="loading-overlay">
    <view class="loading-box">
      <view class="spinner" />
      <text v-if="text" class="text">{{ text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '加载中...'
})
</script>

<style scoped lang="scss">
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $spacing-lg;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.spinner {
  width: 56rpx;
  height: 56rpx;
  border: 4rpx solid rgba($primary-color, 0.15);
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: $spacing-md;
}

.text {
  font-size: $font-md;
  color: $text-secondary;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
