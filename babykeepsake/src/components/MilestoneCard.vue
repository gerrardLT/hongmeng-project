<template>
  <view class="milestone-card" @click="onClick">
    <view class="card-header">
      <text class="milestone-icon">{{ typeIcon }}</text>
      <view class="header-info">
        <text class="milestone-title">{{ milestone.title }}</text>
        <text class="milestone-date">{{ milestone.recordDate }}</text>
      </view>
      <view class="share-btn" @click.stop="onShare">
        <text class="share-icon">↗</text>
      </view>
    </view>

    <text v-if="milestone.description" class="milestone-desc">{{ milestone.description }}</text>

    <view v-if="milestone.photos && milestone.photos.length > 0" class="photos-wrap">
      <image
        v-for="(photo, idx) in milestone.photos.slice(0, 3)"
        :key="idx"
        class="photo-thumb"
        :src="photo"
        mode="aspectFill"
      />
      <view v-if="milestone.photos.length > 3" class="photo-more">
        <text class="photo-more-text">+{{ milestone.photos.length - 3 }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Milestone, MilestoneType } from '@/types/models'

const props = defineProps<{
  milestone: Milestone
}>()

const emit = defineEmits<{
  click: []
  share: []
}>()

const typeIconMap: Record<MilestoneType, string> = {
  first_handprint: '🖐',
  first_hair_cut: '✂️',
  first_tooth: '🦷',
  birthday: '🎂'
}

const typeIcon = computed(() => typeIconMap[props.milestone.type] || '⭐')

function onClick() {
  emit('click')
}

function onShare() {
  emit('share')
}
</script>

<style scoped lang="scss">
.milestone-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 28rpx;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.milestone-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.milestone-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.milestone-date {
  font-size: 24rpx;
  color: $text-hint;
}

.share-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #FFF3ED;
  border-radius: 50%;
}

.share-icon {
  font-size: 28rpx;
  color: $primary;
  font-weight: 700;
}

.milestone-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.photos-wrap {
  display: flex;
  gap: 12rpx;
}

.photo-thumb {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  background-color: #F5F5F5;
}

.photo-more {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  background-color: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-more-text {
  font-size: 28rpx;
  color: $text-hint;
  font-weight: 600;
}
</style>
