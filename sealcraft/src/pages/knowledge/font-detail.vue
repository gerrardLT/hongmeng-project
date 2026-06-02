<template>
  <view class="detail-page">
    <!-- 顶部字体展示区 -->
    <view class="hero-section">
      <!-- 返回按钮 -->
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>

      <view v-if="font" class="hero-content">
        <view class="hero-title-row">
          <text class="font-name-large">{{ font.name }}</text>
          <view class="style-badge">
            <text class="style-badge-text">{{ font.style }}</text>
          </view>
        </view>

        <!-- 大号示例文字 -->
        <view class="sample-area">
          <text class="sample-text">{{ font.sampleText }}</text>
          <text class="sample-label">示例文字</text>
        </view>
      </view>
    </view>

    <!-- 内容滚动 -->
    <scroll-view class="content-scroll" scroll-y>
      <view v-if="font" class="content-wrap">

        <!-- 效果图片展示 -->
        <view v-if="font.photos && font.photos.length > 0" class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">书体效果</text>
          </view>
          <scroll-view class="photo-scroll" scroll-x :show-scrollbar="false">
            <view class="photo-row">
              <image
                v-for="(photo, idx) in font.photos"
                :key="idx"
                class="photo-item"
                :src="photo"
                mode="aspectFill"
              />
            </view>
          </scroll-view>
        </view>

        <!-- 历史渊源 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">历史渊源</text>
          </view>
          <view class="history-card">
            <text class="quote-mark">"</text>
            <text class="history-text">{{ font.history }}</text>
          </view>
        </view>

        <!-- 适用场景 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">适用场景</text>
          </view>
          <view class="suitable-grid">
            <view
              v-for="(cat, idx) in suitableLabels"
              :key="idx"
              class="suitable-card"
            >
              <text class="suitable-icon">{{ CATEGORY_ICONS[font.suitableFor[idx]] || '🔖' }}</text>
              <text class="suitable-name">{{ cat }}</text>
            </view>
          </view>
        </view>

        <!-- 多种样式预览 -->
        <view class="section">
          <view class="section-header">
            <view class="section-dot"></view>
            <text class="section-title">文字预览</text>
          </view>
          <view class="preview-list">
            <view
              v-for="(text, idx) in previewTexts"
              :key="idx"
              class="preview-item"
            >
              <text class="preview-label">{{ text.label }}</text>
              <text class="preview-content">{{ text.text }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载/未找到 -->
      <view v-if="!font && !notFound" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="notFound" class="not-found">
        <text class="not-found-icon">🔍</text>
        <text class="not-found-text">未找到该字体信息</text>
      </view>

      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="font">
      <view class="bottom-bar-inner">
        <view class="bottom-info">
          <text class="bottom-name">{{ font.name }}</text>
          <text class="bottom-style">{{ font.style }} · 篆刻字体</text>
        </view>
        <view class="select-btn" @click="goDesignWithFont">
          <text class="select-btn-text">选择此字体</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getFontStyleById } from '@/services/seal'
import type { FontStyle, SealCategory } from '@/types/models'

const CATEGORY_LABELS: Record<SealCategory, string> = {
  name: '姓名印',
  leisure: '闲章',
  bookplate: '藏书印',
  signature: '签名章',
  collection: '收藏印'
}

const CATEGORY_ICONS: Record<string, string> = {
  name: '✍️',
  leisure: '🍃',
  bookplate: '📚',
  signature: '🖊️',
  collection: '🏛️'
}

// 文字预览数据
const PREVIEW_SAMPLES = ['心静如水', '淡泊明志', '厚德载物', '宁静致远', '上善若水']

const font = ref<FontStyle | null>(null)
const notFound = ref(false)

const suitableLabels = computed(() => {
  if (!font.value) return []
  return font.value.suitableFor.map(
    (cat) => CATEGORY_LABELS[cat as SealCategory] || cat
  )
})

const previewTexts = computed(() => {
  if (!font.value) return []
  return PREVIEW_SAMPLES.slice(0, 3).map((text, idx) => ({
    label: `示例 ${idx + 1}`,
    text
  }))
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || (currentPage as any).options || {}
  const fontId = options.fontId as string

  if (!fontId) {
    notFound.value = true
    return
  }

  const result = getFontStyleById(fontId)
  if (result) {
    font.value = result
  } else {
    notFound.value = true
  }
})

function goBack() {
  uni.navigateBack()
}

function goDesignWithFont() {
  const fontId = font.value?.fontId || ''
  uni.switchTab({ url: '/pages/design/index' })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部展示区 */
.hero-section {
  background: linear-gradient(160deg, #1A0A0A 0%, #3D1010 60%, #C41A1A 100%);
  padding: 0 32rpx 48rpx;
  position: relative;
  min-height: 440rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.back-btn {
  position: absolute;
  top: 88rpx;
  left: 32rpx;
  width: 72rpx;
  height: 72rpx;
  background-color: rgba(255, 255, 255, 0.15);
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

.hero-content {
  padding-top: 80rpx;
}

.hero-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.font-name-large {
  font-size: 56rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 8rpx;
}

.style-badge {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  border-radius: 24rpx;
  padding: 8rpx 28rpx;
}

.style-badge-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* 示例文字区 */
.sample-area {
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: $radius-lg;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
}

.sample-text {
  font-size: 72rpx;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 12rpx;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.5);
}

.sample-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 4rpx;
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

/* 横向图片 */
.photo-scroll {
  white-space: nowrap;
}

.photo-row {
  display: flex;
  gap: 16rpx;
}

.photo-item {
  width: 280rpx;
  height: 200rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
  background-color: #F0EBE8;
}

/* 历史文字 */
.history-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
}

.quote-mark {
  position: absolute;
  top: 16rpx;
  left: 24rpx;
  font-size: 80rpx;
  color: #F0C8C8;
  line-height: 1;
  font-family: Georgia, serif;
}

.history-text {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.8;
  text-align: justify;
  padding-top: 24rpx;
}

/* 适用场景网格 */
.suitable-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.suitable-card {
  flex: 1;
  min-width: 180rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 24rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.suitable-icon {
  font-size: 48rpx;
}

.suitable-name {
  font-size: 24rpx;
  color: $text-secondary;
  font-weight: 600;
}

/* 文字预览列表 */
.preview-list {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.preview-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F7F2F2;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 22rpx;
  color: $text-hint;
  width: 80rpx;
  flex-shrink: 0;
}

.preview-content {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 6rpx;
  flex: 1;
  text-align: center;
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
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.bottom-style {
  font-size: 22rpx;
  color: $text-hint;
  margin-top: 4rpx;
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
