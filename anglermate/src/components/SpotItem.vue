<template>
  <view class="spot-item" @click="onClick">
    <view class="spot-photo">
      <image
        v-if="spot.photos && spot.photos.length > 0"
        class="photo"
        :src="spot.photos[0]"
        mode="aspectFill"
      />
      <view v-else class="photo-placeholder">
        <text class="placeholder-icon">📍</text>
      </view>
    </view>

    <view class="spot-info">
      <view class="spot-header">
        <text class="spot-name text-ellipsis">{{ spot.name }}</text>
        <view class="spot-type-badge">
          <text class="spot-type-text">{{ typeLabel }}</text>
        </view>
      </view>
      <text v-if="spot.note" class="spot-note text-ellipsis">{{ spot.note }}</text>
      <view class="spot-meta">
        <text v-if="formattedDistance" class="spot-distance">{{ formattedDistance }}</text>
        <text v-if="spot.catchCount" class="spot-catches">{{ spot.catchCount }}次渔获</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FishingSpot } from '@/types/models'
import { SPOT_TYPE_MAP } from '@/types/models'

const props = defineProps<{
  spot: FishingSpot
  distance?: number
}>()

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

const typeLabel = computed(() => SPOT_TYPE_MAP[props.spot.type] || '未知')

const formattedDistance = computed(() => {
  if (props.distance === undefined) return ''
  if (props.distance < 1000) {
    return `${Math.round(props.distance)}m`
  }
  return `${(props.distance / 1000).toFixed(1)}km`
})

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.spot-item {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.spot-photo {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.photo {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
}

.spot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.spot-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.spot-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  flex: 1;
}

.spot-type-badge {
  background: rgba(255, 107, 53, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
}

.spot-type-text {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 500;
}

.spot-note {
  font-size: 26rpx;
  color: #999999;
  margin-top: 8rpx;
}

.spot-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
  margin-top: 12rpx;
}

.spot-distance {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.spot-catches {
  font-size: 24rpx;
  color: #BDBDBD;
}
</style>
