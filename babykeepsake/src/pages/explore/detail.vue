<template>
  <view class="detail-page">
    <!-- 顶部大图轮播 -->
    <view class="photo-section">
      <swiper
        class="photo-swiper"
        :autoplay="false"
        :circular="true"
        indicator-dots
        indicator-color="rgba(255,107,53,0.3)"
        indicator-active-color="#FF6B35"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(photo, idx) in detail?.photos" :key="idx">
          <image
            class="photo-item"
            :src="photo"
            mode="aspectFill"
            @click="onPreviewPhoto(idx)"
          />
        </swiper-item>
      </swiper>
      <view class="photo-counter">
        <text class="counter-text">{{ currentPhotoIdx + 1 }} / {{ detail?.photos?.length || 0 }}</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="info-card">
      <view class="info-top">
        <text class="keepsake-name">{{ detail?.name }}</text>
        <view class="category-badge">
          <text class="badge-text">{{ categoryLabel }}</text>
        </view>
      </view>
      <text class="keepsake-desc">{{ detail?.description }}</text>
      <view class="price-row">
        <text class="price-label">价格区间</text>
        <text class="price-value">{{ detail?.priceRange }}</text>
      </view>
    </view>

    <!-- 详情信息 -->
    <view class="detail-card">
      <text class="detail-section-title">详细信息</text>

      <view class="detail-row">
        <view class="detail-row-icon">
          <text>🎨</text>
        </view>
        <view class="detail-row-content">
          <text class="detail-row-label">制作工艺</text>
          <text class="detail-row-value">{{ detail?.technique }}</text>
        </view>
      </view>

      <view class="detail-divider"></view>

      <view class="detail-row">
        <view class="detail-row-icon">
          <text>🔒</text>
        </view>
        <view class="detail-row-content">
          <text class="detail-row-label">保存方法</text>
          <text class="detail-row-value">{{ detail?.storageMethod }}</text>
        </view>
      </view>

      <view class="detail-divider"></view>

      <view class="detail-row">
        <view class="detail-row-icon">
          <text>👶</text>
        </view>
        <view class="detail-row-content">
          <text class="detail-row-label">适合年龄</text>
          <text class="detail-row-value">{{ detail?.suitableAge }}</text>
        </view>
      </view>

      <view class="detail-divider"></view>

      <view class="detail-row">
        <view class="detail-row-icon">
          <text>⏱</text>
        </view>
        <view class="detail-row-content">
          <text class="detail-row-label">制作周期</text>
          <text class="detail-row-value">{{ detail?.duration }}</text>
        </view>
      </view>
    </view>

    <!-- 案例展示入口 -->
    <view class="cases-entry" @click="goCases">
      <view class="cases-entry-left">
        <text class="cases-entry-icon">🖼</text>
        <view class="cases-entry-info">
          <text class="cases-entry-title">查看案例展示</text>
          <text class="cases-entry-desc">浏览真实作品效果</text>
        </view>
      </view>
      <text class="cases-entry-arrow">›</text>
    </view>

    <!-- 底部间距 -->
    <view class="bottom-spacer"></view>

    <!-- 底部固定按钮 -->
    <view class="bottom-bar safe-bottom">
      <view class="book-btn" @click="goBookingCreate">
        <text class="book-btn-text">立即预约</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getKeepsakeDetail } from '@/services/keepsake'
import type { KeepsakeType, KeepsakeCategory } from '@/types/models'

const detail = ref<KeepsakeType | null>(null)
const currentPhotoIdx = ref(0)
const typeId = ref('')

const categoryMap: Record<KeepsakeCategory, string> = {
  handprint: '手足印',
  hair: '胎发',
  tooth: '乳牙',
  birth: '出生纪念',
  growth: '成长记录'
}

const categoryLabel = ref('')

onLoad((options) => {
  if (options?.typeId) {
    typeId.value = options.typeId
    loadDetail(options.typeId)
  }
})

function loadDetail(id: string) {
  const data = getKeepsakeDetail(id)
  if (data) {
    detail.value = data
    categoryLabel.value = categoryMap[data.category] || '其他'
  }
}

function onSwiperChange(e: any) {
  currentPhotoIdx.value = e.detail.current
}

function onPreviewPhoto(idx: number) {
  if (detail.value?.photos) {
    uni.previewImage({
      current: detail.value.photos[idx],
      urls: detail.value.photos
    })
  }
}

function goCases() {
  uni.navigateTo({ url: `/pages/explore/cases?typeId=${typeId.value}` })
}

function goBookingCreate() {
  uni.navigateTo({ url: `/pages/booking/create?typeId=${typeId.value}` })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 140rpx;
}

/* 图片轮播 */
.photo-section {
  position: relative;
}

.photo-swiper {
  height: 560rpx;
}

.photo-item {
  width: 100%;
  height: 100%;
  background-color: #FFE8DD;
}

.photo-counter {
  position: absolute;
  bottom: 20rpx;
  right: 24rpx;
  background-color: rgba(0, 0, 0, 0.45);
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
}

.counter-text {
  font-size: 22rpx;
  color: #FFFFFF;
}

/* 基本信息卡 */
.info-card {
  background-color: $bg-card;
  margin: -40rpx 24rpx 0;
  border-radius: $radius-lg;
  padding: 32rpx;
  position: relative;
  z-index: 2;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.info-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.keepsake-name {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  flex: 1;
}

.category-badge {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
}

.badge-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.keepsake-desc {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.7;
  margin-bottom: 24rpx;
  display: block;
}

.price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #FFF3ED;
  border-radius: $radius-md;
  padding: 16rpx 24rpx;
}

.price-label {
  font-size: 26rpx;
  color: $text-secondary;
}

.price-value {
  font-size: 30rpx;
  color: $primary;
  font-weight: 700;
}

/* 详情信息卡 */
.detail-card {
  background-color: $bg-card;
  margin: 20rpx 24rpx;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.detail-section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 24rpx;
  display: block;
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-row-icon {
  width: 48rpx;
  font-size: 36rpx;
  margin-right: 16rpx;
  padding-top: 2rpx;
}

.detail-row-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-row-label {
  font-size: 24rpx;
  color: $text-hint;
  margin-bottom: 6rpx;
}

.detail-row-value {
  font-size: 28rpx;
  color: $text-primary;
  line-height: 1.6;
}

.detail-divider {
  height: 1rpx;
  background-color: $border-color;
  margin: 20rpx 0;
}

/* 案例入口 */
.cases-entry {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: $bg-card;
  margin: 0 24rpx;
  border-radius: $radius-lg;
  padding: 28rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.cases-entry-left {
  display: flex;
  align-items: center;
}

.cases-entry-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.cases-entry-info {
  display: flex;
  flex-direction: column;
}

.cases-entry-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.cases-entry-desc {
  font-size: 24rpx;
  color: $text-hint;
}

.cases-entry-arrow {
  font-size: 36rpx;
  color: $text-hint;
  font-weight: 700;
}

/* 底部间距 */
.bottom-spacer {
  height: 24rpx;
}

/* 底部固定按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $bg-card;
  padding: 16rpx 32rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.book-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.book-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
