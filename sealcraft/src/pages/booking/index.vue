<template>
  <view class="booking-page">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">我的预约</text>
      <view class="header-right" @click="onStudioList">
        <text class="header-icon">🏛️</text>
        <text class="header-action">找工作室</text>
      </view>
    </view>

    <!-- Tab 切换 -->
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

    <!-- 预约列表 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="onScrollBottom">
      <view v-if="filteredList.length > 0" class="list-content">
        <view
          v-for="item in filteredList"
          :key="item.bookingId"
          class="booking-card"
          @click="onItemClick(item)"
        >
          <!-- 卡片头部 -->
          <view class="card-header">
            <view class="seal-info">
              <text class="seal-icon">🖋️</text>
              <text class="content-text">{{ item.content }}</text>
            </view>
            <view class="status-tag" :class="'status-' + item.status">
              <text class="status-text">{{ statusLabel(item.status) }}</text>
            </view>
          </view>

          <!-- 卡片内容 -->
          <view class="card-body">
            <view class="info-row">
              <text class="info-label">材质</text>
              <text class="info-val">{{ getMaterialName(item.materialId) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">字体</text>
              <text class="info-val">{{ getFontName(item.fontId) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">工作室</text>
              <text class="info-val studio-name-val">{{ getStudioName(item.studioId) }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">日期</text>
              <text class="info-val">{{ item.date }} {{ item.timeSlot }}</text>
            </view>
            <view class="info-row">
              <text class="info-label">配送</text>
              <text class="info-val">{{ item.deliveryType === 'pickup' ? '到店自取' : '邮寄配送' }}</text>
            </view>
          </view>

          <!-- 卡片底部 -->
          <view class="card-footer">
            <view class="price-block">
              <text class="price-label">定金 ¥{{ item.depositAmount }}</text>
              <text class="price-total">总价 ¥{{ item.totalAmount }}</text>
            </view>
            <view class="card-arrow">
              <text class="arrow-icon">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🖋️</text>
        <text class="empty-title">暂无{{ emptyTabLabel }}预约</text>
        <text class="empty-desc">去设计你的专属印章，预约刻制吧</text>
        <view class="empty-btn" @click="onGoDesign">
          <text class="empty-btn-text">去设计印章</text>
        </view>
      </view>
    </scroll-view>

    <!-- 浮动预约按钮 -->
    <view class="fab" @click="onCreateBooking">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getBookings } from '@/services/booking'
import { getStudioById } from '@/services/studio'
import type { Booking, BookingStatus } from '@/types/models'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const statusTabs = [
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const activeTab = ref<string>('active')

const studioNameMap = ref<Record<string, string>>({})

const filteredList = computed(() => {
  const list = bookingStore.bookings
  if (activeTab.value === 'active') {
    return list.filter((b) => ['pending', 'confirmed', 'in-progress'].includes(b.status))
  }
  if (activeTab.value === 'completed') {
    return list.filter((b) => b.status === 'completed')
  }
  if (activeTab.value === 'cancelled') {
    return list.filter((b) => b.status === 'cancelled')
  }
  return list
})

const emptyTabLabel = computed(() => {
  const map: Record<string, string> = {
    active: '进行中的',
    completed: '已完成的',
    cancelled: '已取消的'
  }
  return map[activeTab.value] || ''
})

const MATERIAL_NAMES: Record<string, string> = {
  mat_qingtian: '青田石',
  mat_shoushan: '寿山石',
  mat_changhua: '昌化石',
  mat_wood: '木质',
  mat_copper: '铜质',
  mat_crystal: '水晶'
}

const FONT_NAMES: Record<string, string> = {
  font_zhuan: '篆书',
  font_li: '隶书',
  font_kai: '楷书',
  font_xing: '行书',
  font_cao: '草书'
}

function statusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: '待确认',
    confirmed: '已确认',
    'in-progress': '刻制中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

function getMaterialName(materialId: string): string {
  return MATERIAL_NAMES[materialId] || materialId || '未知材质'
}

function getFontName(fontId: string): string {
  return FONT_NAMES[fontId] || fontId || '未知字体'
}

function getStudioName(studioId: string): string {
  if (studioNameMap.value[studioId]) return studioNameMap.value[studioId]
  const detail = getStudioById(studioId)
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
  uni.navigateTo({ url: `/pages/booking/confirmation?bookingId=${item.bookingId}` })
}

function onGoDesign() {
  uni.switchTab({ url: '/pages/design/index' })
}

function onCreateBooking() {
  uni.navigateTo({ url: '/pages/booking/create' })
}

function onStudioList() {
  uni.navigateTo({ url: '/pages/booking/studio-list' })
}

function onScrollBottom() {
  // 预留分页加载
}

function loadBookings() {
  const userId = userStore.userId
  if (!userId) return
  const list = getBookings(userId)
  bookingStore.bookings = list
}

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

.page-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 48rpx 32rpx 20rpx;
  background-color: $bg-card;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
}

.header-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6rpx;
}

.header-icon {
  font-size: 28rpx;
}

.header-action {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
  padding: 0 32rpx;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
  height: 88rpx;
  position: relative;
  flex: 1;
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
  width: 48rpx;
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

.booking-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid $bg-page;
}

.seal-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.seal-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
  flex-shrink: 0;
}

.content-text {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.status-tag {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
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
  background-color: #FDF0F0;
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

.card-body {
  margin-bottom: 16rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx 0;
}

.info-label {
  font-size: 24rpx;
  color: $text-hint;
  width: 80rpx;
  flex-shrink: 0;
}

.info-val {
  font-size: 26rpx;
  color: $text-secondary;
  flex: 1;
}

.studio-name-val {
  color: $primary;
  font-weight: 500;
}

.card-footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid $bg-page;
}

.price-block {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.price-label {
  font-size: 22rpx;
  color: $text-hint;
}

.price-total {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary;
}

.card-arrow {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  font-size: 40rpx;
  color: $text-hint;
  font-weight: 300;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 180rpx;
  padding-left: 48rpx;
  padding-right: 48rpx;
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
  text-align: center;
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
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.35);
}

.fab-icon {
  font-size: 52rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
}
</style>
