<template>
  <view class="knowledge-card" @click="onTap">
    <view class="card-content">
      <text class="card-title text-ellipsis">{{ article.title }}</text>
      <text class="card-summary text-ellipsis-2">{{ article.summary }}</text>
      <view class="card-footer">
        <view class="category-tag">
          <text class="category-text">{{ categoryLabel }}</text>
        </view>
        <text class="read-more">阅读全文 ›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KnowledgeArticle, KnowledgeCategory } from '@/types/models'

const props = withDefaults(defineProps<{
  article: KnowledgeArticle
}>(), {})

const emit = defineEmits<{
  'tap': [articleId: string]
}>()

const categoryMap: Record<KnowledgeCategory, string> = {
  paramGuide: '参数指南',
  faq: '常见问题',
  maintenanceGuide: '维护指南'
}

const categoryLabel = computed(() => {
  return categoryMap[props.article.category] || props.article.category
})

function onTap() {
  emit('tap', props.article.articleId)
}
</script>

<style scoped lang="scss">
.knowledge-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-sm;

  &:active {
    opacity: 0.9;
    transform: scale(0.99);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.card-summary {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: $spacing-md;
}

.card-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.category-tag {
  background: $primary-lighter;
  border-radius: $radius-pill;
  padding: 4rpx 16rpx;
}

.category-text {
  font-size: $font-xs;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.read-more {
  font-size: $font-xs;
  color: $primary-color;
}
</style>
