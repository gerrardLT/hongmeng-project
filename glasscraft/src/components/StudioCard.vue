<template>
  <view class="studio-card" @click="onClick">
    <view class="photo-wrap">
      <image
        class="photo"
        :src="studio.photos && studio.photos.length > 0 ? studio.photos[0] : '/static/images/default-studio.png'"
        mode="aspectFill"
      />
    </view>

    <view class="info-wrap">
      <text class="name text-ellipsis">{{ studio.name }}</text>

      <view class="rating-row">
        <view class="stars">
          <text
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ filled: star <= Math.round(studio.rating) }"
          >★</text>
        </view>
        <text class="rating-num">{{ studio.rating.toFixed(1) }}</text>
      </view>

      <view class="price-row">
        <text class="price-text">¥{{ studio.priceMin || 0 }}-{{ studio.priceMax || 0 }}</text>
        <text v-if="showDistance && studio.distance !== undefined" class="distance-text">{{ distanceLabel }}</text>
      </view>

      <text class="address text-ellipsis">{{ studio.address }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Studio } from '@/types/models'

const props = withDefaults(defineProps<{
  studio: Studio
  showDistance?: boolean
}>(), {
  showDistance: true
})

const emit = defineEmits<{
  click: []
}>()

const distanceLabel = computed(() => {
  if (props.studio.distance === undefined) return ''
  if (props.studio.distance < 1000) {
    return `${Math.round(props.studio.distance)}m`
  }
  return `${(props.studio.distance / 1000).toFixed(1)}km`
})

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.studio-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.photo-wrap {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.photo {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rating-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.stars {
  display: flex;
  margin-right: 8rpx;
}

.star {
  font-size: 24rpx;
  color: $border-color;
}

.star.filled {
  color: #FFB800;
}

.rating-num {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 600;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.price-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 600;
}

.distance-text {
  font-size: 22rpx;
  color: $secondary;
}

.address {
  font-size: 24rpx;
  color: $text-hint;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
