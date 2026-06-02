<template>
  <view class="color-swatch" :class="{ selected }" @click="onClick">
    <!-- 三色横条 -->
    <view class="swatch-bar">
      <view
        v-for="(color, idx) in schemeColors"
        :key="idx"
        class="swatch-segment"
        :style="{ backgroundColor: color }"
      />
    </view>

    <!-- 名称 -->
    <text class="swatch-name">{{ name }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ColorScheme } from '@/types/models'

/** 配色数据可以是 ColorScheme 对象、颜色数组或含 colors 属性的对象 */
type ColorSwatchData = ColorScheme | string[] | { colors: string[]; [key: string]: unknown }

interface Props {
  scheme: ColorSwatchData
  name: string
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<{
  click: []
}>()

const schemeColors = computed(() => {
  if (Array.isArray(props.scheme)) return props.scheme.slice(0, 3)
  if (props.scheme?.colors) return props.scheme.colors.slice(0, 3)
  return ['#C41A16', '#D4A843', '#7BAA8E']
})

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.color-swatch {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding: $spacing-sm;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.97);
  }

  &.selected {
    border-color: $primary-color;
    box-shadow: 0 0 0 4rpx rgba(196, 26, 22, 0.15);
  }
}

.swatch-bar {
  display: flex;
  height: 56rpx;
  border-radius: $radius-sm;
  overflow: hidden;
}

.swatch-segment {
  flex: 1;
}

.swatch-name {
  font-size: $font-sm;
  color: $text-primary;
  text-align: center;
}
</style>
