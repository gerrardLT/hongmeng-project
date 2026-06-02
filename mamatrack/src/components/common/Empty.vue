<template>
  <view class="empty">
    <text class="empty__icon">{{ displayIcon }}</text>
    <text class="empty__text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  icon?: string
}>(), {
  text: '暂无数据',
  icon: ''
})

const displayIcon = computed(() => {
  return props.icon || '📭'
})
</script>

<style scoped lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;

  &__icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  &__text {
    font-size: 28rpx;
    color: #999999;
    line-height: 1.5;
  }
}
</style>
