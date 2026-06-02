<template>
  <view v-if="visible" class="toast" :class="[`toast-${type}`]">
    <text class="toast-icon">{{ iconMap[type] }}</text>
    <text class="toast-message">{{ message }}</text>
  </view>
</template>

<script setup lang="ts">
type ToastType = 'success' | 'error' | 'info'

interface Props {
  visible: boolean
  message: string
  type?: ToastType
}

withDefaults(defineProps<Props>(), {
  type: 'info'
})

const iconMap: Record<ToastType, string> = {
  success: '✓',
  error: '✗',
  info: 'ℹ'
}
</script>

<style scoped lang="scss">
.toast {
  position: fixed;
  top: 120rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  border-radius: $radius-pill;
  box-shadow: $shadow-md;
  z-index: 1001;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20rpx);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-success {
  background-color: #E8F5E9;
  border: 2rpx solid $success-color;
}

.toast-error {
  background-color: #FFEBEE;
  border: 2rpx solid $error-color;
}

.toast-info {
  background-color: $bg-primary;
  border: 2rpx solid $secondary-color;
}

.toast-icon {
  font-size: $font-lg;
  font-weight: 700;
}

.toast-success .toast-icon {
  color: $success-color;
}

.toast-error .toast-icon {
  color: $error-color;
}

.toast-info .toast-icon {
  color: $secondary-color;
}

.toast-message {
  font-size: $font-sm;
  color: $text-primary;
}
</style>
