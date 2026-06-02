<template>
  <view class="font-preview" @click="onSelect">
    <view class="font-header">
      <text class="font-name">{{ font.name }}</text>
      <text class="font-style">{{ font.style }}</text>
    </view>

    <view class="preview-area">
      <text class="preview-text" :style="{ fontFamily: font.style }">
        {{ previewText || font.sampleText }}
      </text>
    </view>

    <view class="tags-wrap">
      <view
        v-for="(item, idx) in font.suitableFor.slice(0, 3)"
        :key="idx"
        class="suit-tag"
      >
        <text class="suit-tag-text">{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { FontStyle } from '@/types/models'

const props = withDefaults(defineProps<{
  font: FontStyle
  previewText?: string
}>(), {})

const emit = defineEmits<{
  select: []
}>()

function onSelect() {
  emit('select')
}
</script>

<style scoped lang="scss">
.font-preview {
  display: flex;
  flex-direction: column;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.font-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.font-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.font-style {
  font-size: 22rpx;
  color: $text-hint;
}

.preview-area {
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 32rpx 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
}

.preview-text {
  font-size: 40rpx;
  color: $secondary;
  text-align: center;
  line-height: 1.6;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.suit-tag {
  background-color: #F0F5F0;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
}

.suit-tag-text {
  font-size: 20rpx;
  color: $accent;
}
</style>
