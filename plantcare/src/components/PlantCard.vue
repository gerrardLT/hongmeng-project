<template>
  <view class="plant-card" @click="emit('click')">
    <view class="plant-card__left">
      <image
        class="plant-card__photo"
        :src="plant.photoUrl || '/static/images/plant-placeholder.png'"
        mode="aspectFill"
      />
    </view>
    <view class="plant-card__body">
      <view class="plant-card__header">
        <text class="plant-card__name">{{ plant.nickname }}</text>
        <view class="plant-card__location-tag">
          <text class="plant-card__location">{{ plant.location }}</text>
        </view>
      </view>
      <view class="plant-card__countdown" :class="countdownClass">
        <text class="plant-card__countdown-text">{{ countdownText }}</text>
      </view>
      <view class="plant-card__footer">
        <view class="plant-card__status" :class="`plant-card__status--${plant.status}`">
          <text class="plant-card__status-text">{{ statusText }}</text>
        </view>
        <view class="plant-card__actions">
          <view class="plant-card__water-btn" @click.stop="emit('water')">
            <text class="plant-card__water-icon">💧</text>
          </view>
          <view class="plant-card__edit-btn" @click.stop="emit('edit')">
            <text class="plant-card__edit-icon">✏️</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Plant } from '@/types/models'

const props = withDefaults(defineProps<{
  plant: Plant
}>(), {})

const emit = defineEmits<{
  click: []
  water: []
  edit: []
}>()

const daysUntilWater = computed(() => {
  if (!props.plant.nextWaterDate) return -1
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(props.plant.nextWaterDate)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
})

const countdownText = computed(() => {
  const days = daysUntilWater.value
  if (days < 0) return '已逾期浇水'
  if (days === 0) return '今日需浇水'
  return `还有${days}天`
})

const countdownClass = computed(() => {
  const days = daysUntilWater.value
  if (days <= 0) return 'plant-card__countdown--urgent'
  if (days <= 1) return 'plant-card__countdown--soon'
  return ''
})

const statusText = computed(() => {
  const map: Record<string, string> = {
    healthy: '健康',
    needsWater: '需浇水',
    needsFertilizer: '需施肥',
    sick: '生病',
    dormant: '休眠',
    dead: '已枯萎'
  }
  return map[props.plant.status] || '未知'
})
</script>

<style scoped lang="scss">
.plant-card {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-sm;

  &__left {
    flex-shrink: 0;
    margin-right: $spacing-md;
  }

  &__photo {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-sm;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: $spacing-xs;
  }

  &__name {
    font-size: $font-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-right: $spacing-sm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__location-tag {
    background-color: $primary-lighter;
    padding: 2rpx 12rpx;
    border-radius: $radius-pill;
    flex-shrink: 0;
  }

  &__location {
    font-size: $font-xs;
    color: $primary-dark;
  }

  &__countdown {
    margin-bottom: $spacing-xs;

    &--urgent {
      .plant-card__countdown-text {
        color: $error-color;
        font-weight: $font-weight-bold;
      }
    }

    &--soon {
      .plant-card__countdown-text {
        color: $warning-color;
      }
    }
  }

  &__countdown-text {
    font-size: $font-sm;
    color: $text-secondary;
  }

  &__footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  &__status {
    padding: 4rpx 16rpx;
    border-radius: $radius-pill;

    &--healthy {
      background-color: $primary-lighter;
    }

    &--needsWater {
      background-color: #E3F2FD;
    }

    &--needsFertilizer {
      background-color: #FFF3E0;
    }

    &--sick {
      background-color: #FFEBEE;
    }

    &--dormant {
      background-color: $bg-grey;
    }

    &--dead {
      background-color: #EFEBE9;
    }
  }

  &__status-text {
    font-size: $font-xs;

    .plant-card__status--healthy & {
      color: $primary-dark;
    }

    .plant-card__status--needsWater & {
      color: $info-color;
    }

    .plant-card__status--needsFertilizer & {
      color: $warning-color;
    }

    .plant-card__status--sick & {
      color: $error-color;
    }

    .plant-card__status--dormant & {
      color: $text-secondary;
    }

    .plant-card__status--dead & {
      color: $secondary-color;
    }
  }

  &__actions {
    display: flex;
    flex-direction: row;
    gap: $spacing-sm;
  }

  &__water-btn,
  &__edit-btn {
    width: 56rpx;
    height: 56rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $radius-round;
    background-color: $primary-lighter;
  }

  &__water-icon,
  &__edit-icon {
    font-size: 28rpx;
  }
}
</style>
