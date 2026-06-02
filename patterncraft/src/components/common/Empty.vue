<template>
  <view class="empty">
    <text class="empty-icon">{{ icon || '🀄' }}</text>
    <text class="empty-text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  text: '暂无数据',
  icon: ''
})
</script>

<style scoped lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl 0;
  gap: $spacing-md;
}

.empty-icon {
  font-size: 96rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: $font-md;
  color: $text-hint;
}
</style>
