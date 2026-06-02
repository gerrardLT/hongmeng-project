<template>
  <view
    class="color-card"
    :class="[`size-${size}`]"
    @click="onClick"
  >
    <!-- small: 仅色块+名称（一行） -->
    <template v-if="size === 'small'">
      <view class="color-block-small" :style="{ backgroundColor: color.hex }" />
      <text class="color-name-small">{{ color.name }}</text>
    </template>

    <!-- medium: 色块+名称+HEX（两行） -->
    <template v-else-if="size === 'medium'">
      <view class="color-row">
        <view class="color-block-medium" :style="{ backgroundColor: color.hex }" />
        <view class="color-info-medium">
          <text class="color-name-medium">{{ color.name }}</text>
          <text class="color-hex-medium">{{ color.hex }}</text>
        </view>
      </view>
    </template>

    <!-- large: 全部信息（卡片式） -->
    <template v-else>
      <view class="color-block-large" :style="{ backgroundColor: color.hex }" />
      <view class="color-info-large">
        <text class="color-name-large">{{ color.name }}</text>
        <text class="color-name-en">{{ color.nameEn }}</text>
        <text class="color-hex-large">{{ color.hex }}</text>
        <text v-if="showDetails" class="color-rgb">
          RGB({{ color.rgb.r }}, {{ color.rgb.g }}, {{ color.rgb.b }})
        </text>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import type { ColorInfo } from '@/types/models'

interface Props {
  color: ColorInfo
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  showDetails: false
})

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.color-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
  }
}

/* ===== small ===== */
.size-small {
  display: flex;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  gap: $spacing-sm;
}

.color-block-small {
  width: 40rpx;
  height: 40rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
  border: 2rpx solid $border-color;
}

.color-name-small {
  font-size: $font-sm;
  color: $text-primary;
}

/* ===== medium ===== */
.size-medium {
  display: flex;
  padding: $spacing-sm;
}

.color-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.color-block-medium {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
  border: 2rpx solid $border-color;
}

.color-info-medium {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4rpx;
}

.color-name-medium {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.color-hex-medium {
  font-size: $font-sm;
  color: $text-secondary;
  font-family: monospace;
}

/* ===== large ===== */
.size-large {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.color-block-large {
  width: 100%;
  height: 160rpx;
  border-top-left-radius: $radius-md;
  border-top-right-radius: $radius-md;
}

.color-info-large {
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.color-name-large {
  font-size: $font-lg;
  color: $text-primary;
  font-weight: 500;
}

.color-name-en {
  font-size: $font-sm;
  color: $text-hint;
}

.color-hex-large {
  font-size: $font-md;
  color: $primary-color;
  font-family: monospace;
  font-weight: 500;
}

.color-rgb {
  font-size: $font-sm;
  color: $text-secondary;
  font-family: monospace;
}
</style>
