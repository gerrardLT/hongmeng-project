<template>
  <view class="ishihara-plate">
    <!-- 进度指示器 -->
    <view class="progress-bar">
      <text class="progress-text">第 {{ currentIndex + 1 }}/{{ total }} 题</text>
      <view class="progress-dots">
        <view
          v-for="n in total"
          :key="n"
          class="dot"
          :class="{ active: n <= currentIndex + 1 }"
        />
      </view>
    </view>

    <!-- 石原图版图片 -->
    <view class="plate-image-wrap">
      <image
        class="plate-image"
        :src="plate.imageUrl"
        mode="aspectFit"
        :lazy-load="true"
      />
    </view>

    <!-- 选项按钮 -->
    <view class="options-grid">
      <view
        v-for="(option, index) in plate.options"
        :key="index"
        class="option-btn"
        :class="{ selected: selectedIndex === index }"
        @click="onSelect(option, index)"
      >
        <text class="option-text">{{ option }}</text>
      </view>
    </view>

    <!-- 跳过按钮 -->
    <view class="skip-wrap">
      <text class="skip-btn" @click="onSkip">跳过此题</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { IshiharaPlate as IshiharaPlateType } from '@/types/models'

interface Props {
  plate: IshiharaPlateType
  currentIndex: number
  total: number
}

defineProps<Props>()

const emit = defineEmits<{
  answer: [selected: string]
  skip: []
}>()

const selectedIndex = ref<number>(-1)

function onSelect(option: string, index: number) {
  selectedIndex.value = index
  // 延迟反馈后提交，让用户看到选中效果
  setTimeout(() => {
    selectedIndex.value = -1
    emit('answer', option)
  }, 200)
}

function onSkip() {
  selectedIndex.value = -1
  emit('skip')
}
</script>

<style scoped lang="scss">
.ishihara-plate {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md;
}

.progress-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.progress-text {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.progress-dots {
  display: flex;
  gap: $spacing-sm;
}

.dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background-color: $border-color;
  transition: background-color $transition-fast;

  &.active {
    background-color: $primary-color;
  }
}

.plate-image-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: $spacing-xl;
}

.plate-image {
  width: 480rpx;
  height: 480rpx;
  border-radius: $radius-lg;
}

.options-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.option-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-sm;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  transition: all $transition-fast;

  &:active {
    background-color: rgba($primary-color, 0.08);
    border-color: $primary-color;
    transform: scale(0.97);
  }

  &.selected {
    background-color: rgba($primary-color, 0.12);
    border-color: $primary-color;
  }
}

.option-text {
  font-size: $font-lg;
  color: $text-primary;
  font-weight: 500;
}

.skip-wrap {
  display: flex;
  justify-content: center;
}

.skip-btn {
  font-size: $font-sm;
  color: $text-hint;
  padding: $spacing-sm $spacing-md;

  &:active {
    color: $text-secondary;
  }
}
</style>
