<template>
  <view class="knowledge-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <text class="search-icon">🔍</text>
      <input
        class="search-input"
        v-model="keyword"
        placeholder="搜索水族知识..."
        confirm-type="search"
        @confirm="doSearch"
      />
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="category-tabs">
      <view
        v-for="cat in categories"
        :key="String(cat.value)"
        class="cat-tab"
        :class="{ active: currentCategory === cat.value }"
        @click="selectCategory(cat.value)"
      >
        <text class="cat-tab-text">{{ cat.label }}</text>
      </view>
    </scroll-view>

    <!-- 文章列表 -->
    <view class="article-list">
      <KnowledgeCard
        v-for="article in filteredArticles"
        :key="article.articleId"
        :article="article"
        @tap="goDetail(article.articleId)"
      />
    </view>

    <EmptyState
      v-if="filteredArticles.length === 0"
      icon="📚"
      title="暂无相关文章"
      description="换个关键词试试"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { KnowledgeArticle, KnowledgeCategory } from '@/types/models'
import { getArticles, searchArticles } from '@/services/knowledge'
import KnowledgeCard from '@/components/KnowledgeCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

// 搜索关键词
const keyword = ref('')

// 当前分类
const currentCategory = ref<KnowledgeCategory | null>(null)

// 分类列表
const categories: { label: string; value: KnowledgeCategory | null }[] = [
  { label: '全部', value: null },
  { label: '参数指南', value: 'paramGuide' },
  { label: '常见问题', value: 'faq' },
  { label: '维护指南', value: 'maintenanceGuide' }
]

// 文章列表
const allArticles = ref<KnowledgeArticle[]>([])
const searchResults = ref<KnowledgeArticle[] | null>(null)

const filteredArticles = computed(() => {
  const source = searchResults.value !== null ? searchResults.value : allArticles.value
  if (currentCategory.value) {
    return source.filter((a) => a.category === currentCategory.value)
  }
  return source
})

function selectCategory(value: KnowledgeCategory | null) {
  currentCategory.value = value
  // 切换分类时清除搜索
  if (value !== null) {
    keyword.value = ''
    searchResults.value = null
  }
}

function doSearch() {
  const kw = keyword.value.trim()
  if (!kw) {
    searchResults.value = null
    return
  }
  searchResults.value = searchArticles(kw)
  currentCategory.value = null
}

function goDetail(articleId: string) {
  uni.navigateTo({
    url: `/pages/knowledge/detail?articleId=${articleId}`
  })
}

function loadArticles() {
  allArticles.value = getArticles()
}

onShow(() => {
  loadArticles()
})
</script>

<style scoped lang="scss">
.knowledge-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding: $spacing-md;
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
}

/* 搜索栏 */
.search-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-card;
  border-radius: $radius-pill;
  padding: $spacing-xs $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.search-icon {
  font-size: 36rpx;
  margin-right: $spacing-xs;
}

.search-input {
  flex: 1;
  font-size: $font-sm;
  color: $text-primary;
  height: 64rpx;
}

/* 分类标签 */
.category-tabs {
  white-space: nowrap;
  margin-bottom: $spacing-md;
}

.cat-tab {
  display: inline-flex;
  padding: 12rpx 28rpx;
  border-radius: $radius-pill;
  margin-right: 16rpx;
  background: $bg-card;
  box-shadow: $shadow-sm;
  transition: all 0.2s;

  &.active {
    background: $primary-color;
  }
}

.cat-tab-text {
  font-size: $font-sm;
  color: $text-secondary;

  .cat-tab.active & {
    color: #FFFFFF;
    font-weight: $font-weight-medium;
  }
}

/* 文章列表 */
.article-list {
  margin-top: $spacing-xs;
}
</style>
