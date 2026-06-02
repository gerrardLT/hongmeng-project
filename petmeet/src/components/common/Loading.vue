<template>
  <view v-if="loading" class="loading">
    <view class="spinner" />
    <text class="text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean
  text?: string
}>()
</script>

<style scoped>
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #F8F9FA;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.text {
  font-size: 26rpx;
  color: #636E72;
}
</style>
