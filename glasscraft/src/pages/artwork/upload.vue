<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-area">
      <!-- 照片上传区 -->
      <view class="section-card">
        <text class="section-title">上传照片（最多9张）</text>
        <view class="photo-grid">
          <view
            v-for="(photo, index) in photos"
            :key="index"
            class="photo-item"
          >
            <image class="photo-img" :src="photo" mode="aspectFill" />
            <view class="photo-delete" @click="removePhoto(index)">
              <text class="photo-delete-icon">×</text>
            </view>
          </view>
          <view v-if="photos.length < 9" class="photo-add" @click="onChooseImage">
            <text class="photo-add-icon">+</text>
            <text class="photo-add-text">添加照片</text>
          </view>
        </view>
      </view>

      <!-- 制作心得 -->
      <view class="section-card">
        <text class="section-title">制作心得</text>
        <textarea
          v-model="description"
          class="desc-input"
          placeholder="分享你的制作体验和感受..."
          maxlength="500"
        />
        <text class="desc-count">{{ description.length }}/500</text>
      </view>

      <!-- 关联信息 -->
      <view v-if="bookingInfo" class="section-card">
        <text class="section-title">关联预约</text>
        <view class="relate-row">
          <text class="relate-label">工作室</text>
          <text class="relate-value">{{ bookingInfo.studioName }}</text>
        </view>
        <view class="relate-row">
          <text class="relate-label">项目</text>
          <text class="relate-value">{{ bookingInfo.projectName }}</text>
        </view>
        <view class="relate-row">
          <text class="relate-label">体验日期</text>
          <text class="relate-value">{{ bookingInfo.date }}</text>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 底部发布按钮 -->
    <view class="footer">
      <view class="footer-btn" @click="onSubmit">
        <text class="footer-btn-text">发布作品</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useArtworkStore } from '@/store/artwork'
import { uploadArtwork } from '@/services/artwork'
import { getBookingDetail } from '@/services/booking'
import { chooseImage } from '@/services/storage'
import type { Booking } from '@/types/models'

const userStore = useUserStore()
const artworkStore = useArtworkStore()

const photos = ref<string[]>([])
const description = ref('')
const bookingId = ref('')
const bookingInfo = ref<Booking | null>(null)

onLoad((query) => {
  const bid = query?.bookingId || ''
  if (bid) {
    bookingId.value = bid
    loadBookingInfo(bid)
  }
})

async function loadBookingInfo(bid: string) {
  try {
    const booking = await getBookingDetail(bid)
    if (booking) {
      bookingInfo.value = booking
    }
  } catch (e) {
    console.error('loadBookingInfo error:', e)
  }
}

async function onChooseImage() {
  const remain = 9 - photos.value.length
  if (remain <= 0) return
  try {
    const paths = await chooseImage(remain)
    photos.value.push(...paths)
  } catch (e: any) {
    uni.showToast({ title: e.message || '选择图片失败', icon: 'none' })
  }
}

function removePhoto(index: number) {
  photos.value.splice(index, 1)
}

function validate(): boolean {
  if (photos.value.length === 0) {
    uni.showToast({ title: '请至少上传1张照片', icon: 'none' })
    return false
  }
  if (!userStore.userId) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return false
  }
  return true
}

async function onSubmit() {
  if (!validate()) return

  uni.showLoading({ title: '发布中...' })
  try {
    const artwork = await uploadArtwork({
      userId: userStore.userId,
      bookingId: bookingId.value || undefined,
      studioId: bookingInfo.value?.studioId,
      studioName: bookingInfo.value?.studioName,
      projectId: bookingInfo.value?.projectId,
      projectName: bookingInfo.value?.projectName,
      photos: photos.value,
      description: description.value
    })
    artworkStore.addArtwork(artwork)
    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/artwork/detail?artworkId=${artwork.artworkId}` })
    }, 1200)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '发布失败', icon: 'none' })
    console.error('uploadArtwork error:', e)
  }
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

/* 区块卡片 */
.section-card {
  background-color: $bg-card;
  margin: 24rpx;
  border-radius: $radius-lg;
  padding: 24rpx 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

/* 照片网格 */
.photo-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  position: relative;
  width: calc((100% - 32rpx) / 3);
  aspect-ratio: 1;
  border-radius: $radius-md;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-delete-icon {
  font-size: 28rpx;
  color: #FFFFFF;
  line-height: 1;
  margin-top: -2rpx;
}

.photo-add {
  width: calc((100% - 32rpx) / 3);
  aspect-ratio: 1;
  border-radius: $radius-md;
  border: 2rpx dashed $border-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $bg-page;
}

.photo-add-icon {
  font-size: 48rpx;
  color: $text-hint;
  line-height: 1;
  margin-bottom: 8rpx;
}

.photo-add-text {
  font-size: 22rpx;
  color: $text-hint;
}

/* 心得输入 */
.desc-input {
  width: 100%;
  height: 240rpx;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.desc-count {
  font-size: 22rpx;
  color: $text-hint;
  text-align: right;
  margin-top: 8rpx;
  display: block;
}

/* 关联信息 */
.relate-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $border-color;
}

.relate-row:last-child {
  border-bottom: none;
}

.relate-label {
  font-size: 28rpx;
  color: $text-secondary;
}

.relate-value {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

/* 底部按钮 */
.footer {
  background-color: $bg-card;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.footer-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.safe-bottom {
  height: 32rpx;
}
</style>
