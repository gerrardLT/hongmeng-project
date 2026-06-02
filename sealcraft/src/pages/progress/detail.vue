<template>
  <view class="progress-detail-page">
    <!-- 返回按钮区 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">制作进度</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 预约摘要信息 -->
      <view class="info-card">
        <view class="info-card-header">
          <view class="info-icon-wrap">
            <text class="info-icon">{{ categoryIcon }}</text>
          </view>
          <view class="info-content">
            <text class="info-content-text">{{ bookingContent }}</text>
            <text class="info-meta">{{ sealTypeName }} · {{ materialName }} · {{ fontName }}</text>
          </view>
          <view class="info-status-badge" :class="'status-' + bookingStatus">
            <text class="info-status-text">{{ statusLabel }}</text>
          </view>
        </view>
      </view>

      <!-- 当前阶段高亮 -->
      <view v-if="currentStageName" class="current-stage-card">
        <view class="current-stage-left">
          <view class="pulse-dot" />
          <view class="pulse-ring" />
        </view>
        <view class="current-stage-right">
          <text class="current-stage-label">当前阶段</text>
          <text class="current-stage-name">{{ currentStageName }}</text>
        </view>
        <view v-if="estimatedTime" class="current-stage-eta">
          <text class="eta-label">预计完成</text>
          <text class="eta-time">{{ estimatedTime }}</text>
        </view>
      </view>

      <!-- 进度时间线 -->
      <view class="timeline-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">制作流程</text>
        </view>
        <ProgressTimeline :stages="progressList" />
      </view>

      <!-- 工作室信息卡片 -->
      <view v-if="studio" class="studio-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">制作工作室</text>
        </view>
        <view class="studio-info">
          <view class="studio-name-row">
            <text class="studio-icon">🏠</text>
            <text class="studio-name">{{ studio.name }}</text>
            <view class="studio-rating">
              <text class="rating-star">★</text>
              <text class="rating-num">{{ studio.rating }}</text>
            </view>
          </view>
          <view class="studio-meta-row">
            <text class="studio-meta-icon">📍</text>
            <text class="studio-meta-text">{{ studio.address }}</text>
          </view>
          <view class="studio-meta-row">
            <text class="studio-meta-icon">📞</text>
            <text class="studio-meta-text">{{ studio.phone }}</text>
          </view>
          <view class="studio-meta-row">
            <text class="studio-meta-icon">🕐</text>
            <text class="studio-meta-text">{{ studio.businessHours }}</text>
          </view>
        </view>
      </view>

      <!-- 底部联系 -->
      <view class="contact-card">
        <view class="contact-desc">
          <text class="contact-icon">💬</text>
          <text class="contact-text">制作过程如有疑问，请随时联系工作室</text>
        </view>
        <view class="contact-btn" @click="contactStudio">
          <text class="contact-btn-text">联系工作室</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ProgressTimeline from '@/components/ProgressTimeline.vue'
import { getProgressByBooking, getStageLabel } from '@/services/progress'
import { getBookingById } from '@/services/booking'
import { getSealTypeById, getMaterialById, getFontStyleById } from '@/services/seal'
import { getStudioById } from '@/services/studio'
import type { Progress, Studio, BookingStatus } from '@/types/models'

const progressList = ref<Progress[]>([])
const bookingContent = ref('')
const sealTypeName = ref('')
const materialName = ref('')
const fontName = ref('')
const bookingStatus = ref<BookingStatus>('pending')
const studio = ref<Studio | null>(null)

const CATEGORY_ICONS: Record<string, string> = {
  name: '📛',
  leisure: '🎐',
  bookplate: '📖',
  signature: '✍️',
  collection: '🏺'
}

const categoryIcon = ref('🎋')

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待确认',
  confirmed: '已确认',
  'in-progress': '制作中',
  completed: '已完成',
  cancelled: '已取消'
}

const statusLabel = computed(() => STATUS_LABELS[bookingStatus.value] || '未知')

const currentStageName = computed(() => {
  const current = progressList.value.find((p) => p.status === 'active')
  return current ? getStageLabel(current.stage) : null
})

const estimatedTime = computed(() => {
  const current = progressList.value.find((p) => p.status === 'active')
  if (current?.estimatedCompletionTime) {
    const d = new Date(current.estimatedCompletionTime)
    if (isNaN(d.getTime())) return null
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return null
})

onLoad((options) => {
  const bookingId = options?.bookingId as string
  if (bookingId) {
    loadData(bookingId)
  }
})

function formatDate(ts: number | string): string {
  if (!ts) return ''
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function loadData(bookingId: string) {
  // 加载进度
  const progresses = getProgressByBooking(bookingId)
  progressList.value = progresses

  // 加载预约信息
  const booking = getBookingById(bookingId)
  if (booking) {
    bookingStatus.value = booking.status
    bookingContent.value = booking.content || '印章定制'

    // 加载印章类型信息
    const sealType = getSealTypeById(booking.sealTypeId)
    if (sealType) {
      sealTypeName.value = sealType.name
      categoryIcon.value = CATEGORY_ICONS[sealType.category] || '🎋'
    }

    // 加载材质信息
    const material = getMaterialById(booking.materialId)
    if (material) {
      materialName.value = material.name
    }

    // 加载字体信息
    const font = getFontStyleById(booking.fontId)
    if (font) {
      fontName.value = font.name
    }

    // 加载工作室信息
    try {
      const studioData = getStudioById(booking.studioId)
      studio.value = studioData
    } catch (e) {
      studio.value = null
    }
  }
}

function goBack() {
  uni.navigateBack()
}

function contactStudio() {
  if (studio.value?.phone) {
    uni.makePhoneCall({ phoneNumber: studio.value.phone })
  } else {
    uni.showToast({ title: '暂无联系方式', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.progress-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 80rpx 24rpx 20rpx;
  background-color: $bg-card;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-icon {
  font-size: 44rpx;
  color: $text-primary;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.nav-placeholder {
  width: 64rpx;
  flex-shrink: 0;
}

/* 内容滚动区 */
.content-scroll {
  flex: 1;
}

/* 预约摘要信息卡片 */
.info-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  background: linear-gradient(135deg, #FDE8E8, #F5C2C2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-icon {
  font-size: 40rpx;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.info-content-text {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.info-meta {
  font-size: 24rpx;
  color: $text-hint;
}

.info-status-badge {
  border-radius: $radius-sm;
  padding: 8rpx 18rpx;
  flex-shrink: 0;
}

.info-status-text {
  font-size: 22rpx;
  font-weight: 600;
}

.status-pending {
  background-color: #FFF3E0;
}
.status-pending .info-status-text { color: #F57C00; }

.status-confirmed {
  background-color: #E8F5E9;
}
.status-confirmed .info-status-text { color: $success; }

.status-in-progress {
  background-color: #FDE8E8;
}
.status-in-progress .info-status-text { color: $primary; }

.status-completed {
  background-color: #E8F5E9;
}
.status-completed .info-status-text { color: $success; }

.status-cancelled {
  background-color: #F5F5F5;
}
.status-cancelled .info-status-text { color: $text-hint; }

/* 当前阶段高亮卡片 */
.current-stage-card {
  background: linear-gradient(135deg, $primary, $primary-light);
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 28rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 8rpx 28rpx rgba(196, 26, 26, 0.35);
}

.current-stage-left {
  position: relative;
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.pulse-dot {
  width: 20rpx;
  height: 20rpx;
  background-color: #FFFFFF;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.pulse-ring {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  border: 3rpx solid rgba(255, 255, 255, 0.5);
  position: absolute;
  top: 0;
  left: 0;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.current-stage-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.current-stage-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.current-stage-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.current-stage-eta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.eta-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.eta-time {
  font-size: 26rpx;
  font-weight: 600;
  color: #FFFFFF;
}

/* 时间线卡片 */
.timeline-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 28rpx 4rpx 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 通用 Section 标题 */
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 24rpx;
  margin-bottom: 8rpx;
}

.section-accent {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, $primary, $primary-light);
  border-radius: 3rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

/* 工作室信息卡片 */
.studio-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.studio-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 8rpx;
}

.studio-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.studio-icon {
  font-size: 30rpx;
}

.studio-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  flex: 1;
}

.studio-rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background-color: #FFFBEB;
  border-radius: $radius-sm;
  padding: 4rpx 12rpx;
}

.rating-star {
  font-size: 22rpx;
  color: #F59E0B;
}

.rating-num {
  font-size: 22rpx;
  color: #92400E;
  font-weight: 600;
}

.studio-meta-row {
  display: flex;
  align-items: flex-start;
  gap: 10rpx;
}

.studio-meta-icon {
  font-size: 24rpx;
  margin-top: 2rpx;
}

.studio-meta-text {
  font-size: 26rpx;
  color: $text-secondary;
  flex: 1;
  line-height: 1.5;
}

/* 联系卡片 */
.contact-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 24rpx 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.contact-desc {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.contact-icon {
  font-size: 28rpx;
}

.contact-text {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  flex: 1;
}

.contact-btn {
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 32rpx;
  border: 2rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-btn-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 600;
}

/* 底部占位 */
.bottom-placeholder {
  height: calc(60rpx + env(safe-area-inset-bottom));
}
</style>
