<template>
  <view class="detail-page">
    <!-- 顶部导航 -->
    <NavBar :title="pattern?.name || '纹样详情'" />

    <scroll-view scroll-y class="detail-scroll">
      <!-- 高清预览区 -->
      <view class="preview-section">
        <image
          v-if="pattern?.previewUrl"
          class="preview-image"
          :src="pattern.previewUrl"
          :title="pattern.name"
          mode="aspectFill"
        />
        <view v-else class="preview-placeholder">
          <text class="placeholder-icon">◇</text>
          <text class="placeholder-text">纹样预览</text>
        </view>
      </view>

      <!-- 纹样基本信息 -->
      <view class="info-section">
        <view class="info-header">
          <view class="name-row">
            <text class="pattern-name">{{ pattern?.name }}</text>
            <view class="category-tag">
              <text class="category-tag-text">{{ categoryLabel }}</text>
            </view>
          </view>
          <view
            class="fav-btn"
            @click="onToggleFavorite"
          >
            <text class="fav-icon" :class="{ 'fav-active': isFavorited }">
              {{ isFavorited ? '♥' : '♡' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 文化介绍（Tab 切换） -->
      <view class="culture-section">
        <view class="section-title-row">
          <view class="section-ornament" />
          <text class="section-title">文化介绍</text>
          <view class="section-ornament" />
        </view>

        <view class="culture-tabs">
          <text
            v-for="tab in cultureTabs"
            :key="tab.key"
            class="culture-tab"
            :class="{ 'culture-tab-active': activeCultureTab === tab.key }"
            @click="activeCultureTab = tab.key"
          >{{ tab.label }}</text>
        </view>

        <view class="culture-content">
          <text v-if="activeCultureTab === 'description'" class="culture-text">
            {{ pattern?.description || '暂无描述' }}
          </text>
          <text v-else-if="activeCultureTab === 'origin'" class="culture-text">
            {{ pattern?.origin || '暂无起源信息' }}
          </text>
          <text v-else-if="activeCultureTab === 'meaning'" class="culture-text">
            {{ pattern?.meaning || '暂无寓意信息' }}
          </text>
        </view>
      </view>

      <!-- 历史演变时间线 -->
      <view v-if="timelineEvents.length > 0" class="timeline-section">
        <view class="section-title-row">
          <view class="section-ornament" />
          <text class="section-title">历史演变</text>
          <view class="section-ornament" />
        </view>
        <PatternTimeline :events="timelineEvents" />
      </view>

      <!-- 适用场景 -->
      <view v-if="pattern?.usageScenarios?.length" class="scene-section">
        <view class="section-title-row">
          <view class="section-ornament" />
          <text class="section-title">适用场景</text>
          <view class="section-ornament" />
        </view>
        <view class="scene-tags">
          <view
            v-for="(scene, idx) in pattern.usageScenarios"
            :key="idx"
            class="scene-tag"
          >
            <text class="scene-tag-text">{{ scene }}</text>
          </view>
        </view>
      </view>

      <!-- 相关纹样推荐 -->
      <view v-if="relatedPatterns.length > 0" class="related-section">
        <view class="section-title-row">
          <view class="section-ornament" />
          <text class="section-title">相关纹样</text>
          <view class="section-ornament" />
        </view>
        <scroll-view scroll-x class="related-scroll" :show-scrollbar="false">
          <view class="related-list">
            <view
              v-for="rp in relatedPatterns"
              :key="rp.patternId"
              class="related-item"
            >
              <PatternCard
                :pattern="relatedCardData(rp)"
                :show-favorite="false"
                size="small"
                @click="onRelatedClick(rp.patternId)"
              />
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 底部留白（给操作栏腾位） -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-btn" @click="onStartDesign">
        <text class="action-btn-text">开始设计</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePatternStore } from '@/store/pattern'
import { useUserStore } from '@/store/user'
import NavBar from '@/components/common/NavBar.vue'
import PatternCard from '@/components/PatternCard.vue'
import PatternTimeline from '@/components/PatternTimeline.vue'
import type { Pattern, PatternCategory } from '@/types/models'

const patternStore = usePatternStore()
const userStore = useUserStore()

const patternId = ref('')
const activeCultureTab = ref<'description' | 'origin' | 'meaning'>('description')

/** 文化介绍 Tab 配置 */
const cultureTabs = [
  { key: 'description' as const, label: '描述' },
  { key: 'origin' as const, label: '起源' },
  { key: 'meaning' as const, label: '寓意' }
]

/** 分类中文映射 */
const categoryLabelMap: Record<string, string> = {
  'chinese-traditional': '中国传统',
  'miao': '苗族',
  'tibetan': '藏族',
  'yi': '彝族',
  'zhuang': '壮族',
  'uyghur': '维吾尔族'
}

/** 当前纹样 */
const pattern = computed<Pattern | undefined>(() => {
  return patternStore.patterns.find(p => p.patternId === patternId.value)
})

/** 分类标签文本 */
const categoryLabel = computed(() => {
  if (!pattern.value) return ''
  return categoryLabelMap[pattern.value.category] || pattern.value.category
})

/** 是否已收藏 */
const isFavorited = computed(() => {
  return patternStore.isFavorite(patternId.value)
})

/** 历史演变时间线数据（从 history 字段解析） */
const timelineEvents = computed(() => {
  if (!pattern.value?.history) return []
  // history 字段以换行分隔，格式: "年份: 描述"
  const lines = pattern.value.history.split('\n').filter(l => l.trim())
  return lines.map(line => {
    const match = line.match(/^(\S+?)[:：]\s*(.+)$/)
    if (match) {
      return { year: match[1], title: match[2] }
    }
    return { year: '', title: line.trim() }
  })
})

/** 相关纹样（同分类的其他纹样） */
const relatedPatterns = computed(() => {
  if (!pattern.value) return []
  return patternStore.patterns
    .filter(p => p.category === pattern.value!.category && p.patternId !== patternId.value)
    .slice(0, 6)
})

/** 将相关纹样转换为 PatternCard 数据 */
function relatedCardData(p: Pattern) {
  return {
    name: p.name,
    category: categoryLabelMap[p.category] || p.category,
    imageUrl: p.previewUrl,
    isFavorite: patternStore.isFavorite(p.patternId)
  }
}

/** 收藏/取消收藏 */
function onToggleFavorite() {
  const userId = userStore.userInfo?.userId || ''
  patternStore.toggleFavorite(patternId.value, userId)
}

/** 点击相关纹样 */
function onRelatedClick(id: string) {
  uni.navigateTo({
    url: `/pages/library/detail?patternId=${id}`
  })
}

/** 开始设计 */
function onStartDesign() {
  uni.navigateTo({
    url: `/pages/design/index?patternId=${patternId.value}`
  })
}

/** 页面加载 */
onLoad((options) => {
  patternId.value = options?.patternId || ''
  patternStore.loadFavorites()
})
</script>

<style scoped lang="scss">
.detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-primary;
}

.detail-scroll {
  flex: 1;
}

/* 预览区 */
.preview-section {
  width: 100%;
  height: 560rpx;
  background-color: $bg-secondary;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  background: linear-gradient(135deg, $bg-secondary, rgba(212, 168, 67, 0.08));
}

.placeholder-icon {
  font-size: 120rpx;
  color: $secondary-color;
  opacity: 0.3;
}

.placeholder-text {
  font-size: $font-md;
  color: $text-hint;
}

/* 基本信息 */
.info-section {
  padding: $spacing-lg $spacing-md;
  background-color: $bg-card;
}

.info-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
}

.name-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
  flex-wrap: wrap;
}

.pattern-name {
  font-size: $font-xxl;
  font-weight: 700;
  color: $text-primary;
}

.category-tag {
  background-color: rgba(212, 168, 67, 0.12);
  padding: 4rpx $spacing-sm;
  border-radius: $radius-sm;
}

.category-tag-text {
  font-size: $font-xs;
  color: $secondary-color;
  font-weight: 500;
}

.fav-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: $spacing-sm;
}

.fav-icon {
  font-size: $font-xxl;
  color: $text-hint;
}

.fav-active {
  color: $primary-color;
}

/* 通用标题行（中式对称装饰） */
.section-title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.section-ornament {
  width: 48rpx;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, $secondary-color);
  border-radius: 2rpx;

  &:last-child {
    background: linear-gradient(90deg, $secondary-color, transparent);
  }
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

/* 文化介绍 */
.culture-section {
  margin: $spacing-md;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.culture-tabs {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
  justify-content: center;
}

.culture-tab {
  font-size: $font-md;
  color: $text-secondary;
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-pill;
  transition: all $transition-fast;
}

.culture-tab-active {
  color: #FFFFFF;
  background-color: $primary-color;
  font-weight: 500;
}

.culture-content {
  min-height: 160rpx;
}

.culture-text {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.8;
}

/* 时间线 */
.timeline-section {
  margin: $spacing-md;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

/* 适用场景 */
.scene-section {
  margin: $spacing-md;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.scene-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.scene-tag {
  padding: $spacing-xs $spacing-md;
  background-color: rgba(123, 170, 142, 0.12);
  border: 1rpx solid rgba(123, 170, 142, 0.3);
  border-radius: $radius-pill;
}

.scene-tag-text {
  font-size: $font-sm;
  color: $accent-color;
}

/* 相关纹样 */
.related-section {
  margin: $spacing-md;
  padding: $spacing-lg $spacing-lg $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.related-scroll {
  white-space: nowrap;
}

.related-list {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.related-item {
  width: 260rpx;
  flex-shrink: 0;
}

/* 底部留白 */
.bottom-spacer {
  height: 140rpx;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  width: 100%;
  height: 88rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, $primary-color, #D4483C);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.9;
  }
}

.action-btn-text {
  font-size: $font-lg;
  font-weight: 600;
  color: #FFFFFF;
  letter-spacing: 4rpx;
}
</style>
