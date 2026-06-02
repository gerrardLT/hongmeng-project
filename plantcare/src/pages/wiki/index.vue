<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="搜索植物名称、学名"
          placeholder-class="placeholder"
          @input="onSearch"
        />
        <view v-if="keyword" class="search-clear" @click="clearSearch">
          <text class="search-clear-text">×</text>
        </view>
      </view>
    </view>

    <!-- 难度筛选 -->
    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-row">
        <view
          v-for="item in difficultyTags"
          :key="item.value"
          class="filter-tag"
          :class="{ 'filter-tag--active': selectedDifficulty === item.value }"
          @click="onDifficultyChange(item.value)"
        >
          <text class="filter-tag-text">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 分类筛选 -->
    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-row">
        <view
          v-for="item in categoryTags"
          :key="item.value"
          class="filter-tag"
          :class="{ 'filter-tag--active': selectedCategory === item.value }"
          @click="onCategoryChange(item.value)"
        >
          <text class="filter-tag-text">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 列表 -->
    <view v-else-if="filteredList.length > 0" class="wiki-list">
      <WikiCard
        v-for="item in filteredList"
        :key="item.speciesId"
        :wiki="item"
        @click="goDetail(item.speciesId)"
      />
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">📖</text>
      <text class="empty-text">未找到相关植物</text>
      <text class="empty-hint">试试换个关键词搜索</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { PlantWiki, PlantDifficulty, PlantCategory } from '@/types/models'
import { useWikiStore } from '@/store/wiki'
import { loadWikiData, searchPlants } from '@/services/wiki'
import WikiCard from '@/components/WikiCard.vue'

const wikiStore = useWikiStore()

const keyword = ref('')
const allPlants = ref<PlantWiki[]>([])
const loading = ref(false)
const selectedDifficulty = ref<PlantDifficulty | ''>('')
const selectedCategory = ref<PlantCategory | ''>('')

const difficultyTags: { label: string; value: PlantDifficulty | '' }[] = [
  { label: '全部', value: '' },
  { label: '新手', value: 'beginner' },
  { label: '进阶', value: 'intermediate' },
  { label: '专家', value: 'expert' }
]

const categoryTags: { label: string; value: PlantCategory | '' }[] = [
  { label: '全部', value: '' },
  { label: '净化空气', value: 'airPurify' },
  { label: '观赏', value: 'ornamental' },
  { label: '易养护', value: 'easycare' },
  { label: '多肉', value: 'succulent' },
  { label: '草本', value: 'herb' },
  { label: '花卉', value: 'flower' }
]

const filteredList = computed(() => {
  let list = allPlants.value
  if (selectedDifficulty.value) {
    list = list.filter((p) => p.difficulty === selectedDifficulty.value)
  }
  if (selectedCategory.value) {
    list = list.filter((p) => p.category.includes(selectedCategory.value as PlantCategory))
  }
  return list
})

onShow(async () => {
  wikiStore.init()
  await loadData()
})

async function loadData() {
  loading.value = true
  try {
    allPlants.value = await loadWikiData()
  } catch (e) {
    console.error('[wiki page] load error:', e)
  } finally {
    loading.value = false
  }
}

async function onSearch() {
  if (!keyword.value.trim()) {
    allPlants.value = await loadWikiData()
    return
  }
  allPlants.value = await searchPlants(keyword.value)
}

function clearSearch() {
  keyword.value = ''
  onSearch()
}

function onDifficultyChange(val: PlantDifficulty | '') {
  selectedDifficulty.value = val
  wikiStore.setDifficulty(val)
}

function onCategoryChange(val: PlantCategory | '') {
  selectedCategory.value = val
  wikiStore.setCategory(val)
}

function goDetail(speciesId: string) {
  uni.navigateTo({
    url: `/pages/wiki/detail?speciesId=${encodeURIComponent(speciesId)}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
}

.search-bar {
  padding: $spacing-md;
  background: $bg-card;
}

.search-input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-grey;
  border-radius: $radius-pill;
  padding: 0 $spacing-md;
  height: 72rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: $spacing-sm;
}

.search-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  height: 72rpx;
}

.placeholder {
  color: $text-placeholder;
}

.search-clear {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear-text {
  font-size: 36rpx;
  color: $text-light;
}

.filter-scroll {
  white-space: nowrap;
  background: $bg-card;
  padding: 0 $spacing-md $spacing-sm;
}

.filter-row {
  display: flex;
  flex-direction: row;
  gap: $spacing-xs;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 28rpx;
  border-radius: $radius-pill;
  background: $bg-grey;
  flex-shrink: 0;

  &--active {
    background: $primary-color;

    .filter-tag-text {
      color: $text-white;
    }
  }
}

.filter-tag-text {
  font-size: $font-sm;
  color: $text-secondary;
  white-space: nowrap;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.loading-text {
  font-size: $font-md;
  color: $text-light;
}

.wiki-list {
  padding: $spacing-md;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: $font-md;
  color: $text-secondary;
}
</style>
