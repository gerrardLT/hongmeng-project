<template>
  <view class="booking-step">
    <view
      v-for="(step, index) in steps"
      :key="index"
      class="step-wrapper"
    >
      <!-- 连接线 -->
      <view
        v-if="index > 0"
        class="connector"
        :class="{
          completed: index < currentStep,
          active: index === currentStep
        }"
      />

      <!-- 节点 -->
      <view class="step-node" :class="nodeClass(index)">
        <view class="node-circle" :style="circleStyle(index)">
          <text v-if="index < currentStep" class="check-icon">✓</text>
          <text v-else class="node-index">{{ index + 1 }}</text>
        </view>
        <text class="step-label" :class="labelClass(index)">{{ step }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const DEFAULT_STEPS = ['选择纪念品', '选择工作室', '选择时间', '填写信息', '确认预约']

const props = withDefaults(defineProps<{
  currentStep: number
  steps?: string[]
  activeColor?: string
}>(), {
  steps: () => DEFAULT_STEPS,
  activeColor: ''
})

const color = computed(() => props.activeColor || '#8B5CF6')

function nodeClass(index: number) {
  if (index < props.currentStep) return 'is-completed'
  if (index === props.currentStep) return 'is-current'
  return 'is-pending'
}

function circleStyle(index: number) {
  if (index < props.currentStep) {
    return { backgroundColor: color.value }
  }
  if (index === props.currentStep) {
    return {
      backgroundColor: '#FFFFFF',
      borderColor: color.value,
      borderWidth: '4rpx',
      borderStyle: 'solid'
    }
  }
  return {}
}

function labelClass(index: number) {
  if (index < props.currentStep) return 'label-completed'
  if (index === props.currentStep) return 'label-current'
  return 'label-pending'
}
</script>

<style scoped lang="scss">
.booking-step {
  display: flex;
  align-items: flex-start;
  padding: 24rpx 16rpx;
}

.step-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.connector {
  height: 4rpx;
  flex: 1;
  background-color: $border-color;
  margin: 0 8rpx;
  margin-bottom: 40rpx;
}

.connector.completed {
  background-color: $primary;
}

.connector.active {
  background: linear-gradient(90deg, $primary, $border-color);
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.node-circle {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $border-color;
  margin-bottom: 12rpx;
  box-sizing: border-box;
}

.is-current .node-circle {
  box-shadow: 0 0 0 6rpx rgba(139, 92, 246, 0.15);
}

.check-icon {
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 700;
}

.node-index {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 600;
}

.is-current .node-index {
  color: $primary;
}

.is-pending .node-index {
  color: $text-hint;
}

.step-label {
  font-size: 22rpx;
  text-align: center;
  white-space: nowrap;
}

.label-completed {
  color: $primary;
  font-weight: 500;
}

.label-current {
  color: $text-primary;
  font-weight: 600;
}

.label-pending {
  color: $text-hint;
}
</style>
