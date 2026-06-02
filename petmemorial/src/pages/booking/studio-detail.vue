<template>
  <view class="studio-detail-page">
    <!-- 照片轮播 -->
    <swiper
      class="photo-swiper"
      :indicator-dots="studio && studio.photos.length > 1"
      indicator-color="rgba(255,255,255,0.4)"
      indicator-active-color="#FFFFFF"
      :autoplay="true"
      :circular="true"
      :interval="4000"
    >
      <swiper-item v-for="(photo, idx) in (studio?.photos || [])" :key="idx">
        <image class="swiper-photo" :src="photo" mode="aspectFill" />
      </swiper-item>
      <swiper-item v-if="!studio || studio.photos.length === 0">
        <view class="photo-placeholder">
          <text class="placeholder-icon">🏠</text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 基本信息 -->
    <view v-if="studio" class="info-section">
      <text class="studio-name">{{ studio.name }}</text>

      <!-- 评分 -->
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
        <text class="review-count">({{ studio.reviewCount }}条评价)</text>
      </view>

      <!-- 地址 -->
      <view class="info-row" @click="onCopyAddress">
        <text class="info-icon">📍</text>
        <text class="info-text">{{ studio.address }}</text>
        <text class="copy-btn">复制</text>
      </view>

      <!-- 电话 -->
      <view class="info-row" @click="onCallPhone">
        <text class="info-icon">📞</text>
        <text class="info-text phone-text">{{ studio.phone }}</text>
      </view>

      <!-- 营业时间 -->
      <view class="info-row">
        <text class="info-icon">🕐</text>
        <text class="info-text">{{ studio.businessHours }}</text>
      </view>
    </view>

    <!-- 服务项目 -->
    <view v-if="studio && studio.services.length > 0" class="section">
      <text class="section-title">服务项目</text>
      <view class="tags-wrap">
        <view
          v-for="(svc, idx) in studio.services"
          :key="idx"
          class="service-tag"
        >
          <text class="service-tag-text">{{ serviceLabel(svc) }}</text>
        </view>
      </view>
    </view>

    <!-- 工作室描述 -->
    <view v-if="studio" class="section">
      <text class="section-title">工作室简介</text>
      <text class="description">{{ studio.description }}</text>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-spacer" />

    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <view class="select-btn" @click="onSelectStudio">
        <text class="select-btn-text">选择该工作室</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudioById } from '@/services/studio'
import type { Studio, MemorialCategory } from '@/types/models'

const SERVICE_LABELS: Record<MemorialCategory, string> = {
  pawprint: '爪印相框',
  fur: '毛发纪念品',
  portrait: '宠物肖像画',
  seal: '宠物印章',
  jewelry: '纪念首饰'
}

const studio = ref<Studio | null>(null)
const selectMode = ref(false)

function serviceLabel(category: MemorialCategory): string {
  return SERVICE_LABELS[category] || category
}

function onCopyAddress() {
  if (!studio.value) return
  uni.setClipboardData({
    data: studio.value.address,
    success: () => {
      uni.showToast({ title: '地址已复制', icon: 'success' })
    }
  })
}

function onCallPhone() {
  if (!studio.value) return
  uni.makePhoneCall({ phoneNumber: studio.value.phone })
}

function onSelectStudio() {
  if (!studio.value) return
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (selectMode.value && prevPage) {
    // 返回上一页并传递工作室信息
    uni.$emit('studioSelected', studio.value)
    uni.navigateBack()
  } else {
    // 跳转到新建预约页并预填工作室
    uni.navigateTo({
      url: `/pages/booking/create?studioId=${studio.value.studioId}`
    })
  }
}

onLoad((options) => {
  if (options?.studioId) {
    const detail = getStudioById(options.studioId)
    if (detail) {
      studio.value = detail
    }
  }
  if (options?.mode === 'select') {
    selectMode.value = true
  }
})
</script>

<style scoped lang="scss">
.studio-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: env(safe-area-inset-bottom);
}

.photo-swiper {
  width: 100%;
  height: 480rpx;
}

.swiper-photo {
  width: 100%;
  height: 480rpx;
  background-color: #F0F0F0;
}

.photo-placeholder {
  width: 100%;
  height: 480rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F0F0F0;
}

.placeholder-icon {
  font-size: 100rpx;
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
  margin-right: 8rpx;
}

.review-count {
  font-size: 24rpx;
  color: $text-hint;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $bg-page;
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.5;
}

.phone-text {
  color: $primary;
}

.copy-btn {
  font-size: 24rpx;
  color: $primary;
  padding: 6rpx 20rpx;
  border: 2rpx solid $primary;
  border-radius: $radius-xl;
  flex-shrink: 0;
  margin-left: 16rpx;
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
  background-color: #F3E8FF;
  border-radius: $radius-md;
  padding: 12rpx 28rpx;
}

.service-tag-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.description {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.7;
}

.bottom-spacer {
  height: 140rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-btn {
  width: 100%;
  height: 88rpx;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
