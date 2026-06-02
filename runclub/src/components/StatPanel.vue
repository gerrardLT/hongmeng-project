<template>
  <view class="stat-panel">
    <view
      v-for="(item, index) in items"
      :key="index"
      class="stat-item"
    >
      <view class="stat-value-row">
        <text class="stat-value">{{ item.value }}</text>
        <text v-if="item.unit" class="stat-unit">{{ item.unit }}</text>
      </view>
      <text class="stat-label">{{ item.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ label: string; value: string | number; unit?: string }>
}>()
</script>

<style scoped lang="scss">
.stat-panel {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  flex: 1;
  min-width: 33%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12rpx 8rpx;
}

.stat-value-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.stat-value {
  font-size: 40rpx;
  font-weight: 700;
  color: #FF5722;
}

.stat-unit {
  font-size: 22rpx;
  color: #999999;
  margin-left: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 8rpx;
}
</style>
