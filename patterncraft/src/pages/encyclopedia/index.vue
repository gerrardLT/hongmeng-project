<template>
  <view class="encyclopedia-page">
    <scroll-view class="page-scroll" scroll-y :show-scrollbar="false">
      <!-- 每日纹样 -->
      <view class="daily-card">
        <view class="daily-header">
          <text class="daily-label">📜 每日纹样</text>
          <text class="daily-date">{{ todayDate }}</text>
        </view>
        <view v-if="dailyPatternInfo" class="daily-body" @click="goDetail(dailyPatternInfo.patternId)">
          <image
            v-if="dailyPatternInfo.previewUrl"
            class="daily-img"
            :src="dailyPatternInfo.previewUrl"
            :title="dailyPatternInfo.name"
            mode="aspectFill"
          />
          <view v-else class="daily-img-placeholder">
            <text class="daily-icon">◈</text>
          </view>
          <view class="daily-info">
            <text class="daily-name">{{ dailyPatternInfo.name }}</text>
            <text class="daily-story">{{ patternStore.dailyPattern?.story || dailyPatternInfo.description }}</text>
            <view class="daily-tags">
              <text class="meaning-tag">{{ dailyPatternInfo.meaning }}</text>
            </view>
          </view>
        </view>
        <view v-else class="daily-empty">
          <text class="daily-empty-text">今日推荐加载中...</text>
        </view>
      </view>

      <!-- 分类浏览 -->
      <view class="section">
        <text class="section-title">分类浏览</text>
        <scroll-view class="category-bar" scroll-x :show-scrollbar="false">
          <view
            v-for="cat in categoryTabs"
            :key="cat.value"
            class="category-tab"
            :class="{ active: currentCategory === cat.value }"
            @click="currentCategory = cat.value"
          >
            <text class="category-tab-icon">{{ cat.icon }}</text>
            <text class="category-tab-text">{{ cat.label }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 纹样列表 -->
      <view class="section">
        <text class="section-title">纹样图鉴</text>
        <view v-if="displayedPatterns.length === 0" class="list-empty">
          <Empty icon="🀄" text="该分类暂无纹样" />
        </view>
        <view v-else class="pattern-list">
          <view
            v-for="p in displayedPatterns"
            :key="p.patternId"
            class="pattern-item"
            @click="goDetail(p.patternId)"
          >
            <image
              v-if="p.previewUrl"
              class="pattern-thumb"
              :src="p.previewUrl"
              :title="p.name"
              mode="aspectFill"
              lazy-load
            />
            <view v-else class="pattern-thumb pattern-thumb-empty">
              <text class="thumb-icon">◈</text>
            </view>
            <view class="pattern-info">
              <text class="pattern-name">{{ p.name }}</text>
              <text class="pattern-desc">{{ p.description }}</text>
              <view class="pattern-tags">
                <text class="tag-meaning">{{ p.meaning }}</text>
                <text v-if="p.origin" class="tag-origin">{{ p.origin }}</text>
              </view>
            </view>
            <text class="pattern-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 应用场景指南 -->
      <view class="section">
        <text class="section-title">应用场景指南</text>
        <view class="scene-grid">
          <view
            v-for="scene in sceneGuides"
            :key="scene.title"
            class="scene-card"
          >
            <text class="scene-icon">{{ scene.icon }}</text>
            <text class="scene-name">{{ scene.title }}</text>
            <text class="scene-desc">{{ scene.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 底部安全距离 -->
      <view class="safe-bottom" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePatternStore } from '@/store/pattern'
import type { PatternCategory } from '@/types/models'
import Empty from '@/components/common/Empty.vue'

const patternStore = usePatternStore()

const currentCategory = ref<PatternCategory | 'all'>('all')

const categoryTabs: { value: PatternCategory | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '🏮' },
  { value: 'chinese-traditional', label: '传统纹样', icon: '🏯' },
  { value: 'miao', label: '苗族纹样', icon: '🪡' },
  { value: 'tibetan', label: '藏族纹样', icon: '🏔️' },
  { value: 'yi', label: '彝族纹样', icon: '🔥' },
  { value: 'zhuang', label: '壮族纹样', icon: '🌾' },
  { value: 'uyghur', label: '维吾尔纹样', icon: '🕌' }
]

const sceneGuides = [
  { icon: '🏛️', title: '建筑装饰', desc: '门窗、藻井、瓦当等传统建筑装饰纹样' },
  { icon: '👘', title: '服饰纺织', desc: '刺绣、织锦、蜡染等民族服饰纹样' },
  { icon: '🏺', title: '陶瓷器皿', desc: '青花、粉彩、釉下彩等瓷器纹样' },
  { icon: '🖌️', title: '书画艺术', desc: '印章、团花、边框等书画装饰纹样' }
]

const todayDate = computed(() => {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日`
})

const dailyPatternInfo = computed(() => {
  if (!patternStore.dailyPattern) return patternStore.patterns[0] || null
  return patternStore.patterns.find(p => p.patternId === patternStore.dailyPattern?.patternId) || patternStore.patterns[0] || null
})

const displayedPatterns = computed(() => {
  if (currentCategory.value === 'all') return patternStore.patterns
  return patternStore.patterns.filter(p => p.category === currentCategory.value)
})

function goDetail(patternId: string) {
  uni.navigateTo({
    url: `/pages/library/detail?patternId=${patternId}`
  })
}

onMounted(() => {
  patternStore.loadDailyPattern()
})
</script>

<style scoped lang="scss">
.encyclopedia-page {
  min-height: 100vh;
  background-color: $bg-primary;
}

.page-scroll {
  height: 100vh;
}

/* 每日纹样 */
.daily-card {
  margin: $spacing-md;
  background: linear-gradient(135deg, $primary-color, darken($primary-color, 8%));
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.daily-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-md $spacing-lg;
}

.daily-label {
  font-size: $font-lg;
  font-weight: 600;
  color: #FFFFFF;
}

.daily-date {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.7);
}

.daily-body {
  display: flex;
  gap: $spacing-md;
  padding: 0 $spacing-lg $spacing-lg;
}

.daily-img {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
}

.daily-img-placeholder {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-md;
  background-color: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.daily-icon {
  font-size: 64rpx;
  color: rgba(255, 255, 255, 0.5);
}

.daily-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.daily-name {
  font-size: $font-lg;
  font-weight: 600;
  color: #FFFFFF;
}

.daily-story {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.daily-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.meaning-tag {
  font-size: $font-xs;
  color: $secondary-color;
  background-color: rgba(212, 168, 67, 0.2);
  padding: 2rpx 16rpx;
  border-radius: $radius-pill;
}

.daily-empty {
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.daily-empty-text {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.6);
}

/* 分类 */
.section {
  margin: $spacing-lg $spacing-md;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
  padding-left: $spacing-xs;
  border-left: 6rpx solid $primary-color;
}

.category-bar {
  white-space: nowrap;
}

.category-tab {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  margin-right: $spacing-sm;
  border-radius: $radius-md;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;

  &.active {
    background-color: rgba(196, 26, 22, 0.08);
    border-color: $primary-color;

    .category-tab-text {
      color: $primary-color;
      font-weight: 500;
    }
  }
}

.category-tab-icon {
  font-size: 40rpx;
}

.category-tab-text {
  font-size: $font-xs;
  color: $text-secondary;
}

/* 纹样列表 */
.list-empty {
  padding: $spacing-xl 0;
}

.pattern-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.pattern-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  &:active {
    transform: scale(0.99);
  }
}

.pattern-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
}

.pattern-thumb-empty {
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-icon {
  font-size: 48rpx;
  color: $secondary-color;
  opacity: 0.3;
}

.pattern-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  overflow: hidden;
}

.pattern-name {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
}

.pattern-desc {
  font-size: $font-sm;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pattern-tags {
  display: flex;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.tag-meaning {
  font-size: $font-xs;
  color: $primary-color;
  background-color: rgba(196, 26, 22, 0.06);
  padding: 2rpx 12rpx;
  border-radius: $radius-pill;
}

.tag-origin {
  font-size: $font-xs;
  color: $secondary-color;
  background-color: rgba(212, 168, 67, 0.1);
  padding: 2rpx 12rpx;
  border-radius: $radius-pill;
}

.pattern-arrow {
  font-size: $font-xl;
  color: $text-hint;
  flex-shrink: 0;
}

/* 应用场景 */
.scene-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.scene-card {
  width: calc(50% - 8rpx);
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  box-shadow: $shadow-sm;
  border: 2rpx solid $border-color;
}

.scene-icon {
  font-size: 56rpx;
}

.scene-name {
  font-size: $font-md;
  font-weight: 600;
  color: $text-primary;
}

.scene-desc {
  font-size: $font-xs;
  color: $text-secondary;
  text-align: center;
  line-height: 1.4;
}

.safe-bottom {
  height: calc($spacing-lg + env(safe-area-inset-bottom));
}
</style>
