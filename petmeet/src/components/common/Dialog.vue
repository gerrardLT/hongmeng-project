<template>
  <view v-if="visible" class="dialog-overlay" @click="onClose">
    <view class="dialog-box" @click.stop>
      <text v-if="title" class="dialog-title">{{ title }}</text>
      <text v-if="content" class="dialog-content">{{ content }}</text>
      <view class="dialog-actions">
        <text v-if="showCancel" class="btn cancel" @click="onCancel">{{ cancelText || '取消' }}</text>
        <text class="btn confirm" @click="onConfirm">{{ confirmText || '确定' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  title?: string
  content?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
  close: []
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}

function onClose() {
  emit('close')
}
</script>

<style scoped>
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
}

.dialog-box {
  width: 560rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 20rpx;
}

.dialog-content {
  font-size: 28rpx;
  color: #636E72;
  margin-bottom: 40rpx;
  text-align: center;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  gap: 24rpx;
}

.btn {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.cancel {
  background-color: #F8F9FA;
  color: #636E72;
}

.confirm {
  background-color: #FF6B35;
  color: #FFFFFF;
}
</style>
