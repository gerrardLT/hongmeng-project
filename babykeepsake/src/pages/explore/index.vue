<template>
  <view class="explore-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="onSearchClick">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索纪念品...</text>
      </view>
    </view>

    <!-- 分类 Tab -->
    <scroll-view class="category-tabs" scroll-x :show-scrollbar="false">
      <view
        v-for="tab in categoryTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentCategory === tab.value }"
        @click="onTabChange(tab.value)"
      >
        <text class="tab-text" :class="{ 'tab-text-active': currentCategory === tab.value }">
          {{ tab.label }}
        </text>
      </view>
    </scroll-view>

    <!-- 纪念品列表 -->
    <view class="keepsake-list">
      <view v-if="filteredList.length > 0" class="list-grid">
        <view
          v-for="item in filteredList"
          :key="item.typeId"
          class="list-grid-item"
        >
          <KeepsakeCard
            :keepsake="item"
            size="normal"
            :showPrice="true"
            @click="goDetail(item.typeId)"
            @preview="onKeepsakePreview(item)"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon-text">📦</text>
        <text class="empty-text">该分类暂无纪念品</text>
        <text class="empty-hint">换个分类看看吧</text>
      </view>
    </view>

    <!-- 底部安全区 -->
    <view class="safe-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import KeepsakeCard from '@/components/KeepsakeCard.vue'
import { useKeepsakeStore } from '@/store/keepsake'
import { getKeepsakeList } from '@/services/keepsake'
import type { KeepsakeType, KeepsakeCategory } from '@/types/models'

const keepsakeStore = useKeepsakeStore()

const currentCategory = ref<KeepsakeCategory | 'all'>('all')
const keepsakeList = ref<KeepsakeType[]>([])

// 分类 Tab 数据
const categoryTabs = [
  { label: '全部', value: 'all' as const },
  { label: '手足印', value: 'handprint' as KeepsakeCategory },
  { label: '胎发', value: 'hair' as KeepsakeCategory },
  { label: '乳牙', value: 'tooth' as KeepsakeCategory },
  { label: '出生', value: 'birth' as KeepsakeCategory },
  { label: '成长', value: 'growth' as KeepsakeCategory }
]

// 根据分类筛选
const filteredList = computed(() => {
  if (currentCategory.value === 'all') return keepsakeList.value
  return keepsakeList.value.filter((k) => k.category === currentCategory.value)
})

function loadData() {
  const list = getKeepsakeList()
  keepsakeList.value = list
  keepsakeStore.setKeepsakeTypes(list)
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})

onPullDownRefresh(() => {
  loadData()
  setTimeout(() => {
    uni.stopPullDownRefresh()
  }, 600)
})

// 搜索栏点击
function onSearchClick() {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

// Tab 切换
function onTabChange(value: KeepsakeCategory | 'all') {
  currentCategory.value = value
}

// 跳转详情
function goDetail(typeId: string) {
  uni.navigateTo({ url: `/pages/explore/detail?typeId=${typeId}` })
}

// 预览图片
function onKeepsakePreview(item: KeepsakeType) {
  if (item.photos && item.photos.length > 0) {
    uni.previewImage({
      current: item.photos[0],
      urls: item.photos
    })
  }
}
</script>

<style scoped lang="scss">
.explore-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 搜索栏 */
.search-bar {
  padding: 16rpx 32rpx 12rpx;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  background-color: $bg-card;
  border-radius: 36rpx;
  padding: 0 28rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.search-icon {
  font-size: 30rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: $text-hint;
}

/* 分类 Tab */
.category-tabs {
  white-space: nowrap;
  padding: 8rpx 32rpx 16rpx;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 32rpx;
  background-color: $bg-card;
  transition: all 0.25s ease;
}

.tab-item.active {
  background: linear-gradient(135deg, $primary, $primary-light);
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.3);
}

.tab-text {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 500;
}

.tab-text-active {
  color: #FFFFFF;
  font-weight: 600;
}

/* 列表网格 */
.keepsake-list {
  padding: 8rpx 32rpx;
}

.list-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.list-grid-item {
  width: calc(50% - 10rpx);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
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

/* 安全区 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
