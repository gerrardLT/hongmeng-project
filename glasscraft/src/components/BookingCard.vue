<template>
  <view class="booking-card" @click="onClick">
    <view class="header-row">
      <view class="studio-info">
        <text class="studio-name text-ellipsis">{{ booking.studioName }}</text>
        <text class="project-name text-ellipsis">{{ booking.projectName }}</text>
      </view>
      <view class="status-tag" :style="{ backgroundColor: statusBgColor }">
        <text class="status-text" :style="{ color: statusColor }">{{ statusLabel }}</text>
      </view>
    </view>

    <view class="detail-row">
      <text class="detail-item">📅 {{ booking.date }}</text>
      <text class="detail-item">👥 {{ booking.people }}人</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Booking } from '@/types/models'

const props = defineProps<{
  booking: Booking
}>()

const emit = defineEmits<{
  click: []
}>()

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待确认', color: '#FF9800', bgColor: '#FFF3E0' },
  confirmed: { label: '已确认', color: '#4CAF50', bgColor: '#E8F5E9' },
  completed: { label: '已完成', color: '#4ECDC4', bgColor: '#E0F7FA' },
  cancelled: { label: '已取消', color: '#9E9E9E', bgColor: '#F5F5F5' }
}

const statusLabel = computed(() => {
  return statusConfig[props.booking.status]?.label || '未知'
})

const statusColor = computed(() => {
  return statusConfig[props.booking.status]?.color || '#9E9E9E'
})

const statusBgColor = computed(() => {
  return statusConfig[props.booking.status]?.bgColor || '#F5F5F5'
})

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.booking-card {
  display: flex;
  flex-direction: column;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.header-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.studio-info {
  flex: 1;
  min-width: 0;
  margin-right: 16rpx;
}

.studio-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.project-name {
  font-size: 26rpx;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.status-tag {
  flex-shrink: 0;
  border-radius: $radius-sm;
  padding: 6rpx 16rpx;
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.detail-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32rpx;
}

.detail-item {
  font-size: 24rpx;
  color: $text-hint;
}
</style>
