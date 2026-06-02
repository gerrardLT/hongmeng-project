<template>
  <view class="index-page">
    <!-- 顶部标题 -->
    <view class="header-section">
      <view class="header-left">
        <text class="app-name">PatternCraft</text>
        <text class="app-subtitle">中式纹样设计</text>
      </view>
      <view class="header-badge">
        <text class="badge-icon">◈</text>
      </view>
    </view>

    <!-- 每日纹样推荐卡片 -->
    <view class="daily-card" @click="goDailyDetail">
      <view class="daily-border-decor">
        <view class="daily-corner daily-corner-tl"></view>
        <view class="daily-corner daily-corner-tr"></view>
        <view class="daily-corner daily-corner-bl"></view>
        <view class="daily-corner daily-corner-br"></view>
      </view>
      <view class="daily-inner">
        <view class="daily-preview" :style="{ backgroundColor: dailyPreviewColor }">
          <text class="daily-preview-icon">❋</text>
        </view>
        <view class="daily-info">
          <view class="daily-tag">
            <text class="daily-tag-text">每日推荐</text>
          </view>
          <text class="daily-name">{{ dailyPatternData.name }}</text>
          <text class="daily-story">{{ dailyPatternData.story }}</text>
        </view>
      </view>
      <view class="daily-footer">
        <text class="daily-more">查看详情 →</text>
      </view>
    </view>

    <!-- 纹样分类入口 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">纹样分类</text>
      </view>
      <view class="category-grid">
        <view
          v-for="item in categories"
          :key="item.key"
          class="category-item"
          @click="goLibrary(item.key)"
        >
          <view class="category-icon-wrap" :style="{ backgroundColor: item.bgColor }">
            <text class="category-icon">{{ item.icon }}</text>
          </view>
          <text class="category-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 最近使用的纹样 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近使用</text>
        <text v-if="recentPatterns.length > 0" class="section-link" @click="goWorks">查看全部</text>
      </view>
      <scroll-view
        v-if="recentPatterns.length > 0"
        class="recent-scroll"
        scroll-x
        :show-scrollbar="false"
      >
        <view class="recent-list">
          <view
            v-for="pattern in recentPatterns"
            :key="pattern.patternId"
            class="recent-card"
            @click="goDesign(pattern.patternId)"
          >
            <view class="recent-preview" :style="{ backgroundColor: getPatternColor(pattern.category) }">
              <text class="recent-preview-icon">✦</text>
            </view>
            <text class="recent-name">{{ pattern.name }}</text>
          </view>
        </view>
      </scroll-view>
      <view v-else class="empty-tip">
        <text class="empty-icon">✧</text>
        <text class="empty-text">还没有使用过纹样</text>
        <text class="empty-sub">去纹样库探索精美纹样吧</text>
      </view>
    </view>

    <!-- 快速设计入口 -->
    <view class="design-entry" @click="goDesignNew">
      <view class="design-btn">
        <text class="design-btn-icon">✎</text>
        <text class="design-btn-text">开始设计</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// @ts-ignore - alpha 版本类型声明兼容
import { onShow } from '@dcloudio/uni-app'
import { usePatternStore } from '@/store'
import type { Pattern, PatternCategory } from '@/types/models'

const patternStore = usePatternStore()

// 每日推荐数据
const dailyPatternData = computed(() => {
  const daily = patternStore.dailyPattern
  if (daily) {
    const found = patternStore.patterns.find(p => p.patternId === daily.patternId)
    return {
      name: found?.name || '云雷纹',
      story: daily.story || '源自商周青铜器，象征天地交融、气象万千。',
      patternId: daily.patternId,
      category: found?.category || 'chinese-traditional'
    }
  }
  return {
    name: '云雷纹',
    story: '源自商周青铜器，以连续回旋的线条构成，象征天地交融、气象万千，是中国最古老的装饰纹样之一。',
    patternId: '',
    category: 'chinese-traditional' as PatternCategory
  }
})

const dailyPreviewColor = computed(() => {
  return getPatternColor(dailyPatternData.value.category as PatternCategory)
})

// 最近使用的纹样（取最近5个）
const recentPatterns = ref<Pattern[]>([])

// 纹样分类
interface CategoryItem {
  key: PatternCategory
  name: string
  icon: string
  bgColor: string
}

const categories: CategoryItem[] = [
  { key: 'chinese-traditional', name: '中国传统', icon: '◇', bgColor: '#FFF0F0' },
  { key: 'miao', name: '苗族', icon: '◆', bgColor: '#F0F4FF' },
  { key: 'tibetan', name: '藏族', icon: '❖', bgColor: '#FFF8E6' },
  { key: 'yi', name: '彝族', icon: '✦', bgColor: '#F0FFF0' },
  { key: 'zhuang', name: '壮族', icon: '❋', bgColor: '#FFF0F8' },
  { key: 'uyghur', name: '维吾尔族', icon: '✿', bgColor: '#F0FFFF' }
]

/**
 * 根据分类返回对应的预览色块颜色
 */
function getPatternColor(category: PatternCategory | string): string {
  const colorMap: Record<string, string> = {
    'chinese-traditional': '#C41A16',
    'miao': '#4A6FA5',
    'tibetan': '#D4A843',
    'yi': '#2E7D32',
    'zhuang': '#AD1457',
    'uyghur': '#00838F'
  }
  return colorMap[category] || '#C41A16'
}

/**
 * 加载最近使用纹样
 */
function loadRecentPatterns() {
  try {
    const saved = uni.getStorageSync('patterncraft_recent_patterns') as Pattern[] | undefined
    if (saved && Array.isArray(saved)) {
      recentPatterns.value = saved.slice(0, 5)
    }
  } catch (e) {
    console.error('loadRecentPatterns error:', e)
  }
}

// 导航方法
function goDailyDetail() {
  const pid = dailyPatternData.value.patternId
  if (pid) {
    uni.navigateTo({ url: `/pages/library/detail?id=${pid}` })
  } else {
    uni.switchTab({ url: '/pages/library/index' })
  }
}

function goLibrary(category: PatternCategory) {
  uni.switchTab({
    url: '/pages/library/index',
    success() {
      // 切换分类需要通过 store 传递
      patternStore.setCategory(category)
    }
  })
}

function goDesign(patternId: string) {
  uni.navigateTo({ url: `/pages/design/index?patternId=${patternId}` })
}

function goDesignNew() {
  uni.navigateTo({ url: '/pages/design/index' })
}

function goWorks() {
  uni.switchTab({ url: '/pages/works/index' })
}

onShow(() => {
  patternStore.loadDailyPattern()
  patternStore.loadFavorites()
  loadRecentPatterns()
})
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100vh;
  background-color: $bg-primary;
  padding: $spacing-md;
  padding-bottom: calc(env(safe-area-inset-bottom) + 160rpx);
}

/* ===== 顶部标题 ===== */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-size: $font-xxl;
  font-weight: 700;
  color: $primary-color;
  letter-spacing: 2rpx;
}

.app-subtitle {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: 4rpx;
}

.header-badge {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-icon {
  font-size: $font-xl;
  color: #FFFFFF;
}

/* ===== 每日纹样推荐卡片 ===== */
.daily-card {
  position: relative;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
  border: 2rpx solid $border-color;
}

.daily-border-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.daily-corner {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-color: $secondary-color;
}

.daily-corner-tl {
  top: 12rpx;
  left: 12rpx;
  border-top: 4rpx solid;
  border-left: 4rpx solid;
  border-color: $secondary-color;
}

.daily-corner-tr {
  top: 12rpx;
  right: 12rpx;
  border-top: 4rpx solid;
  border-right: 4rpx solid;
  border-color: $secondary-color;
}

.daily-corner-bl {
  bottom: 12rpx;
  left: 12rpx;
  border-bottom: 4rpx solid;
  border-left: 4rpx solid;
  border-color: $secondary-color;
}

.daily-corner-br {
  bottom: 12rpx;
  right: 12rpx;
  border-bottom: 4rpx solid;
  border-right: 4rpx solid;
  border-color: $secondary-color;
}

.daily-inner {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-sm;
}

.daily-preview {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.daily-preview-icon {
  font-size: 80rpx;
  color: rgba(255, 255, 255, 0.6);
}

.daily-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12rpx;
}

.daily-tag {
  align-self: flex-start;
  background: linear-gradient(135deg, $primary-color, #E74C3C);
  padding: 4rpx 20rpx;
  border-radius: $radius-pill;
}

.daily-tag-text {
  font-size: $font-xs;
  color: #FFFFFF;
  font-weight: 500;
}

.daily-name {
  font-size: $font-xl;
  font-weight: 700;
  color: $text-primary;
}

.daily-story {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.daily-footer {
  display: flex;
  justify-content: flex-end;
}

.daily-more {
  font-size: $font-sm;
  color: $primary-color;
  font-weight: 500;
}

/* ===== 区域通用 ===== */
.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.section-link {
  font-size: $font-sm;
  color: $primary-color;
}

/* ===== 纹样分类网格 ===== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md $spacing-sm;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.95);
  }
}

.category-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-icon {
  font-size: $font-xxl;
  color: $primary-color;
}

.category-name {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 500;
}

/* ===== 最近使用横向滚动 ===== */
.recent-scroll {
  white-space: nowrap;
}

.recent-list {
  display: inline-flex;
  gap: $spacing-md;
  padding-bottom: $spacing-xs;
}

.recent-card {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  width: 180rpx;
  flex-shrink: 0;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.95);
  }
}

.recent-preview {
  width: 180rpx;
  height: 180rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;
}

.recent-preview-icon {
  font-size: 56rpx;
  color: rgba(255, 255, 255, 0.5);
}

.recent-name {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180rpx;
}

/* ===== 空状态 ===== */
.empty-tip {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
  border: 2rpx dashed $border-color;
}

.empty-icon {
  font-size: 64rpx;
  color: $text-hint;
}

.empty-text {
  font-size: $font-md;
  color: $text-secondary;
}

.empty-sub {
  font-size: $font-sm;
  color: $text-hint;
}

/* ===== 快速设计入口 ===== */
.design-entry {
  position: fixed;
  left: $spacing-md;
  right: $spacing-md;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  z-index: 100;
}

.design-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  height: 96rpx;
  border-radius: $radius-pill;
  background: linear-gradient(135deg, #C41A16, #A01510);
  box-shadow: 0 8rpx 32rpx rgba(196, 26, 22, 0.35);
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.97);
  }
}

.design-btn-icon {
  font-size: $font-xl;
  color: #FFFFFF;
}

.design-btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 600;
  letter-spacing: 4rpx;
}
</style>
