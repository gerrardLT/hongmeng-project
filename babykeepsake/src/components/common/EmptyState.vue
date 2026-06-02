<template>
  <view class="empty-state">
    <text class="icon">{{ icon || '📭' }}</text>
    <text v-if="title" class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <view v-if="showAction && actionText" class="action-btn" @click="onAction">
      <text class="action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  actionText?: string
  showAction?: boolean
}>(), {
  showAction: false
})

const emit = defineEmits<{
  action: []
}>()

function onAction() {
  emit('action')
}
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.icon {
  font-size: 96rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 32rpx;
}

.action-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  padding: 16rpx 56rpx;
  margin-top: 8rpx;
}

.action-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}
</style>
