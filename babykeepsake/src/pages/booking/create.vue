<template>
  <view class="create-page">
    <!-- 步骤条 -->
    <BookingStep :current-step="currentStep" />

    <scroll-view scroll-y class="form-scroll">
      <!-- 步骤1：选择纪念品类型 -->
      <view v-if="currentStep === 0" class="step-content">
        <text class="step-title">选择纪念品类型</text>
        <view class="keepsake-grid">
          <view
            v-for="item in keepsakeList"
            :key="item.typeId"
            class="keepsake-card"
            :class="{ selected: formData.typeId === item.typeId }"
            @click="onSelectKeepsake(item)"
          >
            <image
              class="keepsake-photo"
              :src="item.photos && item.photos.length > 0 ? item.photos[0] : '/static/images/default-keepsake.png'"
              mode="aspectFill"
            />
            <text class="keepsake-name">{{ item.name }}</text>
            <text class="keepsake-price">{{ item.priceRange }}</text>
          </view>
        </view>
      </view>

      <!-- 步骤2：选择设计风格 -->
      <view v-if="currentStep === 1" class="step-content">
        <text class="step-title">选择设计风格</text>
        <view class="style-grid">
          <view
            v-for="style in designStyles"
            :key="style.value"
            class="style-card"
            :class="{ selected: formData.designStyle === style.value }"
            @click="onSelectStyle(style.value)"
          >
            <text class="style-emoji">{{ style.emoji }}</text>
            <text class="style-name">{{ style.label }}</text>
            <text class="style-desc">{{ style.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 步骤3：选择日期时间 -->
      <view v-if="currentStep === 2" class="step-content">
        <text class="step-title">选择预约日期</text>
        <picker
          mode="date"
          :value="formData.appointmentDate"
          :start="minDate"
          @change="onDateChange"
        >
          <view class="picker-row">
            <text class="picker-label">预约日期</text>
            <text class="picker-value" :class="{ placeholder: !formData.appointmentDate }">
              {{ formData.appointmentDate || '请选择日期' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>

        <text class="step-subtitle">选择时间段</text>
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

      <!-- 步骤4：填写宝宝信息 -->
      <view v-if="currentStep === 3" class="step-content">
        <text class="step-title">填写宝宝信息</text>

        <view class="form-group">
          <text class="form-label">宝宝姓名 <text class="required">*</text></text>
          <input
            class="form-input"
            v-model="formData.babyName"
            placeholder="请输入宝宝姓名"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="form-group">
          <text class="form-label">宝宝生日 <text class="required">*</text></text>
          <picker mode="date" :value="formData.babyBirthday" @change="onBirthdayChange">
            <view class="picker-row">
              <text class="picker-value" :class="{ placeholder: !formData.babyBirthday }">
                {{ formData.babyBirthday || '请选择宝宝生日' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-group">
          <text class="form-label">宝宝性别</text>
          <view class="gender-row">
            <view
              class="gender-option"
              :class="{ selected: formData.babyGender === 'male' }"
              @click="formData.babyGender = 'male'"
            >
              <text class="gender-emoji">👦</text>
              <text class="gender-label">男孩</text>
            </view>
            <view
              class="gender-option"
              :class="{ selected: formData.babyGender === 'female' }"
              @click="formData.babyGender = 'female'"
            >
              <text class="gender-emoji">👧</text>
              <text class="gender-label">女孩</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">特殊需求备注</text>
          <textarea
            class="form-textarea"
            v-model="formData.specialRequests"
            placeholder="如有特殊需求请在此备注（选填）"
            placeholder-class="input-placeholder"
            :maxlength="200"
          />
        </view>
      </view>

      <!-- 步骤5：确认信息总览 -->
      <view v-if="currentStep === 4" class="step-content">
        <text class="step-title">确认预约信息</text>

        <view class="confirm-card">
          <view class="confirm-row">
            <text class="confirm-label">纪念品类型</text>
            <text class="confirm-value">{{ getKeepsakeName() }}</text>
          </view>
          <view class="confirm-row">
            <text class="confirm-label">设计风格</text>
            <text class="confirm-value">{{ getStyleLabel() }}</text>
          </view>
          <view class="confirm-row">
            <text class="confirm-label">预约日期</text>
            <text class="confirm-value">{{ formData.appointmentDate }}</text>
          </view>
          <view class="confirm-row">
            <text class="confirm-label">预约时间</text>
            <text class="confirm-value">{{ formData.appointmentTime }}</text>
          </view>
          <view class="confirm-row">
            <text class="confirm-label">宝宝姓名</text>
            <text class="confirm-value">{{ formData.babyName }}</text>
          </view>
          <view class="confirm-row">
            <text class="confirm-label">宝宝生日</text>
            <text class="confirm-value">{{ formData.babyBirthday }}</text>
          </view>
          <view v-if="formData.specialRequests" class="confirm-row">
            <text class="confirm-label">特殊需求</text>
            <text class="confirm-value">{{ formData.specialRequests }}</text>
          </view>
        </view>

        <!-- 选择工作室 -->
        <text class="step-subtitle">选择工作室</text>
        <view v-if="selectedStudio" class="selected-studio" @click="goSelectStudio">
          <view class="studio-info">
            <text class="studio-name">{{ selectedStudio.name }}</text>
            <text class="studio-addr">{{ selectedStudio.address }}</text>
          </view>
          <text class="change-text">更换</text>
        </view>
        <view v-else class="select-studio-btn" @click="goSelectStudio">
          <text class="select-studio-text">选择工作室</text>
        </view>

        <!-- 费用 -->
        <view class="fee-card">
          <view class="fee-row">
            <text class="fee-label">定金金额</text>
            <text class="fee-value">¥{{ depositAmount }}</text>
          </view>
          <view class="fee-row total">
            <text class="fee-label">预估总额</text>
            <text class="fee-value total-amount">¥{{ totalAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view v-if="currentStep > 0" class="btn prev-btn" @click="onPrev">
        <text class="btn-text prev-text">上一步</text>
      </view>
      <view v-if="currentStep < 4" class="btn next-btn" @click="onNext">
        <text class="btn-text next-text">下一步</text>
      </view>
      <view v-if="currentStep === 4" class="btn submit-btn" @click="onSubmit">
        <text class="btn-text submit-text">提交预约</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getKeepsakeList, getKeepsakeDetail } from '@/services/keepsake'
import { getStudioDetail } from '@/services/studio'
import { createBooking } from '@/services/booking'
import BookingStep from '@/components/BookingStep.vue'
import type { KeepsakeType, DesignStyle, Studio } from '@/types/models'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const currentStep = ref(0)

const keepsakeList = ref<KeepsakeType[]>([])

const designStyles: { value: DesignStyle; label: string; emoji: string; desc: string }[] = [
  { value: 'modern', label: '现代简约', emoji: '✨', desc: '简洁线条，清新配色' },
  { value: 'vintage', label: '复古经典', emoji: '🏛️', desc: '传统韵味，精致雕琢' },
  { value: 'cartoon', label: '可爱卡通', emoji: '🧸', desc: '童趣满满，活泼甜美' },
  { value: 'traditional', label: '国风传统', emoji: '🏮', desc: '水墨意境，东方韵味' },
  { value: 'custom', label: '自由定制', emoji: '🎨', desc: '随心设计，独一无二' }
]

const timeSlots = [
  '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '14:00-15:00', '15:00-16:00', '16:00-17:00',
  '17:00-18:00', '19:00-20:00'
]

const minDate = new Date().toISOString().split('T')[0]

const formData = ref({
  typeId: '',
  designStyle: '' as DesignStyle | '',
  appointmentDate: '',
  appointmentTime: '',
  babyName: '',
  babyBirthday: '',
  babyGender: '' as 'male' | 'female' | '',
  specialRequests: '',
  studioId: ''
})

const selectedStudio = ref<Studio | null>(null)

const depositAmount = computed(() => {
  return Math.round(totalAmount.value * 0.3)
})

const totalAmount = computed(() => {
  if (!formData.value.typeId) return 0
  const detail = getKeepsakeDetail(formData.value.typeId)
  if (!detail) return 0
  // 从 priceRange 中取中间值作为估算
  const match = detail.priceRange.match(/(\d+)-(\d+)/)
  if (match) {
    return Math.round((parseInt(match[1]) + parseInt(match[2])) / 2)
  }
  return 298
})

function getKeepsakeName(): string {
  if (!formData.value.typeId) return ''
  const detail = getKeepsakeDetail(formData.value.typeId)
  return detail?.name || ''
}

function getStyleLabel(): string {
  const style = designStyles.find((s) => s.value === formData.value.designStyle)
  return style?.label || ''
}

function onSelectKeepsake(item: KeepsakeType) {
  formData.value.typeId = item.typeId
  bookingStore.saveDraft({ typeId: item.typeId })
}

function onSelectStyle(style: DesignStyle) {
  formData.value.designStyle = style
  bookingStore.saveDraft({ designStyle: style })
}

function onDateChange(e: any) {
  formData.value.appointmentDate = e.detail.value
  bookingStore.saveDraft({ appointmentDate: e.detail.value })
}

function onSelectTime(time: string) {
  formData.value.appointmentTime = time
  bookingStore.saveDraft({ appointmentTime: time })
}

function onBirthdayChange(e: any) {
  formData.value.babyBirthday = e.detail.value
}

function goSelectStudio() {
  uni.navigateTo({ url: '/pages/booking/studio-list?mode=select' })
}

function validateStep(step: number): boolean {
  if (step === 0) {
    if (!formData.value.typeId) {
      uni.showToast({ title: '请选择纪念品类型', icon: 'none' })
      return false
    }
  }
  if (step === 1) {
    if (!formData.value.designStyle) {
      uni.showToast({ title: '请选择设计风格', icon: 'none' })
      return false
    }
  }
  if (step === 2) {
    if (!formData.value.appointmentDate) {
      uni.showToast({ title: '请选择预约日期', icon: 'none' })
      return false
    }
    if (!formData.value.appointmentTime) {
      uni.showToast({ title: '请选择预约时间', icon: 'none' })
      return false
    }
  }
  if (step === 3) {
    if (!formData.value.babyName.trim()) {
      uni.showToast({ title: '请输入宝宝姓名', icon: 'none' })
      return false
    }
    if (!formData.value.babyBirthday) {
      uni.showToast({ title: '请选择宝宝生日', icon: 'none' })
      return false
    }
  }
  if (step === 4) {
    if (!formData.value.studioId) {
      uni.showToast({ title: '请选择工作室', icon: 'none' })
      return false
    }
  }
  return true
}

function onPrev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function onNext() {
  if (!validateStep(currentStep.value)) return
  currentStep.value++
  // 每步自动保存草稿
  bookingStore.saveDraft(formData.value as any)
}

function onSubmit() {
  if (!validateStep(4)) return

  const userId = userStore.userId
  if (!userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  try {
    const booking = createBooking({
      userId,
      studioId: formData.value.studioId,
      typeId: formData.value.typeId,
      babyName: formData.value.babyName,
      babyBirthday: formData.value.babyBirthday,
      appointmentDate: formData.value.appointmentDate,
      appointmentTime: formData.value.appointmentTime,
      designStyle: formData.value.designStyle as DesignStyle,
      specialRequests: formData.value.specialRequests || undefined,
      depositAmount: depositAmount.value,
      totalAmount: totalAmount.value
    })

    bookingStore.addBooking(booking)
    bookingStore.clearDraft()

    uni.redirectTo({
      url: `/pages/booking/confirmation?bookingId=${booking.bookingId}`
    })
  } catch (e: any) {
    uni.showToast({ title: e.message || '创建预约失败', icon: 'none' })
  }
}

onLoad((options) => {
  // 如果从工作室详情页进入，预选工作室
  if (options?.studioId) {
    formData.value.studioId = options.studioId
    const studio = getStudioDetail(options.studioId)
    if (studio) {
      selectedStudio.value = studio
    }
  }

  // 加载纪念品列表
  keepsakeList.value = getKeepsakeList()

  // 恢复草稿
  bookingStore.loadDraft()
  const draft = bookingStore.bookingDraft
  if (draft) {
    if (draft.typeId) formData.value.typeId = draft.typeId
    if (draft.designStyle) formData.value.designStyle = draft.designStyle
    if (draft.appointmentDate) formData.value.appointmentDate = draft.appointmentDate
    if (draft.appointmentTime) formData.value.appointmentTime = draft.appointmentTime
    if (draft.studioId) {
      formData.value.studioId = draft.studioId
      const studio = getStudioDetail(draft.studioId)
      if (studio) selectedStudio.value = studio
    }
  }
})

onShow(() => {
  // 从工作室列表页返回后，获取选中的工作室
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  // 如果有选中工作室ID，刷新
  if (formData.value.studioId && !selectedStudio.value) {
    selectedStudio.value = getStudioDetail(formData.value.studioId)
  }
})
</script>

<style scoped lang="scss">
.create-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.form-scroll {
  flex: 1;
  overflow: hidden;
}

.step-content {
  padding: 24rpx 32rpx;
}

.step-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 24rpx;
}

.step-subtitle {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  margin-top: 32rpx;
}

// ===== 步骤1: 纪念品选择 =====
.keepsake-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.keepsake-card {
  width: calc(50% - 10rpx);
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  border: 4rpx solid transparent;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.keepsake-card.selected {
  border-color: $primary;
  box-shadow: 0 2rpx 16rpx rgba(255, 107, 53, 0.15);
}

.keepsake-photo {
  width: 100%;
  height: 200rpx;
  background-color: #F5F5F5;
}

.keepsake-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  padding: 12rpx 20rpx 4rpx;
}

.keepsake-price {
  font-size: 24rpx;
  color: $primary;
  padding: 0 20rpx 16rpx;
}

// ===== 步骤2: 风格选择 =====
.style-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.style-card {
  width: calc(50% - 10rpx);
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  border: 4rpx solid transparent;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.style-card.selected {
  border-color: $primary;
  background-color: #FFF8F5;
}

.style-emoji {
  font-size: 56rpx;
  margin-bottom: 12rpx;
}

.style-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.style-desc {
  font-size: 22rpx;
  color: $text-hint;
  text-align: center;
}

// ===== 步骤3: 日期时间 =====
.picker-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
  margin-bottom: 12rpx;
}

.picker-label {
  font-size: 28rpx;
  color: $text-primary;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.picker-value {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  text-align: right;
}

.picker-value.placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 32rpx;
  color: $text-hint;
  margin-left: 12rpx;
}

.time-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-slot {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 20rpx 0;
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

// ===== 步骤4: 宝宝信息 =====
.form-group {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 12rpx;
  display: block;
}

.required {
  color: $error;
}

.form-input {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: $text-primary;
}

.input-placeholder {
  color: $text-hint;
}

.gender-row {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.gender-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx 0;
  border: 2rpx solid transparent;
}

.gender-option.selected {
  border-color: $primary;
  background-color: #FFF8F5;
}

.gender-emoji {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.gender-label {
  font-size: 26rpx;
  color: $text-secondary;
}

.form-textarea {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx 28rpx;
  font-size: 28rpx;
  color: $text-primary;
  width: 100%;
  height: 200rpx;
  box-sizing: border-box;
}

// ===== 步骤5: 确认 =====
.confirm-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  margin-bottom: 24rpx;
}

.confirm-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $bg-page;
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.confirm-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.selected-studio {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx 28rpx;
  margin-bottom: 24rpx;
}

.studio-info {
  flex: 1;
}

.studio-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 6rpx;
}

.studio-addr {
  font-size: 24rpx;
  color: $text-hint;
}

.change-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.select-studio-btn {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $border-color;
  margin-bottom: 24rpx;
}

.select-studio-text {
  font-size: 28rpx;
  color: $primary;
  font-weight: 500;
}

.fee-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
}

.fee-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.fee-row.total {
  border-top: 1rpx solid $border-color;
  padding-top: 20rpx;
  margin-top: 8rpx;
}

.fee-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.fee-value {
  font-size: 28rpx;
  color: $text-primary;
}

.total-amount {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.bottom-spacer {
  height: 160rpx;
}

// ===== 底部按钮 =====
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  gap: 20rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prev-btn {
  background-color: $bg-page;
  border: 2rpx solid $border-color;
}

.prev-text {
  font-size: 30rpx;
  color: $text-secondary;
  font-weight: 500;
}

.next-btn,
.submit-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.next-text,
.submit-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
