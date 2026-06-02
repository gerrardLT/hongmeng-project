<template>
  <view class="studio-detail-page">
    <!-- 顶部轮播图 -->
    <view v-if="studio && studio.photos.length > 0" class="swiper-section">
      <swiper
        class="studio-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="600"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#FF6B6B"
      >
        <swiper-item v-for="(photo, idx) in studio.photos" :key="idx">
          <image class="swiper-img" :src="photo" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 信息区 -->
    <view v-if="studio" class="info-section">
      <text class="studio-name">{{ studio.name }}</text>

      <view class="rating-row">
        <view class="stars">
          <text
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ filled: star <= Math.round(studio.rating) }"
          >★</text>
        </view>
        <text class="rating-num">{{ studio.rating.toFixed(1) }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">价格</text>
        <text class="info-value price-value">{{ studio.priceRange }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">营业</text>
        <text class="info-value">{{ studio.businessHours }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">地址</text>
        <text class="info-value">{{ studio.address }}</text>
      </view>

      <view class="info-row">
        <text class="info-label">电话</text>
        <text class="info-value">{{ studio.phone }}</text>
      </view>

      <view class="info-row description-row">
        <text class="info-label">简介</text>
        <text class="info-value description-text">{{ studio.description }}</text>
      </view>

      <view class="phone-btn-wrap">
        <view class="phone-btn" @click="makePhoneCall">
          <text class="phone-icon">📞</text>
          <text class="phone-text">拨打电话</text>
        </view>
      </view>
    </view>

    <!-- 项目列表 -->
    <view v-if="projectList.length > 0" class="projects-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">项目列表</text>
        </view>
      </view>

      <view class="project-grid">
        <view
          v-for="item in enrichedProjects"
          :key="item.projectId"
          class="project-grid-item"
          @click="goProjectDetail(item.projectId)"
        >
          <ProjectCard :project="item" />
        </view>
      </view>
    </view>

    <view v-else-if="studio" class="empty-projects">
      <text class="empty-icon">🛠</text>
      <text class="empty-text">暂无项目</text>
    </view>

    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ProjectCard from '@/components/ProjectCard.vue'
import { getStudioDetail, getStudioProjects } from '@/services/studio'
import type { Studio, Project } from '@/types/models'

const studio = ref<Studio | null>(null)
const projectList = ref<Project[]>([])

const enrichedProjects = computed(() => {
  return projectList.value.map((p) => ({
    ...p,
    photo: p.photos && p.photos.length > 0 ? p.photos[0] : '/static/images/default-project.png'
  }))
})

async function loadData(studioId: string) {
  try {
    const [studioRes, projectsRes] = await Promise.all([
      getStudioDetail(studioId),
      getStudioProjects(studioId)
    ])
    studio.value = studioRes
    projectList.value = projectsRes
  } catch (e) {
    console.error('load studio detail error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function makePhoneCall() {
  if (!studio.value) return
  uni.makePhoneCall({
    phoneNumber: studio.value.phone
  })
}

function goProjectDetail(projectId: string) {
  uni.navigateTo({ url: `/pages/explore/project-detail?projectId=${projectId}` })
}

onLoad((options) => {
  const studioId = options?.studioId as string
  if (studioId) {
    loadData(studioId)
  }
})
</script>

<style scoped lang="scss">
.studio-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 轮播图 */
.swiper-section {
  width: 100%;
}

.studio-swiper {
  height: 420rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

/* 信息区 */
.info-section {
  background-color: $bg-card;
  margin: 24rpx 32rpx;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.studio-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.rating-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.stars {
  display: flex;
  margin-right: 10rpx;
}

.star {
  font-size: 28rpx;
  color: $border-color;
}

.star.filled {
  color: #FFB800;
}

.rating-num {
  font-size: 28rpx;
  color: $text-secondary;
  font-weight: 600;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.info-label {
  width: 80rpx;
  font-size: 26rpx;
  color: $text-hint;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.5;
}

.price-value {
  color: $primary;
  font-weight: 700;
}

.description-row {
  margin-bottom: 24rpx;
}

.description-text {
  color: $text-secondary;
  line-height: 1.6;
}

.phone-btn-wrap {
  display: flex;
  justify-content: center;
  margin-top: 8rpx;
}

.phone-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary, $primary-light);
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
  gap: 12rpx;
}

.phone-icon {
  font-size: 28rpx;
}

.phone-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 项目列表 */
.projects-section {
  padding: 8rpx 32rpx 0;
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

.project-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.project-grid-item {
  width: calc(50% - 10rpx);
}

.empty-projects {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: $text-secondary;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
