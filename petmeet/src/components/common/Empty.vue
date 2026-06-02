<template>
  <view class="empty">
    <text class="icon">{{ icon || '📭' }}</text>
    <text class="text">{{ text }}</text>
    <text v-if="subText" class="sub-text">{{ subText }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  text?: string
  subText?: string
}>()
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.text {
  font-size: 28rpx;
  color: #636E72;
  margin-bottom: 12rpx;
}

.sub-text {
  font-size: 24rpx;
  color: #B2BEC3;
}
</style>
