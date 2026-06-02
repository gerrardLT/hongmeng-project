<template>
  <view v-if="visible" class="dialog-overlay" @click="onClose">
    <view class="dialog-box" @click.stop>
      <text v-if="title" class="dialog-title">{{ title }}</text>
      <text v-if="content" class="dialog-content">{{ content }}</text>
      <slot />
      <view class="dialog-actions">
        <text
          v-if="showCancel"
          class="btn cancel"
          @click="onCancel"
        >{{ cancelText || '取消' }}</text>
        <text
          class="btn confirm"
          @click="onConfirm"
        >{{ confirmText || '确定' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  content: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

function onConfirm() {
  emit('update:visible', false)
  emit('confirm')
}

function onCancel() {
  emit('update:visible', false)
  emit('cancel')
}

function onClose() {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped lang="scss">
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog-box {
  width: 560rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.25s ease;
}

.dialog-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.dialog-content {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-xl;
  text-align: center;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  gap: $spacing-md;
}

.btn {
  flex: 1;
  text-align: center;
  padding: $spacing-sm 0;
  border-radius: $radius-md;
  font-size: $font-md;
}

.cancel {
  background-color: $bg-color;
  color: $text-secondary;
}

.confirm {
  background-color: $primary-color;
  color: #FFFFFF;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
