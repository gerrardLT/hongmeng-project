<template>
  <view class="stat-panel">
    <view class="stat-grid">
      <view class="stat-cell">
        <text class="stat-icon">🐠</text>
        <text class="stat-number">{{ stats.totalAquariums }}</text>
        <text class="stat-label">水族箱</text>
      </view>
      <view class="stat-cell">
        <text class="stat-icon">📊</text>
        <text class="stat-number">{{ stats.totalRecords }}</text>
        <text class="stat-label">记录总数</text>
      </view>
      <view class="stat-cell">
        <text class="stat-icon">🔔</text>
        <text class="stat-number" :class="{ 'has-alert': stats.todayAlerts > 0 }">{{ stats.todayAlerts }}</text>
        <text class="stat-label">今日预警</text>
      </view>
      <view class="stat-cell">
        <text class="stat-icon">💚</text>
        <text class="stat-number score">{{ stats.healthScore }}</text>
        <text class="stat-label">健康评分</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { AquariumStats } from '@/types/models'

withDefaults(defineProps<{
  stats: AquariumStats
}>(), {})
</script>

<style scoped lang="scss">
.stat-panel {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.stat-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.stat-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: $font-xl;
  margin-bottom: $spacing-xs;
}

.stat-number {
  font-size: $font-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.2;

  &.has-alert {
    color: $error-color;
  }

  &.score {
    color: $success-color;
  }
}

.stat-label {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}
</style>
