<template>
  <view class="booking-page">
    <!-- 顶部标题 + 新建按钮 -->
    <view class="page-header">
      <text class="page-title">我的预约</text>
      <view class="header-add-btn" @click="onGoExplore">
        <text class="header-add-icon">+</text>
      </view>
    </view>

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
    <scroll-view scroll-y class="list-scroll">
      <view v-if="filteredList.length > 0" class="list-content">
        <view
          v-for="item in filteredList"
          :key="item.bookingId"
          class="booking-item-wrap"
          @click="onItemClick(item)"
        >
          <BookingCard :booking="item" @click="onItemClick(item)" />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-wrap">
        <EmptyState
          icon="📋"
          title="暂无预约"
          description="暂无预约，去探索工作室吧"
          action-text="去探索"
          :show-action="true"
          @action="onGoExplore"
        />
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useBookingStore } from '@/store/booking'
import { useUserStore } from '@/store/user'
import { getBookingList } from '@/services/booking'
import BookingCard from '@/components/BookingCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Booking } from '@/types/models'

const bookingStore = useBookingStore()
const userStore = useUserStore()

const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' }
]

const activeTab = ref<string>('all')

const filteredList = computed(() => {
  const list = bookingStore.bookingList
  if (activeTab.value === 'all') return list
  return list.filter((b) => b.status === activeTab.value)
})

function onTabChange(value: string) {
  activeTab.value = value
}

function onItemClick(item: Booking) {
  uni.navigateTo({ url: `/pages/booking/detail?bookingId=${item.bookingId}` })
}

function onGoExplore() {
  uni.switchTab({ url: '/pages/explore/index' })
}

async function loadBookings() {
  const userId = userStore.userId
  if (!userId) return

  bookingStore.loading = true
  try {
    const list = await getBookingList(userId)
    bookingStore.bookingList.length = 0
    list.forEach((b) => bookingStore.bookingList.push(b))
  } catch (e) {
    console.error('loadBookings error:', e)
  } finally {
    bookingStore.loading = false
  }
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
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;
}

.header-add-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.35);
}

.header-add-icon {
  font-size: 40rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
  margin-top: -2rpx;
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
  padding: 0 28rpx;
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
  padding: 24rpx 24rpx 0;
}

.booking-item-wrap {
  margin-bottom: 20rpx;
}

.empty-wrap {
  padding-top: 120rpx;
}

.safe-bottom {
  height: 32rpx;
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
