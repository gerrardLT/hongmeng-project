<template>
  <view class="page">
    <!-- 顶部渐变统计区 -->
    <view class="stats-header">
      <view class="tab-row">
        <view
          v-for="tab in periodTabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: currentPeriod === tab.key }"
          @click="currentPeriod = tab.key"
        >
          <text class="tab-text" :class="{ active: currentPeriod === tab.key }">{{ tab.label }}</text>
        </view>
      </view>
      <view class="big-distance">
        <text class="big-value">{{ periodDistance }}</text>
        <text class="big-unit">km</text>
      </view>
      <text class="big-label">{{ periodLabel }}跑量</text>
    </view>

    <!-- 统计面板 -->
    <view class="section">
      <StatPanel :items="statItems" />
    </view>

    <!-- 个人最佳 PB -->
    <view class="section">
      <text class="section-title">个人最佳 PB</text>
      <view class="pb-grid">
        <view v-for="pb in pbList" :key="pb.label" class="pb-item">
          <text class="pb-value">{{ pb.value }}</text>
          <text class="pb-label">{{ pb.label }}</text>
        </view>
      </view>
    </view>

    <!-- 里程碑成就 -->
    <view class="section">
      <text class="section-title">里程碑成就</text>
      <view class="milestone-row">
        <view
          v-for="ms in milestoneList"
          :key="ms.label"
          class="milestone-item"
          :class="{ achieved: ms.achieved }"
        >
          <text class="milestone-icon">{{ ms.icon }}</text>
          <text class="milestone-label">{{ ms.label }}</text>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="section">
      <text class="section-title">跑步记录</text>
      <view v-if="recordStore.records.length === 0" class="empty-wrap">
        <Empty text="暂无跑步记录" />
      </view>
      <view v-else>
        <view
          v-for="record in recordStore.records"
          :key="record.recordId"
          @longpress="onDeleteRecord(record.recordId)"
        >
          <RecordItem :record="record" />
        </view>
      </view>
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="showAddModal = true">
      <text class="fab-icon">+</text>
    </view>

    <!-- 添加记录弹窗 -->
    <view v-if="showAddModal" class="modal-mask" @click.self="showAddModal = false">
      <view class="modal-body">
        <text class="modal-title">添加跑步记录</text>

        <view class="form-item">
          <text class="form-label">日期</text>
          <picker mode="date" :value="form.date" @change="onDateChange">
            <view class="picker-value">
              <text>{{ form.date || '请选择日期' }}</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">距离 (km)</text>
          <input
            class="form-input"
            type="digit"
            v-model="form.distance"
            placeholder="请输入距离"
          />
        </view>

        <view class="form-item">
          <text class="form-label">用时 (分钟)</text>
          <input
            class="form-input"
            type="digit"
            v-model="form.duration"
            placeholder="请输入用时"
          />
        </view>

        <view v-if="calculatedPace" class="form-item">
          <text class="form-label">配速</text>
          <text class="pace-display">{{ calculatedPace }} min/km</text>
        </view>

        <view class="modal-actions">
          <view class="btn-cancel" @click="showAddModal = false">
            <text class="btn-cancel-text">取消</text>
          </view>
          <view class="btn-confirm" @click="onSubmitRecord">
            <text class="btn-confirm-text">保存</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/store/record'
import { useUserStore } from '@/store/user'
import { formatDate } from '@/utils/format'
import StatPanel from '@/components/StatPanel.vue'
import RecordItem from '@/components/RecordItem.vue'
import Empty from '@/components/common/Empty.vue'

const recordStore = useRecordStore()
const userStore = useUserStore()

const currentPeriod = ref<'week' | 'month' | 'year'>('week')
const showAddModal = ref(false)

const form = ref({
  date: formatDate(Date.now()),
  distance: '',
  duration: ''
})

const periodTabs = [
  { key: 'week' as const, label: '本周' },
  { key: 'month' as const, label: '本月' },
  { key: 'year' as const, label: '本年' }
]

const periodDistance = computed(() => {
  const stats = recordStore.statistics
  const map = {
    week: stats.weeklyDistance,
    month: stats.monthlyDistance,
    year: stats.yearlyDistance
  }
  return (map[currentPeriod.value] || 0).toFixed(1)
})

const periodLabel = computed(() => {
  const map = { week: '本周', month: '本月', year: '本年' }
  return map[currentPeriod.value]
})

const statItems = computed(() => [
  { label: '总里程', value: recordStore.statistics.totalDistance.toFixed(1), unit: 'km' },
  { label: '总次数', value: recordStore.statistics.totalRuns, unit: '次' },
  { label: '连续天数', value: recordStore.streakDays, unit: '天' }
])

// PB 列表 - 按不同距离筛选最佳配速
const pbList = computed(() => {
  const records = recordStore.records
  const distances = [
    { label: '5km', min: 4.5, max: 5.5 },
    { label: '10km', min: 9.5, max: 10.5 },
    { label: '半马', min: 20.5, max: 22 },
    { label: '全马', min: 41, max: 43 }
  ]
  return distances.map((d) => {
    const matched = records.filter((r) => r.distance >= d.min && r.distance <= d.max)
    if (matched.length === 0) return { label: d.label, value: '--' }
    const best = matched.sort((a, b) => {
      const pa = a.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
      const pb2 = b.pace.split(':').reduce((acc, v, i) => acc + parseInt(v) * (i === 0 ? 60 : 1), 0)
      return pa - pb2
    })[0]
    return { label: d.label, value: best.pace }
  })
})

// 里程碑
const milestoneList = computed(() => {
  const achieved = recordStore.milestones
  return [
    { label: '100km', icon: '🥉', achieved: achieved.includes('百公里') },
    { label: '500km', icon: '🥈', achieved: achieved.includes('500公里') },
    { label: '1000km', icon: '🥇', achieved: achieved.includes('千里之行') }
  ]
})

// 计算配速
const calculatedPace = computed(() => {
  const dist = parseFloat(form.value.distance)
  const dur = parseFloat(form.value.duration)
  if (!dist || !dur || dist <= 0) return ''
  const paceTotal = dur / dist
  const paceMin = Math.floor(paceTotal)
  const paceSec = Math.round((paceTotal - paceMin) * 60)
  return `${paceMin}:${String(paceSec).padStart(2, '0')}`
})

function onDateChange(e: any) {
  form.value.date = e.detail.value
}

async function onSubmitRecord() {
  const dist = parseFloat(form.value.distance)
  const dur = parseFloat(form.value.duration)
  if (!form.value.date) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }
  if (!dist || dist <= 0) {
    uni.showToast({ title: '请输入有效距离', icon: 'none' })
    return
  }
  if (!dur || dur <= 0) {
    uni.showToast({ title: '请输入有效用时', icon: 'none' })
    return
  }

  try {
    await recordStore.addRecord({
      userId: userStore.userId,
      date: form.value.date,
      distance: dist,
      duration: Math.round(dur * 60),
      pace: calculatedPace.value,
      source: 'manual'
    })
    showAddModal.value = false
    form.value = { date: formatDate(Date.now()), distance: '', duration: '' }
    uni.showToast({ title: '记录已添加', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

function onDeleteRecord(recordId: string) {
  uni.showModal({
    title: '删除记录',
    content: '确定要删除这条跑步记录吗？',
    success: async (res) => {
      if (res.confirm) {
        await recordStore.deleteRecord(recordId)
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}

onShow(() => {
  recordStore.loadRecords()
  recordStore.loadStatistics()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.stats-header {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  padding: 32rpx 32rpx 48rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tab-row {
  display: flex;
  flex-direction: row;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  padding: 4rpx;
  margin-bottom: 32rpx;
}

.tab-item {
  padding: 12rpx 32rpx;
  border-radius: 28rpx;
  &.active {
    background: #FFFFFF;
  }
}

.tab-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  &.active {
    color: #FF5722;
    font-weight: 600;
  }
}

.big-distance {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.big-value {
  font-size: 80rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.big-unit {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 8rpx;
}

.big-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.7);
}

.section {
  padding: 24rpx 24rpx 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  margin-bottom: 20rpx;
}

.pb-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.pb-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.pb-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #FF5722;
}

.pb-label {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
}

.milestone-row {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.milestone-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  opacity: 0.4;
  &.achieved {
    opacity: 1;
    background: linear-gradient(135deg, #FFF3E0, #FFFFFF);
    border: 2rpx solid #FF5722;
  }
}

.milestone-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.milestone-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.empty-wrap {
  padding: 60rpx 0;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 34, 0.4);
}

.fab-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-body {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #212121;
  text-align: center;
  margin-bottom: 32rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
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
  align-items: center;
  font-size: 28rpx;
  color: #333333;
}

.pace-display {
  font-size: 32rpx;
  font-weight: 600;
  color: #FF5722;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn-cancel {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel-text {
  font-size: 28rpx;
  color: #999999;
}

.btn-confirm {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
