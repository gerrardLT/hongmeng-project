<template>
  <view class="friend-item" @click="onClick">
    <view class="avatar-box">
      <image
        class="avatar"
        :src="friendship.friendPet.avatar || '/static/default-pet.png'"
        mode="aspectFill"
      />
    </view>

    <view class="info">
      <view class="row-top">
        <text class="name">{{ friendship.friendPet.name }}</text>
        <view class="breed-tag">
          <text class="breed-text">{{ friendship.friendPet.breed || '未知品种' }}</text>
        </view>
      </view>
      <view class="row-mid">
        <text class="meet-time">{{ meetTimeText }}相遇</text>
        <text v-if="friendship.meetLocation" class="meet-location">· {{ friendship.meetLocation }}</text>
      </view>
      <view v-if="friendship.remark" class="row-remark">
        <text class="remark-text">备注：{{ friendship.remark }}</text>
      </view>
    </view>

    <view class="arrow">
      <text class="arrow-icon">›</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Friendship } from '@/types/models'
import { formatTime } from '@/utils/format'
import { computed } from 'vue'

const props = defineProps<{
  friendship: Friendship
}>()

const emit = defineEmits<{
  click: []
}>()

const meetTimeText = computed(() => formatTime(props.friendship.meetTime))

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.friend-item {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.15s;

  &:active {
    background-color: #f5f5f5;
  }
}

.avatar-box {
  flex-shrink: 0;
  margin-right: 20rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  background-color: #f0f0f0;
}

.info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.row-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
}

.breed-tag {
  background-color: #f0f0f0;
  border-radius: 16rpx;
  padding: 4rpx 14rpx;
}

.breed-text {
  font-size: 22rpx;
  color: #636E72;
}

.row-mid {
  display: flex;
  align-items: center;
}

.meet-time {
  font-size: 24rpx;
  color: #636E72;
}

.meet-location {
  font-size: 24rpx;
  color: #636E72;
  margin-left: 8rpx;
}

.row-remark {
  margin-top: 2rpx;
}

.remark-text {
  font-size: 22rpx;
  color: #FF6B35;
}

.arrow {
  flex-shrink: 0;
  margin-left: 12rpx;
}

.arrow-icon {
  font-size: 36rpx;
  color: #B2BEC3;
}
</style>
