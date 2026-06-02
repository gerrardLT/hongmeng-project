<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索装备名称、备注、位置"
          :value="gearStore.searchKeyword"
          @input="onSearchInput"
        />
        <text
          v-if="gearStore.searchKeyword"
          class="search-clear"
          @click="gearStore.setSearch('')"
        >✕</text>
      </view>
    </view>

    <!-- 分类 tabs -->
    <scroll-view class="category-tabs" scroll-x :show-scrollbar="false">
      <view
        v-for="tab in categoryTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: gearStore.filterCategory === tab.value }"
        @click="gearStore.setFilter(tab.value)"
      >
        <view
          v-if="tab.value !== 'all'"
          class="tab-dot"
          :style="{ backgroundColor: tab.color }"
        />
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </scroll-view>

    <!-- 按位置筛选 -->
    <view v-if="gearStore.allLocations.length > 0" class="filter-bar">
      <text class="filter-label">按位置筛选:</text>
      <picker
        :value="locationIndex"
        :range="locationOptions"
        @change="onLocationChange"
      >
        <view class="filter-picker">
          <text class="filter-value">{{ currentLocation }}</text>
          <text class="filter-arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- 装备列表 -->
    <view v-if="gearStore.filteredGears.length > 0" class="gear-list">
      <view
        v-for="gear in gearStore.filteredGears"
        :key="gear.gearId"
        class="gear-item"
        @click="goDetail(gear.gearId)"
      >
        <view v-if="gear.photos.length > 0" class="gear-thumb">
          <image class="gear-thumb-img" :src="gear.photos[0]" mode="aspectFill" />
        </view>
        <view v-else class="gear-thumb gear-thumb-placeholder">
          <text class="gear-thumb-icon">🏕️</text>
        </view>
        <view class="gear-info">
          <text class="gear-name">{{ gear.name }}</text>
          <view class="gear-meta">
            <view class="gear-category-tag">
              <view class="category-dot" :style="{ backgroundColor: getCategoryColor(gear.category) }" />
              <text class="category-label">{{ getCategoryLabel(gear.category) }}</text>
            </view>
            <text class="gear-weight">{{ formatWeightGram(gear.weight) }}</text>
            <text class="gear-quantity">数量{{ gear.quantity }}</text>
          </view>
        </view>
        <text class="gear-arrow">›</text>
      </view>
    </view>

    <!-- 空状态 -->
    <Empty
      v-else
      icon="⛺"
      text="还没有装备，快去添加吧"
    />

    <!-- 悬浮添加按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">＋</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useGearStore } from '@/store/gear'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP, GEAR_CATEGORY_COLORS } from '@/types/models'
import { formatWeightGram } from '@/utils/format'
import Empty from '@/components/common/Empty.vue'

const gearStore = useGearStore()

const categoryTabs = computed(() => {
  const tabs: { value: GearCategory | 'all'; label: string; color?: string }[] = [
    { value: 'all', label: '全部' }
  ]
  ;(Object.keys(GEAR_CATEGORY_MAP) as GearCategory[]).forEach((key) => {
    tabs.push({
      value: key,
      label: GEAR_CATEGORY_MAP[key],
      color: GEAR_CATEGORY_COLORS[key]
    })
  })
  return tabs
})

const locationOptions = computed(() => ['所有位置', ...gearStore.allLocations])

const locationIndex = computed(() => {
  if (!gearStore.filterLocation) return 0
  const idx = gearStore.allLocations.indexOf(gearStore.filterLocation)
  return idx >= 0 ? idx + 1 : 0
})

const currentLocation = computed(() => {
  return gearStore.filterLocation || '所有位置'
})

function onSearchInput(e: any) {
  gearStore.setSearch(e.detail.value)
}

function onLocationChange(e: any) {
  const idx = Number(e.detail.value)
  gearStore.filterLocation = idx === 0 ? '' : gearStore.allLocations[idx - 1]
}

function getCategoryColor(category: GearCategory): string {
  return GEAR_CATEGORY_COLORS[category] || '#9E9E9E'
}

function getCategoryLabel(category: GearCategory): string {
  return GEAR_CATEGORY_MAP[category] || '其他'
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/gear/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/gear/create' })
}

onShow(() => {
  gearStore.init()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
}

.search-bar {
  padding: 24rpx 24rpx 16rpx;
  background-color: #ffffff;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
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

.search-clear {
  font-size: 28rpx;
  color: #999999;
  padding: 8rpx;
}

.category-tabs {
  white-space: nowrap;
  background-color: #ffffff;
  padding: 0 24rpx 20rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  background-color: #f5f5f5;
  transition: all 0.2s;

  &.active {
    background-color: #2E7D32;
  }
}

.tab-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.tab-text {
  font-size: 26rpx;
  color: #666666;

  .active & {
    color: #ffffff;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  margin-top: 2rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #666666;
  margin-right: 16rpx;
}

.filter-picker {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 24rpx;
}

.filter-value {
  font-size: 26rpx;
  color: #333333;
  margin-right: 8rpx;
}

.filter-arrow {
  font-size: 20rpx;
  color: #999999;
}

.gear-list {
  padding: 24rpx;
}

.gear-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.gear-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.gear-thumb-img {
  width: 100%;
  height: 100%;
}

.gear-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E8F5E9;
}

.gear-thumb-icon {
  font-size: 48rpx;
}

.gear-info {
  flex: 1;
  min-width: 0;
}

.gear-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gear-meta {
  display: flex;
  align-items: center;
  margin-top: 12rpx;
  flex-wrap: wrap;
  gap: 12rpx;
}

.gear-category-tag {
  display: flex;
  align-items: center;
}

.category-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 6rpx;
}

.category-label {
  font-size: 24rpx;
  color: #666666;
}

.gear-weight {
  font-size: 24rpx;
  color: #999999;
}

.gear-quantity {
  font-size: 24rpx;
  color: #999999;
}

.gear-arrow {
  font-size: 36rpx;
  color: #cccccc;
  margin-left: 12rpx;
  flex-shrink: 0;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 200rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: #2E7D32;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(46, 125, 50, 0.4);
}

.fab-icon {
  font-size: 48rpx;
  color: #ffffff;
  line-height: 1;
}
</style>
