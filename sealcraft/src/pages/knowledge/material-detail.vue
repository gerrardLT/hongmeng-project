<template>
  <view class="detail-page">
    <!-- 材质大图 -->
    <view class="hero-wrap">
      <swiper
        class="hero-swiper"
        :indicator-dots="material && material.photos.length > 1"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="#FFFFFF"
        :autoplay="true"
        :interval="3500"
        circular
      >
        <swiper-item
          v-for="(photo, idx) in (material ? material.photos : [''])"
          :key="idx"
        >
          <image
            class="hero-image"
            :src="photo || '/static/images/default-material.png'"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>

      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>

      <!-- 材质名称浮层 -->
      <view v-if="material" class="name-overlay">
        <text class="overlay-name">{{ material.name }}</text>
        <text class="overlay-price">{{ material.priceRange }}</text>
      </view>
    </view>

    <!-- 内容滚动 -->
    <scroll-view class="content-scroll" scroll-y>
      <view v-if="material" class="content-wrap">

        <!-- 特点标签 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">材质特点</text>
          </view>
          <view class="features-wrap">
            <view
              v-for="(feature, idx) in material.features"
              :key="idx"
              class="feature-chip"
            >
              <text class="feature-chip-text">{{ feature }}</text>
            </view>
          </view>
        </view>

        <!-- 物理参数 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">物理参数</text>
          </view>
          <view class="params-card">
            <view class="param-row">
              <text class="param-label">硬度</text>
              <text class="param-value">{{ material.hardness }}</text>
            </view>
            <view class="param-divider"></view>
            <view class="param-row">
              <text class="param-label">质感</text>
              <text class="param-value flex-value">{{ material.texture }}</text>
            </view>
          </view>
        </view>

        <!-- 价格范围 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">价格范围</text>
          </view>
          <view class="price-banner">
            <text class="price-main">{{ material.priceRange }}</text>
            <text class="price-note">价格因工艺复杂度及材质品质浮动</text>
          </view>
        </view>

        <!-- 适用印章类型 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">适用印章类型</text>
          </view>
          <view class="suitable-list">
            <view
              v-for="(type, idx) in suitableLabels"
              :key="idx"
              class="suitable-item"
              @click="goSealTypeByCategory(material.suitableFor[idx])"
            >
              <text class="suitable-icon">🔖</text>
              <text class="suitable-text">{{ type }}</text>
              <text class="suitable-arrow">›</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载/未找到 -->
      <view v-if="!material && !notFound" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="notFound" class="not-found">
        <text class="not-found-icon">🔍</text>
        <text class="not-found-text">未找到该材质信息</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="material">
      <view class="bottom-bar-inner">
        <view class="bottom-info">
          <text class="bottom-name">{{ material.name }}</text>
          <text class="bottom-price">{{ material.priceRange }}</text>
        </view>
        <view class="select-btn" @click="goDesignWithMaterial">
          <text class="select-btn-text">选择此材质</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMaterialById } from '@/services/seal'
import type { Material, SealCategory } from '@/types/models'

const CATEGORY_LABELS: Record<SealCategory, string> = {
  name: '姓名印',
  leisure: '闲章',
  bookplate: '藏书印',
  signature: '签名章',
  collection: '收藏印'
}

const material = ref<Material | null>(null)
const notFound = ref(false)

const suitableLabels = computed(() => {
  if (!material.value) return []
  return material.value.suitableFor.map(
    (cat) => CATEGORY_LABELS[cat as SealCategory] || cat
  )
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || (currentPage as any).options || {}
  const materialId = options.materialId as string

  if (!materialId) {
    notFound.value = true
    return
  }

  const result = getMaterialById(materialId)
  if (result) {
    material.value = result
  } else {
    notFound.value = true
  }
})

function goBack() {
  uni.navigateBack()
}

function goDesignWithMaterial() {
  const materialId = material.value?.materialId || ''
  uni.switchTab({ url: '/pages/design/index' })
}

function goSealTypeByCategory(category: string) {
  uni.navigateTo({ url: `/pages/knowledge/index` })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 大图区 */
.hero-wrap {
  width: 100%;
  height: 520rpx;
  position: relative;
  flex-shrink: 0;
}

.hero-swiper {
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  background-color: #EDE8E2;
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

.name-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  padding: 48rpx 32rpx 32rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.overlay-name {
  font-size: 48rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 4rpx;
}

.overlay-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFD700;
}

/* 内容区 */
.content-scroll {
  flex: 1;
  height: 0;
}

.content-wrap {
  padding: 32rpx 32rpx 0;
}

/* 内容块 */
.section {
  margin-bottom: 36rpx;
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

/* 特点标签 */
.features-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.feature-chip {
  background: linear-gradient(135deg, #FDF0F0, #FBE8E8);
  border: 1rpx solid #F0C8C8;
  border-radius: $radius-lg;
  padding: 12rpx 32rpx;
}

.feature-chip-text {
  font-size: 24rpx;
  color: #C41A1A;
  font-weight: 500;
}

/* 参数卡片 */
.params-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 0 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.param-row {
  display: flex;
  align-items: flex-start;
  padding: 28rpx 0;
}

.param-divider {
  height: 1rpx;
  background-color: #F0E8E8;
  margin: 0;
}

.param-label {
  font-size: 26rpx;
  color: $text-hint;
  width: 80rpx;
  flex-shrink: 0;
  padding-top: 2rpx;
}

.param-value {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 500;
  flex: 1;
  line-height: 1.6;
}

.flex-value {
  text-align: justify;
}

/* 价格横幅 */
.price-banner {
  background: linear-gradient(135deg, #C41A1A, #8B1010);
  border-radius: $radius-lg;
  padding: 32rpx 40rpx;
  display: flex;
  flex-direction: column;
}

.price-main {
  font-size: 40rpx;
  font-weight: 800;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.price-note {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 适用类型列表 */
.suitable-list {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.suitable-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #F7F2F2;
}

.suitable-item:last-child {
  border-bottom: none;
}

.suitable-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.suitable-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-secondary;
  font-weight: 500;
}

.suitable-arrow {
  font-size: 32rpx;
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

.bottom-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
}

.bottom-price {
  font-size: 26rpx;
  color: #C41A1A;
  margin-top: 4rpx;
  font-weight: 600;
}

.select-btn {
  background: linear-gradient(135deg, #C41A1A, #E53030);
  border-radius: 48rpx;
  padding: 22rpx 56rpx;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.35);
}

.select-btn-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFFFFF;
  letter-spacing: 2rpx;
}
</style>
