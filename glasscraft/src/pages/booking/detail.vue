<template>
  <view class="page">
    <scroll-view v-if="booking" scroll-y class="scroll-area">
      <!-- 状态展示区 -->
      <view class="status-wrap" :class="statusClass">
        <text class="status-icon">{{ statusIcon }}</text>
        <text class="status-text">{{ statusText }}</text>
        <text class="status-desc">{{ statusDesc }}</text>
      </view>

      <!-- 预约信息卡片 -->
      <view class="info-card">
        <view class="section-title">预约信息</view>
        <view class="info-row">
          <text class="info-label">工作室</text>
          <text class="info-value">{{ booking.studioName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">体验项目</text>
          <text class="info-value">{{ booking.projectName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">预约日期</text>
          <text class="info-value">{{ booking.date }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">时间段</text>
          <text class="info-value">{{ booking.timeSlot }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">体验人数</text>
          <text class="info-value">{{ booking.peopleCount }}人</text>
        </view>
        <view v-if="booking.note" class="info-row">
          <text class="info-label">备注</text>
          <text class="info-value">{{ booking.note }}</text>
        </view>
        <view class="info-row info-row-last">
          <text class="info-label">定金</text>
          <text class="info-value price">¥{{ booking.deposit }}</text>
        </view>
      </view>

      <!-- 预约码区域 -->
      <view class="qrcode-card">
        <text class="qrcode-title">预约码</text>
        <view class="qrcode-wrap">
          <image
            class="qrcode-img"
            src="/static/images/qrcode-placeholder.png"
            mode="aspectFit"
          />
          <text class="qrcode-id">{{ booking.bookingId }}</text>
        </view>
        <text class="qrcode-tip">到店出示预约码即可核销</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-wrap">
        <template v-if="booking.status === 'pending' || booking.status === 'confirmed'">
          <view class="action-btn action-btn-danger" @click="onCancel">
            <text class="action-btn-text">取消预约</text>
          </view>
        </template>
        <template v-if="booking.status === 'completed'">
          <view class="action-btn" @click="onRecordArtwork">
            <text class="action-btn-text">记录作品</text>
          </view>
        </template>
        <template v-if="booking.status === 'cancelled'">
          <view class="action-btn action-btn-outline" @click="onRebook">
            <text class="action-btn-text">重新预约</text>
          </view>
        </template>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 空状态 -->
    <view v-else class="empty-wrap">
      <text class="empty-text">预约不存在或已删除</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { getBookingDetail, cancelBooking } from '@/services/booking'
import type { Booking, BookingStatus } from '@/types/models'

const bookingStore = useBookingStore()
const booking = ref<Booking | null>(null)

const statusConfig: Record<BookingStatus, { icon: string; text: string; desc: string; className: string }> = {
  pending: { icon: '⏳', text: '待确认', desc: '预约提交成功，等待工作室确认', className: 'status-pending' },
  confirmed: { icon: '✅', text: '已确认', desc: '工作室已确认，请准时到店', className: 'status-confirmed' },
  completed: { icon: '✨', text: '已完成', desc: '体验已完成，记得记录作品', className: 'status-completed' },
  cancelled: { icon: '❌', text: '已取消', desc: '预约已取消，可重新预约', className: 'status-cancelled' }
}

const statusIcon = computed(() => booking.value ? statusConfig[booking.value.status].icon : '')
const statusText = computed(() => booking.value ? statusConfig[booking.value.status].text : '')
const statusDesc = computed(() => booking.value ? statusConfig[booking.value.status].desc : '')
const statusClass = computed(() => booking.value ? statusConfig[booking.value.status].className : '')

onLoad((query) => {
  const bookingId = query?.bookingId || ''
  if (bookingId) {
    loadBooking(bookingId)
  }
})

async function loadBooking(bookingId: string) {
  try {
    const detail = await getBookingDetail(bookingId)
    if (detail) {
      booking.value = detail
      bookingStore.setCurrentBooking(detail)
    } else {
      uni.showToast({ title: '预约不存在', icon: 'none' })
    }
  } catch (e) {
    console.error('loadBooking error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function onCancel() {
  if (!booking.value) return
  uni.showModal({
    title: '取消预约',
    content: '确定要取消该预约吗？取消后定金不退还。',
    confirmColor: '#FF6B6B',
    success: async (res) => {
      if (res.confirm) {
        try {
          const ok = await cancelBooking(booking.value!.bookingId)
          if (ok) {
            bookingStore.updateBooking(booking.value!.bookingId, { status: 'cancelled' })
            booking.value = { ...booking.value!, status: 'cancelled' }
            uni.showToast({ title: '已取消', icon: 'success' })
          }
        } catch (e: any) {
          uni.showToast({ title: e.message || '取消失败', icon: 'none' })
        }
      }
    }
  })
}

function onRecordArtwork() {
  if (!booking.value) return
  uni.navigateTo({
    url: `/pages/artwork/upload?bookingId=${booking.value.bookingId}`
  })
}

function onRebook() {
  if (!booking.value) return
  uni.navigateTo({
    url: `/pages/booking/create?studioId=${booking.value.studioId}&projectId=${booking.value.projectId}`
  })
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

/* 状态展示区 */
.status-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 32rpx 48rpx;
  background-color: $bg-card;
  margin-bottom: 24rpx;
}

.status-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.status-text {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
}

.status-desc {
  font-size: 26rpx;
  color: $text-secondary;
}

.status-pending .status-text {
  color: $warning;
}

.status-confirmed .status-text {
  color: $success;
}

.status-completed .status-text {
  color: $secondary;
}

.status-cancelled .status-text {
  color: $text-hint;
}

/* 信息卡片 */
.info-card {
  background-color: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.info-row-last {
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
  max-width: 400rpx;
  text-align: right;
}

.price {
  color: $primary;
  font-weight: 700;
}

/* 预约码 */
.qrcode-card {
  background-color: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 24rpx;
}

.qrcode-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-page;
  border-radius: $radius-lg;
  padding: 32rpx 48rpx;
}

.qrcode-img {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 16rpx;
}

.qrcode-id {
  font-size: 22rpx;
  color: $text-hint;
  font-family: monospace;
}

.qrcode-tip {
  font-size: 24rpx;
  color: $text-hint;
  margin-top: 20rpx;
}

/* 操作按钮 */
.action-wrap {
  padding: 0 24rpx 24rpx;
}

.action-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.action-btn-danger {
  background: linear-gradient(135deg, $error, #D32F2F);
}

.action-btn-outline {
  background: transparent;
  border: 2rpx solid $primary;
}

.action-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.action-btn-outline .action-btn-text {
  color: $primary;
}

/* 空状态 */
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.empty-text {
  font-size: 30rpx;
  color: $text-secondary;
}

.safe-bottom {
  height: 32rpx;
}
</style>
