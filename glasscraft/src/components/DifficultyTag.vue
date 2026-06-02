<template>
  <view class="difficulty-tag" :style="{ backgroundColor: bgColor, borderColor: borderColor }">
    <text class="tag-text" :style="{ color: textColor }">{{ label }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DifficultyLevel } from '@/types/models'

const props = defineProps<{
  level: DifficultyLevel
}>()

const difficultyConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  easy: { label: '简单', color: '#4CAF50', bgColor: '#E8F5E9', borderColor: '#C8E6C9' },
  medium: { label: '中等', color: '#FF9800', bgColor: '#FFF3E0', borderColor: '#FFE0B2' },
  hard: { label: '困难', color: '#F44336', bgColor: '#FFEBEE', borderColor: '#FFCDD2' }
}

const label = computed(() => {
  return difficultyConfig[props.level]?.label || '未知'
})

const textColor = computed(() => {
  return difficultyConfig[props.level]?.color || '#9E9E9E'
})

const bgColor = computed(() => {
  return difficultyConfig[props.level]?.bgColor || '#F5F5F5'
})

const borderColor = computed(() => {
  return difficultyConfig[props.level]?.borderColor || '#E0E0E0'
})
</script>

<style scoped lang="scss">
.difficulty-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
  border-width: 1rpx;
  border-style: solid;
}

.tag-text {
  font-size: 20rpx;
  font-weight: 500;
}
</style>
