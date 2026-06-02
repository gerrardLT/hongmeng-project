<template>
  <view class="catch-card" @click="onClick">
    <view class="catch-photo">
      <image
        v-if="record.photos && record.photos.length > 0"
        class="photo"
        :src="record.photos[0]"
        mode="aspectFill"
      />
      <view v-else class="photo-placeholder">
        <text class="placeholder-icon">🐟</text>
      </view>
    </view>

    <view class="catch-info">
      <view class="catch-header">
        <text class="fish-name">{{ record.fishSpecies }}</text>
        <view class="method-badge">
          <text class="method-text">{{ methodLabel }}</text>
        </view>
      </view>

      <view class="catch-detail">
        <text class="detail-text">{{ record.weight }}kg · {{ record.count }}条</text>
      </view>

      <view class="catch-meta">
        <text class="meta-text">{{ record.date }} {{ record.time }}</text>
        <text v-if="record.spotName" class="meta-spot">{{ record.spotName }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CatchRecord } from '@/types/models'
import { FISH_METHOD_MAP } from '@/types/models'

const props = defineProps<{
  record: CatchRecord
}>()

const emit = defineEmits<{
  click: []
}>()

const methodLabel = computed(() => FISH_METHOD_MAP[props.record.method] || '其他')

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.catch-card {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.catch-photo {
  width: 120rpx;
  height: 120rpx;
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

.catch-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.catch-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.fish-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
}

.method-badge {
  background: rgba(255, 107, 53, 0.1);
  padding: 2rpx 14rpx;
  border-radius: 12rpx;
}

.method-text {
  font-size: 22rpx;
  color: #FF6B35;
  font-weight: 500;
}

.catch-detail {
  margin-top: 8rpx;
}

.detail-text {
  font-size: 26rpx;
  color: #666666;
}

.catch-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  margin-top: 8rpx;
}

.meta-text {
  font-size: 24rpx;
  color: #BDBDBD;
}

.meta-spot {
  font-size: 24rpx;
  color: #BDBDBD;
}
</style>
