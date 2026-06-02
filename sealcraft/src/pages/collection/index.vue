<template>
  <view class="collection-list-page">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">印章库</text>
      <text class="page-subtitle">您的定制印章收藏</text>
    </view>

    <!-- 列表 -->
    <scroll-view class="list-scroll" scroll-y @scrolltolower="onScrollEnd">
      <view v-if="collections.length > 0" class="collection-grid">
        <view
          v-for="item in collections"
          :key="item.collectionId"
          class="collection-item"
          @click="goDetail(item.collectionId)"
        >
          <!-- 印章照片 -->
          <view class="item-photo-wrap">
            <image
              v-if="item.photos.length > 0"
              class="item-photo"
              :src="item.photos[0]"
              mode="aspectFill"
            />
            <view v-else class="item-photo-placeholder">
              <text class="placeholder-icon">🎋</text>
            </view>
          </view>

          <!-- 信息 -->
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-meta">{{ getMaterialName(item.materialId) }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">🎋</text>
        </view>
        <text class="empty-title">暂无定制印章</text>
        <text class="empty-desc">完成篆刻定制后，印章将收入此处</text>
        <view class="empty-btn" @click="goBooking">
          <text class="empty-btn-text">去定制印章</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="list-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getCollections } from '@/services/collection'
import { getMaterialById } from '@/services/seal'
import type { SealCollection } from '@/types/models'

const userStore = useUserStore()
const collections = ref<SealCollection[]>([])

function getMaterialName(materialId: string): string {
  const material = getMaterialById(materialId)
  return material?.name || '未知材质'
}

function loadData() {
  const userId = userStore.userId || 'default_user'
  collections.value = getCollections(userId)
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})

onPullDownRefresh(() => {
  loadData()
  setTimeout(() => uni.stopPullDownRefresh(), 600)
})

function goDetail(collectionId: string) {
  uni.navigateTo({ url: `/pages/collection/detail?collectionId=${collectionId}` })
}

function goBooking() {
  uni.switchTab({ url: '/pages/booking/index' })
}

function onScrollEnd() {
  // 分页加载预留
}
</script>

<style scoped lang="scss">
.collection-list-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.page-header {
  background: linear-gradient(160deg, #FDE8E8 0%, #FBF8F5 100%);
  padding: 24rpx 32rpx 28rpx;
}

.page-title {
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 6rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: $text-secondary;
}

/* 列表滚动区 */
.list-scroll {
  flex: 1;
  padding: 20rpx 24rpx 0;
}

/* 网格布局 */
.collection-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.collection-item {
  width: calc((100% - 20rpx) / 2);
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

/* 印章照片 */
.item-photo-wrap {
  width: 100%;
  height: 320rpx;
  position: relative;
}

.item-photo {
  width: 100%;
  height: 100%;
}

.item-photo-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FDE8E8, #F5E8E0);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 80rpx;
}

/* 信息 */
.item-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.item-name {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  font-size: 24rpx;
  color: $text-hint;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx 80rpx;
}

.empty-icon-wrap {
  width: 160rpx;
  height: 160rpx;
  background-color: #FDE8E8;
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
  margin-bottom: 40rpx;
}

.empty-btn {
  height: 80rpx;
  padding: 0 48rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(196, 26, 26, 0.3);
}

.empty-btn-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 底部占位 */
.list-bottom {
  height: calc(40rpx + env(safe-area-inset-bottom));
}
</style>
