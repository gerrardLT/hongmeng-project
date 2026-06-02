<template>
  <view class="weight-bar">
    <view class="weight-bar__bar">
      <view
        v-for="(item, index) in data"
        :key="index"
        class="weight-bar__segment"
        :style="{
          width: getPercent(item.weight) + '%',
          backgroundColor: getCategoryColor(item.category)
        }"
      />
    </view>
    <view class="weight-bar__legend">
      <view v-for="(item, index) in data" :key="index" class="weight-bar__legend-item">
        <view class="weight-bar__dot" :style="{ backgroundColor: getCategoryColor(item.category) }" />
        <text class="weight-bar__legend-text">{{ item.label }}</text>
        <text class="weight-bar__legend-weight">{{ formatWeightGram(item.weight, 'kg') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_COLORS } from '@/types/models'
import { formatWeightGram } from '@/utils/format'

const props = withDefaults(defineProps<{
  data: { category: GearCategory; weight: number; label: string }[]
}>(), {})

const totalWeight = computed(() => props.data.reduce((sum, d) => sum + d.weight, 0))

function getPercent(weight: number): number {
  if (totalWeight.value === 0) return 0
  return Math.max(2, (weight / totalWeight.value) * 100)
}

function getCategoryColor(category: GearCategory): string {
  return GEAR_CATEGORY_COLORS[category] || '#9E9E9E'
}
</script>

<style scoped lang="scss">
.weight-bar {
  &__bar {
    display: flex;
    height: 20rpx;
    border-radius: 10rpx;
    overflow: hidden;
    background-color: #f0f0f0;
  }

  &__segment {
    height: 100%;
    transition: width 0.3s ease;

    &:first-child {
      border-radius: 10rpx 0 0 10rpx;
    }

    &:last-child {
      border-radius: 0 10rpx 10rpx 0;
    }

    &:only-child {
      border-radius: 10rpx;
    }
  }

  &__legend {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16rpx;
    gap: 16rpx;
  }

  &__legend-item {
    display: flex;
    align-items: center;
  }

  &__dot {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    margin-right: 8rpx;
  }

  &__legend-text {
    font-size: 22rpx;
    color: #666666;
    margin-right: 6rpx;
  }

  &__legend-weight {
    font-size: 22rpx;
    color: #999999;
  }
}
</style>
