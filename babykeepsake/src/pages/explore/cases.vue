<template>
  <view class="cases-page">
    <!-- 案例网格 -->
    <view v-if="caseList.length > 0" class="cases-grid">
      <view
        v-for="(item, idx) in caseList"
        :key="item.caseId"
        class="case-card"
        @click="onCaseClick(item, idx)"
      >
        <image
          class="case-photo"
          :src="item.photos && item.photos.length > 0 ? item.photos[0] : '/static/images/default-keepsake.png'"
          mode="aspectFill"
        />
        <view class="case-info">
          <text class="case-title">{{ item.title }}</text>
          <text class="case-desc text-ellipsis-2">{{ item.description }}</text>
          <view class="case-meta">
            <view class="style-tag">
              <text class="style-tag-text">{{ styleLabel(item.designStyle) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!loading" class="empty-state">
      <text class="empty-icon-text">🖼</text>
      <text class="empty-text">暂无案例展示</text>
      <text class="empty-hint">敬请期待更多作品</text>
    </view>

    <!-- 加载更多 -->
    <view v-if="hasMore" class="load-more" @click="loadMore">
      <text class="load-more-text">{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>

    <view v-if="!hasMore && caseList.length > 0" class="no-more">
      <text class="no-more-text">— 已经到底了 —</text>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { getKeepsakeCases } from '@/services/keepsake'

interface KeepsakeCase {
  caseId: string
  typeId: string
  title: string
  description: string
  photos: string[]
  designStyle: string
  createdAt: number
}

const caseList = ref<KeepsakeCase[]>([])
const typeId = ref('')
const currentPage = ref(1)
const hasMore = ref(false)
const loading = ref(false)

const styleMap: Record<string, string> = {
  modern: '现代简约',
  vintage: '复古经典',
  cartoon: '卡通趣味',
  traditional: '传统国风',
  custom: '个性定制'
}

function styleLabel(style: string): string {
  return styleMap[style] || '其他风格'
}

onLoad((options) => {
  if (options?.typeId) {
    typeId.value = options.typeId
    loadCases()
  }
})

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    loadMore()
  }
})

function loadCases() {
  loading.value = true
  const result = getKeepsakeCases(typeId.value, currentPage.value, 10)
  if (currentPage.value === 1) {
    caseList.value = result.list
  } else {
    caseList.value = [...caseList.value, ...result.list]
  }
  hasMore.value = result.hasMore
  loading.value = false
}

function loadMore() {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  loadCases()
}

function onCaseClick(item: KeepsakeCase, idx: number) {
  // 收集当前所有案例的图片用于预览
  const allPhotos: string[] = []
  caseList.value.forEach((c) => {
    if (c.photos && c.photos.length > 0) {
      allPhotos.push(...c.photos)
    }
  })
  const currentPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : ''
  uni.previewImage({
    current: currentPhoto,
    urls: allPhotos.length > 0 ? allPhotos : [currentPhoto]
  })
}
</script>

<style scoped lang="scss">
.cases-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: 20rpx 24rpx;
}

/* 双列网格 */
.cases-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.case-card {
  width: calc(50% - 10rpx);
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.case-photo {
  width: 100%;
  height: 300rpx;
  background-color: #FFE8DD;
}

.case-info {
  padding: 20rpx 24rpx;
}

.case-title {
  font-size: 28rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.case-meta {
  display: flex;
  align-items: center;
}

.style-tag {
  background-color: #FFF3ED;
  border-radius: 8rpx;
  padding: 4rpx 14rpx;
}

.style-tag-text {
  font-size: 22rpx;
  color: $primary;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon-text {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 30rpx;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: $text-hint;
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.load-more-text {
  font-size: 26rpx;
  color: $primary;
  font-weight: 500;
}

/* 到底了 */
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: $text-hint;
}

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
