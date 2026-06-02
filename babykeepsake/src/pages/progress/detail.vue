<template>
  <view class="detail-page">
    <scroll-view class="detail-scroll" scroll-y>
      <!-- 顶部纪念品信息 -->
      <view class="keepsake-header">
        <view class="header-badge">
          <text class="badge-icon">{{ categoryIcon }}</text>
        </view>
        <view class="header-info">
          <text class="keepsake-name">{{ keepsakeName }}</text>
          <text class="keepsake-type">{{ categoryLabel }}</text>
        </view>
        <view class="status-badge" :class="statusClass">
          <text class="status-text">{{ statusLabel }}</text>
        </view>
      </view>

      <!-- 进度时间轴 -->
      <view class="section-card">
        <view class="section-title">
          <text class="section-icon">📍</text>
          <text class="section-text">制作进度</text>
        </view>
        <ProgressTimeline :stages="timelineStages" />
      </view>

      <!-- 预计完成时间 -->
      <view v-if="!isCompleted && latestProgress?.estimatedCompletionTime" class="section-card">
        <view class="estimate-row">
          <text class="estimate-label">预计完成时间</text>
          <text class="estimate-value">{{ formatTime(latestProgress.estimatedCompletionTime) }}</text>
        </view>
      </view>

      <!-- 关联预约信息 -->
      <view v-if="booking" class="section-card">
        <view class="section-title">
          <text class="section-icon">📅</text>
          <text class="section-text">预约信息</text>
        </view>
        <view class="info-row">
          <text class="info-label">工作室</text>
          <text class="info-value">{{ studioName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">预约时间</text>
          <text class="info-value">{{ booking.appointmentDate }} {{ booking.appointmentTime }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">设计风格</text>
          <text class="info-value">{{ styleLabel }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">宝宝姓名</text>
          <text class="info-value">{{ booking.babyName }}</text>
        </view>
        <view v-if="booking.specialRequests" class="info-row">
          <text class="info-label">特殊要求</text>
          <text class="info-value">{{ booking.specialRequests }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <view class="contact-btn" @click="contactStudio">
        <text class="contact-icon">📞</text>
        <text class="contact-text">联系工作室</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProgressByBooking } from '@/services/progress'
import { getBookingDetail } from '@/services/booking'
import { getKeepsakeDetail } from '@/services/keepsake'
import { getStudioDetail } from '@/services/studio'
import type { Progress, ProgressStage, Booking, KeepsakeCategory, DesignStyle } from '@/types/models'
import ProgressTimeline from '@/components/ProgressTimeline.vue'

const CATEGORY_ICONS: Record<string, string> = {
  handprint: '🖐',
  hair: '✂️',
  tooth: '🦷',
  birth: '👶',
  growth: '🌱'
}

const CATEGORY_LABELS: Record<string, string> = {
  handprint: '手印纪念',
  hair: '胎毛纪念',
  tooth: '乳牙纪念',
  birth: '出生纪念',
  growth: '成长纪念'
}

const STYLE_LABELS: Record<DesignStyle, string> = {
  modern: '现代简约',
  vintage: '复古怀旧',
  cartoon: '卡通可爱',
  traditional: '传统经典',
  custom: '自定义'
}

const STAGE_LABEL_MAP: Record<ProgressStage, string> = {
  collected: '采集完成',
  'design-confirmed': '设计确认',
  manufacturing: '制作中',
  'quality-check': '质检完成',
  'ready-pickup': '待取货/已发货',
  shipped: '已发货'
}

const bookingId = ref('')
const progresses = ref<Progress[]>([])
const booking = ref<Booking | null>(null)
const keepsakeName = ref('宝宝纪念品')
const categoryIcon = ref('🎁')
const categoryLabel = ref('纪念品')
const studioName = ref('')
const studioPhone = ref('')

const latestProgress = computed(() => {
  if (progresses.value.length === 0) return null
  return progresses.value[progresses.value.length - 1]
})

const isCompleted = computed(() => {
  return latestProgress.value?.stage === 'shipped' || latestProgress.value?.stage === 'ready-pickup'
})

const statusLabel = computed(() => {
  if (!latestProgress.value) return '待确认'
  if (latestProgress.value.stage === 'shipped') return '已完成'
  return '制作中'
})

const statusClass = computed(() => {
  if (isCompleted.value) return 'status-done'
  return 'status-active'
})

const timelineStages = computed(() => {
  const stages = [
    { stage: '采集完成', status: 'pending', time: '', note: '' },
    { stage: '设计确认', status: 'pending', time: '', note: '' },
    { stage: '制作中', status: 'pending', time: '', note: '' },
    { stage: '质检完成', status: 'pending', time: '', note: '' },
    { stage: '待取货/已发货', status: 'pending', time: '', note: '' }
  ]

  const stageOrder: ProgressStage[] = ['collected', 'design-confirmed', 'manufacturing', 'quality-check', 'ready-pickup']

  let currentFound = false
  for (let i = 0; i < stageOrder.length; i++) {
    const p = progresses.value.find((pr) => pr.stage === stageOrder[i])
    if (p) {
      const isLast = i === progresses.value.length - 1 || p.status === 'in-progress'
      if (!currentFound && isLast) {
        stages[i].status = 'current'
        currentFound = true
      } else if (!currentFound) {
        stages[i].status = 'completed'
      } else {
        stages[i].status = 'pending'
      }
      stages[i].time = formatTime(p.updateTime)
      stages[i].note = p.note
    }
  }

  return stages
})

const styleLabel = computed(() => {
  if (!booking.value) return ''
  return STYLE_LABELS[booking.value.designStyle] || booking.value.designStyle
})

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function contactStudio() {
  if (studioPhone.value) {
    uni.makePhoneCall({
      phoneNumber: studioPhone.value,
      fail: () => {
        uni.setClipboardData({
          data: studioPhone.value,
          success: () => {
            uni.showToast({ title: '号码已复制', icon: 'success' })
          }
        })
      }
    })
  } else {
    uni.showToast({ title: '暂无工作室联系方式', icon: 'none' })
  }
}

function loadData() {
  if (!bookingId.value) return

  // 加载预约信息
  const bookingData = getBookingDetail(bookingId.value)
  if (bookingData) {
    booking.value = bookingData

    // 加载纪念品名称
    try {
      const keepsake = getKeepsakeDetail(bookingData.typeId)
      if (keepsake) keepsakeName.value = keepsake.name
    } catch (_) { /* ignore */ }

    // 分类信息
    categoryIcon.value = CATEGORY_ICONS[bookingData.typeId] || '🎁'
    categoryLabel.value = CATEGORY_LABELS[bookingData.typeId] || '纪念品'

    // 加载工作室
    try {
      const studio = getStudioDetail(bookingData.studioId)
      if (studio) {
        studioName.value = studio.name
        studioPhone.value = studio.phone
      }
    } catch (_) { /* ignore */ }
  }

  // 加载进度
  progresses.value = getProgressByBooking(bookingId.value)
}

onLoad((options) => {
  if (options?.bookingId) {
    bookingId.value = options.bookingId
  } else if (options?.progressId) {
    // 通过 progressId 查找对应 booking
    const p = progresses.value.find((pr) => pr.progressId === options.progressId)
    if (p) bookingId.value = p.bookingId
  }
  loadData()
})
</script>

<style scoped lang="scss">
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.detail-scroll {
  flex: 1;
  padding: $spacing-md $spacing-lg;
}

.keepsake-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.header-badge {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, #FFF3ED, #FFE0CC);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-md;
}

.badge-icon {
  font-size: 44rpx;
}

.header-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.keepsake-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.keepsake-type {
  font-size: 24rpx;
  color: $text-hint;
}

.status-badge {
  padding: 8rpx 24rpx;
  border-radius: 32rpx;
}

.status-active {
  background-color: #FFF3ED;
}

.status-done {
  background-color: #E8F5E9;
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
}

.status-active .status-text {
  color: $primary;
}

.status-done .status-text {
  color: $success;
}

.section-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: $spacing-md;
}

.section-icon {
  font-size: 32rpx;
  margin-right: $spacing-sm;
}

.section-text {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.estimate-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.estimate-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.estimate-value {
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: $text-hint;
  flex-shrink: 0;
  margin-right: $spacing-md;
}

.info-value {
  font-size: 26rpx;
  color: $text-primary;
  text-align: right;
  flex: 1;
}

.bottom-bar {
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
}

.contact-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.contact-icon {
  font-size: 32rpx;
  margin-right: $spacing-sm;
}

.contact-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
