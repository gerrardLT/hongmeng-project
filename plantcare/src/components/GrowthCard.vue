<template>
  <view class="growth-card" @click="emit('click')">
    <view class="growth-card__timeline">
      <view class="growth-card__dot" />
      <view class="growth-card__line" />
    </view>
    <view class="growth-card__content">
      <view class="growth-card__header">
        <text class="growth-card__date">{{ relativeDate }}</text>
        <text v-if="plantName" class="growth-card__plant-tag">{{ plantName }}</text>
        <view class="growth-card__delete" @click.stop="emit('delete')">
          <text class="growth-card__delete-icon">×</text>
        </view>
      </view>
      <text class="growth-card__text">{{ record.content }}</text>
      <view v-if="record.photos && record.photos.length > 0" class="growth-card__photos">
        <image
          v-for="(photo, index) in displayPhotos"
          :key="index"
          class="growth-card__photo"
          :src="photo"
          mode="aspectFill"
        />
        <view v-if="extraCount > 0" class="growth-card__photo-more">
          <text class="growth-card__photo-more-text">+{{ extraCount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GrowthRecord } from '@/types/models'

const props = withDefaults(defineProps<{
  record: GrowthRecord
  plantName?: string
}>(), {
  plantName: ''
})

const emit = defineEmits<{
  click: []
  delete: []
}>()

const displayPhotos = computed(() => {
  if (!props.record.photos) return []
  return props.record.photos.slice(0, 3)
})

const extraCount = computed(() => {
  if (!props.record.photos) return 0
  return Math.max(0, props.record.photos.length - 3)
})

const relativeDate = computed(() => {
  const now = Date.now()
  const recordTime = new Date(props.record.date).getTime()
  const diff = now - recordTime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
})
</script>

<style scoped lang="scss">
.growth-card {
  display: flex;
  flex-direction: row;
  padding-bottom: $spacing-md;

  &__timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 40rpx;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: $radius-round;
    background-color: $primary-color;
    flex-shrink: 0;
    margin-top: 8rpx;
  }

  &__line {
    width: 4rpx;
    flex: 1;
    background-color: $primary-lighter;
    margin-top: 8rpx;
  }

  &__content {
    flex: 1;
    background-color: $bg-card;
    border-radius: $radius-md;
    padding: $spacing-md;
    box-shadow: $shadow-sm;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: $spacing-xs;
  }

  &__date {
    font-size: $font-sm;
    color: $text-light;
  }

  &__plant-tag {
    font-size: $font-xs;
    color: $primary-dark;
    background-color: $primary-lighter;
    padding: 2rpx 12rpx;
    border-radius: $radius-pill;
    margin-left: $spacing-sm;
  }

  &__delete {
    margin-left: auto;
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delete-icon {
    font-size: 32rpx;
    color: $text-light;
  }

  &__text {
    font-size: $font-md;
    color: $text-primary;
    line-height: 1.6;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__photos {
    display: flex;
    flex-direction: row;
    gap: $spacing-xs;
    margin-top: $spacing-sm;
  }

  &__photo {
    width: 140rpx;
    height: 140rpx;
    border-radius: $radius-sm;
  }

  &__photo-more {
    width: 140rpx;
    height: 140rpx;
    border-radius: $radius-sm;
    background-color: $bg-grey;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__photo-more-text {
    font-size: $font-lg;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
}
</style>
