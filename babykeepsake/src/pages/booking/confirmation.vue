<template>
  <view class="confirmation-page">
    <scroll-view scroll-y class="main-scroll">
      <!-- 成功提示 -->
      <view v-if="paySuccess" class="success-banner">
        <text class="success-icon">✅</text>
        <text class="success-title">支付成功</text>
        <text class="success-desc">定金已支付，工作室将尽快确认您的预约</text>
      </view>

      <!-- 预约详情 -->
      <view class="detail-section">
        <text class="section-title">预约详情</text>

        <view class="detail-card">
          <view class="detail-row">
            <text class="detail-label">纪念品类型</text>
            <text class="detail-value">{{ keepsakeName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">设计风格</text>
            <text class="detail-value">{{ styleLabel }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">工作室</text>
            <text class="detail-value">{{ studioName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约日期</text>
            <text class="detail-value">{{ booking?.appointmentDate }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约时间</text>
            <text class="detail-value">{{ booking?.appointmentTime }}</text>
          </view>
        </view>
      </view>

      <!-- 宝宝信息 -->
      <view class="detail-section">
        <text class="section-title">宝宝信息</text>
        <view class="detail-card">
          <view class="detail-row">
            <text class="detail-label">宝宝姓名</text>
            <text class="detail-value">{{ booking?.babyName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">宝宝生日</text>
            <text class="detail-value">{{ booking?.babyBirthday }}</text>
          </view>
          <view v-if="booking?.specialRequests" class="detail-row">
            <text class="detail-label">特殊需求</text>
            <text class="detail-value">{{ booking.specialRequests }}</text>
          </view>
        </view>
      </view>

      <!-- 预约状态 -->
      <view class="detail-section">
        <text class="section-title">预约状态</text>
        <view class="status-card">
          <view class="status-row">
            <view class="status-dot" :class="'dot-' + (booking?.status || 'pending')" />
            <text class="status-label">{{ statusLabel }}</text>
          </view>
          <text class="status-hint">{{ statusHint }}</text>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="detail-section">
        <text class="section-title">费用明细</text>
        <view class="fee-card">
          <view class="fee-row">
            <text class="fee-label">定金金额</text>
            <text class="fee-value">¥{{ booking?.depositAmount || 0 }}</text>
          </view>
          <view v-if="paySuccess" class="fee-row">
            <text class="fee-label">定金状态</text>
            <text class="fee-value paid">已支付</text>
          </view>
          <view class="fee-divider" />
          <view class="fee-row total">
            <text class="fee-label">预估总额</text>
            <text class="fee-value total-amount">¥{{ booking?.totalAmount || 0 }}</text>
          </view>
          <text class="fee-note">尾款于制作完成后支付</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <template v-if="!paySuccess && booking?.status === 'pending'">
        <view class="btn pay-btn" @click="onPayDeposit">
          <text class="btn-text pay-text">支付定金 ¥{{ booking?.depositAmount || 0 }}</text>
        </view>
      </template>
      <template v-if="paySuccess">
        <view class="btn progress-btn" @click="onViewProgress">
          <text class="btn-text progress-text">查看制作进度</text>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { getBookingDetail } from '@/services/booking'
import { getKeepsakeDetail } from '@/services/keepsake'
import { getStudioDetail } from '@/services/studio'
import { createOrder, payDeposit } from '@/services/payment'
import type { Booking, BookingStatus, DesignStyle } from '@/types/models'

const bookingStore = useBookingStore()

const bookingId = ref('')
const booking = ref<Booking | null>(null)
const paySuccess = ref(false)
const paying = ref(false)
const orderId = ref('')

const keepsakeName = computed(() => {
  if (!booking.value) return ''
  const detail = getKeepsakeDetail(booking.value.typeId)
  return detail?.name || '纪念品'
})

const studioName = computed(() => {
  if (!booking.value) return ''
  const detail = getStudioDetail(booking.value.studioId)
  return detail?.name || '工作室'
})

const styleLabel = computed(() => {
  if (!booking.value) return ''
  const map: Record<DesignStyle, string> = {
    modern: '现代简约',
    vintage: '复古经典',
    cartoon: '可爱卡通',
    traditional: '国风传统',
    custom: '自由定制'
  }
  return map[booking.value.designStyle] || booking.value.designStyle
})

const statusLabel = computed(() => {
  const map: Record<BookingStatus, string> = {
    pending: '待确认',
    confirmed: '已确认',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[booking.value?.status || 'pending'] || ''
})

const statusHint = computed(() => {
  const map: Record<BookingStatus, string> = {
    pending: '工作室将在24小时内确认您的预约',
    confirmed: '工作室已确认，请按时到店',
    'in-progress': '您的纪念品正在制作中',
    completed: '您的纪念品已完成，欢迎到店取件',
    cancelled: '该预约已取消'
  }
  return map[booking.value?.status || 'pending'] || ''
})

onLoad((options) => {
  if (options?.bookingId) {
    bookingId.value = options.bookingId
  }
})

onMounted(() => {
  loadBooking()
})

function loadBooking() {
  if (!bookingId.value) return

  const detail = getBookingDetail(bookingId.value)
  if (!detail) {
    uni.showToast({ title: '预约不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }

  booking.value = detail
  bookingStore.setCurrentBooking(detail)
}

async function onPayDeposit() {
  if (paying.value) return
  paying.value = true

  try {
    // 创建订单
    if (!orderId.value) {
      const order = createOrder(bookingId.value, booking.value?.totalAmount || 0)
      orderId.value = order.orderId
    }

    // 支付定金
    const result = await payDeposit(orderId.value, booking.value?.depositAmount || 0)

    if (result.status === 'success') {
      paySuccess.value = true
      uni.showToast({ title: '支付成功', icon: 'success' })
    } else {
      uni.showToast({ title: '支付失败，请重试', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

function onViewProgress() {
  uni.switchTab({ url: '/pages/progress/index' })
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

// 状态卡片
.status-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
}

.status-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin-right: 12rpx;
}

.dot-pending {
  background-color: #FF9800;
}

.dot-confirmed {
  background-color: #1976D2;
}

.dot-in-progress {
  background-color: $primary;
}

.dot-completed {
  background-color: #4CAF50;
}

.dot-cancelled {
  background-color: $text-hint;
}

.status-label {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
}

.status-hint {
  font-size: 24rpx;
  color: $text-hint;
  padding-left: 28rpx;
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
}

.fee-value.paid {
  color: $success;
  font-weight: 500;
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
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 8rpx;
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

.pay-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.pay-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.progress-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.progress-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
