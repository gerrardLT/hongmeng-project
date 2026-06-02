<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-area">
      <!-- 工作室与项目信息 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">工作室</text>
          <text class="info-value">{{ studioName || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">体验项目</text>
          <text class="info-value">{{ projectName || '-' }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">项目价格</text>
          <text class="info-value price">¥{{ projectPrice }}</text>
        </view>
      </view>

      <!-- 日期选择 -->
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">预约日期</text>
          <picker mode="date" :value="form.date" :start="today" @change="onDateChange">
            <view class="picker-wrap">
              <text class="picker-text" :class="{ placeholder: !form.date }">
                {{ form.date || '请选择日期' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 时间段选择 -->
        <view class="form-item">
          <text class="form-label">时间段</text>
          <view v-if="timeSlots.length > 0" class="slot-list">
            <view
              v-for="slot in timeSlots"
              :key="slot"
              class="slot-item"
              :class="{ active: form.timeSlot === slot }"
              @click="form.timeSlot = slot"
            >
              <text class="slot-text">{{ slot }}</text>
            </view>
          </view>
          <view v-else-if="form.date" class="slot-empty">
            <text class="slot-empty-text">该日期暂无可用时段</text>
          </view>
          <view v-else class="slot-hint">
            <text class="slot-hint-text">请先选择日期</text>
          </view>
        </view>

        <!-- 人数选择 -->
        <view class="form-item">
          <text class="form-label">体验人数</text>
          <view class="stepper-wrap">
            <view class="stepper-btn" :class="{ disabled: form.peopleCount <= 1 }" @click="decreasePeople">
              <text class="stepper-icon">−</text>
            </view>
            <text class="stepper-value">{{ form.peopleCount }}</text>
            <view class="stepper-btn" :class="{ disabled: form.peopleCount >= 6 }" @click="increasePeople">
              <text class="stepper-icon">+</text>
            </view>
          </view>
        </view>

        <!-- 备注 -->
        <view class="form-item form-item-last">
          <text class="form-label">备注</text>
          <textarea
            v-model="form.note"
            class="note-input"
            placeholder="请输入特殊需求或备注信息..."
            maxlength="200"
          />
          <text class="note-count">{{ form.note.length }}/200</text>
        </view>
      </view>

      <!-- 定金信息 -->
      <view class="deposit-card">
        <view class="deposit-row">
          <text class="deposit-label">定金（项目价格30%）</text>
          <text class="deposit-value">¥{{ deposit }}</text>
        </view>
        <text class="deposit-tip">到店体验后支付尾款，取消预约定金不退还</text>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 底部确认按钮 -->
    <view class="footer">
      <view class="footer-btn" @click="onSubmit">
        <text class="footer-btn-text">确认预约</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useBookingStore } from '@/store/booking'
import { createBooking, getAvailableTimeSlots } from '@/services/booking'
import { getStudioDetail } from '@/services/studio'
import { getProjectDetail } from '@/services/project'
import type { Studio, Project } from '@/types/models'

const userStore = useUserStore()
const bookingStore = useBookingStore()

const studioId = ref('')
const projectId = ref('')
const studioName = ref('')
const projectName = ref('')
const projectPrice = ref(0)
const timeSlots = ref<string[]>([])

const today = new Date().toISOString().split('T')[0]

const form = ref({
  date: '',
  timeSlot: '',
  peopleCount: 1,
  note: ''
})

const deposit = computed(() => {
  return Math.round(projectPrice.value * 0.3)
})

onLoad((query) => {
  studioId.value = query?.studioId || ''
  projectId.value = query?.projectId || ''
  loadStudioAndProject()
})

async function loadStudioAndProject() {
  if (studioId.value) {
    const studio = await getStudioDetail(studioId.value)
    if (studio) {
      studioName.value = studio.name
    }
  }
  if (projectId.value) {
    const project = await getProjectDetail(projectId.value)
    if (project) {
      projectName.value = project.name
      projectPrice.value = project.price
    }
  }
}

watch(() => form.value.date, async (date) => {
  if (date && studioId.value) {
    try {
      const slots = await getAvailableTimeSlots(studioId.value, date)
      timeSlots.value = slots
      form.value.timeSlot = ''
    } catch (e) {
      console.error('获取时间段失败:', e)
      timeSlots.value = []
    }
  } else {
    timeSlots.value = []
    form.value.timeSlot = ''
  }
})

function onDateChange(e: any) {
  form.value.date = e.detail.value
}

function decreasePeople() {
  if (form.value.peopleCount > 1) {
    form.value.peopleCount--
  }
}

function increasePeople() {
  if (form.value.peopleCount < 6) {
    form.value.peopleCount++
  }
}

function validateForm(): boolean {
  if (!form.value.date) {
    uni.showToast({ title: '请选择预约日期', icon: 'none' })
    return false
  }
  if (!form.value.timeSlot) {
    uni.showToast({ title: '请选择时间段', icon: 'none' })
    return false
  }
  if (!userStore.userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

async function onSubmit() {
  if (!validateForm()) return

  uni.showLoading({ title: '提交中...' })
  try {
    const booking = await createBooking({
      userId: userStore.userId,
      studioId: studioId.value,
      projectId: projectId.value,
      studioName: studioName.value,
      projectName: projectName.value,
      date: form.value.date,
      timeSlot: form.value.timeSlot,
      peopleCount: form.value.peopleCount,
      deposit: deposit.value,
      note: form.value.note
    })
    bookingStore.addBooking(booking)
    uni.hideLoading()
    uni.showToast({ title: '预约成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/booking/detail?bookingId=${booking.bookingId}` })
    }, 1200)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '预约失败', icon: 'none' })
    console.error('createBooking error:', e)
  }
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.scroll-area {
  flex: 1;
  overflow: hidden;
}

/* 信息卡片 */
.info-card {
  background-color: $bg-card;
  margin: 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.info-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.price {
  color: $primary;
  font-weight: 700;
}

/* 表单卡片 */
.form-card {
  background-color: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  padding: 8rpx 32rpx;
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.form-item-last {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 600;
  margin-bottom: 16rpx;
  display: block;
}

/* 日期选择器 */
.picker-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 72rpx;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 0 24rpx;
}

.picker-text {
  font-size: 28rpx;
  color: $text-primary;
}

.placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 32rpx;
  color: $text-hint;
}

/* 时间段 */
.slot-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.slot-item {
  padding: 16rpx 32rpx;
  border-radius: $radius-md;
  background-color: $bg-page;
  border: 2rpx solid transparent;
}

.slot-item.active {
  background-color: rgba(255, 107, 107, 0.1);
  border-color: $primary;
}

.slot-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.slot-item.active .slot-text {
  color: $primary;
  font-weight: 600;
}

.slot-empty,
.slot-hint {
  padding: 16rpx 0;
}

.slot-empty-text,
.slot-hint-text {
  font-size: 26rpx;
  color: $text-hint;
}

/* 步进器 */
.stepper-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24rpx;
}

.stepper-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn.disabled {
  opacity: 0.4;
}

.stepper-icon {
  font-size: 32rpx;
  color: $text-primary;
  font-weight: 600;
  line-height: 1;
}

.stepper-value {
  font-size: 32rpx;
  color: $text-primary;
  font-weight: 700;
  min-width: 48rpx;
  text-align: center;
}

/* 备注 */
.note-input {
  width: 100%;
  height: 160rpx;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.note-count {
  font-size: 22rpx;
  color: $text-hint;
  text-align: right;
  margin-top: 8rpx;
  display: block;
}

/* 定金卡片 */
.deposit-card {
  background-color: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.deposit-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.deposit-label {
  font-size: 28rpx;
  color: $text-primary;
}

.deposit-value {
  font-size: 36rpx;
  color: $primary;
  font-weight: 700;
}

.deposit-tip {
  font-size: 24rpx;
  color: $text-hint;
  margin-top: 12rpx;
  display: block;
}

/* 底部按钮 */
.footer {
  background-color: $bg-card;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.footer-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.safe-bottom {
  height: 32rpx;
}
</style>
