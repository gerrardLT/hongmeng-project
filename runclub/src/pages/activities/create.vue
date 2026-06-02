<template>
  <view class="page">
    <view class="form-container">
      <!-- 活动名称 -->
      <view class="form-group">
        <text class="form-label">活动名称</text>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="请输入活动名称"
          maxlength="30"
        />
      </view>

      <!-- 活动类型 -->
      <view class="form-group">
        <text class="form-label">活动类型</text>
        <picker :range="typeOptions" :range-key="'label'" :value="typeIndex" @change="onTypeChange">
          <view class="form-picker">
            <text class="picker-text" :class="{ placeholder: typeIndex < 0 }">
              {{ typeIndex >= 0 ? typeOptions[typeIndex].label : '请选择活动类型' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 活动日期 -->
      <view class="form-group">
        <text class="form-label">活动日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="form-picker">
            <text class="picker-text" :class="{ placeholder: !form.date }">
              {{ form.date || '请选择日期' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 活动时间 -->
      <view class="form-group">
        <text class="form-label">活动时间</text>
        <picker mode="time" :value="form.time" @change="onTimeChange">
          <view class="form-picker">
            <text class="picker-text" :class="{ placeholder: !form.time }">
              {{ form.time || '请选择时间' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 地点 -->
      <view class="form-group">
        <text class="form-label">活动地点</text>
        <input
          class="form-input"
          v-model="form.locationName"
          placeholder="请输入活动地点"
          maxlength="50"
        />
      </view>

      <!-- 距离 -->
      <view class="form-group">
        <text class="form-label">跑步距离</text>
        <picker :range="distanceOptions" :range-key="'label'" :value="distanceIndex" @change="onDistanceChange">
          <view class="form-picker">
            <text class="picker-text" :class="{ placeholder: distanceIndex < 0 }">
              {{ distanceIndex >= 0 ? distanceOptions[distanceIndex].label : '请选择距离' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 自定义距离 -->
      <view v-if="isCustomDistance" class="form-group">
        <text class="form-label">自定义距离 (km)</text>
        <input
          class="form-input"
          v-model="form.customDistance"
          type="digit"
          placeholder="请输入距离"
        />
      </view>

      <!-- 描述 -->
      <view class="form-group">
        <text class="form-label">活动描述</text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请输入活动描述"
          maxlength="500"
        />
      </view>

      <!-- 报名截止时间 -->
      <view class="form-group">
        <text class="form-label">报名截止日期</text>
        <picker mode="date" :value="form.registrationDeadline" @change="onDeadlineChange">
          <view class="form-picker">
            <text class="picker-text" :class="{ placeholder: !form.registrationDeadline }">
              {{ form.registrationDeadline || '请选择截止日期' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>

      <!-- 人数限制 -->
      <view class="form-group">
        <text class="form-label">人数限制（可选）</text>
        <input
          class="form-input"
          v-model="form.maxParticipants"
          type="number"
          placeholder="不填则不限人数"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="submit-btn" @click="handleSubmit">
        <text class="submit-btn-text">{{ isEdit ? '保存修改' : '发布活动' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useActivityStore } from '@/store/activity'
import { useUserStore } from '@/store/user'
import { useClubStore } from '@/store/club'
import type { ActivityType } from '@/types/models'

const activityStore = useActivityStore()
const userStore = useUserStore()
const clubStore = useClubStore()

const isEdit = ref(false)
const editActivityId = ref('')

const form = ref({
  name: '',
  date: '',
  time: '',
  locationName: '',
  description: '',
  registrationDeadline: '',
  maxParticipants: '',
  customDistance: ''
})

const typeOptions = [
  { label: '例跑', value: 'regular' as ActivityType },
  { label: '拉练', value: 'training' as ActivityType },
  { label: '比赛', value: 'race' as ActivityType },
  { label: '休闲', value: 'casual' as ActivityType }
]

const distanceOptions = [
  { label: '5km', value: 5 },
  { label: '10km', value: 10 },
  { label: '半马 21.1km', value: 21.1 },
  { label: '全马 42.2km', value: 42.2 },
  { label: '自定义', value: 0 }
]

const typeIndex = ref(-1)
const distanceIndex = ref(-1)
const isCustomDistance = computed(() => distanceIndex.value === distanceOptions.length - 1)

onLoad((options) => {
  if (options?.activityId) {
    isEdit.value = true
    editActivityId.value = options.activityId
    loadActivity(options.activityId)
  }
})

async function loadActivity(id: string) {
  await activityStore.loadActivityDetail(id)
  const activity = activityStore.currentActivity
  if (!activity) return

  form.value.name = activity.name
  form.value.date = activity.date
  form.value.time = activity.time
  form.value.locationName = activity.location.name
  form.value.description = activity.description
  form.value.registrationDeadline = activity.registrationDeadline
  form.value.maxParticipants = activity.maxParticipants ? String(activity.maxParticipants) : ''

  typeIndex.value = typeOptions.findIndex((t) => t.value === activity.type)
  const dIdx = distanceOptions.findIndex((d) => d.value === activity.distance)
  if (dIdx >= 0) {
    distanceIndex.value = dIdx
  } else {
    distanceIndex.value = distanceOptions.length - 1
    form.value.customDistance = String(activity.distance)
  }

  uni.setNavigationBarTitle({ title: '编辑活动' })
}

function onTypeChange(e: any) {
  typeIndex.value = Number(e.detail.value)
}

function onDateChange(e: any) {
  form.value.date = e.detail.value
}

function onTimeChange(e: any) {
  form.value.time = e.detail.value
}

function onDistanceChange(e: any) {
  distanceIndex.value = Number(e.detail.value)
}

function onDeadlineChange(e: any) {
  form.value.registrationDeadline = e.detail.value
}

function validate(): boolean {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入活动名称', icon: 'none' })
    return false
  }
  if (typeIndex.value < 0) {
    uni.showToast({ title: '请选择活动类型', icon: 'none' })
    return false
  }
  if (!form.value.date) {
    uni.showToast({ title: '请选择活动日期', icon: 'none' })
    return false
  }
  if (!form.value.time) {
    uni.showToast({ title: '请选择活动时间', icon: 'none' })
    return false
  }
  if (!form.value.locationName.trim()) {
    uni.showToast({ title: '请输入活动地点', icon: 'none' })
    return false
  }
  if (distanceIndex.value < 0) {
    uni.showToast({ title: '请选择跑步距离', icon: 'none' })
    return false
  }
  if (isCustomDistance.value && !form.value.customDistance) {
    uni.showToast({ title: '请输入自定义距离', icon: 'none' })
    return false
  }
  if (!form.value.registrationDeadline) {
    uni.showToast({ title: '请选择报名截止日期', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  const distance = isCustomDistance.value
    ? parseFloat(form.value.customDistance)
    : distanceOptions[distanceIndex.value].value

  const data = {
    clubId: clubStore.club?.clubId || '',
    name: form.value.name.trim(),
    type: typeOptions[typeIndex.value].value,
    date: form.value.date,
    time: form.value.time,
    location: {
      name: form.value.locationName.trim(),
      latitude: 0,
      longitude: 0
    },
    distance,
    description: form.value.description.trim(),
    registrationDeadline: form.value.registrationDeadline,
    maxParticipants: form.value.maxParticipants ? parseInt(form.value.maxParticipants) : undefined
  }

  try {
    if (isEdit.value) {
      await activityStore.updateActivity(editActivityId.value, data)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      await activityStore.createActivity(data)
      uni.showToast({ title: '创建成功', icon: 'success' })
    }
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (e) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 160rpx;
}

.form-container {
  padding: 24rpx;
}

.form-group {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
  display: block;
}

.form-input {
  font-size: 30rpx;
  color: #212121;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-textarea {
  font-size: 30rpx;
  color: #212121;
  width: 100%;
  min-height: 200rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.form-picker {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.picker-text {
  font-size: 30rpx;
  color: #212121;
}

.picker-text.placeholder {
  color: #CCCCCC;
}

.picker-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.submit-btn {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 48rpx;
  padding: 28rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
