<template>
  <view class="stats-card">
    <view class="stat-item">
      <text class="stat-icon">📖</text>
      <text class="stat-number">{{ totalBooks }}</text>
      <text class="stat-label">书籍</text>
    </view>
    <view class="stat-item">
      <text class="stat-icon">🎬</text>
      <text class="stat-number">{{ totalMovies }}</text>
      <text class="stat-label">电影</text>
    </view>
    <view class="stat-item">
      <text class="stat-icon">🎙️</text>
      <text class="stat-number">{{ totalPodcasts }}</text>
      <text class="stat-label">播客</text>
    </view>
    <view class="stat-item">
      <text class="stat-icon">🎨</text>
      <text class="stat-number">{{ totalExhibitions }}</text>
      <text class="stat-label">展览</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  totalBooks: number
  totalMovies: number
  totalPodcasts: number
  totalExhibitions: number
}

withDefaults(defineProps<Props>(), {
  totalBooks: 0,
  totalMovies: 0,
  totalPodcasts: 0,
  totalExhibitions: 0
})
</script>

<style scoped lang="scss">
.stats-card {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg $spacing-md;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stat-icon {
  font-size: $font-xl;
}

.stat-number {
  font-size: $font-xl;
  font-weight: 600;
  color: $primary-color;
}

.stat-label {
  font-size: $font-xs;
  color: $text-secondary;
}
</style>
