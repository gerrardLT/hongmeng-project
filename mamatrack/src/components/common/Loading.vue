<template>
  <view class="loading">
    <view class="loading__spinner">
      <view class="loading__dot loading__dot--1" />
      <view class="loading__dot loading__dot--2" />
      <view class="loading__dot loading__dot--3" />
    </view>
    <text class="loading__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  text: string
}>(), {
  text: '加载中...'
})
</script>

<style scoped lang="scss">
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;

  &__spinner {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24rpx;
  }

  &__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 8rpx;
    background-color: #E91E8C;
    margin: 0 8rpx;
    animation: loading-bounce 1.2s infinite ease-in-out;

    &--1 {
      animation-delay: 0s;
    }

    &--2 {
      animation-delay: 0.2s;
    }

    &--3 {
      animation-delay: 0.4s;
    }
  }

  &__text {
    font-size: 28rpx;
    color: #999999;
    line-height: 1.5;
  }
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
