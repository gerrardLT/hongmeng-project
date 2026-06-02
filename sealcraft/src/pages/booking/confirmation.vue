<template>
  <view class="confirmation-page">
    <scroll-view scroll-y class="main-scroll">
      <!-- 成功提示 -->
      <view v-if="submitSuccess" class="success-banner">
        <text class="success-icon">✅</text>
        <text class="success-title">预约提交成功</text>
        <text class="success-desc">工作室将在24小时内确认您的预约</text>
      </view>

      <!-- 印章设计摘要 -->
      <view class="detail-section">
        <text class="section-title">印章设计方案</text>
        <view class="detail-card">
          <view class="detail-row">
            <text class="detail-label">刻字内容</text>
            <text class="detail-value content-val">{{ bookingData.content || '未填写' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">字体风格</text>
            <text class="detail-value">{{ getFontName(bookingData.fontId) }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">印章材质</text>
            <text class="detail-value">{{ getMaterialName(bookingData.materialId) }}</text>
          </view>
        </view>
      </view>

      <!-- 预约信息 -->
      <view class="detail-section">
        <text class="section-title">预约信息</text>
        <view class="detail-card">
          <view class="detail-row">
            <text class="detail-label">工作室</text>
            <text class="detail-value">{{ studioName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约日期</text>
            <text class="detail-value">{{ bookingData.date || '未选择' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约时段</text>
            <text class="detail-value">{{ bookingData.timeSlot || '未选择' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">配送方式</text>
            <text class="detail-value">{{ deliveryLabel }}</text>
          </view>
        </view>
      </view>

      <!-- 特殊要求 -->
      <view v-if="bookingData.specialRequests" class="detail-section">
        <text class="section-title">特殊要求</text>
        <view class="remark-card">
          <text class="remark-text">{{ bookingData.specialRequests }}</text>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="detail-section">
        <text class="section-title">费用明细</text>
        <view class="fee-card">
          <view class="fee-row">
            <text class="fee-label">定金（30%）</text>
            <text class="fee-value">¥{{ bookingData.depositAmount || 0 }}</text>
          </view>
          <view class="fee-divider" />
          <view class="fee-row total">
            <text class="fee-label">预估总价</text>
            <text class="fee-value total-amount">¥{{ bookingData.totalAmount || 0 }}</text>
          </view>
          <text class="fee-note">* 实际费用以工作室确认为准，多退少补</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <template v-if="!submitSuccess">
        <view class="btn submit-btn" :class="{ 'btn-disabled': submitting }" @click="onConfirmSubmit">
          <text class="btn-text submit-text">{{ submitting ? '提交中…' : '确认提交预约' }}</text>
        </view>
      </template>
      <template v-if="submitSuccess">
        <view class="btn view-list-btn" @click="onViewBookings">
          <text class="btn-text view-list-text">查看我的预约</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { createBooking } from '@/services/booking'
import { getStudioById } from '@/services/studio'
import type { DeliveryType } from '@/types/models'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const submitSuccess = ref(false)
const submitting = ref(false)

// 从 URL 参数或 store 草稿加载的预约数据
const bookingData = ref<{
  content: string
  fontId: string
  materialId: string
  sealTypeId: string
  studioId: string
  date: string
  timeSlot: string
  deliveryType: DeliveryType
  depositAmount: number
  totalAmount: number
  specialRequests: string
}>({
  content: '',
  fontId: '',
  materialId: '',
  sealTypeId: '',
  studioId: '',
  date: '',
  timeSlot: '',
  deliveryType: 'pickup',
  depositAmount: 0,
  totalAmount: 0,
  specialRequests: ''
})

// 字体映射
const FONT_NAMES: Record<string, string> = {
  font_zhuan: '篆书',
  font_li: '隶书',
  font_kai: '楷书',
  font_xing: '行书',
  font_cao: '草书'
}

// 材质映射
const MATERIAL_NAMES: Record<string, string> = {
  mat_qingtian: '青田石',
  mat_shoushan: '寿山石',
  mat_changhua: '昌化石',
  mat_wood: '木质',
  mat_copper: '铜质',
  mat_crystal: '水晶'
}

function getFontName(id: string) {
  return FONT_NAMES[id] || id || '未选择'
}

function getMaterialName(id: string) {
  return MATERIAL_NAMES[id] || id || '未选择'
}

const studioName = computed(() => {
  if (!bookingData.value.studioId) return '未选择'
  const studio = getStudioById(bookingData.value.studioId)
  return studio?.name || '工作室'
})

const deliveryLabel = computed(() => {
  return bookingData.value.deliveryType === 'shipping' ? '邮寄配送' : '到店自取'
})

onLoad((options) => {
  // 优先从 URL 参数读取 bookingData（JSON 编码）
  if (options?.bookingData) {
    try {
      const parsed = JSON.parse(decodeURIComponent(options.bookingData))
      bookingData.value = { ...bookingData.value, ...parsed }
    } catch (e) {
      console.error('解析 bookingData 参数失败:', e)
    }
  }

  // 如果 URL 参数为空，从 store 草稿恢复
  if (!bookingData.value.content) {
    bookingStore.loadDraft()
    const draft = bookingStore.draftBooking
    if (draft) {
      bookingData.value = {
        content: draft.content || '',
        fontId: draft.fontId || '',
        materialId: draft.materialId || '',
        sealTypeId: draft.sealTypeId || '',
        studioId: draft.studioId || '',
        date: draft.date || '',
        timeSlot: draft.timeSlot || '',
        deliveryType: (draft.deliveryType as DeliveryType) || 'pickup',
        depositAmount: draft.depositAmount || 0,
        totalAmount: draft.totalAmount || 0,
        specialRequests: draft.specialRequests || ''
      }
    }
  }
})

function onConfirmSubmit() {
  if (submitting.value || submitSuccess.value) return

  // 基本校验
  if (!bookingData.value.content) {
    uni.showToast({ title: '刻字内容不能为空', icon: 'none' })
    return
  }
  if (!bookingData.value.studioId) {
    uni.showToast({ title: '请选择工作室', icon: 'none' })
    return
  }
  if (!bookingData.value.date || !bookingData.value.timeSlot) {
    uni.showToast({ title: '请选择预约时间', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    const booking = createBooking({
      userId: userStore.userId,
      studioId: bookingData.value.studioId,
      content: bookingData.value.content,
      fontId: bookingData.value.fontId,
      materialId: bookingData.value.materialId,
      sealTypeId: bookingData.value.sealTypeId,
      date: bookingData.value.date,
      timeSlot: bookingData.value.timeSlot,
      deliveryType: bookingData.value.deliveryType,
      depositAmount: bookingData.value.depositAmount,
      totalAmount: bookingData.value.totalAmount,
      specialRequests: bookingData.value.specialRequests || ''
    })

    // 写入 store
    bookingStore.addBooking(booking)
    bookingStore.clearDraft()

    submitSuccess.value = true
    uni.showToast({ title: '预约提交成功', icon: 'success' })
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

function onViewBookings() {
  uni.switchTab({ url: '/pages/booking/index' })
}
</script>

<style scoped lang="scss">
.confirmation-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.main-scroll {
  flex: 1;
  overflow: hidden;
}

// 成功横幅
.success-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.success-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.success-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.success-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

// 详情区块
.detail-section {
  padding: 24rpx 32rpx 0;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.detail-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 8rpx 28rpx;
}

.detail-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $bg-page;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.detail-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.content-val {
  color: $primary;
  font-weight: 700;
  font-size: 30rpx;
}

// 特殊要求卡片
.remark-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx 28rpx;
}

.remark-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
}

// 费用卡片
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

.fee-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.fee-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 600;
}

.fee-divider {
  height: 1rpx;
  background-color: $border-color;
  margin: 12rpx 0;
}

.fee-row.total {
  padding-top: 16rpx;
}

.total-amount {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.fee-note {
  display: block;
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 8rpx;
  line-height: 1.5;
}

.bottom-spacer {
  height: 160rpx;
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

.btn {
  border-radius: $radius-xl;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  box-shadow: 0 4rpx 16rpx rgba(196, 26, 26, 0.3);
}

.btn-disabled {
  opacity: 0.6;
}

.submit-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.view-list-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  box-shadow: 0 4rpx 16rpx rgba(196, 26, 26, 0.3);
}

.view-list-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
