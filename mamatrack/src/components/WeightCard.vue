<template>
  <view class="weight-card" @click="emit('click')" @longpress="onLongPress">
    <view class="weight-card__body">
      <view class="weight-card__header">
        <text class="weight-card__date">{{ formattedDate }}</text>
        <view class="weight-card__week-tag">
          <text class="weight-card__week-text">{{ formattedWeek }}</text>
        </view>
      </view>
      <view class="weight-card__main">
        <view class="weight-card__weight">
          <text class="weight-card__weight-value">{{ record.weight.toFixed(1) }}</text>
          <text class="weight-card__weight-unit">kg</text>
        </view>
        <view class="weight-card__gain" :class="gainClass">
          <text class="weight-card__gain-text">{{ formattedGainFromLast }}</text>
        </view>
      </view>
      <view v-if="record.note" class="weight-card__note">
        <text class="weight-card__note-text">{{ record.note }}</text>
      </view>
    </view>
    <view class="weight-card__side">
      <view class="weight-card__source">
        <text class="weight-card__source-icon">{{ sourceIcon }}</text>
      </view>
      <view class="weight-card__delete-btn" @click.stop="onDelete">
        <text class="weight-card__delete-icon">×</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeightRecord } from '@/types/models'
import { formatDate, formatWeek, formatGain } from '@/utils/format'

const props = withDefaults(defineProps<{
  record: WeightRecord
}>(), {})

const emit = defineEmits<{
  click: []
  delete: []
}>()

const formattedDate = computed(() => formatDate(props.record.date))

const formattedWeek = computed(() => formatWeek(props.record.week, props.record.weekDay))

const formattedGainFromLast = computed(() => formatGain(props.record.gainFromLast))

const gainClass = computed(() => {
  if (props.record.gainFromLast > 0) return 'weight-card__gain--up'
  if (props.record.gainFromLast < 0) return 'weight-card__gain--down'
  return ''
})

const sourceIcon = computed(() => {
  return props.record.source === 'health' ? '📱' : '✍️'
})

function onLongPress() {
  onDelete()
}

function onDelete() {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条体重记录吗？',
    confirmColor: '#E91E8C',
    success(res) {
      if (res.confirm) {
        emit('delete')
      }
    }
  })
}
</script>

<style scoped lang="scss">
.weight-card {
  display: flex;
  flex-direction: row;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 12rpx;
  }

  &__date {
    font-size: 24rpx;
    color: #999999;
    margin-right: 12rpx;
  }

  &__week-tag {
    background-color: #FFF5F8;
    padding: 2rpx 14rpx;
    border-radius: 20rpx;
  }

  &__week-text {
    font-size: 22rpx;
    color: #E91E8C;
    font-weight: 500;
  }

  &__main {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-bottom: 8rpx;
  }

  &__weight {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-right: 20rpx;
  }

  &__weight-value {
    font-size: 40rpx;
    font-weight: 700;
    color: #333333;
    line-height: 1.2;
  }

  &__weight-unit {
    font-size: 24rpx;
    color: #666666;
    margin-left: 4rpx;
  }

  &__gain {
    padding: 4rpx 14rpx;
    border-radius: 20rpx;
    background-color: #F5F5F5;

    &--up {
      background-color: #FFF0F0;

      .weight-card__gain-text {
        color: #F44336;
      }
    }

    &--down {
      background-color: #F0FFF4;

      .weight-card__gain-text {
        color: #4CAF50;
      }
    }
  }

  &__gain-text {
    font-size: 22rpx;
    color: #999999;
    font-weight: 500;
  }

  &__note {
    margin-top: 4rpx;
  }

  &__note-text {
    font-size: 24rpx;
    color: #999999;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding-left: 16rpx;
  }

  &__source {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FFF5F8;
    border-radius: 28rpx;
  }

  &__source-icon {
    font-size: 28rpx;
  }

  &__delete-btn {
    width: 40rpx;
    height: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delete-icon {
    font-size: 32rpx;
    color: #CCCCCC;
  }
}
</style>
