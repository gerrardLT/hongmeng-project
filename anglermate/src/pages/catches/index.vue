<template>
  <view class="catches-page">
    <!-- 下拉刷新 -->
    <scroll-view
      class="scroll-area"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
    >
      <!-- 顶部统计 -->
      <view class="section-stats" v-if="catchesStore.stats">
        <StatPanel :stats="catchesStore.stats" />
      </view>

      <!-- 筛选栏 -->
      <view class="filter-bar">
        <view class="filter-row">
          <!-- 钓点筛选 -->
          <picker
            class="filter-picker"
            :range="spotOptions"
            range-key="label"
            @change="onSpotChange"
            :value="spotPickerIndex"
          >
            <view class="picker-btn">
              <text class="picker-label">{{ currentSpotLabel }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>

          <!-- 鱼种筛选 -->
          <picker
            class="filter-picker"
            :range="speciesOptions"
            @change="onSpeciesChange"
            :value="speciesPickerIndex"
          >
            <view class="picker-btn">
              <text class="picker-label">{{ currentSpeciesLabel }}</text>
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>

        <view class="filter-row">
          <!-- 起始日期 -->
          <picker
            class="filter-picker"
            mode="date"
            :value="startDate"
            @change="onStartDateChange"
          >
            <view class="picker-btn">
              <text class="picker-label">{{ startDate || '开始日期' }}</text>
              <text class="picker-arrow">📅</text>
            </view>
          </picker>

          <!-- 结束日期 -->
          <picker
            class="filter-picker"
            mode="date"
            :value="endDate"
            @change="onEndDateChange"
          >
            <view class="picker-btn">
              <text class="picker-label">{{ endDate || '结束日期' }}</text>
              <text class="picker-arrow">📅</text>
            </view>
          </picker>

          <!-- 重置 -->
          <view class="reset-btn" @click="resetFilters">
            <text class="reset-text">重置</text>
          </view>
        </view>
      </view>

      <!-- 渔获列表 -->
      <view class="list-section">
        <view v-if="loading && catchesStore.filteredList.length === 0" class="loading-inline">
          <view class="mini-spinner" />
          <text class="loading-tip">加载中...</text>
        </view>

        <template v-else-if="catchesStore.filteredList.length > 0">
          <CatchCard
            v-for="item in catchesStore.filteredList"
            :key="item.recordId"
            :record="item"
            @click="goDetail(item.recordId)"
          />
          <view v-if="loadingMore" class="load-more">
            <view class="mini-spinner" />
            <text class="loading-tip">加载更多...</text>
          </view>
          <view v-else-if="noMore" class="load-more">
            <text class="no-more-text">— 没有更多了 —</text>
          </view>
        </template>

        <Empty v-else text="还没有渔获记录，去记录一条吧" icon="🐟" />
      </view>
    </scroll-view>

    <!-- 浮动添加按钮 -->
    <view class="fab-btn" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>

    <Loading :show="submitting" text="加载中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCatchesStore } from '@/store/catches'
import { useSpotsStore } from '@/store/spots'
import { getCatchList, getCatchStats } from '@/services/catches'
import { FISH_SPECIES } from '@/types/models'
import CatchCard from '@/components/CatchCard.vue'
import StatPanel from '@/components/StatPanel.vue'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const catchesStore = useCatchesStore()
const spotsStore = useSpotsStore()

const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const submitting = ref(false)
const page = ref(1)
const pageSize = 20
const noMore = ref(false)

// 筛选相关
const startDate = ref('')
const endDate = ref('')
const spotPickerIndex = ref(0)
const speciesPickerIndex = ref(0)

// 钓点选项
const spotOptions = computed(() => {
  const list = spotsStore.spotList.map((s) => ({ label: s.name, value: s.spotId }))
  return [{ label: '全部钓点', value: '' }, ...list]
})

const currentSpotLabel = computed(() => spotOptions.value[spotPickerIndex.value]?.label || '全部钓点')

// 鱼种选项
const speciesOptions = computed(() => ['全部鱼种', ...FISH_SPECIES])

const currentSpeciesLabel = computed(() => speciesOptions.value[speciesPickerIndex.value] || '全部鱼种')

function onSpotChange(e: any) {
  const idx = Number(e.detail.value)
  spotPickerIndex.value = idx
  const spotId = spotOptions.value[idx]?.value || ''
  catchesStore.setFilters({ spotId })
  refresh()
}

function onSpeciesChange(e: any) {
  const idx = Number(e.detail.value)
  speciesPickerIndex.value = idx
  const species = idx === 0 ? '' : speciesOptions.value[idx]
  catchesStore.setFilters({ species })
  refresh()
}

function onStartDateChange(e: any) {
  startDate.value = e.detail.value
  applyDateFilter()
}

function onEndDateChange(e: any) {
  endDate.value = e.detail.value
  applyDateFilter()
}

function applyDateFilter() {
  if (startDate.value && endDate.value) {
    catchesStore.setFilters({ dateRange: [startDate.value, endDate.value] })
  } else {
    catchesStore.setFilters({ dateRange: [] })
  }
  refresh()
}

function resetFilters() {
  spotPickerIndex.value = 0
  speciesPickerIndex.value = 0
  startDate.value = ''
  endDate.value = ''
  catchesStore.clearFilters()
  refresh()
}

async function fetchList(pageNum: number = 1) {
  try {
    const params: Record<string, any> = {
      page: pageNum,
      pageSize
    }
    if (catchesStore.filterSpotId) params.spotId = catchesStore.filterSpotId
    if (catchesStore.filterSpecies) params.fishSpecies = catchesStore.filterSpecies
    if (catchesStore.filterDateRange.length === 2) {
      params.startDate = catchesStore.filterDateRange[0]
      params.endDate = catchesStore.filterDateRange[1]
    }
    const res = await getCatchList(params)
    if (pageNum === 1) {
      catchesStore.setCatchList(res.list, res.total)
    } else {
      catchesStore.setCatchList([...catchesStore.catchList, ...res.list], res.total)
    }
    noMore.value = catchesStore.catchList.length >= res.total
  } catch (e) {
    console.error('获取渔获列表失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

async function fetchStats() {
  try {
    const data = await getCatchStats()
    catchesStore.setStats(data)
  } catch (e) {
    console.error('获取统计失败:', e)
  }
}

async function refresh() {
  page.value = 1
  noMore.value = false
  loading.value = true
  await Promise.all([fetchList(1), fetchStats()])
  loading.value = false
}

async function onRefresh() {
  refreshing.value = true
  await refresh()
  refreshing.value = false
}

async function loadMore() {
  if (loadingMore.value || noMore.value) return
  loadingMore.value = true
  page.value++
  await fetchList(page.value)
  loadingMore.value = false
}

function goDetail(recordId: string) {
  uni.navigateTo({ url: `/pages/catches/detail?recordId=${recordId}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/catches/create' })
}

onMounted(() => {
  catchesStore.init()
  spotsStore.init()
  refresh()
})
</script>

<style scoped lang="scss">
.catches-page {
  min-height: 100vh;
  background: #F5F5F5;
  position: relative;
}

.scroll-area {
  height: 100vh;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.section-stats {
  padding-top: 24rpx;
  margin-bottom: 20rpx;
}

/* 筛选栏 */
.filter-bar {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.filter-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-picker {
  flex: 1;
}

.picker-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #EEEEEE;
}

.picker-label {
  font-size: 24rpx;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker-arrow {
  font-size: 20rpx;
  color: #BDBDBD;
  margin-left: 8rpx;
}

.reset-btn {
  padding: 16rpx 28rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 12rpx;
  flex-shrink: 0;
}

.reset-text {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

/* 列表 */
.list-section {
  padding-bottom: 160rpx;
}

.loading-inline {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
}

.mini-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid #F0F0F0;
  border-top-color: #FF6B35;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-tip {
  font-size: 24rpx;
  color: #999999;
}

.load-more {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0 48rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #CCCCCC;
}

/* 浮动按钮 */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8F5E);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.4);
  z-index: 100;

  &:active {
    transform: scale(0.92);
    opacity: 0.9;
  }
}

.fab-icon {
  font-size: 52rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
  margin-top: -4rpx;
}
</style>
