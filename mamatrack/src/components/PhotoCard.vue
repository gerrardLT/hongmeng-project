<template>
  <view class="photo-card" @click="emit('click')">
    <view class="photo-card__thumb">
      <image
        class="photo-card__image"
        :src="thumbUrl"
        mode="aspectFill"
      />
      <view class="photo-card__week-badge">
        <text class="photo-card__week-text">{{ formattedWeek }}</text>
      </view>
    </view>
    <view class="photo-card__info">
      <text class="photo-card__date">{{ formattedDate }}</text>
      <text v-if="log.note" class="photo-card__note">{{ log.note }}</text>
    </view>
    <view class="photo-card__compare" @click.stop="emit('compare')">
      <text class="photo-card__compare-text">对比</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PregnancyLog } from '@/types/models'
import { formatDate, formatWeek } from '@/utils/format'

const props = withDefaults(defineProps<{
  log: PregnancyLog
}>(), {})

const emit = defineEmits<{
  click: []
  compare: []
}>()

const thumbUrl = computed(() => {
  return props.log.frontPhotoUrl || props.log.sidePhotoUrl || ''
})

const formattedDate = computed(() => {
  return formatDate(new Date(props.log.createdAt).toISOString().slice(0, 10))
})

const formattedWeek = computed(() => {
  return formatWeek(props.log.week)
})
</script>

<style scoped lang="scss">
.photo-card {
  display: flex;
  flex-direction: row;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &__thumb {
    position: relative;
    width: 160rpx;
    height: 160rpx;
    flex-shrink: 0;
    margin-right: 20rpx;
  }

  &__image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
  }

  &__week-badge {
    position: absolute;
    bottom: 8rpx;
    left: 8rpx;
    background: rgba(233, 30, 140, 0.85);
    padding: 2rpx 12rpx;
    border-radius: 16rpx;
  }

  &__week-text {
    font-size: 20rpx;
    color: #ffffff;
    font-weight: 500;
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
  }

  &__date {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin-bottom: 8rpx;
  }

  &__note {
    font-size: 24rpx;
    color: #999999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.4;
  }

  &__compare {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;
    background: #FFF5F8;
    border-radius: 20rpx;
    align-self: center;
  }

  &__compare-text {
    font-size: 24rpx;
    color: #E91E8C;
    font-weight: 500;
  }
}
</style>
