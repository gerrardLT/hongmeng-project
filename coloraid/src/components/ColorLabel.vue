<template>
  <view
    v-if="visible"
    class="color-label"
    :style="labelStyle"
  >
    <view class="connector" />
    <view class="label-content">
      <view class="label-dot" :style="{ backgroundColor: color.hex }" />
      <text class="label-name">{{ color.name }}</text>
      <text class="label-hex">{{ color.hex }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ColorInfo } from '@/types/models'

interface Position {
  x: number
  y: number
}

interface Props {
  color: ColorInfo
  position: Position
  visible: boolean
}

const props = defineProps<Props>()

const labelStyle = computed(() => {
  // 基础位置
  let left = props.position.x
  let top = props.position.y

  // 获取系统信息以判断边界
  const systemInfo = uni.getSystemInfoSync()
  const screenWidth = systemInfo.windowWidth || 375
  const screenHeight = systemInfo.windowHeight || 667

  // 标签内容预估尺寸（rpx 转 px 粗略估算，按 375 设计稿）
  const labelWidth = 200
  const labelHeight = 72

  // 水平边界检测：防止超出右边界
  if (left + labelWidth > screenWidth) {
    left = screenWidth - labelWidth - 16
  }
  // 防止超出左边界
  if (left < 16) {
    left = 16
  }

  // 垂直边界检测：优先显示在标注点下方，如果下方空间不足则显示在上方
  let above = false
  if (top + labelHeight + 20 > screenHeight) {
    above = true
    top = top - labelHeight - 16
  } else {
    top = top + 16
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
    flexDirection: above ? 'column-reverse' : 'column'
  }
})
</script>

<style scoped lang="scss">
.color-label {
  position: fixed;
  z-index: 100;
  display: flex;
  align-items: center;
  pointer-events: none;
}

.connector {
  width: 2rpx;
  height: 20rpx;
  background-color: rgba(0, 0, 0, 0.3);
  margin-left: 20rpx;
}

.label-content {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: $radius-pill;
  box-shadow: $shadow-sm;
  backdrop-filter: blur(4rpx);
  white-space: nowrap;
}

.label-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2rpx solid $border-color;
}

.label-name {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 500;
}

.label-hex {
  font-size: $font-xs;
  color: $text-secondary;
  font-family: monospace;
}
</style>
