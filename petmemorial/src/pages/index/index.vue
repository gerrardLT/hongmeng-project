<template>
  <view class="home-page">
    <!-- 顶部欢迎区域 -->
    <view class="header">
      <view class="header-left">
        <text class="greeting">{{ greetingText }}</text>
        <text class="sub-greeting">{{ subGreetingText }}</text>
      </view>
      <view class="header-right" @click="goProfile">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/images/default-avatar.png'"
          mode="aspectFill"
        />
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-item" @click="goExplore">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #8B5CF6, #A78BFA)">
          <text class="entry-icon">🔍</text>
        </view>
        <text class="entry-label">浏览纪念品</text>
      </view>
      <view class="entry-item" @click="goBooking">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #FF9800, #FFB74D)">
          <text class="entry-icon">📅</text>
        </view>
        <text class="entry-label">预约采集</text>
      </view>
      <view class="entry-item" @click="goProgress">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #4CAF50, #81C784)">
          <text class="entry-icon">📋</text>
        </view>
        <text class="entry-label">制作进度</text>
      </view>
      <view class="entry-item" @click="goPetProfile">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #E91E63, #F48FB1)">
          <text class="entry-icon">🐾</text>
        </view>
        <text class="entry-label">宠物档案</text>
      </view>
    </view>

    <!-- 推荐纪念品 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐纪念品</text>
        <text class="section-more" @click="goExplore">更多 ›</text>
      </view>
      <scroll-view class="memorial-scroll" scroll-x :show-scrollbar="false">
        <view class="memorial-scroll-inner">
          <view
            v-for="item in recommendList"
            :key="item.typeId"
            class="memorial-scroll-item"
          >
            <MemorialCard
              :memorial="item"
              :showPrice="true"
              @click="goDetail(item.typeId)"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 宠物纪念日提醒 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">纪念日提醒</text>
        <text class="section-more" @click="goAnniversary">管理 ›</text>
      </view>
      <view v-if="upcomingAnniversaries.length > 0" class="anniversary-list">
        <view
          v-for="item in upcomingAnniversaries"
          :key="item.anniversaryId"
          class="anniversary-card"
        >
          <view class="anniversary-icon-wrap">
            <text class="anniversary-icon">{{ anniversaryIcon(item.type) }}</text>
          </view>
          <view class="anniversary-info">
            <text class="anniversary-title">{{ item.title }}</text>
            <text class="anniversary-date">{{ item.date }}</text>
          </view>
          <view class="anniversary-badge">
            <text class="anniversary-badge-text">{{ daysLeft(item.date) }}天后</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">📅</text>
        <text class="empty-text">暂无即将到来的纪念日</text>
        <text class="empty-hint">为宠物添加纪念日获得提醒</text>
      </view>
    </view>

    <!-- 最近预约/进度 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近预约</text>
        <text class="section-more" @click="goBooking">全部 ›</text>
      </view>
      <view v-if="recentBookings.length > 0" class="booking-list">
        <view
          v-for="item in recentBookings"
          :key="item.bookingId"
          class="booking-card"
          @click="goBookingDetail(item.bookingId)"
        >
          <view class="booking-info">
            <text class="booking-type-name">{{ getTypeName(item.typeId) }}</text>
            <text class="booking-date">{{ item.date }} {{ item.timeSlot }}</text>
          </view>
          <view class="booking-status" :class="'status-' + item.status">
            <text class="booking-status-text">{{ statusLabel(item.status) }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">📝</text>
        <text class="empty-text">暂无预约记录</text>
        <text class="empty-hint">预约采集制作纪念品</text>
      </view>
    </view>

    <!-- 底部快速操作 -->
    <view class="bottom-actions">
      <view class="action-btn action-explore" @click="goExplore">
        <text class="action-btn-text">浏览纪念品</text>
      </view>
      <view class="action-btn action-booking" @click="goBookingCreate">
        <text class="action-btn-text-white">预约采集</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import MemorialCard from '@/components/MemorialCard.vue'
import { useUserStore } from '@/store/user'
import { usePetStore } from '@/store/pet'
import { useBookingStore } from '@/store/booking'
import { getMemorialTypes } from '@/services/memorial'
import { getBookings } from '@/services/booking'
import type { MemorialType, Booking, Anniversary, AnniversaryType, BookingStatus } from '@/types/models'

const userStore = useUserStore()
const petStore = usePetStore()
const bookingStore = useBookingStore()

const recommendList = ref<MemorialType[]>([])
const recentBookings = ref<Booking[]>([])
const upcomingAnniversaries = ref<Anniversary[]>([])

// 所有纪念品种类（用于名称查找）
const allMemorials = ref<MemorialType[]>([])

// 欢迎语
const greetingText = computed(() => {
  if (!userStore.isLoggedIn) return '你好，宠物家长 🐾'
  const pet = petStore.currentPet
  if (pet) return `${pet.name}的纪念之旅 ✨`
  return `${userStore.userInfo?.nickname || '家长'}好 🐾`
})

const subGreetingText = computed(() => {
  if (!userStore.isLoggedIn) return '登录后解锁专属纪念品'
  const pet = petStore.currentPet
  if (pet) return '每一份陪伴都值得被珍藏'
  return '为爱宠定制专属纪念品'
})

function loadData() {
  // 加载推荐纪念品
  const list = getMemorialTypes()
  recommendList.value = list
  allMemorials.value = list

  // 加载最近预约
  const userId = userStore.userId || 'default_user'
  const bookings = getBookings(userId)
  recentBookings.value = bookings.filter((b) => b.status !== 'cancelled').slice(0, 3)
  bookingStore.setBookings(bookings)

  // 加载即将到来的纪念日（Mock 数据）
  loadAnniversaries()
}

function loadAnniversaries() {
  // Mock 纪念日数据
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentDay = now.getDate()
  const currentYear = now.getFullYear()

  const mockAnniversaries: Anniversary[] = petStore.pets
    .filter((p) => p.birthday)
    .map((p, idx) => {
      const birthdayParts = p.birthday.split('-')
      const month = parseInt(birthdayParts[1] || '1')
      const day = parseInt(birthdayParts[2] || '1')
      let year = currentYear
      if (month < currentMonth || (month === currentMonth && day < currentDay)) {
        year++
      }
      return {
        anniversaryId: `anniv_${idx}`,
        petId: p.petId,
        userId: p.userId,
        type: 'birthday' as AnniversaryType,
        title: `${p.name}的生日`,
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        reminderDays: [3, 1],
        enabled: true,
        createdAt: Date.now()
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))

  upcomingAnniversaries.value = mockAnniversaries.slice(0, 3)
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})

onPullDownRefresh(() => {
  loadData()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 600)
})

// 纪念日图标
function anniversaryIcon(type: AnniversaryType): string {
  const iconMap: Record<AnniversaryType, string> = {
    birthday: '🎂',
    'adopt-day': '🏠',
    'memorial-day': '🕯',
    custom: '💝'
  }
  return iconMap[type] || '📅'
}

// 距离天数
function daysLeft(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// 获取纪念品名称
function getTypeName(typeId: string): string {
  const found = allMemorials.value.find((m) => m.typeId === typeId)
  return found?.name || '纪念品'
}

// 预约状态标签
function statusLabel(status: BookingStatus): string {
  const map: Record<BookingStatus, string> = {
    pending: '待确认',
    confirmed: '已确认',
    'in-progress': '制作中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

// 快捷入口导航
function goExplore() {
  uni.switchTab({ url: '/pages/explore/index' })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function goProgress() {
  uni.switchTab({ url: '/pages/progress/index' })
}

function goPetProfile() {
  uni.navigateTo({ url: '/pages/pet/index' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function goDetail(typeId: string) {
  uni.navigateTo({ url: `/pages/explore/detail?typeId=${typeId}` })
}

function goBookingDetail(bookingId: string) {
  uni.navigateTo({ url: `/pages/booking/edit?bookingId=${bookingId}` })
}

function goBookingCreate() {
  uni.navigateTo({ url: '/pages/booking/create' })
}

function goAnniversary() {
  uni.navigateTo({ url: '/pages/pet/anniversary' })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 顶部欢迎区域 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 16rpx;
  background: linear-gradient(180deg, #F3E8FF 0%, $bg-page 100%);
}

.header-left {
  display: flex;
  flex-direction: column;
}

.greeting {
  font-size: 38rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.sub-greeting {
  font-size: 26rpx;
  color: $text-secondary;
}

.header-right {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid #E9D5FF;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  justify-content: space-between;
  padding: 32rpx 24rpx 16rpx;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.entry-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.entry-icon {
  font-size: 40rpx;
}

.entry-label {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

/* 通用 Section */
.section {
  padding: 16rpx 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-more {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

/* 推荐纪念品横向滚动 */
.memorial-scroll {
  white-space: nowrap;
}

.memorial-scroll-inner {
  display: flex;
  gap: 20rpx;
  padding-right: 32rpx;
}

.memorial-scroll-item {
  width: 340rpx;
  flex-shrink: 0;
}

/* 纪念日列表 */
.anniversary-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.anniversary-card {
  display: flex;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.anniversary-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #F3E8FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.anniversary-icon {
  font-size: 36rpx;
}

.anniversary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.anniversary-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.anniversary-date {
  font-size: 24rpx;
  color: $text-hint;
}

.anniversary-badge {
  background-color: #FEF3C7;
  border-radius: $radius-sm;
  padding: 6rpx 16rpx;
  flex-shrink: 0;
}

.anniversary-badge-text {
  font-size: 22rpx;
  color: #D97706;
  font-weight: 600;
}

/* 最近预约列表 */
.booking-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.booking-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.booking-info {
  display: flex;
  flex-direction: column;
}

.booking-type-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.booking-date {
  font-size: 24rpx;
  color: $text-hint;
}

.booking-status {
  border-radius: $radius-sm;
  padding: 6rpx 16rpx;
  flex-shrink: 0;
}

.booking-status-text {
  font-size: 22rpx;
  font-weight: 600;
}

.status-pending {
  background-color: #FFF3E0;
}

.status-pending .booking-status-text {
  color: #F57C00;
}

.status-confirmed {
  background-color: #E8F5E9;
}

.status-confirmed .booking-status-text {
  color: #4CAF50;
}

.status-in-progress {
  background-color: #E3F2FD;
}

.status-in-progress .booking-status-text {
  color: #2196F3;
}

.status-completed {
  background-color: #F3E8FF;
}

.status-completed .booking-status-text {
  color: #8B5CF6;
}

/* 空状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  background-color: $bg-card;
  border-radius: $radius-lg;
}

.empty-icon-text {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: $text-hint;
}

/* 底部快速操作 */
.bottom-actions {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  margin-top: 16rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-explore {
  background-color: $bg-card;
  border: 2rpx solid $primary;
}

.action-btn-text {
  font-size: 30rpx;
  color: $primary;
  font-weight: 600;
}

.action-booking {
  background: linear-gradient(135deg, $primary, $primary-light);
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.action-btn-text-white {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
