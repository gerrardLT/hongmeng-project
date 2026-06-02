<template>
  <view class="library-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索纹样名称、寓意、场景…"
          placeholder-class="search-placeholder"
          :value="keyword"
          @input="onSearchInput"
          confirm-type="search"
        />
        <text
          v-if="keyword"
          class="clear-btn"
          @click="clearSearch"
        >✕</text>
      </view>
    </view>

    <!-- 分类 Tab 切换 -->
    <scroll-view scroll-x class="category-tabs" :show-scrollbar="false">
      <view class="tab-list">
        <view
          v-for="tab in categoryTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ 'tab-active': activeCategory === tab.value }"
          @click="onCategoryChange(tab.value)"
        >
          <text class="tab-text" :class="{ 'tab-text-active': activeCategory === tab.value }">
            {{ tab.label }}
          </text>
          <view v-if="activeCategory === tab.value" class="tab-underline" />
        </view>
      </view>
    </scroll-view>

    <!-- 结果数量 -->
    <view class="result-count">
      <text class="count-text">共 {{ filteredPatterns.length }} 个纹样</text>
    </view>

    <!-- 纹样网格列表 -->
    <scroll-view
      scroll-y
      class="pattern-list"
      @scrolltolower="loadMore"
    >
      <view class="grid-wrap">
        <view
          v-for="pattern in displayedPatterns"
          :key="pattern.patternId"
          class="grid-item"
        >
          <PatternCard
            :pattern="cardData(pattern)"
            :show-favorite="true"
            size="medium"
            @click="onPatternClick(pattern.patternId)"
            @favorite="onToggleFavorite(pattern.patternId)"
          />
        </view>
      </view>

      <!-- 空状态 -->
      <Empty
        v-if="filteredPatterns.length === 0"
        icon="🔍"
        text="没有找到匹配的纹样"
      />

      <!-- 底部加载提示 -->
      <view v-if="displayedPatterns.length < filteredPatterns.length" class="load-more">
        <text class="load-more-text">上拉加载更多</text>
      </view>
      <view v-else-if="filteredPatterns.length > 0 && displayedPatterns.length === filteredPatterns.length" class="load-more">
        <text class="load-more-text">— 已展示全部 —</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePatternStore } from '@/store/pattern'
import { useUserStore } from '@/store/user'
import PatternCard from '@/components/PatternCard.vue'
import Empty from '@/components/common/Empty.vue'
import type { Pattern, PatternCategory } from '@/types/models'

const patternStore = usePatternStore()
const userStore = useUserStore()

/** 分类标签配置 */
const categoryTabs: { label: string; value: PatternCategory | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '中国传统', value: 'chinese-traditional' },
  { label: '苗族', value: 'miao' },
  { label: '藏族', value: 'tibetan' },
  { label: '彝族', value: 'yi' },
  { label: '壮族', value: 'zhuang' },
  { label: '维吾尔族', value: 'uyghur' }
]

// 搜索关键词（本地）
const keyword = ref('')
const activeCategory = ref<PatternCategory | 'all'>('all')

// 分页
const pageSize = 20
const currentPage = ref(1)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/** 分类映射（用于显示中文标签） */
const categoryLabelMap: Record<string, string> = {
  'chinese-traditional': '中国传统',
  'miao': '苗族',
  'tibetan': '藏族',
  'yi': '彝族',
  'zhuang': '壮族',
  'uyghur': '维吾尔族'
}

/** 筛选后的纹样 */
const filteredPatterns = computed(() => {
  return patternStore.filteredPatterns
})

/** 当前展示的纹样（分页） */
const displayedPatterns = computed(() => {
  return filteredPatterns.value.slice(0, currentPage.value * pageSize)
})

/** 将 Pattern 数据转换为 PatternCard 需要的格式 */
function cardData(pattern: Pattern) {
  return {
    name: pattern.name,
    category: categoryLabelMap[pattern.category] || pattern.category,
    imageUrl: pattern.previewUrl,
    isFavorite: patternStore.isFavorite(pattern.patternId)
  }
}

/** 搜索输入防抖 */
function onSearchInput(e: { detail: { value: string } }) {
  const value = e.detail?.value ?? ''
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    keyword.value = value
    patternStore.setSearchKeyword(value)
    currentPage.value = 1
  }, 300)
}

/** 清除搜索 */
function clearSearch() {
  keyword.value = ''
  patternStore.setSearchKeyword('')
  currentPage.value = 1
}

/** 切换分类 */
function onCategoryChange(category: PatternCategory | 'all') {
  activeCategory.value = category
  patternStore.setCategory(category)
  currentPage.value = 1
}

/** 加载更多 */
function loadMore() {
  if (displayedPatterns.value.length < filteredPatterns.value.length) {
    currentPage.value++
  }
}

/** 点击纹样跳转详情 */
function onPatternClick(patternId: string) {
  uni.navigateTo({
    url: `/pages/library/detail?patternId=${patternId}`
  })
}

/** 收藏/取消收藏 */
function onToggleFavorite(patternId: string) {
  const userId = userStore.userInfo?.userId || ''
  patternStore.toggleFavorite(patternId, userId)
}

/** 分类变化时重置分页 */
watch(activeCategory, () => {
  currentPage.value = 1
})

/** 组件卸载时清理防抖定时器 */
onBeforeUnmount(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

/** 页面显示时刷新数据 */
onShow(() => {
  patternStore.loadFavorites()
})
</script>

<style scoped lang="scss">
.library-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-primary;
}

/* 搜索栏 */
.search-bar {
  padding: $spacing-md $spacing-md $spacing-sm;
  background-color: $bg-card;
}

.search-input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-secondary;
  border-radius: $radius-pill;
  padding: $spacing-sm $spacing-md;
  gap: $spacing-xs;
}

.search-icon {
  font-size: $font-md;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  height: 48rpx;
  line-height: 48rpx;
}

.search-placeholder {
  color: $text-hint;
  font-size: $font-md;
}

.clear-btn {
  font-size: $font-sm;
  color: $text-hint;
  padding: $spacing-xs;
}

/* 分类 Tab */
.category-tabs {
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
  white-space: nowrap;
}

.tab-list {
  display: flex;
  flex-direction: row;
  padding: 0 $spacing-md;
}

.tab-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-md $spacing-sm;
  flex-shrink: 0;
}

.tab-text {
  font-size: $font-md;
  color: $text-secondary;
  transition: color $transition-fast;
}

.tab-text-active {
  color: $primary-color;
  font-weight: 600;
}

.tab-underline {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  border-radius: 3rpx;
  background-color: $primary-color;
}

/* 结果数量 */
.result-count {
  padding: $spacing-sm $spacing-md;
}

.count-text {
  font-size: $font-sm;
  color: $text-hint;
}

/* 纹样网格 */
.pattern-list {
  flex: 1;
  padding: 0 $spacing-md;
}

.grid-wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.grid-item {
  width: calc(50% - 8rpx);
}

/* 加载更多 */
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg 0;
}

.load-more-text {
  font-size: $font-sm;
  color: $text-hint;
}
</style>
