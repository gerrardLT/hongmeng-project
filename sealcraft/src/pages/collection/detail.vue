<template>
  <view class="collection-detail-page">
    <!-- 返回按钮区 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <text class="nav-title">印章详情</text>
      <view class="nav-placeholder" />
    </view>

    <scroll-view class="content-scroll" scroll-y>
      <!-- 印章实物照片轮播 -->
      <view class="photo-section">
        <swiper
          v-if="photos.length > 0"
          class="photo-swiper"
          :indicator-dots="photos.length > 1"
          indicator-color="rgba(0,0,0,0.2)"
          indicator-active-color="#C41A1A"
          :autoplay="false"
          :circular="true"
        >
          <swiper-item v-for="(photo, idx) in photos" :key="idx">
            <image class="swiper-photo" :src="photo" mode="aspectFill" @click="previewPhoto(idx)" />
          </swiper-item>
        </swiper>
        <view v-else class="photo-placeholder">
          <text class="placeholder-icon">🎋</text>
          <text class="placeholder-text">暂无照片</text>
        </view>
      </view>

      <!-- 印蜕效果展示区 -->
      <view v-if="inkEffects.length > 0" class="ink-section">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">印蜕效果</text>
        </view>
        <scroll-view class="ink-scroll" scroll-x>
          <view class="ink-list">
            <view
              v-for="(effect, idx) in inkEffects"
              :key="idx"
              class="ink-item"
              @click="previewInkEffect(idx)"
            >
              <image class="ink-photo" :src="effect" mode="aspectFill" />
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 定制信息 -->
      <view class="detail-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">定制信息</text>
        </view>
        <view class="detail-list">
          <view class="detail-row">
            <text class="detail-label">刻字内容</text>
            <text class="detail-value content-value">{{ collectionData?.name || '--' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">字体</text>
            <text class="detail-value">{{ fontName || '--' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">材质</text>
            <text class="detail-value">{{ materialName || '--' }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">印章类型</text>
            <text class="detail-value">{{ sealTypeName || '--' }}</text>
          </view>
          <view v-if="studioName" class="detail-row">
            <text class="detail-label">工作室</text>
            <text class="detail-value">{{ studioName }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">定制时间</text>
            <text class="detail-value">{{ createdAt }}</text>
          </view>
        </view>
      </view>

      <!-- 备注编辑 -->
      <view class="note-card">
        <view class="section-title-row">
          <view class="section-accent" />
          <text class="section-title">备注</text>
        </view>
        <view class="note-input-wrap">
          <textarea
            class="note-input"
            :value="notes"
            placeholder="添加备注..."
            placeholder-class="note-placeholder"
            :maxlength="200"
            auto-height
            @blur="onNoteBlur"
          />
          <text class="note-count">{{ notes.length }}/200</text>
        </view>
      </view>

      <!-- 分享按钮 -->
      <view class="share-section">
        <view class="share-btn" @click="onShare">
          <text class="share-icon">↗</text>
          <text class="share-text">分享印章</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCollectionById, updateCollection } from '@/services/collection'
import { getBookingById } from '@/services/booking'
import { getSealTypeById, getMaterialById, getFontStyleById } from '@/services/seal'
import { getStudioById } from '@/services/studio'
import type { SealCollection } from '@/types/models'

const collectionData = ref<SealCollection | null>(null)
const photos = ref<string[]>([])
const inkEffects = ref<string[]>([])
const fontName = ref('')
const materialName = ref('')
const sealTypeName = ref('')
const studioName = ref('')
const createdAt = ref('')
const notes = ref('')
const collectionId = ref('')

onLoad((options) => {
  const id = options?.collectionId as string
  if (id) {
    collectionId.value = id
    loadData(id)
  }
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '--'
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadData(id: string) {
  const collection = getCollectionById(id)
  if (!collection) return

  collectionData.value = collection
  photos.value = collection.photos || []
  inkEffects.value = collection.inkEffects || []
  notes.value = collection.notes || ''
  createdAt.value = formatDate(collection.createdAt)

  // 加载材质信息
  const material = getMaterialById(collection.materialId)
  if (material) {
    materialName.value = material.name
  }

  // 加载字体信息
  const font = getFontStyleById(collection.fontId)
  if (font) {
    fontName.value = font.name
  }

  // 加载印章类型信息
  const sealType = getSealTypeById(collection.sealTypeId)
  if (sealType) {
    sealTypeName.value = sealType.name
  }

  // 加载工作室信息（通过 booking 关联）
  if (collection.bookingId) {
    const booking = getBookingById(collection.bookingId)
    if (booking) {
      const studio = getStudioById(booking.studioId)
      if (studio) {
        studioName.value = studio.name
      }
    }
  }
}

function goBack() {
  uni.navigateBack()
}

function previewPhoto(idx: number) {
  uni.previewImage({
    urls: photos.value,
    current: photos.value[idx]
  })
}

function previewInkEffect(idx: number) {
  uni.previewImage({
    urls: inkEffects.value,
    current: inkEffects.value[idx]
  })
}

function onNoteBlur(e: any) {
  const newNotes = e.detail?.value || ''
  notes.value = newNotes
  if (collectionId.value) {
    updateCollection(collectionId.value, { notes: newNotes })
  }
}

function onShare() {
  // #ifdef MP
  // 小程序端使用原生分享
  uni.showShareMenu({ withShareTicket: true })
  // #endif

  // #ifndef MP
  // 非小程序端使用系统分享
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
  // #endif
}
</script>

<style scoped lang="scss">
.collection-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  padding: 80rpx 24rpx 20rpx;
  background-color: $bg-card;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: $bg-page;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.back-icon {
  font-size: 44rpx;
  color: $text-primary;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.nav-placeholder {
  width: 64rpx;
  flex-shrink: 0;
}

/* 内容滚动区 */
.content-scroll {
  flex: 1;
}

/* 照片轮播 */
.photo-section {
  background-color: $bg-card;
}

.photo-swiper {
  width: 100%;
  height: 560rpx;
}

.swiper-photo {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  width: 100%;
  height: 560rpx;
  background: linear-gradient(135deg, #FDE8E8, #F5E8E0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.placeholder-icon {
  font-size: 100rpx;
}

.placeholder-text {
  font-size: 28rpx;
  color: $text-hint;
}

/* 印蜕效果 */
.ink-section {
  background-color: $bg-card;
  margin-top: 16rpx;
  padding: 24rpx 0 28rpx;
}

.ink-scroll {
  white-space: nowrap;
}

.ink-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 8rpx 24rpx;
}

.ink-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.ink-photo {
  width: 100%;
  height: 100%;
}

/* 定制信息 */
.detail-card {
  background-color: $bg-card;
  margin-top: 16rpx;
  padding: 28rpx;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 8rpx;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.detail-label {
  font-size: 26rpx;
  color: $text-hint;
  flex-shrink: 0;
  min-width: 140rpx;
}

.detail-value {
  font-size: 26rpx;
  color: $text-primary;
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.content-value {
  font-size: 30rpx;
  font-weight: 700;
  color: $primary;
}

/* 备注编辑 */
.note-card {
  background-color: $bg-card;
  margin-top: 16rpx;
  padding: 28rpx;
}

.note-input-wrap {
  margin-top: 12rpx;
  background-color: #FBF8F5;
  border-radius: $radius-md;
  padding: 20rpx;
  position: relative;
}

.note-input {
  width: 100%;
  font-size: 26rpx;
  color: $text-primary;
  line-height: 1.6;
  min-height: 80rpx;
}

.note-placeholder {
  color: $text-hint;
  font-size: 26rpx;
}

.note-count {
  font-size: 22rpx;
  color: $text-hint;
  text-align: right;
  display: block;
  margin-top: 8rpx;
}

/* 分享按钮 */
.share-section {
  padding: 32rpx 24rpx 0;
}

.share-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.3);
}

.share-icon {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.share-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 通用 Section 标题 */
.section-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 4rpx;
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

/* 底部占位 */
.bottom-placeholder {
  height: calc(60rpx + env(safe-area-inset-bottom));
}
</style>
