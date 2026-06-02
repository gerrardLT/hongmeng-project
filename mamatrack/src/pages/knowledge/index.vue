<template>
  <view class="page">
    <!-- 分类 Tab -->
    <scroll-view class="knowledge-tabs" scroll-x scroll-with-animation>
      <view class="knowledge-tabs__inner">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="knowledge-tab"
          :class="{ 'knowledge-tab--active': selectedCategory === tab.key }"
          @click="selectedCategory = tab.key"
        >
          <text class="knowledge-tab__text">{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view class="knowledge-scroll" scroll-y>
      <!-- 本周推荐（仅"全部"时显示） -->
      <view v-if="selectedCategory === '' && recommendedList.length > 0" class="knowledge-recommend">
        <view class="knowledge-recommend__header">
          <text class="knowledge-recommend__title">本周推荐</text>
          <text class="knowledge-recommend__week">{{ currentWeekText }}</text>
        </view>
        <scroll-view class="knowledge-recommend__scroll" scroll-x>
          <view class="knowledge-recommend__inner">
            <view
              v-for="item in recommendedList"
              :key="item.id"
              class="knowledge-recommend__card"
              @click="toggleExpand(item.id)"
            >
              <text class="knowledge-recommend__icon">{{ item.icon }}</text>
              <text class="knowledge-recommend__card-title">{{ item.title }}</text>
              <text class="knowledge-recommend__summary">{{ item.summary }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 知识列表 -->
      <view class="knowledge-list">
        <view
          v-for="item in filteredList"
          :key="item.id"
          class="knowledge-list__item"
        >
          <KnowledgeCard :item="item" @click="toggleExpand(item.id)" />
          <!-- 展开内容 -->
          <view
            v-if="expandedId === item.id"
            class="knowledge-detail"
            @click="toggleExpand(item.id)"
          >
            <text class="knowledge-detail__content">{{ item.content }}</text>
            <text class="knowledge-detail__collapse">点击收起</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredList.length === 0" class="knowledge-empty">
        <Empty text="暂无相关知识点" icon="📚" />
      </view>

      <!-- 底部占位 -->
      <view class="knowledge-bottom-spacer" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePregnancyStore } from '@/store/pregnancy'
import { getKnowledgeList, getKnowledgeForWeek } from '@/services/knowledge'
import KnowledgeCard from '@/components/KnowledgeCard.vue'
import Empty from '@/components/common/Empty.vue'
import { formatWeek } from '@/utils/format'

const pregnancyStore = usePregnancyStore()

// 分类标签
const tabs = [
  { key: '', label: '全部' },
  { key: 'guide', label: '增重指南' },
  { key: 'diet', label: '饮食建议' },
  { key: 'exercise', label: '运动建议' },
  { key: 'faq', label: '常见问题' }
]

// 当前选中分类
const selectedCategory = ref('')

// 展开的知识条目 ID
const expandedId = ref<string | null>(null)

// 当前孕周文本
const currentWeekText = computed(() => {
  const { week, day } = pregnancyStore.currentWeek
  if (week <= 0) return ''
  return formatWeek(week, day)
})

// 本周推荐列表
const recommendedList = computed(() => {
  const { week } = pregnancyStore.currentWeek
  if (week <= 0) return []
  return getKnowledgeForWeek(week)
})

// 分类过滤后的列表
const filteredList = computed(() => {
  return getKnowledgeList(selectedCategory.value || undefined)
})

// 切换展开/收起
function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.knowledge-tabs {
  background: #ffffff;
  white-space: nowrap;
  border-bottom: 1rpx solid $border-color;

  &__inner {
    display: flex;
    flex-direction: row;
    padding: 20rpx 24rpx;
  }
}

.knowledge-tab {
  padding: 12rpx 28rpx;
  border-radius: $border-radius-round;
  margin-right: 16rpx;
  background: $bg-secondary;

  &:last-child {
    margin-right: 0;
  }

  &--active {
    background: $primary-color;
  }

  &__text {
    font-size: 26rpx;
    color: $text-secondary;
    font-weight: 500;
  }

  &--active &__text {
    color: #ffffff;
  }
}

.knowledge-scroll {
  height: calc(100vh - 100rpx);
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.knowledge-recommend {
  margin-bottom: 32rpx;

  &__header {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 20rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 700;
    color: $text-primary;
  }

  &__week {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: 500;
  }

  &__scroll {
    white-space: nowrap;
  }

  &__inner {
    display: flex;
    flex-direction: row;
  }

  &__card {
    width: 480rpx;
    background: #ffffff;
    border-radius: $border-radius;
    padding: 28rpx;
    margin-right: 20rpx;
    box-shadow: $shadow-sm;
    display: flex;
    flex-direction: column;
    white-space: normal;
    flex-shrink: 0;

    &:active {
      background: $bg-secondary;
    }
  }

  &__icon {
    font-size: 44rpx;
    margin-bottom: 12rpx;
  }

  &__card-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__summary {
    font-size: 24rpx;
    color: $text-hint;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.knowledge-list {
  &__item {
    margin-bottom: 4rpx;
  }
}

.knowledge-detail {
  background: #ffffff;
  border-radius: 0 0 $border-radius $border-radius;
  padding: 0 24rpx 24rpx;
  margin-top: -8rpx;
  margin-bottom: 16rpx;
  box-shadow: $shadow-sm;

  &__content {
    font-size: 28rpx;
    color: $text-secondary;
    line-height: 1.7;
  }

  &__collapse {
    display: block;
    text-align: center;
    font-size: 22rpx;
    color: $primary-color;
    margin-top: 16rpx;
  }
}

.knowledge-empty {
  padding-top: 120rpx;
}

.knowledge-bottom-spacer {
  height: 40rpx;
}
</style>
