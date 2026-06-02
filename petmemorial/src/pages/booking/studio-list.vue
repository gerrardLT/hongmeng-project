<template>
  <view class="studio-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索工作室名称/地址"
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="onSearch"
          @input="onSearch"
        />
        <text v-if="keyword" class="clear-icon" @click="onClearSearch">✕</text>
      </view>
    </view>

    <!-- 排序与筛选 -->
    <view class="filter-bar">
      <view class="sort-row">
        <view
          v-for="sort in sortOptions"
          :key="sort.value"
          class="sort-item"
          :class="{ 'sort-active': currentSort === sort.value }"
          @click="onSortChange(sort.value)"
        >
          <text class="sort-text" :class="{ 'sort-text-active': currentSort === sort.value }">{{ sort.label }}</text>
        </view>
      </view>
      <view class="filter-row">
        <view
          v-for="cat in serviceFilters"
          :key="cat.value"
          class="filter-chip"
          :class="{ 'filter-active': currentService === cat.value }"
          @click="onServiceFilter(cat.value)"
        >
          <text class="filter-text" :class="{ 'filter-text-active': currentService === cat.value }">{{ cat.label }}</text>
        </view>
      </view>
    </view>

    <!-- 工作室列表 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="onLoadMore">
      <view v-if="studioList.length > 0" class="list-content">
        <view
          v-for="studio in studioList"
          :key="studio.studioId"
          class="card-wrap"
        >
          <StudioCard
            :studio="studio"
            @click="onStudioClick(studio)"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🏠</text>
        <text class="empty-title">未找到工作室</text>
        <text class="empty-desc">换个关键词或筛选条件试试吧</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="hasMore" class="load-more">
        <text class="load-more-text">加载更多...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudios } from '@/services/studio'
import StudioCard from '@/components/StudioCard.vue'
import type { Studio, MemorialCategory } from '@/types/models'

const sortOptions = [
  { label: '综合推荐', value: 'rating' },
  { label: '距离最近', value: 'distance' },
  { label: '评分最高', value: 'score' }
]

const serviceFilters = [
  { label: '全部', value: '' },
  { label: '爪印', value: 'pawprint' as MemorialCategory },
  { label: '毛发', value: 'fur' as MemorialCategory },
  { label: '肖像', value: 'portrait' as MemorialCategory },
  { label: '印章', value: 'seal' as MemorialCategory },
  { label: '首饰', value: 'jewelry' as MemorialCategory }
]

const keyword = ref('')
const currentSort = ref('rating')
const currentService = ref('')
const studioList = ref<Studio[]>([])
const page = ref(1)
const hasMore = ref(false)
const userLat = ref(0)
const userLon = ref(0)
const selectMode = ref(false)

function loadStudios(reset = false) {
  if (reset) {
    page.value = 1
    studioList.value = []
  }

  const sortBy = currentSort.value === 'distance' ? 'distance' : currentSort.value === 'score' ? 'rating' : 'rating'
  const result = getStudios(
    userLat.value || undefined,
    userLon.value || undefined,
    {
      keyword: keyword.value || undefined,
      service: (currentService.value || undefined) as MemorialCategory | undefined,
      sortBy,
      order: currentSort.value === 'distance' ? 'asc' : 'desc',
      page: page.value,
      pageSize: 20
    }
  )

  if (reset) {
    studioList.value = result.list
  } else {
    studioList.value.push(...result.list)
  }
  hasMore.value = result.hasMore
}

function onSearch() {
  loadStudios(true)
}

function onClearSearch() {
  keyword.value = ''
  loadStudios(true)
}

function onSortChange(value: string) {
  currentSort.value = value
  loadStudios(true)
}

function onServiceFilter(value: string) {
  currentService.value = value
  loadStudios(true)
}

function onStudioClick(studio: Studio) {
  uni.navigateTo({ url: `/pages/booking/studio-detail?studioId=${studio.studioId}` })
}

function onLoadMore() {
  if (!hasMore.value) return
  page.value++
  loadStudios()
}

function getUserLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      userLat.value = res.latitude
      userLon.value = res.longitude
      loadStudios(true)
    },
    fail: () => {
      // 获取位置失败，使用默认坐标（北京）
      userLat.value = 39.9087
      userLon.value = 116.4605
      loadStudios(true)
    }
  })
}

onLoad((options) => {
  if (options?.mode === 'select') {
    selectMode.value = true
  }
  getUserLocation()
  loadStudios(true)
})
</script>

<style scoped lang="scss">
.studio-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.search-bar {
  padding: 20rpx 24rpx;
  background-color: $bg-card;
}

.search-input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-page;
  border-radius: $radius-xl;
  padding: 0 24rpx;
  height: 72rpx;
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
  color: $text-hint;
  font-size: 28rpx;
}

.clear-icon {
  font-size: 28rpx;
  color: $text-hint;
  padding: 8rpx;
}

.filter-bar {
  background-color: $bg-card;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid $border-color;
}

.sort-row {
  display: flex;
  flex-direction: row;
  margin-bottom: 16rpx;
}

.sort-item {
  padding: 12rpx 28rpx;
  border-radius: $radius-xl;
  margin-right: 16rpx;
  background-color: $bg-page;
}

.sort-active {
  background-color: #F3E8FF;
}

.sort-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.sort-text-active {
  color: $primary;
  font-weight: 600;
}

.filter-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.filter-chip {
  padding: 8rpx 22rpx;
  border-radius: $radius-xl;
  background-color: $bg-page;
  border: 2rpx solid transparent;
}

.filter-active {
  background-color: #F3E8FF;
  border-color: $primary;
}

.filter-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.filter-text-active {
  color: $primary;
  font-weight: 600;
}

.list-scroll {
  flex: 1;
  overflow: hidden;
}

.list-content {
  padding: 24rpx;
}

.card-wrap {
  margin-bottom: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
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

.load-more {
  padding: 24rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.load-more-text {
  font-size: 26rpx;
  color: $text-hint;
}
</style>
