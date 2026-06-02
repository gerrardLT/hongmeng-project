<template>
  <view class="detail-page">
    <!-- 顶部轮播图 -->
    <view class="banner-wrap">
      <swiper
        class="banner-swiper"
        :indicator-dots="photos.length > 1"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#8B5CF6"
        circular
        autoplay
        :interval="3500"
      >
        <swiper-item v-for="(photo, index) in photos" :key="index">
          <image
            class="banner-image"
            :src="photo"
            mode="aspectFill"
          />
        </swiper-item>
        <swiper-item v-if="photos.length === 0">
          <view class="banner-placeholder">
            <text class="banner-placeholder-icon">🎁</text>
          </view>
        </swiper-item>
      </swiper>

      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>

      <!-- 图片计数 -->
      <view v-if="photos.length > 1" class="photo-count">
        <text class="photo-count-text">{{ currentPhotoIndex + 1 }}/{{ photos.length }}</text>
      </view>
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 基本信息 -->
      <view class="section-card">
        <view class="name-row">
          <text class="product-name">{{ memorial?.name }}</text>
          <view class="category-badge">
            <text class="category-text">{{ categoryLabel }}</text>
          </view>
        </view>

        <!-- 价格与周期 -->
        <view class="meta-row">
          <view class="meta-item">
            <text class="meta-icon">💰</text>
            <view class="meta-content">
              <text class="meta-label">价格区间</text>
              <text class="meta-value price-value">{{ memorial?.priceRange }}</text>
            </view>
          </view>
          <view class="meta-divider" />
          <view class="meta-item">
            <text class="meta-icon">⏱</text>
            <view class="meta-content">
              <text class="meta-label">制作周期</text>
              <text class="meta-value">{{ memorial?.duration }}</text>
            </view>
          </view>
        </view>

        <!-- 适合宠物 -->
        <view class="suitable-row">
          <text class="suitable-icon">🐾</text>
          <text class="suitable-text">适合：{{ memorial?.suitablePet }}</text>
        </view>
      </view>

      <!-- 详细描述 -->
      <view class="section-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">产品简介</text>
        </view>
        <text class="desc-text">{{ memorial?.description }}</text>
      </view>

      <!-- 制作工艺 -->
      <view class="section-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">制作工艺</text>
        </view>
        <view class="technique-content">
          <text class="technique-icon">✨</text>
          <text class="technique-text">{{ memorial?.technique }}</text>
        </view>
      </view>

      <!-- 采集方法 -->
      <view class="section-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">采集说明</text>
        </view>
        <view class="collection-notice">
          <view class="notice-header">
            <text class="notice-icon">⚠️</text>
            <text class="notice-title">安全提示</text>
          </view>
          <text class="collection-text">{{ memorial?.collectionMethod }}</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="btn-cases" @click="goCases">
        <text class="btn-cases-text">查看案例</text>
      </view>
      <view class="btn-booking" @click="goBooking">
        <text class="btn-booking-text">立即预约</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMemorialTypeById, getCategoryLabel } from '@/services/memorial'
import type { MemorialType } from '@/types/models'

const memorial = ref<MemorialType | null>(null)
const typeId = ref('')
const currentPhotoIndex = ref(0)

const photos = computed(() => memorial.value?.photos || [])
const categoryLabel = computed(() =>
  memorial.value ? getCategoryLabel(memorial.value.category) : ''
)

onLoad((options) => {
  const id = options?.typeId as string
  if (id) {
    typeId.value = id
    loadData(id)
  }
})

function loadData(id: string) {
  const data = getMemorialTypeById(id)
  memorial.value = data
  if (data) {
    uni.setNavigationBarTitle({ title: data.name })
  }
}

function goBack() {
  uni.navigateBack()
}

function goCases() {
  uni.navigateTo({ url: `/pages/explore/cases?typeId=${typeId.value}` })
}

function goBooking() {
  uni.navigateTo({ url: `/pages/booking/create?typeId=${typeId.value}` })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 轮播图 */
.banner-wrap {
  position: relative;
  width: 100%;
  height: 480rpx;
  flex-shrink: 0;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-image {
  width: 100%;
  height: 100%;
  background-color: #EDE9FE;
}

.banner-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-placeholder-icon {
  font-size: 100rpx;
}

.back-btn {
  position: absolute;
  top: 80rpx;
  left: 24rpx;
  width: 64rpx;
  height: 64rpx;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.back-icon {
  font-size: 44rpx;
  color: $text-primary;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.photo-count {
  position: absolute;
  bottom: 20rpx;
  right: 24rpx;
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 20rpx;
  padding: 4rpx 16rpx;
}

.photo-count-text {
  font-size: 22rpx;
  color: #FFFFFF;
}

/* 内容滚动区 */
.content-scroll {
  flex: 1;
  padding-bottom: 180rpx;
}

/* 通用卡片 */
.section-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 名称行 */
.name-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.product-name {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-primary;
  flex: 1;
  margin-right: 16rpx;
  line-height: 1.3;
}

.category-badge {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-sm;
  padding: 6rpx 18rpx;
  flex-shrink: 0;
  margin-top: 6rpx;
}

.category-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 元信息行 */
.meta-row {
  display: flex;
  align-items: center;
  background-color: #FAFAFA;
  border-radius: $radius-md;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meta-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.meta-content {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 22rpx;
  color: $text-hint;
  margin-bottom: 4rpx;
}

.meta-value {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 600;
}

.price-value {
  color: $primary;
}

.meta-divider {
  width: 2rpx;
  height: 48rpx;
  background-color: $border-color;
  margin: 0 20rpx;
}

/* 适合宠物 */
.suitable-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.suitable-icon {
  font-size: 26rpx;
}

.suitable-text {
  font-size: 26rpx;
  color: $text-secondary;
}

/* section 标题行 */
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.section-accent {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, $primary, $primary-light);
  border-radius: 3rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

/* 描述文字 */
.desc-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.8;
}

/* 制作工艺 */
.technique-content {
  display: flex;
  gap: 12rpx;
  background-color: #F3E8FF;
  border-radius: $radius-md;
  padding: 20rpx;
}

.technique-icon {
  font-size: 28rpx;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.technique-text {
  font-size: 26rpx;
  color: #5B21B6;
  line-height: 1.8;
  flex: 1;
}

/* 采集说明 */
.collection-notice {
  background-color: #FFFBEB;
  border-radius: $radius-md;
  padding: 20rpx;
  border-left: 6rpx solid $warning;
}

.notice-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.notice-icon {
  font-size: 28rpx;
}

.notice-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #92400E;
}

.collection-text {
  font-size: 26rpx;
  color: #78350F;
  line-height: 1.8;
}

/* 底部占位 */
.bottom-placeholder {
  height: 40rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 24rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.btn-cases {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  border: 2rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cases-text {
  font-size: 30rpx;
  color: $primary;
  font-weight: 600;
}

.btn-booking {
  flex: 2;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(139, 92, 246, 0.3);
}

.btn-booking-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 700;
}
</style>
