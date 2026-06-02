<template>
  <view class="progress-ring" :style="{ width: `${size}rpx`, height: `${size}rpx` }">
    <svg :width="svgSize" :height="svgSize" :viewBox="`0 0 ${svgSize} ${svgSize}`">
      <!-- 底层灰色圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="#E8E8E8"
        :stroke-width="strokeWidth"
      />
      <!-- 上层绿色进度圆环 -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="#2E7D32"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        transform-origin="center"
        :transform="`rotate(-90 ${center} ${center})`"
      />
    </svg>
    <view class="progress-ring__label">
      <text class="progress-ring__value">{{ percent }}</text>
      <text class="progress-ring__unit">%</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  percent: number
  size?: number
  strokeWidth?: number
}>(), {
  size: 120,
  strokeWidth: 8
})

const svgSize = computed(() => props.size / 2)
const center = computed(() => svgSize.value / 2)
const radius = computed(() => (svgSize.value - props.strokeWidth / 2) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dashOffset = computed(() => {
  const p = Math.min(100, Math.max(0, props.percent))
  return circumference.value * (1 - p / 100)
})
</script>

<style scoped lang="scss">
.progress-ring {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  &__label {
    position: absolute;
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  &__value {
    font-size: 32rpx;
    font-weight: 700;
    color: #2E7D32;
  }

  &__unit {
    font-size: 20rpx;
    color: #2E7D32;
    margin-left: 2rpx;
  }
}
</style>
