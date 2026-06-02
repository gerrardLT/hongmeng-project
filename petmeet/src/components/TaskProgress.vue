<template>
  <view class="task-progress" v-if="tasks.length > 0">
    <view class="progress-header">
      <text class="title">新手任务</text>
      <text class="count">已完成 {{ completedCount }}/{{ tasks.length }}</text>
    </view>

    <!-- 全部完成提示 -->
    <view v-if="allCompleted" class="completed-banner">
      <text class="banner-text">恭喜完成所有任务！🎉</text>
    </view>

    <!-- 进度节点 -->
    <view v-else class="progress-nodes">
      <view v-for="(task, index) in tasks" :key="task.taskId" class="node-wrapper">
        <!-- 连接线 -->
        <view v-if="index > 0" class="connector" :class="{ active: task.isCompleted }"></view>
        <!-- 节点 -->
        <view class="node" :class="{ completed: task.isCompleted }" @click="$emit('taskClick', task.taskType)">
          <view class="node-circle">
            <text v-if="task.isCompleted" class="check-icon">✓</text>
            <text v-else class="node-index">{{ index + 1 }}</text>
          </view>
          <text class="node-label">{{ getTaskLabel(task.taskType) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserTask, TaskType } from '@/types/models'

const props = defineProps<{
  tasks: UserTask[]
}>()

const emit = defineEmits<{
  taskClick: [taskType: TaskType]
}>()

const completedCount = computed(() => props.tasks.filter(t => t.isCompleted).length)
const allCompleted = computed(() => completedCount.value === props.tasks.length)

function getTaskLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    complete_profile: '完善档案',
    first_diary: '发布日记',
    first_bump: '碰一碰'
  }
  return labels[type] || type
}
</script>

<style scoped>
.task-progress {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 20rpx 0;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}
.title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2D3436;
}
.count {
  font-size: 24rpx;
  color: #636E72;
}
.completed-banner {
  text-align: center;
  padding: 20rpx;
  background: #FFF3ED;
  border-radius: 12rpx;
}
.banner-text {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: bold;
}
.progress-nodes {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
.node-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}
.connector {
  height: 4rpx;
  flex: 1;
  background: #E0E0E0;
  margin: 0 8rpx;
  margin-bottom: 36rpx;
}
.connector.active {
  background: #FF6B35;
}
.node {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.node-circle {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E0E0E0;
  margin-bottom: 8rpx;
}
.node.completed .node-circle {
  background: #FF6B35;
}
.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
.node-index {
  color: #fff;
  font-size: 24rpx;
}
.node-label {
  font-size: 22rpx;
  color: #636E72;
}
.node.completed .node-label {
  color: #FF6B35;
}
</style>
