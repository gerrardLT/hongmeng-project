<template>
  <view class="detail-page">
    <!-- 图片轮播 -->
    <view class="swiper-wrap">
      <swiper
        class="photo-swiper"
        :indicator-dots="sealType && sealType.photos.length > 1"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#FFFFFF"
        :autoplay="true"
        :interval="3000"
        circular
      >
        <swiper-item
          v-for="(photo, idx) in (sealType ? sealType.photos : [''])"
          :key="idx"
        >
          <image
            class="swiper-image"
            :src="photo || '/static/images/default-seal.png'"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>

      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>

      <!-- 图片数量 -->
      <view v-if="sealType && sealType.photos.length > 0" class="photo-count">
        <text class="photo-count-text">{{ sealType.photos.length }} 张图片</text>
      </view>
    </view>

    <!-- 内容区 -->
    <scroll-view class="content-scroll" scroll-y>
      <view v-if="sealType" class="content-wrap">
        <!-- 标题行 -->
        <view class="title-row">
          <text class="type-name">{{ sealType.name }}</text>
          <view class="category-badge">
            <text class="category-badge-text">{{ categoryLabel }}</text>
          </view>
        </view>

        <!-- 价格范围 -->
        <view class="price-row">
          <text class="price-label">参考价格</text>
          <text class="price-value">{{ sealType.priceRange }}</text>
        </view>

        <!-- 分割线 -->
        <view class="divider"></view>

        <!-- 详细描述 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">类型介绍</text>
          </view>
          <text class="section-content">{{ sealType.description }}</text>
        </view>

        <!-- 适用场景 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">适用场景</text>
          </view>
          <view class="usage-wrap">
            <view
              v-for="(scene, idx) in usageScenes"
              :key="idx"
              class="usage-tag"
            >
              <text class="usage-tag-text">{{ scene }}</text>
            </view>
          </view>
        </view>

        <!-- 相关字体推荐 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">推荐字体</text>
          </view>
          <view class="recommend-list">
            <view
              v-for="(font, idx) in recommendFonts"
              :key="idx"
              class="recommend-tag"
              @click="goFontDetail(font.fontId)"
            >
              <text class="recommend-tag-text">{{ font.name }}</text>
              <text class="recommend-tag-style">{{ font.style }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="!sealType && !notFound" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 未找到 -->
      <view v-if="notFound" class="not-found">
        <text class="not-found-icon">🔍</text>
        <text class="not-found-text">未找到该印章类型</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="sealType">
      <view class="bottom-bar-inner">
        <view class="bottom-info">
          <text class="bottom-price">{{ sealType.priceRange }}</text>
          <text class="bottom-hint">可定制专属印章</text>
        </view>
        <view class="design-btn" @click="goDesign">
          <text class="design-btn-text">去设计</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getSealTypeById, getFontStyles } from '@/services/seal'
import type { SealType, SealCategory, FontStyle } from '@/types/models'

const CATEGORY_LABELS: Record<SealCategory, string> = {
  name: '姓名印',
  leisure: '闲章',
  bookplate: '藏书印',
  signature: '签名章',
  collection: '收藏印'
}

const sealType = ref<SealType | null>(null)
const notFound = ref(false)
const allFonts = ref<FontStyle[]>([])

const categoryLabel = computed(() =>
  sealType.value ? (CATEGORY_LABELS[sealType.value.category] || '其他') : ''
)

const usageScenes = computed(() => {
  if (!sealType.value) return []
  return sealType.value.usage.split('、').map(s => s.trim()).filter(Boolean)
})

const recommendFonts = computed(() => {
  if (!sealType.value) return []
  const category = sealType.value.category
  return allFonts.value.filter(f => f.suitableFor.includes(category)).slice(0, 3)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || (currentPage as any).options || {}
  const typeId = options.typeId as string

  if (!typeId) {
    notFound.value = true
    return
  }

  const result = getSealTypeById(typeId)
  if (result) {
    sealType.value = result
  } else {
    notFound.value = true
  }

  allFonts.value = getFontStyles()
})

function goBack() {
  uni.navigateBack()
}

function goDesign() {
  const typeId = sealType.value?.typeId || ''
  uni.switchTab({ url: '/pages/design/index' })
}

function goFontDetail(fontId: string) {
  uni.navigateTo({ url: `/pages/knowledge/font-detail?fontId=${fontId}` })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 轮播 */
.swiper-wrap {
  width: 100%;
  height: 560rpx;
  position: relative;
  flex-shrink: 0;
}

.photo-swiper {
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
  background-color: #F0EBE8;
}

.back-btn {
  position: absolute;
  top: 88rpx;
  left: 32rpx;
  width: 72rpx;
  height: 72rpx;
  background-color: rgba(0, 0, 0, 0.35);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.back-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  line-height: 1;
  margin-top: -4rpx;
}

.photo-count {
  position: absolute;
  bottom: 24rpx;
  right: 32rpx;
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
}

.photo-count-text {
  font-size: 22rpx;
  color: #FFFFFF;
}

/* 内容滚动 */
.content-scroll {
  flex: 1;
  height: 0;
}

.content-wrap {
  padding: 32rpx 32rpx 0;
}

/* 标题行 */
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.type-name {
  font-size: 44rpx;
  font-weight: 800;
  color: $text-primary;
  letter-spacing: 2rpx;
}

.category-badge {
  background: linear-gradient(135deg, #C41A1A, #E53030);
  border-radius: 20rpx;
  padding: 8rpx 24rpx;
}

.category-badge-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 价格 */
.price-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.price-label {
  font-size: 24rpx;
  color: $text-hint;
}

.price-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #C41A1A;
}

/* 分割线 */
.divider {
  height: 2rpx;
  background-color: #F0E8E8;
  margin-bottom: 28rpx;
}

/* 内容块 */
.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.section-dot {
  width: 8rpx;
  height: 32rpx;
  background-color: #C41A1A;
  border-radius: 4rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-content {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
  text-align: justify;
}

/* 场景标签 */
.usage-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.usage-tag {
  background-color: #FDF0F0;
  border: 1rpx solid #F0C8C8;
  border-radius: $radius-md;
  padding: 10rpx 28rpx;
}

.usage-tag-text {
  font-size: 24rpx;
  color: #C41A1A;
  font-weight: 500;
}

/* 推荐字体 */
.recommend-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.recommend-tag {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 16rpx 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  min-width: 120rpx;
}

.recommend-tag-text {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.recommend-tag-style {
  font-size: 20rpx;
  color: $text-hint;
}

/* 底部占位 */
.bottom-placeholder {
  height: 200rpx;
}

/* 加载/未找到 */
.loading-state,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: $text-hint;
}

.not-found-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.not-found-text {
  font-size: 28rpx;
  color: $text-hint;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top: 1rpx solid #F0E8E8;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.bottom-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bottom-info {
  display: flex;
  flex-direction: column;
}

.bottom-price {
  font-size: 32rpx;
  font-weight: 700;
  color: #C41A1A;
}

.bottom-hint {
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 4rpx;
}

.design-btn {
  background: linear-gradient(135deg, #C41A1A, #E53030);
  border-radius: 48rpx;
  padding: 22rpx 64rpx;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.35);
}

.design-btn-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}
</style>
