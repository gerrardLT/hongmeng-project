<template>
  <view class="project-card" @click="onClick">
    <view class="photo-wrap">
      <image
        class="photo"
        :src="project.photo || '/static/images/default-project.png'"
        mode="aspectFill"
      />
      <view class="difficulty-wrap">
        <DifficultyTag :level="project.difficulty" />
      </view>
    </view>

    <view class="info-wrap">
      <text class="name text-ellipsis">{{ project.name }}</text>
      <view class="meta-row">
        <text class="price">¥{{ project.price }}</text>
        <text class="duration">⏱ {{ project.duration }}分钟</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Project } from '@/types/models'
import DifficultyTag from './DifficultyTag.vue'

defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.project-card {
  display: flex;
  flex-direction: column;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.photo-wrap {
  position: relative;
  width: 100%;
  height: 280rpx;
}

.photo {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.difficulty-wrap {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
}

.info-wrap {
  padding: 20rpx 24rpx 24rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary;
}

.duration {
  font-size: 22rpx;
  color: $text-hint;
}
</style>
