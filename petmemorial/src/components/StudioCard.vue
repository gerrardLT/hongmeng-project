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
        <text v-if="studio.reviewCount" class="review-count">({{ studio.reviewCount }})</text>
      </view>

      <view v-if="studio.distance !== undefined" class="distance-row">
        <text class="distance-text">{{ distanceLabel }}</text>
      </view>

      <text class="address text-ellipsis">{{ studio.address }}</text>

      <view v-if="studio.services && studio.services.length > 0" class="tags-wrap">
        <view
          v-for="(svc, idx) in studio.services.slice(0, 3)"
          :key="idx"
          class="service-tag"
        >
          <text class="service-tag-text">{{ serviceLabel(svc) }}</text>
        </view>
        <text v-if="studio.services.length > 3" class="more-tag">+{{ studio.services.length - 3 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Studio, MemorialCategory } from '@/types/models'

const SERVICE_LABELS: Record<MemorialCategory, string> = {
  pawprint: '爪印',
  fur: '毛发',
  portrait: '肖像',
  seal: '印章',
  jewelry: '首饰'
}

const props = defineProps<{
  studio: Studio
}>()

const emit = defineEmits<{
  click: []
}>()

const distanceLabel = computed(() => {
  if (props.studio.distance === undefined) return ''
  if (props.studio.distance < 1) {
    return `${Math.round(props.studio.distance * 1000)}m`
  }
  return `${props.studio.distance.toFixed(1)}km`
})

function serviceLabel(category: MemorialCategory): string {
  return SERVICE_LABELS[category] || category
}

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

.review-count {
  font-size: 20rpx;
  color: $text-hint;
  margin-left: 4rpx;
}

.distance-row {
  margin-bottom: 6rpx;
}

.distance-text {
  font-size: 22rpx;
  color: $primary;
}

.address {
  font-size: 24rpx;
  color: $text-hint;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  align-items: center;
}

.service-tag {
  background-color: #F3E8FF;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
}

.service-tag-text {
  font-size: 20rpx;
  color: $primary;
}

.more-tag {
  font-size: 20rpx;
  color: $text-hint;
}
</style>
