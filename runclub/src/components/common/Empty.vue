<template>
  <view class="empty-container">
    <text class="empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
    <view v-if="actionText" class="empty-action" @click="emit('action')">
      <text class="empty-action-text">{{ actionText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  text?: string
  actionText?: string
}>(), {
  icon: '📭',
  text: '暂无数据'
})

const emit = defineEmits<{
  action: []
}>()
</script>

<style scoped lang="scss">
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 48rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.empty-action {
  padding: 16rpx 48rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 32rpx;
}

.empty-action-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 500;
}
</style>
