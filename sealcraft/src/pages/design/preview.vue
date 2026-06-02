<template>
  <view class="preview-page">
    <!-- 大尺寸印章效果展示 -->
    <view class="preview-container">
      <view class="seal-showcase" :class="`layout-${preview.layout}`">
        <view
          class="seal-frame-large"
          :class="`frame-${preview.layout}`"
          :style="{ borderColor: inkColorMap[preview.inkColor] || '#C41A1A' }"
        >
          <view class="seal-text-large" :class="`text-${preview.layout}`">
            <text
              v-for="(char, idx) in displayChars"
              :key="idx"
              class="seal-char-large"
              :style="{ color: inkColorMap[preview.inkColor] || '#C41A1A' }"
            >{{ char }}</text>
          </view>
        </view>
      </view>

      <!-- 设计信息 -->
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">刻字内容</text>
          <text class="info-value">{{ preview.content }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">字体风格</text>
          <text class="info-value">{{ preview.fontName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">印章材质</text>
          <text class="info-value">{{ preview.materialName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">印章类型</text>
          <text class="info-value">{{ preview.sealTypeName }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">排版方式</text>
          <text class="info-value">{{ preview.layout }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">印泥颜色</text>
          <view class="ink-color-display">
            <view class="ink-dot-sm" :style="{ backgroundColor: inkColorMap[preview.inkColor] || '#C41A1A' }" />
            <text class="info-value">{{ preview.inkColor }}</text>
          </view>
        </view>
        <view class="info-row">
          <text class="info-label">印章尺寸</text>
          <text class="info-value">{{ preview.dimensions.width }}mm × {{ preview.dimensions.height }}mm</text>
        </view>
      </view>

      <!-- 模拟不同角度/光照效果 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">不同光照效果</text>
        </view>
        <scroll-view class="h-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="effect-list">
            <view
              v-for="(effect, idx) in lightEffects"
              :key="idx"
              class="effect-card"
            >
              <view class="effect-preview" :style="{ backgroundColor: effect.bgColor }">
                <view
                  class="effect-seal"
                  :class="`frame-${preview.layout}`"
                  :style="{ borderColor: effect.borderColor, transform: effect.transform }"
                >
                  <view class="effect-text-wrap" :class="`text-${preview.layout}`">
                    <text
                      v-for="(char, ci) in displayChars"
                      :key="ci"
                      class="effect-char"
                      :style="{ color: effect.borderColor }"
                    >{{ char }}</text>
                  </view>
                </view>
              </view>
              <text class="effect-label">{{ effect.label }}</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-actions safe-bottom">
      <view class="btn-share" @click="onShare">
        <text class="btn-text-share">分享预览</text>
      </view>
      <view class="btn-save" @click="onSaveImage">
        <text class="btn-text-save">保存图片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { DesignPreview } from '@/services/design'

const preview = ref<DesignPreview>({
  content: '',
  fontName: '篆书',
  materialName: '寿山石',
  sealTypeName: '姓名章',
  layout: '自动布局',
  inkColor: '朱砂红',
  previewImage: '',
  dimensions: { width: 30, height: 30 }
})

const inkColorMap: Record<string, string> = {
  '朱砂红': '#C41A1A',
  '朱红': '#E85530',
  '靛蓝': '#2B4F8C'
}

const displayChars = computed(() => {
  const content = preview.value.content.trim()
  if (!content) return ['印']
  return Array.from(content)
})

// 模拟光照效果
const lightEffects = computed(() => {
  const baseColor = inkColorMap[preview.value.inkColor] || '#C41A1A'
  return [
    { label: '自然光', bgColor: '#FFFFFF', borderColor: baseColor, transform: 'rotate(0deg)' },
    { label: '侧光', bgColor: '#F5F0EB', borderColor: baseColor, transform: 'rotate(-5deg)' },
    { label: '暖光', bgColor: '#FFF5E6', borderColor: '#D4A060', transform: 'rotate(3deg)' },
    { label: '暗光', bgColor: '#E8E0D8', borderColor: '#8B4513', transform: 'rotate(-2deg)' }
  ]
})

function onShare() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function onSaveImage() {
  uni.showToast({ title: '图片保存功能开发中', icon: 'none' })
}

onLoad((options) => {
  if (options?.data) {
    try {
      const data = JSON.parse(decodeURIComponent(options.data))
      preview.value = data
    } catch (e) {
      console.error('解析预览数据失败:', e)
    }
  }
})
</script>

<style scoped lang="scss">
.preview-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-page;
}

.preview-container {
  flex: 1;
  padding: $spacing-md;
}

/* ===== 大尺寸印章展示 ===== */
.seal-showcase {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0 60rpx;
}

.seal-frame-large {
  border: 8rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.frame-自动布局,
.frame-横排布局 {
  border-radius: 12rpx;
  min-width: 320rpx;
  min-height: 320rpx;
}

.frame-竖排布局 {
  border-radius: 12rpx;
  min-width: 240rpx;
  min-height: 400rpx;
}

.frame-圆章布局 {
  border-radius: 50%;
  width: 360rpx;
  height: 360rpx;
}

.seal-text-large {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-自动布局,
.text-横排布局 {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.text-竖排布局 {
  flex-direction: column;
  gap: 12rpx;
}

.text-圆章布局 {
  flex-direction: column;
  gap: 8rpx;
}

.seal-char-large {
  font-size: 80rpx;
  font-weight: 900;
  color: $primary;
}

/* ===== 信息卡片 ===== */
.info-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0EBE6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 26rpx;
  color: $text-hint;
}

.info-value {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
}

.ink-color-display {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.ink-dot-sm {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

/* ===== 光照效果 ===== */
.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.h-scroll {
  white-space: nowrap;
}

.effect-list {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 4rpx 0;
}

.effect-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.effect-preview {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  margin-bottom: 12rpx;
}

.effect-seal {
  border: 4rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx;
  transform-origin: center;
}

.effect-seal.frame-自动布局,
.effect-seal.frame-横排布局 {
  border-radius: 6rpx;
  min-width: 100rpx;
  min-height: 100rpx;
}

.effect-seal.frame-竖排布局 {
  border-radius: 6rpx;
  min-width: 80rpx;
  min-height: 130rpx;
}

.effect-seal.frame-圆章布局 {
  border-radius: 50%;
  width: 130rpx;
  height: 130rpx;
}

.effect-text-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.effect-text-wrap.text-自动布局,
.effect-text-wrap.text-横排布局 {
  flex-direction: row;
  gap: 4rpx;
}

.effect-text-wrap.text-竖排布局,
.effect-text-wrap.text-圆章布局 {
  flex-direction: column;
  gap: 4rpx;
}

.effect-char {
  font-size: 32rpx;
  font-weight: 900;
  color: $primary;
}

.effect-label {
  font-size: 24rpx;
  color: $text-secondary;
}

/* ===== 底部操作栏 ===== */
.bottom-actions {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  padding: 24rpx $spacing-md;
  background-color: $bg-card;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.btn-share {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  border: 2rpx solid $primary;
  background-color: $bg-card;
}

.btn-text-share {
  font-size: 30rpx;
  color: $primary;
  font-weight: 600;
}

.btn-save {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.btn-text-save {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
