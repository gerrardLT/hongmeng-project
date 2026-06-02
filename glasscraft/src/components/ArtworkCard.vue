<template>
  <view class="artwork-card" @click="onClick">
    <view class="photo-wrap">
      <image
        class="photo"
        :src="artwork.photos && artwork.photos.length > 0 ? artwork.photos[0] : '/static/images/default-artwork.png'"
        mode="widthFix"
      />
    </view>

    <view class="info-wrap">
      <text class="studio-name text-ellipsis">{{ artwork.studioName }}</text>
      <text class="date">{{ artwork.createdAt }}</text>
      <text v-if="artwork.note" class="note text-ellipsis-2">{{ artwork.note }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Artwork } from '@/types/models'

defineProps<{
  artwork: Artwork
}>()

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.artwork-card {
  display: flex;
  flex-direction: column;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.photo-wrap {
  width: 100%;
  overflow: hidden;
}

.photo {
  width: 100%;
  background-color: #F5F5F5;
}

.info-wrap {
  padding: 16rpx 20rpx 20rpx;
}

.studio-name {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.date {
  font-size: 22rpx;
  color: $text-hint;
  margin-bottom: 8rpx;
  display: block;
}

.note {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
