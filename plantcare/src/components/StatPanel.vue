<template>
  <view class="stat-panel">
    <view class="stat-panel__item">
      <text class="stat-panel__icon">🌱</text>
      <text class="stat-panel__value">{{ stats.totalPlants }}</text>
      <text class="stat-panel__label">植物总数</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">💧</text>
      <text class="stat-panel__value stat-panel__value--water">{{ stats.todayNeedWater }}</text>
      <text class="stat-panel__label">今日待浇</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">✅</text>
      <text class="stat-panel__value stat-panel__value--done">{{ stats.weekCompleted }}</text>
      <text class="stat-panel__label">本周完成</text>
    </view>
    <view class="stat-panel__item">
      <text class="stat-panel__icon">🔥</text>
      <text class="stat-panel__value stat-panel__value--streak">{{ stats.consecutiveDays }}</text>
      <text class="stat-panel__label">连续天数</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CareStats } from '@/types/models'

withDefaults(defineProps<{
  stats: CareStats
}>(), {})
</script>

<style scoped lang="scss">
.stat-panel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md $spacing-sm;
  box-shadow: $shadow-md;

  &__item {
    width: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: $spacing-sm 0;
  }

  &__icon {
    font-size: 40rpx;
    margin-bottom: $spacing-xs;
  }

  &__value {
    font-size: $font-xxl;
    font-weight: 700;
    color: $primary-color;
    line-height: 1.2;

    &--water {
      color: $info-color;
    }

    &--done {
      color: $success-color;
    }

    &--streak {
      color: $warning-color;
    }
  }

  &__label {
    font-size: $font-sm;
    color: $text-secondary;
    margin-top: 4rpx;
  }
}
</style>
