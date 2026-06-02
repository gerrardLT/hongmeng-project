<template>
  <view class="category-tag" :style="tagStyle">
    <text class="category-tag__text" :style="{ color: textColor }">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP, GEAR_CATEGORY_COLORS } from '@/types/models'

const props = withDefaults(defineProps<{
  category: GearCategory
}>(), {})

const label = computed(() => GEAR_CATEGORY_MAP[props.category] || '未知')

const textColor = computed(() => GEAR_CATEGORY_COLORS[props.category] || '#999999')

const tagStyle = computed(() => {
  const color = GEAR_CATEGORY_COLORS[props.category] || '#999999'
  return {
    backgroundColor: `${color}33`
  }
})
</script>

<style scoped lang="scss">
.category-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;

  &__text {
    font-size: 22rpx;
    font-weight: 500;
    line-height: 1.4;
  }
}
</style>
