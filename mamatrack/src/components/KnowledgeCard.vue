<template>
  <view class="knowledge-card" @click="emit('click')">
    <view class="knowledge-card__icon-wrap" :class="categoryClass">
      <text class="knowledge-card__icon">{{ item.icon }}</text>
    </view>
    <view class="knowledge-card__body">
      <view class="knowledge-card__header">
        <text class="knowledge-card__title">{{ item.title }}</text>
        <view class="knowledge-card__tag" :class="categoryClass">
          <text class="knowledge-card__tag-text">{{ categoryLabel }}</text>
        </view>
      </view>
      <text class="knowledge-card__summary">{{ item.summary }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KnowledgeItem } from '@/types/models'

const props = withDefaults(defineProps<{
  item: KnowledgeItem
}>(), {})

const emit = defineEmits<{
  click: []
}>()

const categoryLabel = computed(() => {
  const map: Record<string, string> = {
    guide: '指南',
    diet: '饮食',
    exercise: '运动',
    faq: '问答'
  }
  return map[props.item.category] || '其他'
})

const categoryClass = computed(() => {
  return `knowledge-card--${props.item.category}`
})
</script>

<style scoped lang="scss">
.knowledge-card {
  display: flex;
  flex-direction: row;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &__icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  &__icon {
    font-size: 36rpx;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333333;
    margin-right: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  &__tag {
    padding: 2rpx 14rpx;
    border-radius: 16rpx;
    flex-shrink: 0;
  }

  &__tag-text {
    font-size: 20rpx;
    font-weight: 500;
  }

  &__summary {
    font-size: 24rpx;
    color: #999999;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  // 分类颜色区分
  &--guide {
    .knowledge-card__icon-wrap {
      background-color: #F3E5F5;
    }
    &.knowledge-card__tag,
    .knowledge-card__tag {
      background-color: #F3E5F5;
    }
    .knowledge-card__tag-text {
      color: #9C27B0;
    }
  }

  &--diet {
    .knowledge-card__icon-wrap {
      background-color: #E8F5E9;
    }
    &.knowledge-card__tag,
    .knowledge-card__tag {
      background-color: #E8F5E9;
    }
    .knowledge-card__tag-text {
      color: #4CAF50;
    }
  }

  &--exercise {
    .knowledge-card__icon-wrap {
      background-color: #E3F2FD;
    }
    &.knowledge-card__tag,
    .knowledge-card__tag {
      background-color: #E3F2FD;
    }
    .knowledge-card__tag-text {
      color: #2196F3;
    }
  }

  &--faq {
    .knowledge-card__icon-wrap {
      background-color: #FFF3E0;
    }
    &.knowledge-card__tag,
    .knowledge-card__tag {
      background-color: #FFF3E0;
    }
    .knowledge-card__tag-text {
      color: #FF9800;
    }
  }
}
</style>
