<template>
  <view class="create-booking-page">
    <!-- 步骤条 -->
    <view class="step-bar">
      <BookingStep :current-step="currentStep" :steps="STEPS" />
    </view>

    <!-- 步骤内容 -->
    <scroll-view scroll-y class="step-content">

      <!-- 步骤 0：确认设计方案 -->
      <view v-if="currentStep === 0" class="step-panel">
        <view class="panel-title-wrap">
          <text class="step-icon">🖋️</text>
          <text class="panel-title">确认设计方案</text>
        </view>
        <text class="panel-desc">请确认以下印章设计信息无误后继续</text>

        <view class="design-summary">
          <view class="summary-row">
            <text class="summary-label">刻字内容</text>
            <text class="summary-val content-val">{{ form.content || '未填写' }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">印章类型</text>
            <text class="summary-val">{{ getSealTypeName(form.sealTypeId) }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">字体风格</text>
            <text class="summary-val">{{ getFontName(form.fontId) }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">印章材质</text>
            <text class="summary-val">{{ getMaterialName(form.materialId) }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">排布方式</text>
            <text class="summary-val">{{ getLayoutName(form.layout) }}</text>
          </view>
          <view class="summary-row">
            <text class="summary-label">印泥颜色</text>
            <text class="summary-val">{{ getInkName(form.inkColor) }}</text>
          </view>
        </view>

        <view class="tip-box">
          <text class="tip-icon">💡</text>
          <text class="tip-text">如需修改设计，请返回设计工作台重新编辑</text>
        </view>
      </view>

      <!-- 步骤 1：选择工作室 -->
      <view v-if="currentStep === 1" class="step-panel">
        <view class="panel-title-wrap">
          <text class="step-icon">🏛️</text>
          <text class="panel-title">选择工作室</text>
        </view>
        <text class="panel-desc">请选择您希望前往的篆刻工作室</text>

        <view class="studio-list">
          <view
            v-for="studio in studioList"
            :key="studio.studioId"
            class="studio-option"
            :class="{ 'studio-selected': form.studioId === studio.studioId }"
            @click="onSelectStudio(studio)"
          >
            <view class="studio-option-main">
              <text class="studio-option-name">{{ studio.name }}</text>
              <view class="studio-option-meta">
                <view class="studio-stars">
                  <text
                    v-for="star in 5"
                    :key="star"
                    class="mini-star"
                    :class="{ 'mini-star-filled': star <= Math.round(studio.rating) }"
                  >★</text>
                </view>
                <text class="studio-rating">{{ studio.rating.toFixed(1) }}</text>
              </view>
              <text class="studio-option-addr">{{ studio.address }}</text>
            </view>
            <view v-if="form.studioId === studio.studioId" class="check-badge">
              <text class="check-text">✓</text>
            </view>
          </view>
        </view>

        <view class="studio-list-link" @click="onViewStudioList">
          <text class="link-text">🗺️ 查看更多工作室详情</text>
        </view>
      </view>

      <!-- 步骤 2：选择日期时间 -->
      <view v-if="currentStep === 2" class="step-panel">
        <view class="panel-title-wrap">
          <text class="step-icon">📅</text>
          <text class="panel-title">选择预约日期</text>
        </view>
        <text class="panel-desc">请选择您方便到店的日期和时间段</text>

        <!-- 日期选择 -->
        <view class="form-field">
          <text class="field-label">预约日期</text>
          <picker
            class="date-picker"
            mode="date"
            :value="form.date"
            :start="minDate"
            @change="onDateChange"
          >
            <view class="picker-wrap">
              <text class="picker-val" :class="{ 'picker-placeholder': !form.date }">
                {{ form.date || '请选择日期' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 时间段选择 -->
        <view class="form-field">
          <text class="field-label">预约时段</text>
          <view class="time-slots">
            <view
              v-for="slot in TIME_SLOTS"
              :key="slot"
              class="time-slot"
              :class="{ 'time-slot-active': form.timeSlot === slot }"
              @click="onSelectTimeSlot(slot)"
            >
              <text class="time-slot-text">{{ slot }}</text>
            </view>
          </view>
        </view>

        <view v-if="selectedStudio" class="studio-hours-tip">
          <text class="studio-hours-icon">🕐</text>
          <text class="studio-hours-text">{{ selectedStudio.name }} 营业时间：{{ selectedStudio.businessHours }}</text>
        </view>
      </view>

      <!-- 步骤 3：配送方式 -->
      <view v-if="currentStep === 3" class="step-panel">
        <view class="panel-title-wrap">
          <text class="step-icon">🚚</text>
          <text class="panel-title">选择配送方式</text>
        </view>
        <text class="panel-desc">印章完成后，请选择您偏好的取件方式</text>

        <view class="delivery-options">
          <!-- 到店自取 -->
          <view
            class="delivery-option"
            :class="{ 'delivery-selected': form.deliveryType === 'pickup' }"
            @click="onDeliveryChange('pickup')"
          >
            <view class="delivery-icon-wrap">
              <text class="delivery-icon">🏛️</text>
            </view>
            <view class="delivery-info">
              <text class="delivery-name">到店自取</text>
              <text class="delivery-desc">完成后前往工作室取件，无额外费用</text>
            </view>
            <view v-if="form.deliveryType === 'pickup'" class="delivery-check">
              <text class="check-mark">✓</text>
            </view>
          </view>

          <!-- 邮寄配送 -->
          <view
            class="delivery-option"
            :class="{ 'delivery-selected': form.deliveryType === 'shipping' }"
            @click="onDeliveryChange('shipping')"
          >
            <view class="delivery-icon-wrap">
              <text class="delivery-icon">📦</text>
            </view>
            <view class="delivery-info">
              <text class="delivery-name">邮寄配送</text>
              <text class="delivery-desc">印章完成后由工作室邮寄到您指定地址</text>
            </view>
            <view v-if="form.deliveryType === 'shipping'" class="delivery-check">
              <text class="check-mark">✓</text>
            </view>
          </view>
        </view>

        <!-- 收货地址（邮寄时显示） -->
        <view v-if="form.deliveryType === 'shipping'" class="address-field">
          <text class="field-label">收货地址</text>
          <textarea
            class="address-textarea"
            v-model="shippingAddress"
            placeholder="请填写详细收货地址（省市区街道门牌号）"
            placeholder-class="textarea-placeholder"
            :maxlength="200"
            auto-height
          />
        </view>
      </view>

      <!-- 步骤 4：填写备注 -->
      <view v-if="currentStep === 4" class="step-panel">
        <view class="panel-title-wrap">
          <text class="step-icon">📝</text>
          <text class="panel-title">特殊要求与备注</text>
        </view>
        <text class="panel-desc">有任何特殊要求可在此说明，师傅会优先参考您的备注</text>

        <view class="form-field">
          <text class="field-label">特殊要求（选填）</text>
          <textarea
            class="remark-textarea"
            v-model="form.specialRequests"
            placeholder="例如：印面尺寸偏大些、边框略粗、字体更古朴……"
            placeholder-class="textarea-placeholder"
            :maxlength="300"
            auto-height
          />
          <text class="char-count">{{ (form.specialRequests || '').length }}/300</text>
        </view>

        <!-- 费用预估 -->
        <view class="fee-estimate">
          <text class="fee-title">费用预估</text>
          <view class="fee-row">
            <text class="fee-label">定金（30%）</text>
            <text class="fee-val">¥{{ depositAmount }}</text>
          </view>
          <view class="fee-row">
            <text class="fee-label">预估总价</text>
            <text class="fee-val fee-total">¥{{ totalAmount }}</text>
          </view>
          <text class="fee-note">* 实际费用以工作室确认为准，多退少补</text>
        </view>
      </view>

      <view class="content-bottom" />
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view v-if="currentStep > 0" class="prev-btn" @click="onPrevStep">
        <text class="prev-btn-text">上一步</text>
      </view>
      <view class="next-btn" :class="{ 'btn-full': currentStep === 0 }" @click="onNextStep">
        <text class="next-btn-text">{{ currentStep === STEPS.length - 1 ? '下一步：确认预约' : '下一步' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getStudios } from '@/services/studio'
import BookingStep from '@/components/BookingStep.vue'
import type { Studio, DeliveryType } from '@/types/models'

const STEPS = ['确认方案', '选工作室', '选日期', '配送方式', '填写备注']

const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
]

const bookingStore = useBookingStore()
const userStore = useUserStore()

const currentStep = ref(0)
const studioList = ref<Studio[]>([])
const shippingAddress = ref('')

// 预约表单
const form = ref({
  content: '',
  sealTypeId: '',
  fontId: '',
  materialId: '',
  layout: 'auto' as 'auto' | 'horizontal' | 'vertical' | 'circular',
  inkColor: 'red' as 'red' | 'vermilion' | 'blue',
  studioId: '',
  date: '',
  timeSlot: '',
  deliveryType: 'pickup' as DeliveryType,
  specialRequests: ''
})

const selectedStudio = computed(() => {
  if (!form.value.studioId) return null
  return studioList.value.find((s) => s.studioId === form.value.studioId) || null
})

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})

// 费用计算（简单估算）
const totalAmount = computed(() => {
  const basePrice: Record<string, number> = {
    mat_qingtian: 280,
    mat_shoushan: 480,
    mat_changhua: 680,
    mat_wood: 120,
    mat_copper: 360,
    mat_crystal: 320
  }
  return basePrice[form.value.materialId] || 200
})

const depositAmount = computed(() => Math.round(totalAmount.value * 0.3))

const SEAL_TYPE_NAMES: Record<string, string> = {
  name: '姓名章',
  leisure: '闲章',
  bookplate: '藏书章',
  signature: '签名章',
  collection: '收藏章'
}

const FONT_NAMES: Record<string, string> = {
  font_zhuan: '篆书',
  font_li: '隶书',
  font_kai: '楷书',
  font_xing: '行书',
  font_cao: '草书'
}

const MATERIAL_NAMES: Record<string, string> = {
  mat_qingtian: '青田石',
  mat_shoushan: '寿山石',
  mat_changhua: '昌化石',
  mat_wood: '木质',
  mat_copper: '铜质',
  mat_crystal: '水晶'
}

const LAYOUT_NAMES: Record<string, string> = {
  auto: '自动排布',
  horizontal: '横向排列',
  vertical: '纵向排列',
  circular: '圆形排列'
}

const INK_NAMES: Record<string, string> = {
  red: '朱红色',
  vermilion: '朱砂色',
  blue: '蓝色'
}

function getSealTypeName(id: string) { return SEAL_TYPE_NAMES[id] || id || '未选择' }
function getFontName(id: string) { return FONT_NAMES[id] || id || '未选择' }
function getMaterialName(id: string) { return MATERIAL_NAMES[id] || id || '未选择' }
function getLayoutName(layout: string) { return LAYOUT_NAMES[layout] || layout }
function getInkName(ink: string) { return INK_NAMES[ink] || ink }

function onSelectStudio(studio: Studio) {
  form.value.studioId = studio.studioId
}

function onViewStudioList() {
  uni.navigateTo({ url: '/pages/booking/studio-list?mode=select' })
  uni.$on('studioSelected', (studio: Studio) => {
    form.value.studioId = studio.studioId
    uni.$off('studioSelected')
  })
}

function onDateChange(e: any) {
  form.value.date = e.detail.value
}

function onSelectTimeSlot(slot: string) {
  form.value.timeSlot = slot
}

function onDeliveryChange(type: DeliveryType) {
  form.value.deliveryType = type
}

function validateStep(): boolean {
  if (currentStep.value === 0) {
    if (!form.value.content) {
      uni.showToast({ title: '请先前往设计工作台完成设计', icon: 'none' })
      return false
    }
    return true
  }
  if (currentStep.value === 1) {
    if (!form.value.studioId) {
      uni.showToast({ title: '请选择一家工作室', icon: 'none' })
      return false
    }
    return true
  }
  if (currentStep.value === 2) {
    if (!form.value.date) {
      uni.showToast({ title: '请选择预约日期', icon: 'none' })
      return false
    }
    if (!form.value.timeSlot) {
      uni.showToast({ title: '请选择预约时段', icon: 'none' })
      return false
    }
    return true
  }
  if (currentStep.value === 3) {
    if (form.value.deliveryType === 'shipping' && !shippingAddress.value.trim()) {
      uni.showToast({ title: '请填写收货地址', icon: 'none' })
      return false
    }
    return true
  }
  return true
}

function onNextStep() {
  if (!validateStep()) return

  if (currentStep.value < STEPS.length - 1) {
    currentStep.value++
  } else {
    // 最后一步，跳转确认页
    bookingStore.saveDraft({
      userId: userStore.userId,
      studioId: form.value.studioId,
      content: form.value.content,
      fontId: form.value.fontId,
      materialId: form.value.materialId,
      sealTypeId: form.value.sealTypeId,
      date: form.value.date,
      timeSlot: form.value.timeSlot,
      deliveryType: form.value.deliveryType,
      specialRequests: form.value.specialRequests || '',
      depositAmount: depositAmount.value,
      totalAmount: totalAmount.value
    })

    uni.navigateTo({ url: '/pages/booking/confirmation' })
  }
}

function onPrevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

onLoad((options) => {
  // 从草稿或设计工作台参数恢复
  bookingStore.loadDraft()
  const draft = bookingStore.draftBooking
  if (draft.content) form.value.content = draft.content
  if (draft.fontId) form.value.fontId = draft.fontId
  if (draft.materialId) form.value.materialId = draft.materialId
  if (draft.sealTypeId) form.value.sealTypeId = draft.sealTypeId

  // URL 参数
  if (options?.studioId) {
    form.value.studioId = options.studioId
  }

  // 加载工作室列表
  studioList.value = getStudios()
})
</script>

<style scoped lang="scss">
.create-booking-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.step-bar {
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
  overflow: hidden;
}

.step-panel {
  padding: 32rpx 24rpx;
}

.panel-title-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.step-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.panel-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.panel-desc {
  font-size: 26rpx;
  color: $text-hint;
  margin-bottom: 32rpx;
  display: block;
}

.design-summary {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 8rpx 0;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.summary-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 28rpx;
  border-bottom: 1rpx solid $bg-page;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 26rpx;
  color: $text-hint;
  width: 120rpx;
  flex-shrink: 0;
}

.summary-val {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.content-val {
  color: $primary;
  font-weight: 700;
  font-size: 30rpx;
}

.tip-box {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #FFFBF0;
  border-radius: $radius-md;
  padding: 16rpx 20rpx;
  border: 1rpx solid #FFE0A0;
}

.tip-icon {
  font-size: 26rpx;
  margin-right: 10rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #996600;
  flex: 1;
  line-height: 1.5;
}

.studio-list {
  margin-bottom: 20rpx;
}

.studio-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 2rpx solid transparent;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.studio-selected {
  border-color: $primary;
  background-color: #FDF0F0;
}

.studio-option-main {
  flex: 1;
}

.studio-option-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  display: block;
}

.studio-option-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 6rpx;
}

.studio-stars {
  display: flex;
  margin-right: 6rpx;
}

.mini-star {
  font-size: 22rpx;
  color: $border-color;
}

.mini-star-filled {
  color: #FFB800;
}

.studio-rating {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 600;
}

.studio-option-addr {
  font-size: 24rpx;
  color: $text-hint;
}

.check-badge {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background-color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.check-text {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.studio-list-link {
  text-align: center;
  padding: 16rpx;
}

.link-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.form-field {
  margin-bottom: 32rpx;
}

.field-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.date-picker {
  width: 100%;
}

.picker-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 0 24rpx;
  height: 88rpx;
  border: 2rpx solid $border-color;
}

.picker-val {
  flex: 1;
  font-size: 30rpx;
  color: $text-primary;
}

.picker-placeholder {
  color: $text-hint;
}

.picker-arrow {
  font-size: 36rpx;
  color: $text-hint;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-slot {
  padding: 14rpx 24rpx;
  border-radius: $radius-lg;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
}

.time-slot-active {
  background-color: #FDF0F0;
  border-color: $primary;
}

.time-slot-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.time-slot-active .time-slot-text {
  color: $primary;
  font-weight: 600;
}

.studio-hours-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 16rpx 20rpx;
  margin-top: 8rpx;
}

.studio-hours-icon {
  font-size: 24rpx;
  margin-right: 10rpx;
}

.studio-hours-text {
  font-size: 24rpx;
  color: $text-hint;
  flex: 1;
}

.delivery-options {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.delivery-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  border: 2rpx solid $border-color;
}

.delivery-selected {
  border-color: $primary;
  background-color: #FDF0F0;
}

.delivery-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-lg;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.delivery-icon {
  font-size: 40rpx;
}

.delivery-info {
  flex: 1;
}

.delivery-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 6rpx;
  display: block;
}

.delivery-desc {
  font-size: 24rpx;
  color: $text-hint;
  line-height: 1.5;
}

.delivery-check {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  background-color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.check-mark {
  font-size: 26rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.address-field {
  margin-top: 8rpx;
}

.address-textarea {
  width: 100%;
  min-height: 160rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $text-primary;
  border: 2rpx solid $border-color;
  box-sizing: border-box;
  line-height: 1.6;
}

.remark-textarea {
  width: 100%;
  min-height: 200rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $text-primary;
  border: 2rpx solid $border-color;
  box-sizing: border-box;
  line-height: 1.6;
}

.textarea-placeholder {
  color: $text-hint;
  font-size: 28rpx;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 8rpx;
}

.fee-estimate {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  margin-top: 32rpx;
  border: 2rpx solid $border-color;
}

.fee-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

.fee-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.fee-label {
  font-size: 26rpx;
  color: $text-secondary;
}

.fee-val {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 600;
}

.fee-total {
  font-size: 34rpx;
  color: $primary;
  font-weight: 700;
}

.fee-note {
  display: block;
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 16rpx;
  line-height: 1.5;
}

.content-bottom {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.prev-btn {
  flex: 1;
  height: 88rpx;
  border-radius: $radius-xl;
  border: 2rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.prev-btn-text {
  font-size: 30rpx;
  color: $primary;
  font-weight: 600;
}

.next-btn {
  flex: 2;
  height: 88rpx;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(196, 26, 26, 0.3);
}

.btn-full {
  flex: 1;
}

.next-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
