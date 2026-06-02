<template>
  <view class="home-page">
    <!-- 顶部搜索栏（点击跳转探索页） -->
    <view class="search-bar" @click="goExplore">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索工作室或项目...</text>
      </view>
    </view>

    <!-- Banner 区域 -->
    <view class="banner-section">
      <swiper
        class="banner-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="600"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,107,107,0.35)"
        indicator-active-color="#FF6B6B"
      >
        <swiper-item v-for="(item, idx) in bannerList" :key="idx">
          <view class="banner-item">
            <image class="banner-img" :src="item.image" mode="aspectFill" />
            <view class="banner-overlay">
              <text class="banner-tag">{{ item.tag }}</text>
              <text class="banner-title">{{ item.title }}</text>
              <text class="banner-desc">{{ item.desc }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 附近工作室推荐 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">附近工作室</text>
        </view>
        <text class="section-more" @click="goExplore">更多 ›</text>
      </view>
      <scroll-view class="studio-scroll" scroll-x :show-scrollbar="false">
        <view class="studio-scroll-inner">
          <view
            v-for="item in nearbyStudios"
            :key="item.studioId"
            class="studio-scroll-item"
            @click="goStudioDetail(item.studioId)"
          >
            <view class="studio-mini-card">
              <view class="studio-mini-photo-wrap">
                <image
                  class="studio-mini-photo"
                  :src="item.photos && item.photos.length > 0 ? item.photos[0] : '/static/images/default-studio.png'"
                  mode="aspectFill"
                />
                <view class="studio-mini-distance" v-if="item.distance !== undefined">
                  <text class="distance-text">{{ formatDistance(item.distance) }}</text>
                </view>
              </view>
              <view class="studio-mini-info">
                <text class="studio-mini-name">{{ item.name }}</text>
                <view class="studio-mini-rating">
                  <text class="star-text">★</text>
                  <text class="rating-val">{{ item.rating.toFixed(1) }}</text>
                </view>
                <text class="studio-mini-price">{{ item.priceRange }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 热门项目推荐 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">热门项目</text>
        </view>
        <text class="section-more" @click="goExplore">更多 ›</text>
      </view>
      <view v-if="hotProjects.length > 0" class="project-grid">
        <view
          v-for="item in hotProjects"
          :key="item.projectId"
          class="project-grid-item"
          @click="goProjectDetail(item.projectId)"
        >
          <ProjectCard :project="item" @click="goProjectDetail(item.projectId)" />
        </view>
      </view>
      <view v-else class="empty-section">
        <text class="empty-icon-text">🔥</text>
        <text class="empty-text">暂无热门项目</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">快捷入口</text>
        </view>
      </view>
      <view class="quick-entry">
        <view class="entry-item" @click="goBooking">
          <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #FF6B6B, #FF8E8E)">
            <text class="entry-icon">📅</text>
          </view>
          <text class="entry-label">我的预约</text>
        </view>
        <view class="entry-item" @click="goArtwork">
          <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #4ECDC4, #6FE3DC)">
            <text class="entry-icon">🎨</text>
          </view>
          <text class="entry-label">我的作品</text>
        </view>
        <view class="entry-item" @click="goExplore">
          <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #FFB347, #FFC97A)">
            <text class="entry-icon">🔍</text>
          </view>
          <text class="entry-label">探索更多</text>
        </view>
        <view class="entry-item" @click="goProfile">
          <view class="entry-icon-wrap" style="background: linear-gradient(135deg, #A29BFE, #B8B3FF)">
            <text class="entry-icon">👤</text>
          </view>
          <text class="entry-label">个人中心</text>
        </view>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import ProjectCard from '@/components/ProjectCard.vue'
import { getStudioList } from '@/services/studio'
import { getHotProjects } from '@/services/project'
import type { Studio, Project } from '@/types/models'

const nearbyStudios = ref<Studio[]>([])
const hotProjects = ref<Project[]>([])

// Banner 数据
const bannerList = ref([
  {
    image: '/static/images/banner_glass.png',
    tag: '亲手体验',
    title: '烧玻璃艺术体验',
    desc: '从熔融到成型，感受玻璃的灵动之美'
  },
  {
    image: '/static/images/banner_ring.png',
    tag: '热门推荐',
    title: '琉璃戒指工作坊',
    desc: '亲手制作独一无二的专属饰品'
  },
  {
    image: '/static/images/banner_studio.png',
    tag: '精选工作室',
    title: '附近工作室探索',
    desc: '发现身边的玻璃艺术空间'
  }
])

async function loadData() {
  try {
    const [studios, projects] = await Promise.all([
      getStudioList(),
      getHotProjects()
    ])
    nearbyStudios.value = studios.slice(0, 4)
    hotProjects.value = projects
  } catch (e) {
    console.error('loadData error:', e)
  }
}

onShow(() => {
  loadData()
})

function formatDistance(dist: number): string {
  if (dist < 1) return `${Math.round(dist * 1000)}m`
  return `${dist.toFixed(1)}km`
}

function goExplore() {
  uni.switchTab({ url: '/pages/explore/index' })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function goArtwork() {
  uni.switchTab({ url: '/pages/artwork/index' })
}

function goProfile() {
  uni.switchTab({ url: '/pages/profile/index' })
}

function goStudioDetail(studioId: string) {
  uni.navigateTo({ url: `/pages/explore/studio-detail?studioId=${studioId}` })
}

function goProjectDetail(projectId: string) {
  uni.navigateTo({ url: `/pages/explore/project-detail?projectId=${projectId}` })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-bar {
  padding: 20rpx 32rpx 16rpx;
  background: linear-gradient(180deg, #FFF0F0 0%, $bg-page 100%);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  background-color: $bg-card;
  border-radius: 36rpx;
  padding: 0 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 107, 107, 0.08);
  border: 1rpx solid rgba(255, 107, 107, 0.12);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: $text-hint;
}

/* Banner */
.banner-section {
  padding: 4rpx 32rpx 0;
}

.banner-swiper {
  height: 340rpx;
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
  background: linear-gradient(135deg, #FFE0E0, #E0F7F5);
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 28rpx 32rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.banner-tag {
  display: inline-block;
  font-size: 20rpx;
  font-weight: 600;
  color: #FFFFFF;
  background-color: #FF6B6B;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 10rpx;
}

.banner-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 6rpx;
}

.banner-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  display: block;
}

/* 通用 Section */
.section {
  padding: 28rpx 32rpx 4rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-accent {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #FF6B6B, #4ECDC4);
  border-radius: 3rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-more {
  font-size: 26rpx;
  color: #FF6B6B;
  font-weight: 500;
}

/* 工作室横向滚动 */
.studio-scroll {
  white-space: nowrap;
  margin-left: -32rpx;
  margin-right: -32rpx;
  padding: 0 32rpx;
}

.studio-scroll-inner {
  display: inline-flex;
  gap: 20rpx;
  padding-right: 64rpx;
}

.studio-scroll-item {
  flex-shrink: 0;
  width: 260rpx;
}

.studio-mini-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.studio-mini-photo-wrap {
  position: relative;
  width: 100%;
  height: 200rpx;
}

.studio-mini-photo {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.studio-mini-distance {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20rpx;
  padding: 4rpx 12rpx;
}

.distance-text {
  font-size: 20rpx;
  color: #FFFFFF;
}

.studio-mini-info {
  padding: 16rpx 16rpx 18rpx;
}

.studio-mini-name {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.studio-mini-rating {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.star-text {
  font-size: 22rpx;
  color: #FFB800;
  margin-right: 4rpx;
}

.rating-val {
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 600;
}

.studio-mini-price {
  font-size: 22rpx;
  color: #FF6B6B;
  font-weight: 500;
}

/* 热门项目网格 */
.project-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.project-grid-item {
  width: calc(50% - 10rpx);
}

/* 快捷入口 */
.quick-entry {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0 0;
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
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.entry-icon {
  font-size: 40rpx;
}

.entry-label {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 500;
}

/* 空状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
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
}

/* 安全区域 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
