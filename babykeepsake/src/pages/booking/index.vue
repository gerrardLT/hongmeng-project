<template>
  <view class="booking-page">
    <!-- 状态筛选 Tab -->
    <scroll-view scroll-x class="tab-scroll" :show-scrollbar="false">
      <view class="tab-bar">
        <view
          v-for="tab in statusTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: activeTab === tab.value }"
          @click="onTabChange(tab.value)"
        >
          <text class="tab-text" :class="{ 'tab-text-active': activeTab === tab.value }">{{ tab.label }}</text>
          <view v-if="activeTab === tab.value" class="tab-indicator" />
        </view>
      </view>
    </scroll-view>

    <!-- 预约列表 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="onScrollBottom">
      <view v-if="filteredList.length > 0" class="list-content">
        <view
          v-for="item in filteredList"
          :key="item.bookingId"
          class="booking-item"
          @click="onItemClick(item)"
        >
          <view class="item-header">
            <text class="keepsake-name">{{ getKeepsakeName(item.typeId) }}</text>
            <view class="status-tag" :class="'status-' + item.status">
              <text class="status-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>
          <view class="item-body">
            <view class="info-row">
              <text class="info-icon">🏠</text>
              <text class="info-text">{{ getStudioName(item.studioId) }}</text>
            </view>
            <view class="info-row">
              <text class="info-icon">📅</text>
              <text class="info-text">{{ item.appointmentDate }} {{ item.appointmentTime }}</text>
            </view>
          </view>
          <view class="item-footer">
            <text class="price-text">¥{{ item.totalAmount }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无预约记录</text>
        <text class="empty-desc">快去探索精美纪念品，预约制作吧</text>
        <view class="empty-btn" @click="onExplore">
          <text class="empty-btn-text">去探索纪念品</text>
        </view>
      </view>
    </scroll-view>

    <!-- 浮动新建按钮 -->
    <view class="fab" @click="onCreateBooking">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getBookingList } from '@/services/booking'
import { getStudioDetail } from '@/services/studio'
import { getKeepsakeDetail } from '@/services/keepsake'
import type { Booking, BookingStatus } from '@/types/models'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const activeTab = ref<string>('all')

// 缓存名称
const keepsakeNameMap = ref<Record<string, string>>({})
const studioNameMap = ref<Record<string, string>>({})

const filteredList = computed(() => {
  const list = bookingStore.bookings
  if (activeTab.value === 'all') return list
  return list.filter((b) => b.status === activeTab.value)
})

function statusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: '待确认',
    confirmed: '已确认',
    'in-progress': '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function getKeepsakeName(typeId: string): string {
  if (keepsakeNameMap.value[typeId]) return keepsakeNameMap.value[typeId]
  const detail = getKeepsakeDetail(typeId)
  if (detail) {
    keepsakeNameMap.value[typeId] = detail.name
    return detail.name
  }
  return '纪念品'
}

function getStudioName(studioId: string): string {
  if (studioNameMap.value[studioId]) return studioNameMap.value[studioId]
  const detail = getStudioDetail(studioId)
  if (detail) {
    studioNameMap.value[studioId] = detail.name
    return detail.name
  }
  return '工作室'
}

function onTabChange(value: string) {
  activeTab.value = value
}

function onItemClick(item: Booking) {
  if (item.status === 'pending' || item.status === 'confirmed') {
    uni.navigateTo({ url: `/pages/booking/edit?bookingId=${item.bookingId}` })
  } else {
    uni.navigateTo({ url: `/pages/booking/confirmation?bookingId=${item.bookingId}` })
  }
}

function onExplore() {
  uni.switchTab({ url: '/pages/explore/index' })
}

function onCreateBooking() {
  uni.navigateTo({ url: '/pages/booking/create' })
}

function onScrollBottom() {
  // 预留分页加载
}

function loadBookings() {
  const userId = userStore.userId
  if (!userId) return
  const list = getBookingList(userId)
  bookingStore.setBookings(list)
}

onMounted(() => {
  loadBookings()
})

onShow(() => {
  loadBookings()
})
</script>

<style scoped lang="scss">
.booking-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.tab-scroll {
  flex-shrink: 0;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  padding: 0 16rpx;
  height: 88rpx;
  align-items: center;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  height: 100%;
  position: relative;
  flex-shrink: 0;
}

.tab-text {
  font-size: 28rpx;
  color: $text-secondary;
}

.tab-text-active {
  color: $primary;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background-color: $primary;
}

.list-scroll {
  flex: 1;
  overflow: hidden;
}

.list-content {
  padding: 24rpx;
}

.booking-item {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.item-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.keepsake-name {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.status-tag {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
}

.status-pending {
  background-color: #FFF3E0;
}

.status-pending .status-text {
  color: #FF9800;
}

.status-confirmed {
  background-color: #E3F2FD;
}

.status-confirmed .status-text {
  color: #1976D2;
}

.status-in-progress {
  background-color: #FFF3ED;
}

.status-in-progress .status-text {
  color: $primary;
}

.status-completed {
  background-color: #E8F5E9;
}

.status-completed .status-text {
  color: #4CAF50;
}

.status-cancelled {
  background-color: #F5F5F5;
}

.status-cancelled .status-text {
  color: $text-hint;
}

.status-text {
  font-size: 22rpx;
  font-weight: 500;
}

.item-body {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10rpx;
}

.info-icon {
  font-size: 26rpx;
  margin-right: 10rpx;
}

.info-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.item-footer {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding-top: 16rpx;
  border-top: 1rpx solid $border-color;
}

.price-text {
  font-size: 32rpx;
  font-weight: 700;
  color: $primary;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
  margin-bottom: 48rpx;
}

.empty-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-xl;
  padding: 20rpx 64rpx;
}

.empty-btn-text {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 600;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 108rpx;
  height: 108rpx;
  border-radius: 54rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
}

.fab-icon {
  font-size: 52rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
}
</style>
