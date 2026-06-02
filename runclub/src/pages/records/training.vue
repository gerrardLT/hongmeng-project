<template>
  <view class="page">
    <!-- 无计划时：创建表单 -->
    <view v-if="!activePlan" class="create-section">
      <view class="create-header">
        <text class="create-title">创建训练计划</text>
        <text class="create-desc">制定个性化训练方案，科学备赛</text>
      </view>

      <view class="form-card">
        <view class="form-item">
          <text class="form-label">计划名称</text>
          <input class="form-input" v-model="createForm.name" placeholder="例如：首马备战计划" />
        </view>

        <view class="form-item">
          <text class="form-label">训练周期</text>
          <picker :range="durationOptions" :range-key="'label'" :value="durationIndex" @change="onDurationChange">
            <view class="picker-value">
              <text>{{ durationOptions[durationIndex].label }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">目标赛事（选填）</text>
          <input class="form-input" v-model="createForm.targetRace" placeholder="例如：北京马拉松" />
        </view>

        <view class="form-item">
          <text class="form-label">开始日期</text>
          <picker mode="date" :value="createForm.startDate" @change="onStartDateChange">
            <view class="picker-value">
              <text>{{ createForm.startDate || '请选择开始日期' }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="btn-create" @click="onCreatePlan">
          <text class="btn-create-text">生成训练计划</text>
        </view>
      </view>
    </view>

    <!-- 有计划时：计划详情 -->
    <view v-else class="plan-detail">
      <!-- 计划信息头 -->
      <view class="plan-info-card">
        <view class="plan-info-top">
          <text class="plan-title">{{ activePlan.name }}</text>
          <view class="status-badge" :class="`status-${activePlan.status}`">
            <text class="status-text">{{ statusMap[activePlan.status] }}</text>
          </view>
        </view>
        <view v-if="activePlan.targetRace" class="plan-race">
          <text class="race-label">目标赛事：</text>
          <text class="race-value">{{ activePlan.targetRace }}</text>
        </view>

        <!-- 进度条 -->
        <view class="progress-section">
          <view class="progress-info">
            <text class="progress-label">训练进度</text>
            <text class="progress-percent">{{ trainingStore.planProgress }}%</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: trainingStore.planProgress + '%' }" />
          </view>
        </view>
      </view>

      <!-- 今日训练 -->
      <view v-if="todayTraining" class="today-section">
        <text class="section-title">今日训练</text>
        <view class="today-card" :class="`type-${todayTraining.type}`">
          <view class="today-top">
            <view class="type-tag" :class="`tag-${todayTraining.type}`">
              <text class="type-tag-text">{{ typeLabels[todayTraining.type] }}</text>
            </view>
            <text v-if="todayTraining.distance" class="today-distance">{{ todayTraining.distance }}km</text>
          </view>
          <text class="today-desc">{{ todayTraining.description }}</text>
          <view v-if="!todayTraining.completed && todayTraining.type !== 'rest'" class="btn-checkin" @click="onCheckIn">
            <text class="btn-checkin-text">完成打卡 ✓</text>
          </view>
          <view v-else-if="todayTraining.completed" class="checked-badge">
            <text class="checked-text">已完成 ✓</text>
          </view>
        </view>
      </view>

      <!-- 当周训练表 -->
      <view class="week-section">
        <text class="section-title">当周训练安排</text>
        <view class="week-table">
          <view
            v-for="(day, index) in currentWeekDays"
            :key="index"
            class="week-row"
            :class="{ 'is-today': day.isToday }"
          >
            <text class="week-day-label">Day {{ day.day }}</text>
            <view class="type-dot" :class="`dot-${day.type}`" />
            <text class="week-type">{{ typeLabels[day.type] }}</text>
            <text v-if="day.distance" class="week-distance">{{ day.distance }}km</text>
            <text v-else class="week-distance">-</text>
            <view class="week-status">
              <text v-if="day.completed" class="status-done">✓</text>
              <text v-else-if="day.type === 'rest'" class="status-rest">休</text>
              <text v-else class="status-pending">○</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="plan-actions">
        <view class="btn-action btn-pause" @click="onPausePlan">
          <text class="btn-action-text">{{ activePlan.status === 'paused' ? '恢复计划' : '暂停计划' }}</text>
        </view>
        <view class="btn-action btn-delete" @click="onDeletePlan">
          <text class="btn-delete-text">删除计划</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useTrainingStore } from '@/store/training'
import { useUserStore } from '@/store/user'
import { formatDate } from '@/utils/format'
import type { TrainingType, TrainingStatus, TrainingDay } from '@/types/models'

const trainingStore = useTrainingStore()
const userStore = useUserStore()

const typeLabels: Record<TrainingType, string> = {
  rest: '休息',
  easy: '轻松跑',
  tempo: '节奏跑',
  long: '长距离',
  interval: '间歇跑',
  recovery: '恢复跑'
}

const statusMap: Record<TrainingStatus, string> = {
  active: '进行中',
  completed: '已完成',
  paused: '已暂停'
}

const durationOptions = [
  { label: '4周', value: 4 },
  { label: '8周', value: 8 },
  { label: '12周', value: 12 }
]
const durationIndex = ref(1)

const createForm = ref({
  name: '',
  targetRace: '',
  startDate: formatDate(Date.now())
})

const activePlan = computed(() => trainingStore.activePlan)
const todayTraining = computed(() => trainingStore.todayTraining)

// 当周训练日
const currentWeekDays = computed(() => {
  const plan = activePlan.value
  if (!plan) return []
  const startDate = new Date(plan.startDate)
  const today = new Date()
  const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  const weekStart = Math.floor(diffDays / 7) * 7
  const days: Array<TrainingDay & { isToday: boolean }> = []
  for (let i = weekStart; i < weekStart + 7 && i < plan.schedule.length; i++) {
    days.push({
      ...plan.schedule[i],
      isToday: i === diffDays
    })
  }
  return days
})

function onDurationChange(e: any) {
  durationIndex.value = Number(e.detail.value)
}

function onStartDateChange(e: any) {
  createForm.value.startDate = e.detail.value
}

// 生成训练安排
function generateSchedule(weeks: number): TrainingDay[] {
  const schedule: TrainingDay[] = []
  const weekTemplate: Array<{ type: TrainingType; desc: string; dist?: number }> = [
    { type: 'easy', desc: '轻松慢跑，保持心率在最大心率60-70%', dist: 5 },
    { type: 'interval', desc: '间歇训练：5组800米，组间休息90秒', dist: 6 },
    { type: 'recovery', desc: '恢复跑，轻松配速', dist: 3 },
    { type: 'rest', desc: '完全休息，适当拉伸' },
    { type: 'tempo', desc: '节奏跑，保持舒适但有挑战的配速', dist: 8 },
    { type: 'long', desc: '长距离拉练，注意补给', dist: 12 },
    { type: 'rest', desc: '休息日，做瑜伽或泡沫轴放松' }
  ]

  for (let w = 0; w < weeks; w++) {
    const factor = 1 + w * 0.08
    weekTemplate.forEach((t, dayIdx) => {
      schedule.push({
        day: w * 7 + dayIdx + 1,
        type: t.type,
        description: t.desc,
        distance: t.dist ? Math.round(t.dist * factor * 10) / 10 : undefined,
        completed: false
      })
    })
  }
  return schedule
}

async function onCreatePlan() {
  if (!createForm.value.name.trim()) {
    uni.showToast({ title: '请输入计划名称', icon: 'none' })
    return
  }
  if (!createForm.value.startDate) {
    uni.showToast({ title: '请选择开始日期', icon: 'none' })
    return
  }

  const weeks = durationOptions[durationIndex.value].value
  try {
    await trainingStore.createPlan({
      userId: userStore.userId,
      name: createForm.value.name,
      duration: weeks,
      targetRace: createForm.value.targetRace || undefined,
      startDate: createForm.value.startDate,
      status: 'active',
      schedule: generateSchedule(weeks)
    })
    uni.showToast({ title: '计划已创建', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '创建失败', icon: 'none' })
  }
}

async function onCheckIn() {
  const plan = activePlan.value
  if (!plan) return
  const startDate = new Date(plan.startDate)
  const today = new Date()
  const dayIndex = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
  if (dayIndex < 0 || dayIndex >= plan.schedule.length) return

  try {
    await trainingStore.completeDayTraining(plan.planId, dayIndex)
    uni.showToast({ title: '打卡成功！', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '打卡失败', icon: 'none' })
  }
}

async function onPausePlan() {
  const plan = activePlan.value
  if (!plan) return
  const newStatus = plan.status === 'paused' ? 'active' : 'paused'
  try {
    await trainingStore.updatePlan(plan.planId, { status: newStatus })
    uni.showToast({ title: newStatus === 'paused' ? '已暂停' : '已恢复', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

function onDeletePlan() {
  const plan = activePlan.value
  if (!plan) return
  uni.showModal({
    title: '删除计划',
    content: '确定要删除当前训练计划吗？此操作不可撤销。',
    success: async (res) => {
      if (res.confirm) {
        await trainingStore.deletePlan(plan.planId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

onShow(() => {
  trainingStore.loadPlans()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 60rpx;
}

/* 创建表单 */
.create-section {
  padding: 24rpx;
}

.create-header {
  padding: 32rpx 0;
  text-align: center;
}

.create-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
  display: block;
  margin-bottom: 12rpx;
}

.create-desc {
  font-size: 26rpx;
  color: #999999;
}

.form-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker-value {
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.btn-create {
  height: 88rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 87, 34, 0.3);
}

.btn-create-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 计划详情 */
.plan-detail {
  padding: 24rpx;
}

.plan-info-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  margin-bottom: 24rpx;
}

.plan-info-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.plan-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #212121;
  flex: 1;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}
.status-active { background: #FFF3E0; }
.status-active .status-text { color: #FF9800; }
.status-completed { background: #E8F5E9; }
.status-completed .status-text { color: #4CAF50; }
.status-paused { background: #F5F5F5; }
.status-paused .status-text { color: #9E9E9E; }

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.plan-race {
  display: flex;
  flex-direction: row;
  margin-bottom: 20rpx;
}

.race-label {
  font-size: 24rpx;
  color: #999999;
}

.race-value {
  font-size: 24rpx;
  color: #2196F3;
  font-weight: 500;
}

.progress-section {
  padding-top: 16rpx;
  border-top: 1rpx solid #F0F0F0;
}

.progress-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 24rpx;
  color: #666666;
}

.progress-percent {
  font-size: 24rpx;
  color: #FF5722;
  font-weight: 600;
}

.progress-bar {
  height: 12rpx;
  background: #F0F0F0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF5722, #FF7043);
  border-radius: 6rpx;
}

/* 今日训练 */
.today-section {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  margin-bottom: 16rpx;
}

.today-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.today-top {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.type-tag {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
}
.tag-rest { background: #F5F5F5; }
.tag-rest .type-tag-text { color: #9E9E9E; }
.tag-easy { background: #E8F5E9; }
.tag-easy .type-tag-text { color: #4CAF50; }
.tag-tempo { background: #FFF3E0; }
.tag-tempo .type-tag-text { color: #FF9800; }
.tag-long { background: #FFEBEE; }
.tag-long .type-tag-text { color: #F44336; }
.tag-interval { background: #F3E5F5; }
.tag-interval .type-tag-text { color: #9C27B0; }
.tag-recovery { background: #E3F2FD; }
.tag-recovery .type-tag-text { color: #2196F3; }

.type-tag-text {
  font-size: 24rpx;
  font-weight: 500;
}

.today-distance {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF5722;
}

.today-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 20rpx;
}

.btn-checkin {
  height: 80rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-checkin-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.checked-badge {
  height: 80rpx;
  background: #E8F5E9;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checked-text {
  font-size: 28rpx;
  color: #4CAF50;
  font-weight: 600;
}

/* 当周训练表 */
.week-section {
  margin-bottom: 24rpx;
}

.week-table {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.week-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
  &.is-today {
    background: #FFF8E1;
  }
  &:last-child {
    border-bottom: none;
  }
}

.week-day-label {
  font-size: 24rpx;
  color: #999999;
  width: 100rpx;
}

.type-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
.dot-rest { background: #E0E0E0; }
.dot-easy { background: #4CAF50; }
.dot-tempo { background: #FF9800; }
.dot-long { background: #F44336; }
.dot-interval { background: #9C27B0; }
.dot-recovery { background: #2196F3; }

.week-type {
  font-size: 26rpx;
  color: #333333;
  flex: 1;
}

.week-distance {
  font-size: 26rpx;
  color: #666666;
  width: 100rpx;
  text-align: right;
}

.week-status {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-done {
  font-size: 28rpx;
  color: #4CAF50;
  font-weight: 700;
}

.status-rest {
  font-size: 22rpx;
  color: #BDBDBD;
}

.status-pending {
  font-size: 28rpx;
  color: #E0E0E0;
}

/* 底部操作 */
.plan-actions {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  margin-top: 16rpx;
}

.btn-action {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-pause {
  background: #F5F5F5;
}

.btn-action-text {
  font-size: 28rpx;
  color: #666666;
}

.btn-delete {
  background: #FFF5F5;
}

.btn-delete-text {
  font-size: 28rpx;
  color: #F44336;
}
</style>
