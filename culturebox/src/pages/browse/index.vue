<template>
  <view class="browse-page">
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          type="text"
          placeholder="搜索书名、作者、导演…"
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

    <!-- 筛选区 -->
    <FilterBar
      :active-type="activeType"
      :active-year="activeYear"
      :active-rating="activeRating"
      @update:active-type="activeType = $event"
      @update:active-year="activeYear = $event"
      @update:active-rating="activeRating = $event"
    />

    <!-- 结果数量 -->
    <view class="result-count">
      <text class="count-text">共 {{ filteredEntries.length }} 条记录</text>
    </view>

    <!-- 条目列表 -->
    <scroll-view
      scroll-y
      class="entry-list"
      @scrolltolower="loadMore"
    >
      <view
        v-for="entry in displayedEntries"
        :key="entry.entryId"
        class="entry-item"
      >
        <EntryCard
          :entry="entry"
          @click="onEntryClick"
        />
      </view>

      <!-- 空状态 -->
      <Empty
        v-if="filteredEntries.length === 0"
        icon="🔍"
        text="没有找到匹配的条目"
      />

      <!-- 底部加载提示 -->
      <view v-if="displayedEntries.length < filteredEntries.length" class="load-more">
        <text class="load-more-text">上拉加载更多</text>
      </view>
      <view v-else-if="filteredEntries.length > 0 && displayedEntries.length === filteredEntries.length" class="load-more">
        <text class="load-more-text">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEntryStore } from '@/store/entry'
import FilterBar from '@/components/FilterBar.vue'
import EntryCard from '@/components/EntryCard.vue'
import Empty from '@/components/common/Empty.vue'
import type { EntryType } from '@/types/models'

const entryStore = useEntryStore()

// 筛选条件
const keyword = ref('')
const activeType = ref<string>('all')
const activeYear = ref<number | null>(null)
const activeRating = ref<number | null>(null)

// 分页
const pageSize = 20
const currentPage = ref(1)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/** 筛选后的条目 */
const filteredEntries = computed(() => {
  let result = [...entryStore.sortedEntries]

  // 类型筛选
  if (activeType.value !== 'all') {
    result = result.filter(e => e.type === activeType.value)
  }

  // 年份筛选
  if (activeYear.value !== null) {
    result = result.filter(e => {
      const entryYear = parseInt(e.date.split('-')[0], 10)
      return entryYear === activeYear.value
    })
  }

  // 评分筛选（X星及以上）
  if (activeRating.value !== null) {
    result = result.filter(e => e.rating >= activeRating.value!)
  }

  // 关键词搜索
  if (keyword.value.trim()) {
    const lower = keyword.value.trim().toLowerCase()
    result = result.filter(e =>
      e.title.toLowerCase().includes(lower) ||
      e.subtitle.toLowerCase().includes(lower)
    )
  }

  return result
})

/** 当前展示的条目（分页） */
const displayedEntries = computed(() => {
  return filteredEntries.value.slice(0, currentPage.value * pageSize)
})

/** 搜索输入防抖 */
function onSearchInput(e: any) {
  const value = e.detail?.value ?? e.target?.value ?? ''
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    keyword.value = value
    currentPage.value = 1
  }, 300)
}

/** 清除搜索 */
function clearSearch() {
  keyword.value = ''
  currentPage.value = 1
}

/** 加载更多 */
function loadMore() {
  if (displayedEntries.value.length < filteredEntries.value.length) {
    currentPage.value++
  }
}

/** 筛选条件变化时重置分页 */
watch([activeType, activeYear, activeRating], () => {
  currentPage.value = 1
})

/** 点击条目跳转详情 */
function onEntryClick(entryId: string) {
  uni.navigateTo({
    url: `/pages/entry/detail?id=${entryId}`
  })
}
</script>

<style scoped lang="scss">
.browse-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
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
  background-color: $bg-color;
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

/* 筛选区 */
.filter-section {
  padding: $spacing-sm $spacing-md;
  background-color: $bg-card;
}

/* 结果数量 */
.result-count {
  padding: $spacing-sm $spacing-md;
}

.count-text {
  font-size: $font-sm;
  color: $text-hint;
}

/* 条目列表 */
.entry-list {
  flex: 1;
  padding: 0 $spacing-md;
}

.entry-item {
  margin-bottom: $spacing-sm;
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
