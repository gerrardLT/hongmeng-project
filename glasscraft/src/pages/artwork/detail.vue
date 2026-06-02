<template>
  <view class="page">
    <scroll-view v-if="artwork" scroll-y class="scroll-area">
      <!-- Swiper 大图轮播 -->
      <view class="swiper-wrap">
        <swiper class="swiper" :indicator-dots="artwork.photos.length > 1" indicator-color="rgba(255,255,255,0.4)" indicator-active-color="#FFFFFF">
          <swiper-item v-for="(photo, index) in artwork.photos" :key="index">
            <image class="swiper-img" :src="photo" mode="aspectFill" @click="previewImage(index)" />
          </swiper-item>
        </swiper>
        <view class="photo-count">
          <text class="photo-count-text">{{ artwork.photos.length }}张</text>
        </view>
      </view>

      <!-- 信息区 -->
      <view class="info-card">
        <view v-if="artwork.studioName" class="info-row">
          <text class="info-label">工作室</text>
          <text class="info-value">{{ artwork.studioName }}</text>
        </view>
        <view v-if="artwork.projectName" class="info-row">
          <text class="info-label">项目</text>
          <text class="info-value">{{ artwork.projectName }}</text>
        </view>
        <view class="info-row info-row-last">
          <text class="info-label">日期</text>
          <text class="info-value">{{ formatDate(artwork.createdAt) }}</text>
        </view>
      </view>

      <!-- 心得文字区 -->
      <view v-if="artwork.description" class="desc-card">
        <text class="desc-title">制作心得</text>
        <text class="desc-text">{{ artwork.description }}</text>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 操作栏 -->
    <view v-if="artwork" class="action-bar">
      <view class="action-item" @click="onShare">
        <text class="action-icon">↗</text>
        <text class="action-text">分享</text>
      </view>
      <view class="action-divider" />
      <view class="action-item action-delete" @click="onDelete">
        <text class="action-icon">🗑</text>
        <text class="action-text">删除</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-wrap">
      <text class="empty-text">作品不存在或已删除</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useArtworkStore } from '@/store/artwork'
import { getArtworkDetail, deleteArtwork } from '@/services/artwork'
import type { Artwork } from '@/types/models'

const artworkStore = useArtworkStore()
const artwork = ref<Artwork | null>(null)

onLoad((query) => {
  const artworkId = query?.artworkId || ''
  if (artworkId) {
    loadArtwork(artworkId)
  }
})

async function loadArtwork(artworkId: string) {
  try {
    const detail = await getArtworkDetail(artworkId)
    if (detail) {
      artwork.value = detail
      artworkStore.setCurrentArtwork(detail)
    } else {
      uni.showToast({ title: '作品不存在', icon: 'none' })
    }
  } catch (e) {
    console.error('loadArtwork error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function previewImage(index: number) {
  if (!artwork.value) return
  uni.previewImage({
    current: index,
    urls: artwork.value.photos
  })
}

function onShare() {
  if (!artwork.value) return
  uni.navigateTo({
    url: `/pages/artwork/share?artworkId=${artwork.value.artworkId}`
  })
}

function onDelete() {
  if (!artwork.value) return
  uni.showModal({
    title: '删除作品',
    content: '确定要删除该作品吗？删除后无法恢复。',
    confirmColor: '#FF6B6B',
    success: async (res) => {
      if (res.confirm) {
        try {
          const ok = await deleteArtwork(artwork.value!.artworkId)
          if (ok) {
            artworkStore.removeArtwork(artwork.value!.artworkId)
            uni.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => {
              uni.navigateBack()
            }, 1200)
          }
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.scroll-area {
  flex: 1;
  overflow: hidden;
}

/* Swiper */
.swiper-wrap {
  position: relative;
  width: 100%;
  height: 560rpx;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-img {
  width: 100%;
  height: 100%;
}

.photo-count {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 24rpx;
  padding: 6rpx 20rpx;
}

.photo-count-text {
  font-size: 24rpx;
  color: #FFFFFF;
}

/* 信息卡片 */
.info-card {
  background-color: $bg-card;
  margin: 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.info-row-last {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.info-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

/* 心得卡片 */
.desc-card {
  background-color: $bg-card;
  margin: 0 24rpx 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.desc-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 16rpx;
  display: block;
}

.desc-text {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.8;
  display: block;
}

/* 操作栏 */
.action-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 32rpx;
}

.action-text {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.action-delete .action-text {
  color: $error;
}

.action-divider {
  width: 1rpx;
  height: 40rpx;
  background-color: $border-color;
}

/* 空状态 */
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.empty-text {
  font-size: 30rpx;
  color: $text-secondary;
}

.safe-bottom {
  height: 32rpx;
}
</style>
