<template>
  <view class="gear-item" @click="emit('click')">
    <view v-if="checkMode" class="gear-item__check" @click.stop="emit('toggle')">
      <view class="gear-item__checkbox" :class="{ 'gear-item__checkbox--checked': isChecked }">
        <text v-if="isChecked" class="gear-item__checkmark">✓</text>
      </view>
    </view>

    <view class="gear-item__content">
      <view class="gear-item__row">
        <text class="gear-item__name" :class="{ 'gear-item__name--checked': isChecked }">{{ gear.name }}</text>
        <CategoryTag :category="gear.category" />
      </view>
      <view class="gear-item__meta">
        <text class="gear-item__weight">{{ formatWeightGram(gear.weight, 'kg') }}</text>
        <text v-if="gear.quantity > 1" class="gear-item__quantity">×{{ gear.quantity }}</text>
      </view>
    </view>

    <view v-if="gear.photos && gear.photos.length > 0" class="gear-item__photo">
      <image class="gear-item__photo-img" :src="gear.photos[0]" mode="aspectFill" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Gear } from '@/types/models'
import { formatWeightGram } from '@/utils/format'
import CategoryTag from './CategoryTag.vue'

withDefaults(defineProps<{
  gear: Gear
  checkMode?: boolean
  isChecked?: boolean
}>(), {
  checkMode: false,
  isChecked: false
})

const emit = defineEmits<{
  click: []
  toggle: []
}>()
</script>

<style scoped lang="scss">
.gear-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  &__check {
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  &__checkbox {
    width: 44rpx;
    height: 44rpx;
    border: 3rpx solid #CCCCCC;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &--checked {
      background-color: #2E7D32;
      border-color: #2E7D32;
    }
  }

  &__checkmark {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: 700;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__row {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &__name {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin-right: 12rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--checked {
      color: #999999;
      text-decoration: line-through;
    }
  }

  &__meta {
    display: flex;
    align-items: center;
  }

  &__weight {
    font-size: 24rpx;
    color: #999999;
  }

  &__quantity {
    font-size: 24rpx;
    color: #999999;
    margin-left: 12rpx;
  }

  &__photo {
    margin-left: 16rpx;
    flex-shrink: 0;
  }

  &__photo-img {
    width: 80rpx;
    height: 80rpx;
    border-radius: 12rpx;
  }
}
</style>
