<template>
  <view class="progress-list-page">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">制作进度</text>
      <text class="page-subtitle">实时跟踪您的印章制作状态</text>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ 'tab-active': activeTab === 'active' }"
        @click="switchTab('active')"
      >
        <text class="tab-text" :class="{ 'tab-text-active': activeTab === 'active' }">
          制作中
        </text>
        <view v-if="activeTab === 'active'" class="tab-indicator" />
      </view>
      <view
        class="tab-item"
        :class="{ 'tab-active': activeTab === 'completed' }"
        @click="switchTab('completed')"
      >
        <text class="tab-text" :class="{ 'tab-text-active': activeTab === 'completed' }">
          已完成
        </text>
        <view v-if="activeTab === 'completed'" class="tab-indicator" />
      </view>
    </view>

    <!-- 进度列表 -->
    <scroll-view class="list-scroll" scroll-y @scrolltolower="onScrollEnd">
      <!-- 制作中 -->
      <view v-if="activeTab === 'active'">
        <view v-if="activeGroups.length > 0">
          <view
            v-for="group in activeGroups"
            :key="group.bookingId"
            class="progress-card"
            @click="goDetail(group.bookingId)"
          >
            <!-- 卡片头部 -->
            <view class="card-header">
              <view class="card-icon-wrap">
                <text class="card-icon">{{ group.categoryIcon }}</text>
              </view>
              <view class="card-title-wrap">
                <text class="card-content">{{ group.content }}</text>
                <view class="current-stage-badge">
                  <text class="current-stage-text">{{ group.currentStageLabel }}</text>
                </view>
              </view>
              <text class="card-arrow">›</text>
            </view>

            <!-- 进度条 -->
            <view class="progress-bar-wrap">
              <view class="progress-bar-bg">
                <view
                  class="progress-bar-fill"
                  :style="{ width: group.percent + '%' }"
                />
              </view>
              <text class="progress-percent">{{ group.percent }}%</text>
            </view>

            <!-- 阶段进度点 -->
            <view class="stage-dots">
              <view
                v-for="(dot, idx) in group.stageDots"
                :key="idx"
                class="dot-wrapper"
              >
                <view
                  class="stage-dot"
                  :class="dot.status === 'completed' ? 'dot-done' : dot.status === 'current' ? 'dot-current' : 'dot-pending'"
                />
                <view v-if="idx < group.stageDots.length - 1" class="dot-line" :class="dot.status === 'completed' ? 'line-done' : 'line-pending'" />
              </view>
            </view>

            <!-- 预计完成时间 -->
            <view class="card-footer">
              <text class="footer-icon">🕐</text>
              <text class="footer-text">预计完成：{{ group.estimatedTime }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <view class="empty-icon-wrap">
            <text class="empty-icon">🎋</text>
          </view>
          <text class="empty-title">暂无制作中的订单</text>
          <text class="empty-desc">预约篆刻后即可在此追踪制作进度</text>
          <view class="empty-btn" @click="goBooking">
            <text class="empty-btn-text">去预约印章</text>
          </view>
        </view>
      </view>

      <!-- 已完成 -->
      <view v-if="activeTab === 'completed'">
        <view v-if="completedGroups.length > 0">
          <view
            v-for="group in completedGroups"
            :key="group.bookingId"
            class="progress-card progress-card-done"
            @click="goDetail(group.bookingId)"
          >
            <view class="card-header">
              <view class="card-icon-wrap card-icon-done">
                <text class="card-icon">{{ group.categoryIcon }}</text>
              </view>
              <view class="card-title-wrap">
                <text class="card-content">{{ group.content }}</text>
                <view class="done-badge">
                  <text class="done-badge-text">✓ 已完成</text>
                </view>
              </view>
              <text class="card-arrow">›</text>
            </view>
            <view class="card-footer">
              <text class="footer-icon">📅</text>
              <text class="footer-text">完成时间：{{ group.completedTime }}</text>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <view class="empty-icon-wrap">
            <text class="empty-icon">🎊</text>
          </view>
          <text class="empty-title">暂无已完成的印章</text>
          <text class="empty-desc">完成制作的印章会显示在这里</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="list-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useProgressStore } from '@/store/progress'
import { useUserStore } from '@/store/user'
import { getProgressByBooking, getStageLabel } from '@/services/progress'
import { getBookings } from '@/services/booking'
import { getSealTypeById } from '@/services/seal'
import { getMaterialById } from '@/services/seal'
import { getProgressPercent, PROGRESS_STAGE_ORDER } from '@/utils/format'
import type { Progress, ProgressStage } from '@/types/models'

const progressStore = useProgressStore()
const userStore = useUserStore()
const activeTab = ref<'active' | 'completed'>('active')

const CATEGORY_ICONS: Record<string, string> = {
  name: '📛',
  leisure: '🎐',
  bookplate: '📖',
  signature: '✍️',
  collection: '🏺'
}

interface ProgressGroup {
  bookingId: string
  content: string
  materialName: string
  categoryIcon: string
  currentStageLabel: string
  percent: number
  estimatedTime: string
  completedTime: string
  stageDots: { status: string }[]
}

const allGroups = ref<ProgressGroup[]>([])

const activeGroups = computed(() =>
  allGroups.value.filter((g) => g.currentStageLabel !== '已发货')
)

const completedGroups = computed(() =>
  allGroups.value.filter((g) => g.currentStageLabel === '已发货')
)

function formatDate(ts: number | string): string {
  if (!ts) return '待确认'
  const d = new Date(ts)
  if (isNaN(d.getTime())) return '待确认'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadData() {
  const userId = userStore.userId || 'default_user'
  const bookings = getBookings(userId)

  const groups: ProgressGroup[] = []

  for (const booking of bookings) {
    if (booking.status === 'cancelled') continue

    const progresses = getProgressByBooking(booking.bookingId)
    if (progresses.length === 0) continue

    const sealType = getSealTypeById(booking.sealTypeId)
    const material = getMaterialById(booking.materialId)
    const lastProgress = progresses[progresses.length - 1]
    const currentStage: ProgressStage = lastProgress?.stage || 'design-confirmed'

    // 构造阶段圆点
    const currentIdx = PROGRESS_STAGE_ORDER.indexOf(currentStage)
    const stageDots = PROGRESS_STAGE_ORDER.map((_, idx) => ({
      status: idx < currentIdx ? 'completed' : idx === currentIdx ? 'current' : 'pending'
    }))

    // 进度百分比
    const percent = getProgressPercent(currentStage)

    // 预计完成时间
    const activeProgress = progresses.find((p) => p.status === 'active')
    const estimatedTime = activeProgress?.estimatedCompletionTime
      ? formatDate(activeProgress.estimatedCompletionTime)
      : '待确认'

    // 完成时间
    const shippedProgress = progresses.find((p) => p.stage === 'shipped')
    const completedTime = shippedProgress ? formatDate(shippedProgress.updateTime) : '--'

    groups.push({
      bookingId: booking.bookingId,
      content: booking.content || '印章定制',
      materialName: material?.name || '',
      categoryIcon: sealType ? (CATEGORY_ICONS[sealType.category] || '🎋') : '🎋',
      currentStageLabel: getStageLabel(currentStage),
      percent,
      estimatedTime,
      completedTime,
      stageDots
    })
  }

  allGroups.value = groups
  progressStore.loadProgress()
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})

onPullDownRefresh(() => {
  loadData()
  setTimeout(() => uni.stopPullDownRefresh(), 600)
})

function switchTab(tab: 'active' | 'completed') {
  activeTab.value = tab
}

function goDetail(bookingId: string) {
  uni.navigateTo({ url: `/pages/progress/detail?bookingId=${bookingId}` })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function onScrollEnd() {
  // 分页加载预留
}
</script>

<style scoped lang="scss">
.progress-list-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.page-header {
  background: linear-gradient(160deg, #FDE8E8 0%, #FBF8F5 100%);
  padding: 24rpx 32rpx 28rpx;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 6rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: $text-secondary;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  background-color: $bg-card;
  padding: 0 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  gap: 4rpx;
}

.tab-text {
  font-size: 28rpx;
  color: $text-hint;
  font-weight: 500;
}

.tab-text-active {
  color: $primary;
  font-weight: 700;
}

.tab-indicator {
  width: 40rpx;
  height: 6rpx;
  background: linear-gradient(90deg, $primary, $primary-light);
  border-radius: 3rpx;
  position: absolute;
  bottom: 0;
}

/* 列表滚动区 */
.list-scroll {
  flex: 1;
  padding-top: 20rpx;
}

/* 进度卡片 */
.progress-card {
  background-color: $bg-card;
  margin: 0 24rpx 20rpx;
  border-radius: $radius-lg;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.progress-card-done {
  opacity: 0.85;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 16rpx;
}

.card-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  background: linear-gradient(135deg, #FDE8E8, #F5C2C2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-done {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
}

.card-icon {
  font-size: 36rpx;
}

.card-title-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-content {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.current-stage-badge {
  display: inline-flex;
  align-items: center;
  background-color: #FDE8E8;
  border-radius: $radius-sm;
  padding: 4rpx 14rpx;
  align-self: flex-start;
}

.current-stage-text {
  font-size: 22rpx;
  color: $primary;
  font-weight: 600;
}

.done-badge {
  display: inline-flex;
  align-items: center;
  background-color: #E8F5E9;
  border-radius: $radius-sm;
  padding: 4rpx 14rpx;
  align-self: flex-start;
}

.done-badge-text {
  font-size: 22rpx;
  color: $success;
  font-weight: 600;
}

.card-arrow {
  font-size: 36rpx;
  color: $text-hint;
  font-weight: 300;
}

/* 进度条 */
.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.progress-bar-bg {
  flex: 1;
  height: 12rpx;
  background-color: #F0E8E0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary, $primary-light);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
  min-width: 72rpx;
  text-align: right;
}

/* 阶段圆点 */
.stage-dots {
  display: flex;
  align-items: center;
  margin: 4rpx 0 20rpx;
  padding: 0 8rpx;
}

.dot-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.dot-wrapper:last-child {
  flex: 0;
}

.stage-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-done {
  background-color: $success;
}

.dot-current {
  background-color: $bg-card;
  border: 5rpx solid $primary;
  box-shadow: 0 0 0 4rpx rgba(196, 26, 26, 0.15);
}

.dot-pending {
  background-color: $border-color;
}

.dot-line {
  flex: 1;
  height: 4rpx;
  margin: 0 4rpx;
}

.line-done {
  background-color: $success;
}

.line-pending {
  background-color: $border-color;
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #FBF8F5;
  border-radius: $radius-sm;
  padding: 12rpx 16rpx;
}

.footer-icon {
  font-size: 24rpx;
}

.footer-text {
  font-size: 24rpx;
  color: $text-secondary;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 80rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background-color: #FDE8E8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-icon {
  font-size: 72rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 40rpx;
}

.empty-btn {
  height: 80rpx;
  padding: 0 48rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(196, 26, 26, 0.3);
}

.empty-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 底部占位 */
.list-bottom {
  height: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
