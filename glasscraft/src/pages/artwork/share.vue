<template>
  <view class="page">
    <scroll-view v-if="artwork" scroll-y class="scroll-area">
      <!-- 分享卡片预览 -->
      <view class="card-wrap">
        <view class="share-card">
          <!-- 照片 -->
          <image
            v-if="artwork.photos.length > 0"
            class="card-photo"
            :src="artwork.photos[0]"
            mode="aspectFill"
          />
          <view class="card-body">
            <!-- 工作室名 -->
            <text v-if="artwork.studioName" class="card-studio">{{ artwork.studioName }}</text>
            <!-- 日期 -->
            <text class="card-date">{{ formatDate(artwork.createdAt) }}</text>
            <!-- 心得摘要 -->
            <text class="card-desc">{{ descSummary }}</text>
            <!-- 水印 -->
            <view class="card-watermark">
              <text class="watermark-text">GlassCraft</text>
              <text class="watermark-sub">烧玻璃饰品 DIY</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 操作按钮 -->
    <view v-if="artwork" class="footer">
      <view class="footer-btn footer-btn-primary" @click="onSaveToAlbum">
        <text class="footer-btn-text">保存到相册</text>
      </view>
      <view class="footer-btn footer-btn-outline" @click="onShareToFriend">
        <text class="footer-btn-text">分享给朋友</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-wrap">
      <text class="empty-text">作品不存在或已删除</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useArtworkStore } from '@/store/artwork'
import { getArtworkDetail, generateShareCard } from '@/services/artwork'
import { saveToAlbum } from '@/services/storage'
import type { Artwork } from '@/types/models'

const artworkStore = useArtworkStore()
const artwork = ref<Artwork | null>(null)

const descSummary = computed(() => {
  if (!artwork.value) return ''
  const desc = artwork.value.description || ''
  if (desc.length <= 60) return desc
  return desc.slice(0, 60) + '...'
})

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

async function onSaveToAlbum() {
  if (!artwork.value || artwork.value.photos.length === 0) {
    uni.showToast({ title: '没有可保存的图片', icon: 'none' })
    return
  }
  try {
    const ok = await saveToAlbum(artwork.value.photos[0])
    if (ok) {
      uni.showToast({ title: '已保存到相册', icon: 'success' })
    } else {
      uni.showToast({ title: '保存失败', icon: 'none' })
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  }
}

async function onShareToFriend() {
  if (!artwork.value) return
  try {
    const shareData = await generateShareCard(artwork.value)
    // #ifdef APP-HARMONY
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    // #endif
    // #ifndef APP-HARMONY
    uni.showShareMenu({
      withShareTicket: true
    })
    // #endif
    uni.showToast({ title: '请使用系统分享', icon: 'none' })
  } catch (e) {
    uni.showToast({ title: '分享失败', icon: 'none' })
  }
}

// 设置页面分享数据
// #ifdef MP-WEIXIN
uni.showShareMenu({ withShareTicket: true })
// #endif
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 分享卡片 */
.card-wrap {
  padding: 48rpx 32rpx;
  width: 100%;
  box-sizing: border-box;
}

.share-card {
  background-color: $bg-card;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.card-photo {
  width: 100%;
  height: 480rpx;
}

.card-body {
  padding: 32rpx;
  position: relative;
}

.card-studio {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  display: block;
}

.card-date {
  font-size: 24rpx;
  color: $text-hint;
  margin-bottom: 16rpx;
  display: block;
}

.card-desc {
  font-size: 28rpx;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: 24rpx;
  display: block;
}

.card-watermark {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 12rpx;
  border-top: 1rpx solid $border-color;
  padding-top: 20rpx;
}

.watermark-text {
  font-size: 28rpx;
  font-weight: 700;
  color: $primary;
}

.watermark-sub {
  font-size: 22rpx;
  color: $text-hint;
}

/* 底部按钮 */
.footer {
  background-color: $bg-card;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}

.footer-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn-primary {
  background: linear-gradient(135deg, $primary, $primary-dark);
}

.footer-btn-outline {
  background: transparent;
  border: 2rpx solid $primary;
}

.footer-btn-text {
  font-size: 30rpx;
  font-weight: 600;
}

.footer-btn-primary .footer-btn-text {
  color: #FFFFFF;
}

.footer-btn-outline .footer-btn-text {
  color: $primary;
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
