<template>
  <view class="studio-detail-page">
    <scroll-view scroll-y class="main-scroll">
      <!-- 顶部轮播 -->
      <swiper
        class="photo-swiper"
        indicator-dots
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#FFFFFF"
        autoplay
        circular
      >
        <swiper-item v-for="(photo, idx) in studio?.photos || []" :key="idx">
          <image class="swiper-img" :src="photo" mode="aspectFill" />
        </swiper-item>
        <swiper-item v-if="!studio?.photos || studio.photos.length === 0">
          <image class="swiper-img" src="/static/images/default-studio.png" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <!-- 基本信息 -->
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

        <view class="info-item">
          <text class="info-icon">📍</text>
          <text class="info-text">{{ studio.address }}</text>
        </view>

        <view class="info-item">
          <text class="info-icon">🕐</text>
          <text class="info-text">{{ studio.businessHours }}</text>
        </view>

        <view class="info-item" @click="onCallPhone">
          <text class="info-icon">📞</text>
          <text class="info-text phone-text">{{ studio.phone }}</text>
        </view>
      </view>

      <!-- 服务项目 -->
      <view v-if="studio && studio.services.length > 0" class="section">
        <text class="section-title">服务项目</text>
        <view class="tags-wrap">
          <view v-for="(svc, idx) in studio.services" :key="idx" class="service-tag">
            <text class="tag-text">{{ svc }}</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮区 -->
      <view class="action-section">
        <view class="action-btn call-action" @click="onCallPhone">
          <text class="action-icon">📞</text>
          <text class="action-label">拨打电话</text>
        </view>
        <view class="action-btn nav-action" @click="onNavigate">
          <text class="action-icon">🧭</text>
          <text class="action-label">导航到店</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <view class="book-btn" @click="onBookStudio">
        <text class="book-btn-text">预约此工作室</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudioDetail } from '@/services/studio'
import type { Studio } from '@/types/models'

const studio = ref<Studio | null>(null)
const studioId = ref('')

onLoad((options) => {
  if (options?.studioId) {
    studioId.value = options.studioId
  }
})

onMounted(() => {
  if (studioId.value) {
    studio.value = getStudioDetail(studioId.value)
  }
})

function onCallPhone() {
  if (!studio.value) return
  uni.makePhoneCall({ phoneNumber: studio.value.phone })
}

function onNavigate() {
  if (!studio.value) return
  uni.openLocation({
    latitude: studio.value.location.latitude,
    longitude: studio.value.location.longitude,
    name: studio.value.name,
    address: studio.value.address
  })
}

function onBookStudio() {
  if (!studio.value) return
  uni.navigateTo({
    url: `/pages/booking/create?studioId=${studio.value.studioId}`
  })
}
</script>

<style scoped lang="scss">
.studio-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.main-scroll {
  flex: 1;
  overflow: hidden;
}

.photo-swiper {
  width: 100%;
  height: 440rpx;
}

.swiper-img {
  width: 100%;
  height: 100%;
  background-color: #F0F0F0;
}

.info-section {
  background-color: $bg-card;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.studio-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.rating-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
}

.stars {
  display: flex;
  flex-direction: row;
  margin-right: 12rpx;
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

.info-item {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  margin-top: 2rpx;
}

.info-text {
  font-size: 28rpx;
  color: $text-secondary;
  flex: 1;
  line-height: 1.5;
}

.phone-text {
  color: $primary;
}

.section {
  background-color: $bg-card;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.service-tag {
  background-color: #FFF3ED;
  border-radius: $radius-md;
  padding: 12rpx 24rpx;
}

.tag-text {
  font-size: 26rpx;
  color: $primary;
}

.action-section {
  background-color: $bg-card;
  padding: 32rpx;
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28rpx 0;
  border-radius: $radius-lg;
  border: 2rpx solid $border-color;
}

.call-action {
  background-color: #FFF8F5;
  border-color: #FFD4C2;
}

.nav-action {
  background-color: #F0F7FF;
  border-color: #C2D9FF;
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.action-label {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 500;
}

.bottom-spacer {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $bg-card;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.book-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-xl;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-btn-text {
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
