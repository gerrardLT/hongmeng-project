<template>
  <view class="cases-page">
    <!-- 顶部标题区 -->
    <view class="page-header">
      <view class="header-back" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-center">
        <text class="header-title">{{ memorialName }}</text>
        <text class="header-subtitle">案例展示</text>
      </view>
      <view class="header-placeholder" />
    </view>

    <!-- 照片数量提示 -->
    <view v-if="photos.length > 0" class="count-hint">
      <text class="count-text">共 {{ photos.length }} 张案例图片</text>
      <text class="count-tip">点击图片可放大查看</text>
    </view>

    <!-- 照片网格 -->
    <view v-if="photos.length > 0" class="photo-grid">
      <view
        v-for="(photo, index) in photos"
        :key="index"
        class="photo-item"
        @click="previewPhoto(index)"
      >
        <image
          class="photo-img"
          :src="photo"
          mode="aspectFill"
          lazy-load
        />
        <view class="photo-overlay">
          <text class="photo-zoom-icon">🔍</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="empty-icon-wrap">
        <text class="empty-icon">📷</text>
      </view>
      <text class="empty-title">暂无案例照片</text>
      <text class="empty-desc">该纪念品的案例图片正在整理中</text>
    </view>

    <!-- 底部操作 -->
    <view v-if="photos.length > 0" class="bottom-bar">
      <view class="btn-booking" @click="goBooking">
        <text class="btn-booking-icon">✨</text>
        <text class="btn-booking-text">心动了？立即预约制作</text>
      </view>
    </view>

    <!-- 安全区 -->
    <view class="safe-bottom" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getCasePhotos, getMemorialTypeById } from '@/services/memorial'

const memorialName = ref('')
const photos = ref<string[]>([])
const typeId = ref('')

onLoad((options) => {
  const id = options?.typeId as string
  if (id) {
    typeId.value = id
    loadData(id)
  }
})

function loadData(id: string) {
  const memorial = getMemorialTypeById(id)
  if (memorial) {
    memorialName.value = memorial.name
    uni.setNavigationBarTitle({ title: `${memorial.name} · 案例` })
  }
  photos.value = getCasePhotos(id)
}

function previewPhoto(index: number) {
  uni.previewImage({
    current: photos.value[index],
    urls: photos.value
  })
}

function goBack() {
  uni.navigateBack()
}

function goBooking() {
  uni.navigateTo({ url: `/pages/booking/create?typeId=${typeId.value}` })
}
</script>

<style scoped lang="scss">
.cases-page {
  min-height: 100vh;
  background-color: $bg-page;
}

/* 顶部标题 */
.page-header {
  display: flex;
  align-items: center;
  padding: 88rpx 24rpx 20rpx;
  background-color: $bg-card;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.header-back {
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

.header-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.header-subtitle {
  font-size: 24rpx;
  color: $text-hint;
  margin-top: 4rpx;
}

.header-placeholder {
  width: 64rpx;
  flex-shrink: 0;
}

/* 数量提示 */
.count-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx 12rpx;
}

.count-text {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 500;
}

.count-tip {
  font-size: 22rpx;
  color: $text-hint;
}

/* 照片网格 */
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  padding: 0 6rpx;
}

.photo-item {
  width: calc(50% - 3rpx);
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
  border-radius: $radius-md;
  background-color: #EDE9FE;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background-color: transparent;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 12rpx;
  opacity: 0;
  transition: opacity 0.2s;
}

.photo-item:active .photo-overlay {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.2);
}

.photo-zoom-icon {
  font-size: 32rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 48rpx 80rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background-color: #F3E8FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-icon {
  font-size: 72rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
  text-align: center;
  line-height: 1.6;
}

/* 底部操作栏 */
.bottom-bar {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.btn-booking {
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 28rpx rgba(139, 92, 246, 0.35);
}

.btn-booking-icon {
  font-size: 30rpx;
}

.btn-booking-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 700;
}

/* 安全区 */
.safe-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
