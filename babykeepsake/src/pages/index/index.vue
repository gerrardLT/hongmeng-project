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

    <!-- 轮播图区域 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="600"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,107,53,0.3)"
        indicator-active-color="#FF6B35"
      >
        <swiper-item v-for="(item, idx) in bannerList" :key="idx" @click="onBannerClick(item)">
          <view class="banner-item">
            <image class="banner-img" :src="item.image" mode="aspectFill" />
            <view class="banner-overlay">
              <text class="banner-title">{{ item.title }}</text>
              <text class="banner-desc">{{ item.desc }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-item" @click="goExplore">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #FF6B35, #FF8C5A)">
          <text class="entry-icon">🔍</text>
        </view>
        <text class="entry-label">探索纪念品</text>
      </view>
      <view class="entry-item" @click="goBooking">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #FF9800, #FFB74D)">
          <text class="entry-icon">📅</text>
        </view>
        <text class="entry-label">工作室预约</text>
      </view>
      <view class="entry-item" @click="goProgress">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #4CAF50, #81C784)">
          <text class="entry-icon">📋</text>
        </view>
        <text class="entry-label">我的进度</text>
      </view>
      <view class="entry-item" @click="goKnowledge">
        <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #2196F3, #64B5F6)">
          <text class="entry-icon">📖</text>
        </view>
        <text class="entry-label">知识库</text>
      </view>
    </view>

    <!-- 成长里程碑 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">成长里程碑</text>
        <text class="section-more" @click="goTimeline">查看全部 ›</text>
      </view>
      <view v-if="milestones.length > 0" class="milestone-list">
        <MilestoneCard
          v-for="item in milestones.slice(0, 2)"
          :key="item.milestoneId"
          :milestone="item"
          @click="onMilestoneClick(item)"
          @share="onMilestoneShare(item)"
        />
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">🌱</text>
        <text class="empty-text">还没有里程碑记录</text>
        <text class="empty-hint">预约制作纪念品后自动生成</text>
      </view>
    </view>

    <!-- 热门纪念品推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门纪念品</text>
        <text class="section-more" @click="goExplore">更多 ›</text>
      </view>
      <scroll-view class="keepsake-scroll" scroll-x :show-scrollbar="false">
        <view class="keepsake-scroll-inner">
          <view
            v-for="item in popularKeepsakes"
            :key="item.typeId"
            class="keepsake-scroll-item"
          >
            <KeepsakeCard
              :keepsake="item"
              size="compact"
              :showPrice="true"
              @click="goDetail(item.typeId)"
              @preview="onKeepsakePreview(item)"
            />
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import KeepsakeCard from '@/components/KeepsakeCard.vue'
import MilestoneCard from '@/components/MilestoneCard.vue'
import { useUserStore } from '@/store/user'
import { useKeepsakeStore } from '@/store/keepsake'
import { getKeepsakeList } from '@/services/keepsake'
import { getMilestones } from '@/services/milestone'
import type { KeepsakeType, Milestone } from '@/types/models'

const userStore = useUserStore()
const keepsakeStore = useKeepsakeStore()

const popularKeepsakes = ref<KeepsakeType[]>([])
const milestones = ref<Milestone[]>([])

// 轮播数据
const bannerList = ref([
  {
    image: '/static/banner/banner_handprint.jpg',
    title: '手足印相框',
    desc: '记录宝宝最初的印记',
    typeId: 'ks_handprint_frame'
  },
  {
    image: '/static/banner/banner_hair.jpg',
    title: '胎毛画定制',
    desc: '将胎毛融入艺术创作',
    typeId: 'ks_hair_painting'
  },
  {
    image: '/static/banner/banner_tooth.jpg',
    title: '乳牙保存盒',
    desc: '珍藏每一颗脱落的乳牙',
    typeId: 'ks_tooth_box'
  },
  {
    image: '/static/banner/banner_growth.jpg',
    title: '成长时间轴',
    desc: '记录12个月的蜕变',
    typeId: 'ks_growth_timeline'
  }
])

// 欢迎语
const greetingText = computed(() => {
  if (!userStore.isLoggedIn) return '你好，准爸妈 👋'
  const baby = userStore.selectedBaby
  if (baby) return `${baby.name}的成长之旅 ✨`
  return `${userStore.userInfo?.nickname || '爸妈'}好 👋`
})

const subGreetingText = computed(() => {
  if (!userStore.isLoggedIn) return '登录后解锁专属纪念品'
  const baby = userStore.selectedBaby
  if (baby) return '每一次成长都值得被珍藏'
  return '为宝宝定制专属纪念品'
})

function loadData() {
  // 加载热门纪念品
  const list = getKeepsakeList()
  popularKeepsakes.value = list.slice(0, 6)
  keepsakeStore.setKeepsakeTypes(list)

  // 加载里程碑
  const userId = userStore.userId || 'default_user'
  milestones.value = getMilestones(userId)
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

// 轮播点击
function onBannerClick(item: { typeId: string }) {
  uni.navigateTo({ url: `/pages/explore/detail?typeId=${item.typeId}` })
}

// 快捷入口
function goExplore() {
  uni.switchTab({ url: '/pages/explore/index' })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function goProgress() {
  uni.switchTab({ url: '/pages/progress/index' })
}

function goKnowledge() {
  uni.navigateTo({ url: '/pages/knowledge/index' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

// 里程碑
function onMilestoneClick(item: Milestone) {
  uni.navigateTo({ url: `/pages/record/timeline?milestoneId=${item.milestoneId}` })
}

function onMilestoneShare(item: Milestone) {
  uni.navigateTo({ url: `/pages/record/share?milestoneId=${item.milestoneId}` })
}

function goTimeline() {
  uni.navigateTo({ url: '/pages/record/timeline' })
}

// 纪念品
function goDetail(typeId: string) {
  uni.navigateTo({ url: `/pages/explore/detail?typeId=${typeId}` })
}

function onKeepsakePreview(item: KeepsakeType) {
  if (item.photos && item.photos.length > 0) {
    uni.previewImage({
      current: item.photos[0],
      urls: item.photos
    })
  }
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
  background: linear-gradient(180deg, #FFF5F0 0%, $bg-page 100%);
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
  border: 4rpx solid #FFE0CC;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

/* 轮播图 */
.banner-section {
  padding: 16rpx 32rpx 0;
}

.banner-swiper {
  height: 320rpx;
  border-radius: $radius-lg;
  overflow: hidden;
}

.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: $radius-lg;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  background-color: #FFE8DD;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 28rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
}

.banner-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 4rpx;
  display: block;
}

.banner-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  display: block;
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

/* 里程碑列表 */
.milestone-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
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

/* 热门纪念品横向滚动 */
.keepsake-scroll {
  white-space: nowrap;
}

.keepsake-scroll-inner {
  display: flex;
  gap: 20rpx;
  padding-right: 32rpx;
}

.keepsake-scroll-item {
  width: 340rpx;
  flex-shrink: 0;
}

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
