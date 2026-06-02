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
          <text class="placeholder-icon">🖋️</text>
        </view>
      </swiper-item>
    </swiper>

    <scroll-view scroll-y class="detail-scroll">
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
          <view v-if="studio.distance !== undefined" class="distance-badge">
            <text class="distance-text">📍 {{ distanceLabel }}</text>
          </view>
        </view>

        <!-- 地址 -->
        <view class="info-row" @click="onCopyAddress">
          <text class="info-icon">📍</text>
          <text class="info-text">{{ studio.address }}</text>
          <view class="copy-btn">
            <text class="copy-text">复制</text>
          </view>
        </view>

        <!-- 营业时间 -->
        <view class="info-row">
          <text class="info-icon">🕐</text>
          <text class="info-text">{{ studio.businessHours }}</text>
        </view>

        <!-- 电话 -->
        <view class="info-row" @click="onCallPhone">
          <text class="info-icon">📞</text>
          <text class="info-text phone-text">{{ studio.phone }}</text>
          <view class="call-btn">
            <text class="call-text">拨打</text>
          </view>
        </view>
      </view>

      <!-- 师傅介绍 -->
      <view v-if="studio" class="section">
        <text class="section-title">刻印师傅</text>
        <view class="master-card">
          <view class="master-avatar">
            <text class="master-avatar-icon">👨‍🎨</text>
          </view>
          <view class="master-info">
            <text class="master-name">{{ studio.masterName }}</text>
            <view class="master-tags">
              <view
                v-for="(spec, idx) in studio.specialties.slice(0, 4)"
                :key="idx"
                class="master-tag"
              >
                <text class="master-tag-text">{{ specialtyLabel(spec) }}</text>
              </view>
            </view>
          </view>
        </view>
        <text class="description">{{ studio.description }}</text>
      </view>

      <!-- 服务项目 -->
      <view v-if="studio && studio.services.length > 0" class="section">
        <text class="section-title">可定制印章</text>
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

      <!-- 用户评价 -->
      <view v-if="reviews.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">用户评价</text>
          <text class="review-total">{{ studio?.reviewCount }}条</text>
        </view>
        <view
          v-for="(review, idx) in reviews"
          :key="idx"
          class="review-item"
        >
          <view class="review-header">
            <view class="reviewer-avatar">
              <text class="reviewer-initial">{{ review.userName.charAt(0) }}</text>
            </view>
            <view class="reviewer-meta">
              <text class="reviewer-name">{{ review.userName }}</text>
              <view class="review-stars">
                <text
                  v-for="star in 5"
                  :key="star"
                  class="review-star"
                  :class="{ 'review-star-filled': star <= review.rating }"
                >★</text>
              </view>
            </view>
            <text class="review-date">{{ review.date }}</text>
          </view>
          <text class="review-content">{{ review.content }}</text>
        </view>
      </view>

      <!-- 底部留白 -->
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
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudioById, getStudioReviews } from '@/services/studio'
import type { Studio } from '@/types/models'

type SealCategory = 'name' | 'leisure' | 'bookplate' | 'signature' | 'collection'

const SERVICE_LABELS: Record<string, string> = {
  name: '姓名章',
  leisure: '闲章',
  bookplate: '藏书章',
  signature: '签名章',
  collection: '收藏章'
}

const SPECIALTY_LABELS: Record<string, string> = {
  name: '擅长姓名章',
  leisure: '擅长闲章',
  bookplate: '擅长藏书章',
  signature: '擅长签名章',
  collection: '擅长收藏章'
}

const studio = ref<Studio | null>(null)
const reviews = ref<{ userName: string; rating: number; content: string; date: string }[]>([])
const selectMode = ref(false)

const distanceLabel = computed(() => {
  if (!studio.value || studio.value.distance === undefined) return ''
  if (studio.value.distance < 1) {
    return `${Math.round(studio.value.distance * 1000)}m`
  }
  return `${studio.value.distance.toFixed(1)}km`
})

function serviceLabel(svc: string): string {
  return SERVICE_LABELS[svc] || svc
}

function specialtyLabel(spec: string): string {
  return SPECIALTY_LABELS[spec] || spec
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

function onBookStudio() {
  if (!studio.value) return
  if (selectMode.value) {
    uni.$emit('studioSelected', studio.value)
    uni.navigateBack()
  } else {
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
      reviews.value = getStudioReviews(options.studioId)
    } else {
      uni.showToast({ title: '工作室不存在', icon: 'none' })
      uni.navigateBack()
    }
  }
  if (options?.mode === 'select') {
    selectMode.value = true
    uni.setNavigationBarTitle({ title: '选择工作室' })
  }
})
</script>

<style scoped lang="scss">
.studio-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.photo-swiper {
  width: 100%;
  height: 460rpx;
  flex-shrink: 0;
}

.swiper-photo {
  width: 100%;
  height: 460rpx;
  background-color: #F0F0F0;
}

.photo-placeholder {
  width: 100%;
  height: 460rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FDF0F0, #FBF8F5);
}

.placeholder-icon {
  font-size: 100rpx;
}

.detail-scroll {
  flex: 1;
  overflow: hidden;
}

.info-section {
  background-color: $bg-card;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.studio-name {
  font-size: 38rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.rating-row {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
  gap: 8rpx;
}

.stars {
  display: flex;
  margin-right: 8rpx;
}

.star {
  font-size: 28rpx;
  color: $border-color;
}

.star.filled {
  color: #FFB800;
}

.rating-num {
  font-size: 30rpx;
  color: $text-primary;
  font-weight: 700;
  margin-right: 6rpx;
}

.review-count {
  font-size: 24rpx;
  color: $text-hint;
  flex: 1;
}

.distance-badge {
  background-color: #FDF0F0;
  border-radius: $radius-md;
  padding: 4rpx 16rpx;
}

.distance-text {
  font-size: 22rpx;
  color: $primary;
  font-weight: 500;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid $bg-page;
}

.info-row:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 14rpx;
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
  font-weight: 500;
}

.copy-btn {
  padding: 6rpx 20rpx;
  border: 2rpx solid $primary;
  border-radius: $radius-xl;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.copy-text {
  font-size: 22rpx;
  color: $primary;
}

.call-btn {
  padding: 6rpx 20rpx;
  background-color: $primary;
  border-radius: $radius-xl;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.call-text {
  font-size: 22rpx;
  color: #FFFFFF;
}

.section {
  background-color: $bg-card;
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

.section-header .section-title {
  margin-bottom: 0;
}

.review-total {
  font-size: 24rpx;
  color: $text-hint;
}

.master-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-page;
  border-radius: $radius-lg;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.master-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #FDF0F0, #F5E0E0);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.master-avatar-icon {
  font-size: 48rpx;
}

.master-info {
  flex: 1;
}

.master-name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
  display: block;
}

.master-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.master-tag {
  background-color: #FDF0F0;
  border-radius: $radius-md;
  padding: 4rpx 14rpx;
}

.master-tag-text {
  font-size: 22rpx;
  color: $primary;
}

.description {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.8;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.service-tag {
  background-color: #FDF0F0;
  border-radius: $radius-md;
  padding: 12rpx 28rpx;
  border: 1rpx solid rgba(196, 26, 26, 0.2);
}

.service-tag-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

.review-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid $bg-page;
}

.review-item:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.reviewer-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.reviewer-initial {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.reviewer-meta {
  flex: 1;
}

.reviewer-name {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
  margin-bottom: 4rpx;
  display: block;
}

.review-stars {
  display: flex;
}

.review-star {
  font-size: 22rpx;
  color: $border-color;
}

.review-star-filled {
  color: #FFB800;
}

.review-date {
  font-size: 22rpx;
  color: $text-hint;
}

.review-content {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.7;
}

.bottom-spacer {
  height: 160rpx;
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
}

.book-btn {
  width: 100%;
  height: 88rpx;
  border-radius: $radius-xl;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(196, 26, 26, 0.3);
}

.book-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
