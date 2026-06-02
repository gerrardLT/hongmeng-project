<template>
  <view class="explore-page">
    <!-- 顶部搜索栏 -->
    <view class="search-section">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索工作室名称..."
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="onSearch"
        />
        <text v-if="keyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        v-for="item in sortOptions"
        :key="item.value"
        class="filter-item"
        :class="{ active: sortBy === item.value }"
        @click="changeSort(item.value)"
      >
        <text class="filter-text">{{ item.label }}</text>
      </view>
    </view>

    <!-- 工作室列表 -->
    <scroll-view
      class="studio-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="loading && studioList.length === 0" class="loading-wrap">
        <text class="loading-text">加载中...</text>
      </view>

      <view v-else-if="studioList.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-title">未找到工作室</text>
        <text class="empty-desc">换个关键词试试吧</text>
      </view>

      <view v-else class="studio-list-inner">
        <view
          v-for="studio in enrichedStudioList"
          :key="studio.studioId"
          class="studio-item"
          @click="goStudioDetail(studio.studioId)"
        >
          <StudioCard :studio="studio" />
        </view>

        <view v-if="loadingMore" class="load-more">
          <text class="load-more-text">加载更多...</text>
        </view>

        <view v-if="noMore && studioList.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
      </view>

      <view class="safe-bottom"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import StudioCard from '@/components/StudioCard.vue'
import { getStudioList, searchStudios } from '@/services/studio'
import type { Studio } from '@/types/models'

const keyword = ref('')
const sortBy = ref<'distance' | 'rating' | 'price'>('distance')
const studioList = ref<Studio[]>([])
const loading = ref(false)
const refreshing = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)

const sortOptions = [
  { label: '距离最近', value: 'distance' },
  { label: '评分最高', value: 'rating' },
  { label: '价格最低', value: 'price' }
] as const

const enrichedStudioList = computed(() => {
  return studioList.value.map((studio) => {
    const enriched = { ...studio } as Studio & { priceMin?: number; priceMax?: number }
    const match = studio.priceRange.match(/(\d+)[^\d]+(\d+)/)
    if (match) {
      enriched.priceMin = parseInt(match[1], 10)
      enriched.priceMax = parseInt(match[2], 10)
    }
    return enriched
  })
})

async function loadData(isRefresh = false) {
  if (isRefresh) {
    refreshing.value = true
    noMore.value = false
  } else if (studioList.value.length > 0) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    let list: Studio[]
    if (keyword.value.trim()) {
      list = await searchStudios(keyword.value)
    } else {
      list = await getStudioList()
    }

    // 排序
    list = sortStudios(list, sortBy.value)

    if (isRefresh) {
      studioList.value = list
    } else {
      studioList.value = list
    }

    noMore.value = true
  } catch (e) {
    console.error('loadData error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
    loadingMore.value = false
  }
}

function sortStudios(list: Studio[], sort: 'distance' | 'rating' | 'price'): Studio[] {
  const arr = [...list]
  if (sort === 'distance') {
    arr.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
  } else if (sort === 'rating') {
    arr.sort((a, b) => b.rating - a.rating)
  } else if (sort === 'price') {
    arr.sort((a, b) => {
      const priceA = extractMinPrice(a.priceRange)
      const priceB = extractMinPrice(b.priceRange)
      return priceA - priceB
    })
  }
  return arr
}

function extractMinPrice(priceRange: string): number {
  const match = priceRange.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

function onSearch() {
  loadData(true)
}

function clearSearch() {
  keyword.value = ''
  loadData(true)
}

function changeSort(value: 'distance' | 'rating' | 'price') {
  sortBy.value = value
  loadData(true)
}

function onRefresh() {
  loadData(true)
}

function onLoadMore() {
  // Mock 数据已全部加载，这里仅做提示
  if (!noMore.value) {
    loadData()
  }
}

function goStudioDetail(studioId: string) {
  uni.navigateTo({ url: `/pages/explore/studio-detail?studioId=${studioId}` })
}

onLoad(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.explore-page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

/* 搜索栏 */
.search-section {
  padding: 20rpx 32rpx 16rpx;
  background: linear-gradient(180deg, #FFF0F0 0%, $bg-page 100%);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  background-color: $bg-card;
  border-radius: 36rpx;
  padding: 0 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(255, 107, 107, 0.08);
  border: 1rpx solid rgba(255, 107, 107, 0.12);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
  height: 72rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: $text-hint;
}

.clear-icon {
  font-size: 24rpx;
  color: $text-hint;
  padding: 8rpx;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 32rpx;
  background-color: $bg-page;
  gap: 16rpx;
}

.filter-item {
  padding: 10rpx 28rpx;
  border-radius: 32rpx;
  background-color: $bg-card;
  border: 1rpx solid $border-color;
}

.filter-item.active {
  background-color: $primary;
  border-color: $primary;
}

.filter-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.filter-item.active .filter-text {
  color: #FFFFFF;
  font-weight: 600;
}

/* 工作室列表 */
.studio-list {
  flex: 1;
  padding: 0 32rpx;
}

.studio-list-inner {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  padding-top: 8rpx;
}

.studio-item {
  width: 100%;
}

/* 加载状态 */
.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: $text-secondary;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
}

.load-more-text {
  font-size: 24rpx;
  color: $text-hint;
}

.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: $text-hint;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: $text-hint;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
