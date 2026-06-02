<template>
  <view class="progress-page">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: currentTab === 'active' }"
        @click="switchTab('active')"
      >
        <text class="tab-text" :class="{ 'tab-active': currentTab === 'active' }">进行中</text>
        <view v-if="currentTab === 'active'" class="tab-indicator" />
      </view>
      <view
        class="tab-item"
        :class="{ active: currentTab === 'completed' }"
        @click="switchTab('completed')"
      >
        <text class="tab-text" :class="{ 'tab-active': currentTab === 'completed' }">已完成</text>
        <view v-if="currentTab === 'completed'" class="tab-indicator" />
      </view>
    </view>

    <!-- 列表内容 -->
    <scroll-view
      class="list-scroll"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 进行中列表 -->
      <view v-if="currentTab === 'active'">
        <view v-if="activeList.length > 0" class="card-list">
          <view
            v-for="item in activeList"
            :key="item.bookingId"
            class="progress-card"
            @click="goDetail(item)"
          >
            <view class="card-top">
              <view class="card-info">
                <text class="keepsake-name">{{ item.keepsakeName }}</text>
                <text class="stage-label">{{ item.stageLabel }}</text>
              </view>
              <view class="card-arrow">
                <text class="arrow-icon">›</text>
              </view>
            </view>

            <!-- 进度条 -->
            <view class="progress-bar-wrap">
              <view class="progress-bar-bg">
                <view class="progress-bar-fill" :style="{ width: item.percent + '%' }" />
              </view>
              <text class="progress-percent">{{ item.percent }}%</text>
            </view>

            <view class="card-footer">
              <text class="estimate-time">预计完成：{{ item.estimateTime }}</text>
            </view>
          </view>
        </view>
        <EmptyState
          v-else
          icon="📦"
          title="暂无进行中的订单"
          description="去探索纪念品，开始定制属于宝宝的珍贵回忆吧"
          action-text="去探索"
          :show-action="true"
          @action="goExplore"
        />
      </view>

      <!-- 已完成列表 -->
      <view v-if="currentTab === 'completed'">
        <view v-if="completedList.length > 0" class="card-list">
          <view
            v-for="item in completedList"
            :key="item.bookingId"
            class="progress-card completed-card"
            @click="goDetail(item)"
          >
            <view class="card-top">
              <view class="card-info">
                <text class="keepsake-name">{{ item.keepsakeName }}</text>
                <view class="status-tag completed-tag">
                  <text class="tag-text">已完成</text>
                </view>
              </view>
              <view class="card-arrow">
                <text class="arrow-icon">›</text>
              </view>
            </view>
            <view class="card-footer">
              <text class="complete-time">完成时间：{{ item.estimateTime }}</text>
              <text class="pickup-status">{{ item.pickupLabel }}</text>
            </view>
          </view>
        </view>
        <EmptyState
          v-else
          icon="📋"
          title="暂无已完成的订单"
          description="您的纪念品制作完成后会显示在这里"
        />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useProgressStore } from '@/store/progress'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getProgressByBooking } from '@/services/progress'
import { getBookingList } from '@/services/booking'
import { getKeepsakeDetail } from '@/services/keepsake'
import type { Progress, ProgressStage, Booking } from '@/types/models'
import EmptyState from '@/components/common/EmptyState.vue'

type TabType = 'active' | 'completed'

interface ProgressItem {
  bookingId: string
  keepsakeName: string
  stage: ProgressStage
  stageLabel: string
  percent: number
  estimateTime: string
  pickupLabel: string
}

const STAGE_LABEL_MAP: Record<ProgressStage, string> = {
  collected: '材料采集',
  'design-confirmed': '设计方案确认',
  manufacturing: '手工制作中',
  'quality-check': '品质检验',
  'ready-pickup': '待取件/配送',
  shipped: '已发货'
}

const STAGE_PERCENT_MAP: Record<ProgressStage, number> = {
  collected: 20,
  'design-confirmed': 40,
  manufacturing: 60,
  'quality-check': 80,
  'ready-pickup': 95,
  shipped: 100
}

const progressStore = useProgressStore()
const bookingStore = useBookingStore()
const userStore = useUserStore()

const currentTab = ref<TabType>('active')
const refreshing = ref(false)

const activeList = ref<ProgressItem[]>([])
const completedList = ref<ProgressItem[]>([])

function switchTab(tab: TabType) {
  currentTab.value = tab
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getKeepsakeName(typeId: string): string {
  const nameMap: Record<string, string> = {
    handprint: '手印纪念品',
    hair: '胎毛纪念品',
    tooth: '乳牙纪念品',
    birth: '出生纪念品',
    growth: '成长纪念品'
  }
  try {
    const detail = getKeepsakeDetail(typeId)
    if (detail) return detail.name
  } catch (_) { /* ignore */ }
  return nameMap[typeId] || '宝宝纪念品'
}

function buildProgressItems(bookings: Booking[], onlyActive: boolean): ProgressItem[] {
  const items: ProgressItem[] = []
  for (const booking of bookings) {
    const progresses = getProgressByBooking(booking.bookingId)
    if (progresses.length === 0) continue

    const latest = progresses[progresses.length - 1]
    const isShipped = latest.stage === 'shipped'

    if (onlyActive && isShipped) continue
    if (!onlyActive && !isShipped) continue

    const keepsakeName = getKeepsakeName(booking.typeId)
    const percent = STAGE_PERCENT_MAP[latest.stage] || 0
    const estimateTime = latest.estimatedCompletionTime
      ? formatTime(latest.estimatedCompletionTime)
      : latest.stage === 'shipped'
        ? formatTime(latest.updateTime)
        : '待确认'

    items.push({
      bookingId: booking.bookingId,
      keepsakeName,
      stage: latest.stage,
      stageLabel: STAGE_LABEL_MAP[latest.stage],
      percent,
      estimateTime,
      pickupLabel: latest.stage === 'shipped' ? '已发货' : latest.stage === 'ready-pickup' ? '待取件' : ''
    })
  }
  return items
}

function loadData() {
  const userId = userStore.userId || 'default_user'
  const bookings = getBookingList(userId)
  bookingStore.setBookings(bookings)

  activeList.value = buildProgressItems(
    bookings.filter((b) => !['completed', 'cancelled'].includes(b.status)),
    true
  )
  completedList.value = buildProgressItems(
    bookings.filter((b) => b.status === 'completed'),
    false
  )

  // 同步到 progress store
  const allProgresses: Progress[] = []
  for (const booking of bookings) {
    const progresses = getProgressByBooking(booking.bookingId)
    allProgresses.push(...progresses)
  }
  progressStore.setProgressList(allProgresses)
}

function onRefresh() {
  refreshing.value = true
  setTimeout(() => {
    loadData()
    refreshing.value = false
  }, 600)
}

function goDetail(item: ProgressItem) {
  uni.navigateTo({
    url: `/pages/progress/detail?bookingId=${item.bookingId}`
  })
}

function goExplore() {
  uni.switchTab({
    url: '/pages/explore/index'
  })
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.progress-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  padding: 0 $spacing-lg;
  border-bottom: 1rpx solid $border-color;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 20rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: $text-secondary;
  font-weight: 500;
}

.tab-active {
  color: $primary;
  font-weight: 700;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background-color: $primary;
}

.list-scroll {
  flex: 1;
  padding: $spacing-md $spacing-lg;
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.progress-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: $spacing-md;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.keepsake-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
}

.stage-label {
  font-size: 24rpx;
  color: $primary;
  font-weight: 500;
}

.card-arrow {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 36rpx;
  color: $text-hint;
  font-weight: 300;
}

.progress-bar-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.progress-bar-bg {
  flex: 1;
  height: 12rpx;
  background-color: #F0F0F0;
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
  font-weight: 700;
  min-width: 72rpx;
  text-align: right;
}

.card-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.estimate-time {
  font-size: 24rpx;
  color: $text-hint;
}

.complete-time {
  font-size: 24rpx;
  color: $text-hint;
}

.pickup-status {
  font-size: 24rpx;
  color: $success;
  font-weight: 500;
}

.completed-card .keepsake-name {
  color: $text-secondary;
}

.status-tag {
  display: inline-flex;
  padding: 4rpx 16rpx;
  border-radius: $radius-sm;
}

.completed-tag {
  background-color: #E8F5E9;
}

.tag-text {
  font-size: 22rpx;
  color: $success;
  font-weight: 500;
}
</style>
