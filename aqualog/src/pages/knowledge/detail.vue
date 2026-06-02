<template>
  <view class="detail-page" v-if="article">
    <view class="card">
      <view class="category-tag">
        <text class="category-text">{{ categoryLabel }}</text>
      </view>
      <text class="article-title">{{ article.title }}</text>
      <view class="tag-list" v-if="article.tags.length > 0">
        <view v-for="tag in article.tags" :key="tag" class="tag-item">
          <text class="tag-text">{{ tag }}</text>
        </view>
      </view>
      <view class="article-content">
        <text class="content-text">{{ article.content }}</text>
      </view>
    </view>

    <!-- 相关推荐 -->
    <view class="related-section" v-if="relatedArticles.length > 0">
      <text class="section-title">相关推荐</text>
      <KnowledgeCard
        v-for="item in relatedArticles"
        :key="item.articleId"
        :article="item"
        @tap="goDetail(item.articleId)"
      />
    </view>
  </view>

  <view class="detail-page loading-page" v-else>
    <EmptyState icon="📄" title="加载中..." />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { KnowledgeArticle, KnowledgeCategory } from '@/types/models'
import { getArticleById } from '@/services/knowledge'
import KnowledgeCard from '@/components/KnowledgeCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const article = ref<KnowledgeArticle | null>(null)
const relatedArticles = ref<KnowledgeArticle[]>([])

const categoryMap: Record<KnowledgeCategory, string> = {
  paramGuide: '参数指南',
  faq: '常见问题',
  maintenanceGuide: '维护指南'
}

const categoryLabel = ref('')

function loadArticle(articleId: string) {
  const data = getArticleById(articleId)
  if (!data) return

  article.value = data
  categoryLabel.value = categoryMap[data.category] || data.category

  // 设置页面标题
  uni.setNavigationBarTitle({ title: data.title })

  // 加载相关文章
  relatedArticles.value = []
  if (data.relatedIds && data.relatedIds.length > 0) {
    const related: KnowledgeArticle[] = []
    for (const id of data.relatedIds) {
      const relatedItem = getArticleById(id)
      if (relatedItem) {
        related.push(relatedItem)
      }
    }
    relatedArticles.value = related
  }
}

function goDetail(articleId: string) {
  // 重新加载当前页面数据
  loadArticle(articleId)
  // 滚动到顶部
  uni.pageScrollTo({ scrollTop: 0, duration: 200 })
}

onLoad((options) => {
  const articleId = options?.articleId as string
  if (articleId) {
    loadArticle(articleId)
  }
})
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background: #F5F7FA;
  padding: $spacing-md;
  padding-bottom: $spacing-xxl;
}

.loading-page {
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  background: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.category-tag {
  display: inline-flex;
  background: $primary-lighter;
  border-radius: $radius-pill;
  padding: 6rpx 20rpx;
  margin-bottom: $spacing-sm;
}

.category-text {
  font-size: $font-xs;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.article-title {
  display: block;
  font-size: 40rpx;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.4;
  margin-bottom: $spacing-sm;
}

.tag-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: $spacing-md;
}

.tag-item {
  background: #F0F0F0;
  border-radius: $radius-sm;
  padding: 4rpx 14rpx;
  margin-right: 12rpx;
  margin-bottom: 8rpx;
}

.tag-text {
  font-size: $font-xs;
  color: $text-secondary;
}

.article-content {
  margin-top: $spacing-sm;
}

.content-text {
  font-size: $font-sm;
  color: $text-primary;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-all;
}

.related-section {
  margin-top: $spacing-sm;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}
</style>
