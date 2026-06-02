<template>
  <view class="page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="header-title">我的作品</text>
      <view class="header-stats">
        <text class="stats-num">{{ artworkStore.artworkCount }}</text>
        <text class="stats-label">件作品</text>
      </view>
    </view>

    <!-- 作品网格列表 -->
    <scroll-view class="scroll-area" scroll-y>
      <view v-if="artworkStore.sortedArtworks.length > 0" class="grid-wrap">
        <view class="grid-col">
          <ArtworkCard
            v-for="artwork in leftColumn"
            :key="artwork.artworkId"
            :artwork="artwork"
            class="grid-item"
            @click="goToDetail(artwork.artworkId)"
          />
        </view>
        <view class="grid-col">
          <ArtworkCard
            v-for="artwork in rightColumn"
            :key="artwork.artworkId"
            :artwork="artwork"
            class="grid-item"
            @click="goToDetail(artwork.artworkId)"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon-wrap">
          <image
            class="empty-icon"
            src="/static/images/empty-artwork.png"
            mode="aspectFit"
          />
        </view>
        <text class="empty-title">还没有作品</text>
        <text class="empty-desc">完成体验后记录你的作品吧</text>
      </view>

      <!-- 底部安全区域 -->
      <view class="safe-bottom" />
    </scroll-view>

    <!-- 右下角浮动 + 按钮 -->
    <view class="fab-btn" @click="goToUpload">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useArtworkStore } from '@/store/artwork'
import { useUserStore } from '@/store/user'
import { getArtworkList } from '@/services/artwork'
import ArtworkCard from '@/components/ArtworkCard.vue'

const artworkStore = useArtworkStore()
const userStore = useUserStore()

// 双列瀑布流分配
const leftColumn = computed(() => {
  return artworkStore.sortedArtworks.filter((_, i) => i % 2 === 0)
})
const rightColumn = computed(() => {
  return artworkStore.sortedArtworks.filter((_, i) => i % 2 === 1)
})

onShow(async () => {
  if (!userStore.userId) return
  try {
    const list = await getArtworkList(userStore.userId)
    artworkStore.artworkList.splice(0, artworkStore.artworkList.length, ...list)
  } catch (e) {
    console.error('加载作品列表失败:', e)
  }
})

function goToDetail(artworkId: string) {
  uni.navigateTo({ url: `/pages/artwork/detail?artworkId=${artworkId}` })
}

function goToUpload() {
  uni.navigateTo({ url: '/pages/artwork/upload' })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: $bg-card;
  padding: 40rpx 32rpx 28rpx;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  border-bottom: 1rpx solid $border-color;
}

.header-title {
  font-size: 44rpx;
  font-weight: 700;
  color: $text-primary;
}

.header-stats {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 6rpx;
}

.stats-num {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary;
}

.stats-label {
  font-size: 24rpx;
  color: $text-secondary;
}

.scroll-area {
  flex: 1;
  height: 0;
  padding: 24rpx 16rpx 0;
}

.grid-wrap {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  align-items: flex-start;
}

.grid-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.grid-item {
  width: 100%;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.empty-icon-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 100rpx;
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(78, 205, 196, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
  text-align: center;
  line-height: 1.6;
}

/* FAB 按钮 */
.fab-btn {
  position: fixed;
  right: 48rpx;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, $primary, $primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.45);
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  line-height: 1;
  font-weight: 300;
}

.safe-bottom {
  height: calc(48rpx + env(safe-area-inset-bottom));
}

/* 鸿蒙安全区域 */
/* #ifdef APP-HARMONY */
.header {
  padding-top: calc(40rpx + env(safe-area-inset-top));
}
/* #endif */
</style>
