<template>
  <view class="result-page">
    <!-- 照片展示 -->
    <view class="photo-area">
      <view class="photo-container" id="photoContainer">
        <image
          class="photo-image"
          :src="result?.imagePath"
          mode="widthFix"
          @load="onImageLoad"
        />
        <ColorLabel
          v-for="(item, index) in displayColors"
          :key="index"
          :color="item.color"
          :position="getLabelPosition(item.region)"
          :visible="imageLoaded"
        />
      </view>
    </view>

    <!-- 颜色列表 -->
    <view class="colors-section">
      <text class="section-title">识别颜色</text>
      <view class="colors-list">
        <view class="color-item" v-for="(item, index) in result?.colors" :key="index">
          <ColorCard :color="item.color" size="medium" />
          <text class="color-percentage">{{ item.percentage }}%</text>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar safe-bottom">
      <view class="action-btn" @click="saveToAlbum">
        <text class="action-icon">💾</text>
        <text class="action-text">保存到相册</text>
      </view>
      <view class="action-btn" @click="shareImage">
        <text class="action-icon">📤</text>
        <text class="action-text">分享</text>
      </view>
      <view class="action-btn" @click="reanalyze">
        <text class="action-icon">🔄</text>
        <text class="action-text">重新分析</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { dbGet } from '@/utils/db'
import type { AnalysisResult } from '@/types/models'
import ColorCard from '@/components/ColorCard.vue'
import ColorLabel from '@/components/ColorLabel.vue'

const result = ref<AnalysisResult | null>(null)
const photoRect = ref<{ left: number; top: number; width: number; height: number } | null>(null)
const imageLoaded = ref(false)
const COLLECTION = 'analysis_results'

const displayColors = computed(() => {
  return (result.value?.colors || []).slice(0, 5)
})

onLoad((options) => {
  const analysisId = options?.analysisId
  if (analysisId) {
    const data = dbGet<AnalysisResult>(COLLECTION, analysisId)
    if (data) {
      result.value = data
    } else {
      uni.showToast({ title: '记录不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  }
})

function onImageLoad() {
  setTimeout(() => {
    const query = uni.createSelectorQuery()
    query.select('#photoContainer').boundingClientRect((rect) => {
      if (rect) {
        photoRect.value = rect as { left: number; top: number; width: number; height: number }
        imageLoaded.value = true
      }
    }).exec()
  }, 100)
}

function getLabelPosition(region: { x: number; y: number; width: number; height: number }) {
  if (!photoRect.value) return { x: 0, y: 0 }
  const scale = photoRect.value.width / 256
  return {
    x: photoRect.value.left + region.x * scale + (region.width * scale) / 2,
    y: photoRect.value.top + region.y * scale + (region.height * scale) / 2
  }
}

function saveToAlbum() {
  if (!result.value) return
  uni.saveImageToPhotosAlbum({
    filePath: result.value.imagePath,
    success: () => {
      uni.showToast({ title: '保存成功', icon: 'success' })
    },
    fail: (err) => {
      if (err.errMsg?.includes('auth')) {
        uni.showModal({
          title: '需要权限',
          content: '请允许保存到相册权限',
          success: (r) => {
            if (r.confirm) uni.openSetting()
          }
        })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    }
  })
}

function shareImage() {
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    type: 0,
    scene: 'WXSceneSession',
    imageUrl: result.value?.imagePath,
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '分享失败', icon: 'none' })
    }
  })
  // #endif

  // #ifndef APP-PLUS
  uni.showToast({ title: '请在APP中分享', icon: 'none' })
  // #endif
}

function reanalyze() {
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding-bottom: 160rpx;
}

.photo-area {
  background-color: $bg-card;
  padding: $spacing-md;
}

.photo-container {
  position: relative;
  width: 100%;
}

.photo-image {
  width: 100%;
  border-radius: $radius-md;
  display: block;
}

.colors-section {
  padding: $spacing-md;

  .section-title {
    font-size: $font-lg;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: $spacing-md;
    display: block;
  }
}

.colors-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.color-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm;
}

.color-percentage {
  font-size: $font-md;
  color: $primary-color;
  font-weight: 600;
  margin-left: $spacing-md;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $bg-card;
  display: flex;
  justify-content: space-around;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
