<template>
  <view class="param-item" :class="{ compact }">
    <view class="param-status" :class="'param-status-' + status" />
    <view class="param-info">
      <text class="param-label">{{ label }}</text>
      <view class="param-value-row">
        <text class="param-value" :class="'value-' + status">{{ displayValue }}</text>
        <text v-if="unit && value !== null" class="param-unit">{{ unit }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: number | null
  unit: string
  status?: 'normal' | 'warning' | 'danger'
  compact?: boolean
}>(), {
  status: 'normal',
  compact: false
})

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return '--'
  return String(props.value)
})
</script>

<style scoped lang="scss">
.param-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-sm;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;

  &.compact {
    padding: $spacing-sm $spacing-md;
    margin-bottom: $spacing-xs;
  }
}

.param-status {
  width: 8rpx;
  height: 48rpx;
  border-radius: $radius-xs;
  margin-right: $spacing-md;
  flex-shrink: 0;

  &.param-status-normal {
    background: $success-color;
  }

  &.param-status-warning {
    background: $warning-color;
  }

  &.param-status-danger {
    background: $error-color;
  }

  .compact & {
    height: 36rpx;
    margin-right: $spacing-sm;
  }
}

.param-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.param-label {
  font-size: $font-md;
  color: $text-secondary;

  .compact & {
    font-size: $font-sm;
  }
}

.param-value-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
}

.param-value {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;

  &.value-warning {
    color: $warning-color;
  }

  &.value-danger {
    color: $error-color;
  }

  .compact & {
    font-size: $font-md;
  }
}

.param-unit {
  font-size: $font-xs;
  color: $text-light;
  margin-left: 4rpx;
}
</style>
