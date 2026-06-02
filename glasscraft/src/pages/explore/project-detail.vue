<template>
  <view class="project-detail-page">
    <!-- 顶部轮播图 -->
    <view v-if="project && project.photos.length > 0" class="swiper-section">
      <swiper
        class="project-swiper"
        :autoplay="true"
        :interval="4000"
        :duration="600"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#FF6B6B"
      >
        <swiper-item v-for="(photo, idx) in project.photos" :key="idx">
          <image class="swiper-img" :src="photo" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 项目信息 -->
    <view v-if="project" class="info-section">
      <view class="info-header">
        <text class="project-name">{{ project.name }}</text>
        <DifficultyTag :level="project.difficulty" />
      </view>

      <view class="meta-row">
        <text class="price">¥{{ project.price }}</text>
        <text class="duration">⏱ {{ project.duration }}分钟</text>
      </view>

      <view class="suitable-row">
        <text class="suitable-label">适合人群：</text>
        <text class="suitable-value">{{ project.suitableFor }}</text>
      </view>

      <view class="desc-row">
        <text class="desc-text">{{ project.description }}</text>
      </view>
    </view>

    <!-- 制作流程 -->
    <view v-if="project && project.process.length > 0" class="process-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">制作流程</text>
        </view>
      </view>

      <view class="process-list">
        <view
          v-for="(step, idx) in project.process"
          :key="idx"
          class="process-item"
        >
          <view class="process-num-wrap">
            <text class="process-num">{{ idx + 1 }}</text>
          </view>
          <view class="process-content">
            <text class="process-text">{{ step }}</text>
          </view>
          <view v-if="idx < project.process.length - 1" class="process-line"></view>
        </view>
      </view>
    </view>

    <!-- 可选款式 -->
    <view v-if="project" class="style-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">可选款式</text>
        </view>
      </view>

      <!-- 颜色 -->
      <view v-if="project.colors.length > 0" class="style-sub-section">
        <text class="style-sub-title">可选颜色</text>
        <view class="color-grid">
          <view
            v-for="(color, idx) in project.colors"
            :key="idx"
            class="color-item"
          >
            <view class="color-block" :style="{ backgroundColor: mapColor(color) }"></view>
            <text class="color-name">{{ color }}</text>
          </view>
        </view>
      </view>

      <!-- 形状 -->
      <view v-if="project.shapes.length > 0" class="style-sub-section">
        <text class="style-sub-title">可选形状</text>
        <view class="shape-list">
          <view
            v-for="(shape, idx) in project.shapes"
            :key="idx"
            class="shape-item"
          >
            <text class="shape-text">{{ shape }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <view class="bottom-inner">
        <view class="style-btn" @click="goStyleChoose">
          <text class="style-btn-text">选择款式</text>
        </view>
        <view class="booking-btn" @click="goBooking">
          <text class="booking-btn-text">立即预约</text>
        </view>
      </view>
      <view class="safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import DifficultyTag from '@/components/DifficultyTag.vue'
import { getProjectDetail } from '@/services/project'
import type { Project } from '@/types/models'

const project = ref<Project | null>(null)

const colorMap: Record<string, string> = {
  '琥珀金': '#D4A017',
  '深海蓝': '#1E3A5F',
  '樱花粉': '#FFB7C5',
  '翡翠绿': '#50C878',
  '透明色': '#E8F4F8',
  '彩虹渐变': 'linear-gradient(90deg, #FF6B6B, #FFD93D, #4ECDC4)',
  '日落橙红': '#FF7043',
  '海洋蓝绿': '#26A69A',
  '紫罗兰': '#9C27B0',
  '冰透白': '#F0F8FF',
  '香槟金': '#F7E7CE',
  '玫瑰粉': '#E91E63',
  '夜空蓝': '#1A237E',
  '磨砂白': '#F5F5F5',
  '渐变蓝': '#42A5F5',
  '琥珀黄': '#FFC107',
  '深蓝星空': '#0D1B2A',
  '紫色星云': '#7B1FA2',
  '银河银白': '#C0C0C0',
  '极光绿': '#69F0AE',
  '翡翠绿': '#2E7D32',
  '粉边绿': '#A5D6A7',
  '蓝灰': '#78909C',
  '果冻色': '#FFCCBC',
  '浅蓝': '#81D4FA',
  '淡紫': '#CE93D8',
  '薄荷绿': '#B2DFDB',
  '朱砂红': '#D32F2F',
  '孔雀蓝': '#00838F',
  '墨玉黑': '#212121'
}

function mapColor(name: string): string {
  return colorMap[name] || '#E0E0E0'
}

async function loadData(projectId: string) {
  try {
    const res = await getProjectDetail(projectId)
    project.value = res
  } catch (e) {
    console.error('load project detail error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function goStyleChoose() {
  if (!project.value) return
  uni.navigateTo({
    url: `/pages/explore/style-choose?projectId=${project.value.projectId}`
  })
}

function goBooking() {
  if (!project.value) return
  uni.navigateTo({
    url: `/pages/booking/create?projectId=${project.value.projectId}&studioId=${project.value.studioId}`
  })
}

onLoad((options) => {
  const projectId = options?.projectId as string
  if (projectId) {
    loadData(projectId)
  }
})
</script>

<style scoped lang="scss">
.project-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 轮播图 */
.swiper-section {
  width: 100%;
}

.project-swiper {
  height: 420rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

/* 项目信息 */
.info-section {
  background-color: $bg-card;
  margin: 24rpx 32rpx;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.project-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.price {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.duration {
  font-size: 26rpx;
  color: $text-hint;
}

.suitable-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 16rpx;
}

.suitable-label {
  font-size: 26rpx;
  color: $text-secondary;
  flex-shrink: 0;
}

.suitable-value {
  font-size: 26rpx;
  color: $text-primary;
}

.desc-row {
  margin-top: 8rpx;
}

.desc-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* 制作流程 */
.process-section {
  margin: 24rpx 32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
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

.process-list {
  display: flex;
  flex-direction: column;
}

.process-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  padding-bottom: 24rpx;
}

.process-num-wrap {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.process-num {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.process-content {
  flex: 1;
  padding-top: 6rpx;
}

.process-text {
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.5;
}

.process-line {
  position: absolute;
  left: 23rpx;
  top: 48rpx;
  bottom: 0;
  width: 2rpx;
  background-color: $border-color;
}

/* 可选款式 */
.style-section {
  margin: 24rpx 32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.style-sub-section {
  margin-bottom: 24rpx;
}

.style-sub-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.color-block {
  width: 72rpx;
  height: 72rpx;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
}

.color-name {
  font-size: 22rpx;
  color: $text-secondary;
}

.shape-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.shape-item {
  padding: 12rpx 28rpx;
  background-color: #FFF5F5;
  border-radius: 28rpx;
  border: 1rpx solid rgba(255, 107, 107, 0.2);
}

.shape-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

/* 底部占位 */
.bottom-placeholder {
  height: 160rpx;
}

/* 底部固定栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
  z-index: 100;
}

.bottom-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 32rpx;
  gap: 20rpx;
}

.style-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  border-radius: 42rpx;
  border: 2rpx solid $primary;
  background-color: #FFFFFF;
}

.style-btn-text {
  font-size: 28rpx;
  color: $primary;
  font-weight: 600;
}

.booking-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.booking-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
