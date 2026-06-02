<template>
  <view class="timeline">
    <view
      v-for="(event, idx) in events"
      :key="idx"
      class="timeline-item"
    >
      <!-- 年份 -->
      <view class="year-col">
        <text class="year-text">{{ event.year }}</text>
      </view>

      <!-- 连线 -->
      <view class="line-col">
        <view class="dot" />
        <view v-if="idx < events.length - 1" class="line" />
      </view>

      <!-- 描述 -->
      <view class="content-col">
        <text class="event-title">{{ event.title }}</text>
        <text v-if="event.description" class="event-desc">{{ event.description }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface TimelineEvent {
  year: string | number
  title: string
  description?: string
}

interface Props {
  events: TimelineEvent[]
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.timeline {
  padding: $spacing-md 0;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  min-height: 120rpx;
}

.year-col {
  width: 120rpx;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: $spacing-md;
  padding-top: 4rpx;
}

.year-text {
  font-size: $font-sm;
  color: $secondary-color;
  font-weight: 600;
  font-family: monospace;
}

.line-col {
  width: 40rpx;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: $secondary-color;
  flex-shrink: 0;
  margin-top: 8rpx;
}

.line {
  width: 4rpx;
  flex: 1;
  background-color: rgba(212, 168, 67, 0.35);
}

.content-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  padding-left: $spacing-md;
  padding-bottom: $spacing-lg;
}

.event-title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
}

.event-desc {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
}
</style>
