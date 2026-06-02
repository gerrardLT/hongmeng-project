<template>
  <view class="page">
    <NavBar title="我的钓点" :show-back="false">
      <template #right>
        <text class="sort-btn" @click="toggleSort">{{ sortBy === 'time' ? '⏱' : '📏' }}</text>
      </template>
    </NavBar>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索钓点名称"
          :value="keyword"
          @input="onSearchInput"
          confirm-type="search"
        />
        <text v-if="keyword" class="clear-btn" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 视图切换 -->
    <view class="segment-control">
      <view
        class="segment-item"
        :class="{ active: viewMode === 'list' }"
        @click="viewMode = 'list'"
      >
        <text class="segment-text">列表</text>
      </view>
      <view
        class="segment-item"
        :class="{ active: viewMode === 'map' }"
        @click="switchToMap"
      >
        <text class="segment-text">地图</text>
      </view>
    </view>

    <!-- 列表视图 -->
    <scroll-view
      v-if="viewMode === 'list'"
      class="spot-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <Loading :show="loading && spotList.length === 0" />

      <view v-if="!loading && spotList.length === 0">
        <Empty text="还没有记录钓点" icon="📍" />
      </view>

      <view v-else class="list-content">
        <SpotItem
          v-for="spot in filteredSpots"
          :key="spot.spotId"
          :spot="spot"
          :distance="getDistance(spot)"
          @click="goDetail(spot.spotId)"
        />
        <view v-if="loadingMore" class="loading-more">
          <text class="loading-more-text">加载中...</text>
        </view>
        <view v-if="!hasMore && filteredSpots.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 地图视图 -->
    <view v-if="viewMode === 'map'" class="map-container">
      <map
        class="spot-map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :markers="markers"
        :scale="12"
        show-location
        @markertap="onMarkerTap"
      />
    </view>

    <!-- 浮动添加按钮 -->
    <view class="fab-btn" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'
import SpotItem from '@/components/SpotItem.vue'
import { useSpotsStore } from '@/store/spots'
import { getSpotList, getAllSpotMarkers } from '@/services/spots'
import { getCurrentLocation, calculateDistance } from '@/utils/location'
import type { FishingSpot } from '@/types/models'

const spotsStore = useSpotsStore()

const viewMode = ref<'list' | 'map'>('list')
const keyword = ref('')
const sortBy = ref<'time' | 'distance'>('time')
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 10

const currentLocation = ref<{ latitude: number; longitude: number } | null>(null)
const mapCenter = ref({ latitude: 30.0, longitude: 120.0 })
const markers = ref<any[]>([])

const spotList = computed(() => spotsStore.spotList)

const filteredSpots = computed(() => {
  if (!keyword.value) return spotList.value
  return spotList.value.filter((s) => s.name.includes(keyword.value))
})

function getDistance(spot: FishingSpot): number | undefined {
  if (!currentLocation.value) return undefined
  return calculateDistance(
    currentLocation.value.latitude,
    currentLocation.value.longitude,
    spot.latitude,
    spot.longitude
  )
}

function toggleSort() {
  sortBy.value = sortBy.value === 'time' ? 'distance' : 'time'
  page.value = 1
  hasMore.value = true
  loadSpots()
}

function onSearchInput(e: any) {
  keyword.value = e.detail.value
}

function clearSearch() {
  keyword.value = ''
}

async function loadSpots() {
  loading.value = true
  try {
    const params: any = { page: page.value, pageSize, sortBy: sortBy.value }
    if (sortBy.value === 'distance' && currentLocation.value) {
      params.lat = currentLocation.value.latitude
      params.lng = currentLocation.value.longitude
    }
    const res = await getSpotList(params)
    if (page.value === 1) {
      spotsStore.setSpotList(res.list, res.total)
    } else {
      spotsStore.setSpotList([...spotList.value, ...res.list], res.total)
    }
    hasMore.value = res.hasMore
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

async function onRefresh() {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  await loadSpots()
}

async function onLoadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  page.value++
  await loadSpots()
  loadingMore.value = false
}

async function switchToMap() {
  viewMode.value = 'map'
  await loadMarkers()
}

async function loadMarkers() {
  try {
    const data = await getAllSpotMarkers()
    markers.value = data.map((item, index) => ({
      id: index,
      spotId: item.spotId,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.name,
      iconPath: '/static/images/marker.png',
      width: 32,
      height: 32,
      callout: {
        content: item.name,
        display: 'BYCLICK',
        borderRadius: 8,
        padding: 8,
        fontSize: 14
      }
    }))
    if (data.length > 0) {
      mapCenter.value = { latitude: data[0].latitude, longitude: data[0].longitude }
    }
  } catch (e) {
    console.error('加载地图标记失败', e)
  }
}

function onMarkerTap(e: any) {
  const markerId = e.detail?.markerId ?? e.markerId
  const marker = markers.value[markerId]
  if (marker?.spotId) {
    goDetail(marker.spotId)
  }
}

function goDetail(spotId: string) {
  uni.navigateTo({ url: `/pages/spots/detail?spotId=${spotId}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/spots/create' })
}

async function initLocation() {
  try {
    const loc = await getCurrentLocation()
    currentLocation.value = { latitude: loc.latitude, longitude: loc.longitude }
    mapCenter.value = { latitude: loc.latitude, longitude: loc.longitude }
  } catch (e) {
    console.warn('获取位置失败', e)
  }
}

onMounted(async () => {
  spotsStore.init()
  await initLocation()
  await loadSpots()
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.search-bar {
  padding: 16rpx 32rpx;
  background: #FFFFFF;
}

.search-input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #F5F5F5;
  border-radius: 32rpx;
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
  color: #333333;
}

.clear-btn {
  font-size: 28rpx;
  color: #999999;
  padding: 8rpx;
}

.segment-control {
  display: flex;
  flex-direction: row;
  margin: 20rpx 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.segment-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72rpx;
  transition: all 0.3s;
}

.segment-item.active {
  background: #FF6B35;
}

.segment-item.active .segment-text {
  color: #FFFFFF;
  font-weight: 600;
}

.segment-text {
  font-size: 28rpx;
  color: #666666;
}

.spot-list {
  flex: 1;
  padding: 0 32rpx;
}

.list-content {
  padding-bottom: 160rpx;
}

.loading-more,
.no-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;
}

.loading-more-text,
.no-more-text {
  font-size: 24rpx;
  color: #999999;
}

.map-container {
  flex: 1;
  position: relative;
}

.spot-map {
  width: 100%;
  height: 100%;
}

.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 56rpx;
  background: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  z-index: 99;
}

.fab-icon {
  font-size: 56rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
}

.sort-btn {
  font-size: 36rpx;
}
</style>
