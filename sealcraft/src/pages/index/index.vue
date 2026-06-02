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
      <view class="entry-item" @click="goDesign">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #C41A1A, #E85454)">
          <text class="entry-icon">🖌</text>
        </view>
        <text class="entry-label">设计印章</text>
      </view>
      <view class="entry-item" @click="goKnowledgeMaterial">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #548B54, #7CB37C)">
          <text class="entry-icon">🪨</text>
        </view>
        <text class="entry-label">查看材质</text>
      </view>
      <view class="entry-item" @click="goBooking">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #D4A853, #E8C97A)">
          <text class="entry-icon">🏪</text>
        </view>
        <text class="entry-label">预约工作室</text>
      </view>
      <view class="entry-item" @click="goCollection">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #2C2C2C, #555555)">
          <text class="entry-icon">🗃</text>
        </view>
        <text class="entry-label">我的印章库</text>
      </view>
    </view>

    <!-- 推荐印章类型 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">推荐印章类型</text>
        <text class="section-more" @click="goKnowledge">更多 ›</text>
      </view>
      <scroll-view class="seal-scroll" scroll-x :show-scrollbar="false">
        <view class="seal-scroll-inner">
          <view
            v-for="item in sealTypeList"
            :key="item.typeId"
            class="seal-scroll-item"
          >
            <SealCard
              :sealType="item"
              :showPrice="true"
              @click="goSealTypeDetail(item.typeId)"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 最新预约状态 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最新预约</text>
        <text class="section-more" @click="goBooking">全部 ›</text>
      </view>
      <view v-if="activeBooking" class="booking-card" @click="goBookingDetail(activeBooking.bookingId)">
        <view class="booking-info">
          <text class="booking-type-name">{{ getSealTypeName(activeBooking.sealTypeId) }}</text>
          <text class="booking-date">{{ activeBooking.date }} {{ activeBooking.timeSlot }}</text>
        </view>
        <view class="booking-status" :class="'status-' + activeBooking.status">
          <text class="booking-status-text">{{ statusLabel(activeBooking.status) }}</text>
        </view>
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">🏪</text>
        <text class="empty-text">暂无预约记录</text>
        <text class="empty-hint">预约工作室定制专属印章</text>
      </view>
    </view>

    <!-- 印章知识推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">印章小知识</text>
        <text class="section-more" @click="goKnowledge">了解更多 ›</text>
      </view>
      <view v-if="knowledgeTip" class="knowledge-card">
        <view class="knowledge-tag">
          <text class="knowledge-tag-text">{{ knowledgeTip.tag }}</text>
        </view>
        <text class="knowledge-title">{{ knowledgeTip.title }}</text>
        <text class="knowledge-desc">{{ knowledgeTip.desc }}</text>
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">📖</text>
        <text class="empty-text">暂无知识推荐</text>
      </view>
    </view>

    <!-- 底部安全区（适配 TabBar） -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import SealCard from '@/components/SealCard.vue'
import { useUserStore } from '@/store/user'
import { getSealTypes } from '@/services/seal'
import { getMaterials, getFontStyles } from '@/services/seal'
import { getBookings } from '@/services/booking'
import type { SealType, Booking, BookingStatus } from '@/types/models'

const userStore = useUserStore()

const sealTypeList = ref<SealType[]>([])
const allSealTypes = ref<SealType[]>([])
const activeBooking = ref<Booking | null>(null)

// 知识推荐
interface KnowledgeTip {
  tag: string
  title: string
  desc: string
}
const knowledgeTip = ref<KnowledgeTip | null>(null)

// 时段问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  let timeGreeting = '晚上好'
  if (hour >= 6 && hour < 12) timeGreeting = '早上好'
  else if (hour >= 12 && hour < 18) timeGreeting = '下午好'

  if (!userStore.isLoggedIn) return `${timeGreeting}，印友 🖌`
  return `${timeGreeting}，${userStore.userInfo?.nickname || '印友'}`
})

const subGreetingText = computed(() => {
  if (!userStore.isLoggedIn) return '登录后开启印章定制之旅'
  return '方寸之间，尽显风雅'
})

function loadData() {
  // 加载印章类型
  const types = getSealTypes()
  sealTypeList.value = types
  allSealTypes.value = types

  // 加载最新预约
  const userId = userStore.userId || 'default_user'
  const bookings = getBookings(userId)
  const active = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
    .sort((a, b) => b.createdAt - a.createdAt)
  activeBooking.value = active.length > 0 ? active[0] : null

  // 加载知识推荐（随机一条）
  loadKnowledgeTip()
}

function loadKnowledgeTip() {
  const materials = getMaterials()
  const fonts = getFontStyles()

  const tips: KnowledgeTip[] = []

  // 从材质中提取知识
  materials.forEach((mat) => {
    tips.push({
      tag: '材质',
      title: `${mat.name} · ${mat.hardness}`,
      desc: mat.texture
    })
  })

  // 从字体中提取知识
  fonts.forEach((font) => {
    tips.push({
      tag: '字体',
      title: `${font.name} · ${font.style}`,
      desc: font.history.length > 80 ? font.history.slice(0, 80) + '…' : font.history
    })
  })

  if (tips.length > 0) {
    const randomIdx = Math.floor(Math.random() * tips.length)
    knowledgeTip.value = tips[randomIdx]
  } else {
    knowledgeTip.value = null
  }
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

// 获取印章类型名称
function getSealTypeName(sealTypeId: string): string {
  const found = allSealTypes.value.find((s) => s.typeId === sealTypeId)
  return found?.name || '印章定制'
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
function goDesign() {
  uni.switchTab({ url: '/pages/design/index' })
}

function goKnowledgeMaterial() {
  uni.switchTab({ url: '/pages/knowledge/index' })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function goCollection() {
  uni.navigateTo({ url: '/pages/collection/index' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function goKnowledge() {
  uni.switchTab({ url: '/pages/knowledge/index' })
}

function goSealTypeDetail(typeId: string) {
  uni.navigateTo({ url: `/pages/knowledge/seal-type-detail?typeId=${typeId}` })
}

function goBookingDetail(bookingId: string) {
  uni.navigateTo({ url: `/pages/booking/create?bookingId=${bookingId}` })
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
  background: linear-gradient(180deg, #F5E6E6 0%, $bg-page 100%);
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
  border: 4rpx solid #E8C0C0;
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

/* 推荐印章类型横向滚动 */
.seal-scroll {
  white-space: nowrap;
}

.seal-scroll-inner {
  display: flex;
  gap: 20rpx;
  padding-right: 32rpx;
}

.seal-scroll-item {
  width: 340rpx;
  flex-shrink: 0;
}

/* 预约卡片 */
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
  background-color: #F5E6E6;
}

.status-in-progress .booking-status-text {
  color: $primary;
}

/* 知识推荐卡片 */
.knowledge-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 28rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border-left: 6rpx solid $primary;
}

.knowledge-tag {
  display: inline-flex;
  background-color: #F5E6E6;
  border-radius: $radius-sm;
  padding: 4rpx 14rpx;
  margin-bottom: 12rpx;
}

.knowledge-tag-text {
  font-size: 22rpx;
  color: $primary;
  font-weight: 600;
}

.knowledge-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 10rpx;
}

.knowledge-desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
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

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
