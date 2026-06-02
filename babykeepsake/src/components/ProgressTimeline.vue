<template>
  <view class="progress-timeline">
    <view
      v-for="(item, index) in stageList"
      :key="index"
      class="timeline-item"
    >
      <!-- 左侧时间轴 -->
      <view class="timeline-left">
        <view class="dot" :class="dotClass(item)" />
        <view v-if="index < stageList.length - 1" class="line" :class="lineClass(item, index)" />
      </view>

      <!-- 右侧内容 -->
      <view class="timeline-right">
        <text class="stage-title" :class="titleClass(item)">{{ item.stage }}</text>
        <text v-if="item.time" class="stage-time">{{ item.time }}</text>
        <text v-if="item.note" class="stage-note">{{ item.note }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface StageItem {
  stage: string
  status: string
  time?: string
  note?: string
}

const DEFAULT_STAGES: StageItem[] = [
  { stage: '采集完成', status: 'completed' },
  { stage: '设计确认', status: 'completed' },
  { stage: '制作中', status: 'current' },
  { stage: '质检完成', status: 'pending' },
  { stage: '待取货/已发货', status: 'pending' }
]

const props = withDefaults(defineProps<{
  stages?: StageItem[]
  currentStage?: string
}>(), {
  stages: () => DEFAULT_STAGES
})

const stageList = computed(() => {
  if (!props.currentStage) return props.stages
  let found = false
  return props.stages.map((s) => {
    if (s.stage === props.currentStage) {
      found = true
      return { ...s, status: 'current' }
    }
    if (!found) {
      return { ...s, status: 'completed' }
    }
    return { ...s, status: 'pending' }
  })
})

function dotClass(item: StageItem) {
  if (item.status === 'completed') return 'dot-completed'
  if (item.status === 'current') return 'dot-current'
  return 'dot-pending'
}

function lineClass(item: StageItem, index: number) {
  if (item.status === 'completed') return 'line-completed'
  const nextItem = props.stages[index + 1]
  if (item.status === 'current' && nextItem?.status !== 'completed') return 'line-half'
  return 'line-pending'
}

function titleClass(item: StageItem) {
  if (item.status === 'completed') return 'title-completed'
  if (item.status === 'current') return 'title-current'
  return 'title-pending'
}
</script>

<style scoped lang="scss">
.progress-timeline {
  padding: 24rpx;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  min-height: 120rpx;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 48rpx;
  flex-shrink: 0;
}

.dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.dot-completed {
  background-color: $primary;
}

.dot-current {
  background-color: #FFFFFF;
  border: 6rpx solid $primary;
  box-shadow: 0 0 0 4rpx rgba(255, 107, 53, 0.15);
}

.dot-pending {
  background-color: $border-color;
}

.line {
  flex: 1;
  width: 4rpx;
  margin: 8rpx 0;
}

.line-completed {
  background-color: $primary;
}

.line-half {
  background: linear-gradient(180deg, $primary, $border-color);
}

.line-pending {
  background-color: $border-color;
}

.timeline-right {
  flex: 1;
  padding-left: 24rpx;
  padding-bottom: 32rpx;
}

.stage-title {
  font-size: 28rpx;
  font-weight: 500;
  display: block;
  margin-bottom: 6rpx;
}

.title-completed {
  color: $primary;
  font-weight: 600;
}

.title-current {
  color: $text-primary;
  font-weight: 700;
}

.title-pending {
  color: $text-hint;
}

.stage-time {
  font-size: 24rpx;
  color: $text-hint;
  display: block;
  margin-bottom: 4rpx;
}

.stage-note {
  font-size: 24rpx;
  color: $text-secondary;
  display: block;
  line-height: 1.5;
}
</style>
