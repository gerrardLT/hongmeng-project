<template>
  <view class="progress-timeline">
    <view
      v-for="(item, index) in stageList"
      :key="index"
      class="timeline-item"
    >
      <!-- 左侧时间轴 -->
      <view class="timeline-left">
        <view class="dot" :class="dotClass(item)">
          <text v-if="item.status === 'completed'" class="dot-check">✓</text>
        </view>
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
import type { Progress, ProgressStage } from '@/types/models'

// 印章制作6阶段：设计确认→选材准备→刻制中→打磨修整→质检完成→待取件/已发货
const STAGE_ORDER: ProgressStage[] = [
  'design-confirmed',
  'material-prepared',
  'carving',
  'polishing',
  'quality-check',
  'ready-pickup',
  'shipped'
]

const STAGE_LABELS: Record<ProgressStage, string> = {
  'design-confirmed': '设计确认',
  'material-prepared': '选材准备',
  'carving': '刻制中',
  'polishing': '打磨修整',
  'quality-check': '质检完成',
  'ready-pickup': '待取件',
  'shipped': '已发货'
}

interface StageItem {
  stage: string
  status: string
  time?: string
  note?: string
}

const props = withDefaults(defineProps<{
  stages?: Progress[]
  currentStage?: ProgressStage
}>(), {})

const stageList = computed(() => {
  if (props.stages && props.stages.length > 0) {
    return props.stages.map((s) => {
      const isCompleted = s.status === 'completed'
      const isCurrent = s.status === 'active'
      const date = s.updateTime ? new Date(s.updateTime) : null
      return {
        stage: STAGE_LABELS[s.stage] || s.stage,
        status: isCompleted ? 'completed' : isCurrent ? 'current' : 'pending',
        time: date ? `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}` : undefined,
        note: s.note || undefined
      } as StageItem
    })
  }

  // 如果没有传入stages，根据currentStage生成
  const currentIdx = props.currentStage ? STAGE_ORDER.indexOf(props.currentStage) : -1
  return STAGE_ORDER.map((stage, idx) => {
    let status = 'pending'
    if (currentIdx >= 0) {
      if (idx < currentIdx) status = 'completed'
      else if (idx === currentIdx) status = 'current'
    }
    return {
      stage: STAGE_LABELS[stage],
      status
    } as StageItem
  })
})

function dotClass(item: StageItem) {
  if (item.status === 'completed') return 'dot-completed'
  if (item.status === 'current') return 'dot-current'
  return 'dot-pending'
}

function lineClass(item: StageItem, index: number) {
  if (item.status === 'completed') return 'line-completed'
  if (item.status === 'current') return 'line-half'
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
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-completed {
  background-color: $success;
}

.dot-check {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.dot-current {
  background-color: #FFFFFF;
  border: 6rpx solid $primary;
  box-shadow: 0 0 0 4rpx rgba(196, 26, 26, 0.15);
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
  background-color: $success;
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
  color: $success;
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
