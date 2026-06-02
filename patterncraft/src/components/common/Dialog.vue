<template>
  <view v-if="visible" class="dialog-mask" @click.self="onCancel">
    <view class="dialog-card">
      <!-- 标题 -->
      <text v-if="title" class="dialog-title">{{ title }}</text>

      <!-- 内容 -->
      <view class="dialog-body">
        <text v-if="content" class="dialog-content">{{ content }}</text>
        <slot />
      </view>

      <!-- 按钮栏 -->
      <view class="dialog-footer">
        <view v-if="showCancel" class="btn btn-cancel" @click="onCancel">
          <text class="btn-text cancel-text">{{ cancelText }}</text>
        </view>
        <view class="btn btn-confirm" @click="onConfirm">
          <text class="btn-text confirm-text">{{ confirmText }}</text>
        </view>
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
}>()

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
}
</script>

<style scoped lang="scss">
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.dialog-card {
  width: 580rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  overflow: hidden;
}

.dialog-title {
  display: block;
  text-align: center;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  padding: $spacing-lg $spacing-lg 0;
}

.dialog-body {
  padding: $spacing-lg;
}

.dialog-content {
  font-size: $font-md;
  color: $text-secondary;
  line-height: 1.6;
  text-align: center;
}

.dialog-footer {
  display: flex;
  border-top: 2rpx solid $border-color;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md 0;

  &:active {
    opacity: 0.7;
  }
}

.btn-cancel {
  border-right: 2rpx solid $border-color;
}

.btn-text {
  font-size: $font-md;
}

.cancel-text {
  color: $text-secondary;
}

.confirm-text {
  color: $primary-color;
  font-weight: 600;
}
</style>
