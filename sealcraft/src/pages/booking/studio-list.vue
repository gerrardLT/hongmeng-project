<template>
  <view class="studio-list-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索工作室名称或地址"
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="onSearch"
          @input="onSearch"
        />
        <text v-if="keyword" class="clear-icon" @click="onClearSearch">✕</text>
      </view>
    </view>

    <!-- 排序栏 -->
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
      <!-- 服务类型筛选 -->
      <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
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
      </scroll-view>
    </view>

    <!-- 位置提示 -->
    <view v-if="!locationGranted" class="location-tip" @click="getUserLocation">
      <text class="location-tip-icon">📍</text>
      <text class="location-tip-text">点击获取位置，发现附近工作室</text>
      <text class="location-tip-action">授权</text>
    </view>

    <!-- 工作室列表 -->
    <scroll-view scroll-y class="list-scroll" @scrolltolower="onLoadMore">
      <view v-if="displayList.length > 0" class="list-content">
        <view
          v-for="studio in displayList"
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
        <text class="empty-icon">🏛️</text>
        <text class="empty-title">未找到工作室</text>
        <text class="empty-desc">换个关键词或筛选条件试试吧</text>
      </view>

      <!-- 底部留白 -->
      <view class="list-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStudios, getNearbyStudios } from '@/services/studio'
import StudioCard from '@/components/StudioCard.vue'
import type { Studio } from '@/types/models'

type SealCategory = 'name' | 'leisure' | 'bookplate' | 'signature' | 'collection'

const sortOptions = [
  { label: '综合推荐', value: 'rating' },
  { label: '距离最近', value: 'distance' },
  { label: '评分最高', value: 'score' }
]

const serviceFilters = [
  { label: '全部', value: '' },
  { label: '姓名章', value: 'name' },
  { label: '闲章', value: 'leisure' },
  { label: '藏书章', value: 'bookplate' },
  { label: '签名章', value: 'signature' },
  { label: '收藏章', value: 'collection' }
]

const keyword = ref('')
const currentSort = ref('rating')
const currentService = ref('')
const allStudios = ref<Studio[]>([])
const locationGranted = ref(false)
const userLat = ref(0)
const userLon = ref(0)
const selectMode = ref(false)

const displayList = computed(() => {
  let list = [...allStudios.value]

  // 关键词过滤
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw)
    )
  }

  // 服务类型过滤
  if (currentService.value) {
    list = list.filter((s) => s.services.includes(currentService.value as SealCategory))
  }

  // 排序
  if (currentSort.value === 'distance' && locationGranted.value) {
    list = list.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999))
  } else if (currentSort.value === 'score') {
    list = list.sort((a, b) => b.rating - a.rating)
  } else {
    list = list.sort((a, b) => b.rating - a.rating)
  }

  return list
})

function onSearch() {
  // computed displayList 自动过滤
}

function onClearSearch() {
  keyword.value = ''
}

function onSortChange(value: string) {
  if (value === 'distance' && !locationGranted.value) {
    // 请求位置权限前先弹出 Modal 说明用途并让用户确认
    uni.showModal({
      title: '位置权限说明',
      content: 'SealCraft 需要获取您的位置信息，仅用于按距离排序并展示附近工作室。您的位置信息不会上传至服务器或分享给第三方。',
      confirmText: '允许',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          currentSort.value = value
          getUserLocation()
        }
        // 用户取消则不切换排序，保持当前排序不变
      }
    })
    return
  }
  currentSort.value = value
}

function onServiceFilter(value: string) {
  currentService.value = value
}

function onStudioClick(studio: Studio) {
  if (selectMode.value) {
    uni.$emit('studioSelected', studio)
    uni.navigateBack()
  } else {
    uni.navigateTo({ url: `/pages/booking/studio-detail?studioId=${studio.studioId}` })
  }
}

function onLoadMore() {
  // 预留分页
}

function loadStudios() {
  if (locationGranted.value && userLat.value && userLon.value) {
    allStudios.value = getNearbyStudios(userLat.value, userLon.value)
  } else {
    allStudios.value = getStudios()
  }
}

function getUserLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      userLat.value = res.latitude
      userLon.value = res.longitude
      locationGranted.value = true
      loadStudios()
    },
    fail: () => {
      uni.showToast({ title: '无法获取位置，显示全部工作室', icon: 'none' })
      loadStudios()
    }
  })
}

onLoad((options) => {
  if (options?.mode === 'select') {
    selectMode.value = true
    uni.setNavigationBarTitle({ title: '选择工作室' })
  }
  loadStudios()
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
  gap: 12rpx;
}

.sort-item {
  padding: 12rpx 28rpx;
  border-radius: $radius-xl;
  background-color: $bg-page;
}

.sort-active {
  background-color: #FDF0F0;
}

.sort-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.sort-text-active {
  color: $primary;
  font-weight: 600;
}

.filter-scroll {
  width: 100%;
}

.filter-row {
  display: flex;
  flex-direction: row;
  gap: 12rpx;
  padding-right: 24rpx;
}

.filter-chip {
  padding: 8rpx 22rpx;
  border-radius: $radius-xl;
  background-color: $bg-page;
  border: 2rpx solid transparent;
  flex-shrink: 0;
}

.filter-active {
  background-color: #FDF0F0;
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

.location-tip {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #FFFBF0;
  border-bottom: 1rpx solid $border-color;
}

.location-tip-icon {
  font-size: 26rpx;
  margin-right: 10rpx;
}

.location-tip-text {
  flex: 1;
  font-size: 24rpx;
  color: $text-secondary;
}

.location-tip-action {
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
  padding: 4rpx 16rpx;
  border: 1rpx solid $primary;
  border-radius: $radius-md;
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

.list-bottom {
  height: 40rpx;
}
</style>
