<template>
  <view class="edit-page">
    <scroll-view scroll-y class="form-scroll">
      <!-- 纪念品类型（不可修改） -->
      <view class="form-section">
        <text class="section-title">纪念品类型</text>
        <view class="disabled-card">
          <text class="disabled-name">{{ keepsakeName }}</text>
          <text class="disabled-tag">不可修改</text>
        </view>
      </view>

      <!-- 可修改项 -->
      <view class="form-section">
        <text class="section-title">预约信息</text>

        <!-- 设计风格 -->
        <view class="form-group">
          <text class="form-label">设计风格</text>
          <view class="style-row">
            <view
              v-for="style in designStyles"
              :key="style.value"
              class="style-chip"
              :class="{ selected: formData.designStyle === style.value }"
              @click="onSelectStyle(style.value)"
            >
              <text class="style-emoji-sm">{{ style.emoji }}</text>
              <text class="style-chip-text" :class="{ 'style-chip-text-selected': formData.designStyle === style.value }">{{ style.label }}</text>
            </view>
          </view>
        </view>

        <!-- 预约日期 -->
        <view class="form-group">
          <text class="form-label">预约日期</text>
          <picker mode="date" :value="formData.appointmentDate" :start="minDate" @change="onDateChange">
            <view class="picker-row">
              <text class="picker-value" :class="{ placeholder: !formData.appointmentDate }">
                {{ formData.appointmentDate || '请选择日期' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 预约时间 -->
        <view class="form-group">
          <text class="form-label">预约时间</text>
          <view class="time-grid">
            <view
              v-for="time in timeSlots"
              :key="time"
              class="time-slot"
              :class="{ selected: formData.appointmentTime === time }"
              @click="onSelectTime(time)"
            >
              <text class="time-text" :class="{ 'time-text-selected': formData.appointmentTime === time }">{{ time }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 特殊需求 -->
      <view class="form-section">
        <text class="section-title">特殊需求</text>
        <textarea
          class="form-textarea"
          v-model="formData.specialRequests"
          placeholder="如有特殊需求请在此备注（选填）"
          placeholder-class="input-placeholder"
          :maxlength="200"
        />
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部保存按钮 -->
    <view class="bottom-bar">
      <view class="save-btn" @click="onSave">
        <text class="save-btn-text">保存修改</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { getBookingDetail, updateBooking } from '@/services/booking'
import { getKeepsakeDetail } from '@/services/keepsake'
import type { DesignStyle } from '@/types/models'

const bookingStore = useBookingStore()

const bookingId = ref('')
const keepsakeName = ref('')

const designStyles: { value: DesignStyle; label: string; emoji: string }[] = [
  { value: 'modern', label: '现代简约', emoji: '✨' },
  { value: 'vintage', label: '复古经典', emoji: '🏛️' },
  { value: 'cartoon', label: '可爱卡通', emoji: '🧸' },
  { value: 'traditional', label: '国风传统', emoji: '🏮' },
  { value: 'custom', label: '自由定制', emoji: '🎨' }
]

const timeSlots = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00',
  '17:00-18:00', '19:00-20:00'
]

const minDate = new Date().toISOString().split('T')[0]

const formData = ref({
  designStyle: '' as DesignStyle | '',
  appointmentDate: '',
  appointmentTime: '',
  specialRequests: ''
})

onLoad((options) => {
  if (options?.bookingId) {
    bookingId.value = options.bookingId
  }
})

onMounted(() => {
  if (!bookingId.value) return

  const booking = getBookingDetail(bookingId.value)
  if (!booking) {
    uni.showToast({ title: '预约不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  // 检查是否可编辑
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    uni.showToast({ title: '该预约不可编辑', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  // 填充表单
  formData.value.designStyle = booking.designStyle
  formData.value.appointmentDate = booking.appointmentDate
  formData.value.appointmentTime = booking.appointmentTime
  formData.value.specialRequests = booking.specialRequests || ''

  // 获取纪念品名称
  const keepsake = getKeepsakeDetail(booking.typeId)
  keepsakeName.value = keepsake?.name || '纪念品'

  bookingStore.setCurrentBooking(booking)
})

function onSelectStyle(style: DesignStyle) {
  formData.value.designStyle = style
}

function onDateChange(e: any) {
  formData.value.appointmentDate = e.detail.value
}

function onSelectTime(time: string) {
  formData.value.appointmentTime = time
}

function onSave() {
  if (!formData.value.designStyle) {
    uni.showToast({ title: '请选择设计风格', icon: 'none' })
    return
  }
  if (!formData.value.appointmentDate) {
    uni.showToast({ title: '请选择预约日期', icon: 'none' })
    return
  }
  if (!formData.value.appointmentTime) {
    uni.showToast({ title: '请选择预约时间', icon: 'none' })
    return
  }

  try {
    const updated = updateBooking(bookingId.value, {
      designStyle: formData.value.designStyle as DesignStyle,
      appointmentDate: formData.value.appointmentDate,
      appointmentTime: formData.value.appointmentTime,
      specialRequests: formData.value.specialRequests || undefined
    })

    if (updated) {
      bookingStore.updateBooking(bookingId.value, {
        designStyle: formData.value.designStyle as DesignStyle,
        appointmentDate: formData.value.appointmentDate,
        appointmentTime: formData.value.appointmentTime,
        specialRequests: formData.value.specialRequests || undefined
      })

      uni.showToast({ title: '修改成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: '修改失败', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '修改失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.edit-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.form-scroll {
  flex: 1;
  overflow: hidden;
}

.form-section {
  background-color: $bg-card;
  padding: 28rpx 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

// 不可修改卡片
.disabled-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
}

.disabled-name {
  font-size: 30rpx;
  color: $text-disabled;
  font-weight: 500;
}

.disabled-tag {
  font-size: 22rpx;
  color: $text-hint;
  background-color: #F5F5F5;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

// 表单
.form-group {
  margin-bottom: 28rpx;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 12rpx;
  display: block;
}

// 风格选择
.style-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.style-chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-page;
  border-radius: $radius-xl;
  padding: 14rpx 24rpx;
  border: 2rpx solid transparent;
}

.style-chip.selected {
  background-color: #FFF3ED;
  border-color: $primary;
}

.style-emoji-sm {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.style-chip-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.style-chip-text-selected {
  color: $primary;
  font-weight: 600;
}

// 日期选择
.picker-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.picker-value.placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 32rpx;
  color: $text-hint;
  margin-left: 12rpx;
}

// 时间选择
.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-slot {
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 18rpx 0;
  width: calc(25% - 12rpx);
  text-align: center;
  border: 2rpx solid transparent;
}

.time-slot.selected {
  background-color: #FFF3ED;
  border-color: $primary;
}

.time-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.time-text-selected {
  color: $primary;
  font-weight: 600;
}

// 文本域
.form-textarea {
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: $text-primary;
  width: 100%;
  height: 200rpx;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-hint;
}

.bottom-spacer {
  height: 140rpx;
}

// 底部按钮
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.save-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-xl;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
