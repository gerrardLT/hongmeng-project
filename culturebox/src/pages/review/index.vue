<template>
  <view class="review-page">
    <!-- 顶部年份选择器 -->
    <scroll-view scroll-x class="year-selector">
      <view class="year-list">
        <view
          v-for="year in availableYears"
          :key="year"
          class="year-tag"
          :class="{ active: selectedYear === year }"
          @click="selectedYear = year"
        >
          <text class="year-text">{{ year }}</text>
        </view>
      </view>
    </scroll-view>

    <scroll-view scroll-y class="content-scroll">
      <!-- 统计总览 -->
      <view class="stats-overview">
        <view class="stats-card">
          <view class="stats-item">
            <text class="stats-icon">📖</text>
            <text class="stats-number">{{ yearStats.totalBooks }}</text>
            <text class="stats-label">本书</text>
          </view>
          <view class="stats-item">
            <text class="stats-icon">🎬</text>
            <text class="stats-number">{{ yearStats.totalMovies }}</text>
            <text class="stats-label">部电影</text>
          </view>
          <view class="stats-item">
            <text class="stats-icon">🎙️</text>
            <text class="stats-number">{{ yearStats.totalPodcasts }}</text>
            <text class="stats-label">期播客</text>
          </view>
          <view class="stats-item">
            <text class="stats-icon">🎨</text>
            <text class="stats-number">{{ yearStats.totalExhibitions }}</text>
            <text class="stats-label">次展</text>
          </view>
        </view>
      </view>

      <!-- 月度分布图 -->
      <view class="section-card">
        <text class="section-title">月度分布</text>
        <view class="chart-container">
          <view
            v-for="(count, index) in yearStats.monthlyDistribution"
            :key="index"
            class="bar-col"
          >
            <view class="bar-wrap">
              <view
                class="bar"
                :style="{ height: getBarHeight(count) + 'rpx' }"
              />
            </view>
            <text class="bar-label">{{ index + 1 }}月</text>
          </view>
        </view>
      </view>

      <!-- 类型占比 -->
      <view class="section-card">
        <text class="section-title">类型占比</text>
        <view class="type-ratio-list">
          <view
            v-for="item in typeRatioList"
            :key="item.type"
            class="type-ratio-item"
          >
            <view class="type-ratio-header">
              <text class="type-ratio-icon">{{ item.icon }}</text>
              <text class="type-ratio-name">{{ item.label }}</text>
              <text class="type-ratio-percent">{{ item.percent }}%</text>
            </view>
            <view class="ratio-bar-bg">
              <view
                class="ratio-bar-fill"
                :style="{
                  width: item.percent + '%',
                  backgroundColor: item.color
                }"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 评分分布 -->
      <view class="section-card">
        <text class="section-title">评分分布</text>
        <view class="rating-dist-list">
          <view
            v-for="i in 5"
            :key="i"
            class="rating-dist-item"
          >
            <text class="rating-star-label">{{ i }}星</text>
            <view class="rating-bar-bg">
              <view
                class="rating-bar-fill"
                :style="{ width: getRatingBarWidth(yearStats.ratingDistribution[i - 1]) + '%' }"
              />
            </view>
            <text class="rating-count">{{ yearStats.ratingDistribution[i - 1] }}</text>
          </view>
        </view>
      </view>

      <!-- TOP5 标签 -->
      <view v-if="yearStats.topTags.length > 0" class="section-card">
        <text class="section-title">TOP5 标签</text>
        <view class="tag-cloud">
          <view
            v-for="tag in yearStats.topTags"
            :key="tag.name"
            class="tag-item"
          >
            <text class="tag-name">{{ tag.name }}</text>
            <text class="tag-count">{{ tag.count }}</text>
          </view>
        </view>
      </view>

      <!-- 年度精选 -->
      <view class="section-card">
        <text class="section-title">年度精选</text>
        <template v-if="hasTopEntries">
          <view
            v-for="group in topEntryGroups"
            :key="group.type"
            class="top-group"
          >
            <text class="top-group-title">{{ group.icon }} {{ group.label }} TOP3</text>
            <view class="top-entry-list">
              <view
                v-for="entry in group.entries"
                :key="entry.entryId"
                class="top-entry-item"
                @click="onEntryClick(entry.entryId)"
              >
                <view class="top-entry-cover">
                  <image
                    v-if="entry.coverUrl"
                    class="cover-img"
                    :src="entry.coverUrl"
                    mode="aspectFill"
                  />
                  <view v-else class="cover-placeholder">
                    <text class="type-icon">{{ group.icon }}</text>
                  </view>
                </view>
                <view class="top-entry-info">
                  <text class="top-entry-title">{{ entry.title }}</text>
                  <text class="top-entry-rating">{{ entry.rating }}星</text>
                </view>
              </view>
            </view>
          </view>
        </template>
        <Empty
          v-else
          icon="⭐"
          text="去首页标记你的年度精选吧"
        />
      </view>

      <!-- 生成长图按钮 -->
      <view class="bottom-action">
        <view class="generate-btn" @click="generateLongImage">
          <text class="generate-btn-text">生成年度回顾长图</text>
        </view>
      </view>
    </scroll-view>

    <!-- 隐藏的 canvas 用于生成长图 -->
    <canvas
      canvas-id="reviewCanvas"
      class="review-canvas"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEntryStore } from '@/store/entry'
import { calculateYearStats, getAvailableYears, getTopEntries } from '@/services/stats'
import { requestStoragePermission, requestHarmonyStoragePermission } from '@/utils/permission'
import Empty from '@/components/common/Empty.vue'
import type { EntryType, YearStats } from '@/types/models'

const entryStore = useEntryStore()

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)

const availableYears = computed(() => {
  const years = getAvailableYears(entryStore.entries)
  if (years.length === 0) {
    return [currentYear]
  }
  if (!years.includes(currentYear)) {
    years.unshift(currentYear)
  }
  return years
})

const yearStats = computed<YearStats>(() => {
  return calculateYearStats(entryStore.entries, selectedYear.value)
})

const maxBarHeight = 200

function getBarHeight(count: number): number {
  const maxCount = Math.max(...yearStats.value.monthlyDistribution, 1)
  return Math.round((count / maxCount) * maxBarHeight)
}

const typeConfig: Record<EntryType, { icon: string; label: string; color: string }> = {
  book: { icon: '📖', label: '书', color: '#8B6914' },
  movie: { icon: '🎬', label: '电影', color: '#5B7553' },
  podcast: { icon: '🎙️', label: '播客', color: '#C17817' },
  exhibition: { icon: '🎨', label: '展览', color: '#9C7CBB' }
}

const typeRatioList = computed(() => {
  const dist = yearStats.value.typeDistribution
  const total = dist.book + dist.movie + dist.podcast + dist.exhibition
  const types: EntryType[] = ['book', 'movie', 'podcast', 'exhibition']
  return types.map(type => {
    const count = dist[type]
    return {
      type,
      icon: typeConfig[type].icon,
      label: typeConfig[type].label,
      color: typeConfig[type].color,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0
    }
  })
})

function getRatingBarWidth(count: number): number {
  const maxCount = Math.max(...yearStats.value.ratingDistribution, 1)
  return Math.round((count / maxCount) * 100)
}

const topEntryGroups = computed(() => {
  const types: EntryType[] = ['book', 'movie', 'podcast', 'exhibition']
  return types
    .map(type => ({
      type,
      icon: typeConfig[type].icon,
      label: typeConfig[type].label,
      entries: getTopEntries(entryStore.entries, selectedYear.value, type, 3)
    }))
    .filter(g => g.entries.length > 0)
})

const hasTopEntries = computed(() => {
  return topEntryGroups.value.some(g => g.entries.length > 0)
})

function onEntryClick(entryId: string) {
  uni.navigateTo({
    url: `/pages/entry/detail?id=${entryId}`
  })
}

async function generateLongImage() {
  // #ifdef APP-HARMONY
  const granted = await requestHarmonyStoragePermission()
  // #endif
  // #ifndef APP-HARMONY
  const granted = await requestStoragePermission()
  // #endif

  if (!granted) {
    uni.showToast({ title: '需要存储权限才能保存图片', icon: 'none' })
    return
  }

  uni.showLoading({ title: '生成中…' })

  try {
    const canvasWidth = 750
    const padding = 40
    let y = 60

    const ctx = uni.createCanvasContext('reviewCanvas')

    ctx.setFillStyle('#FAF8F5')
    ctx.fillRect(0, 0, canvasWidth, 2000)

    ctx.setFillStyle('#2C2C2C')
    ctx.setFontSize(36)
    ctx.setTextAlign('center')
    ctx.fillText(`${selectedYear.value} 年度回顾`, canvasWidth / 2, y)
    y += 60

    ctx.setTextAlign('left')
    ctx.setFontSize(28)
    ctx.setFillStyle('#8B6914')
    const stats = yearStats.value
    const statsText = `📖 ${stats.totalBooks}本书  🎬 ${stats.totalMovies}部电影  🎙️ ${stats.totalPodcasts}期播客  🎨 ${stats.totalExhibitions}次展`
    ctx.fillText(statsText, padding, y)
    y += 60

    ctx.setStrokeStyle('#E8E4DF')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(canvasWidth - padding, y)
    ctx.stroke()
    y += 40

    if (stats.topTags.length > 0) {
      ctx.setFillStyle('#6B6B6B')
      ctx.setFontSize(26)
      const tagText = '常用标签: ' + stats.topTags.map(t => `${t.name}(${t.count})`).join('  ')
      ctx.fillText(tagText, padding, y)
      y += 40
    }

    const canvasHeight = Math.max(y + 100, 800)

    ctx.draw(false, () => {
      setTimeout(() => {
        uni.canvasToTempFilePath({
          canvasId: 'reviewCanvas',
          width: canvasWidth,
          height: canvasHeight,
          success: (res) => {
            uni.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                uni.showToast({ title: '已保存到相册', icon: 'success' })
              },
              fail: () => {
                uni.showToast({ title: '保存失败', icon: 'none' })
              }
            })
          },
          fail: () => {
            uni.showToast({ title: '生成失败', icon: 'none' })
          }
        })
      }, 500)
    })
  } catch (e) {
    console.error('generateLongImage error:', e)
    uni.showToast({ title: '生成失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style scoped lang="scss">
.review-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
}

.year-selector {
  background-color: $bg-card;
  padding: $spacing-sm 0;
  white-space: nowrap;
}

.year-list {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
  padding: 0 $spacing-md;
}

.year-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xs $spacing-lg;
  border-radius: $radius-pill;
  border: 1rpx solid $border-color;
  background-color: $bg-color;
  flex-shrink: 0;
}

.year-tag.active {
  background-color: rgba($primary-color, 0.1);
  border-color: $primary-color;
}

.year-text {
  font-size: $font-md;
  color: $text-secondary;
}

.year-tag.active .year-text {
  color: $primary-color;
  font-weight: 500;
}

.content-scroll {
  flex: 1;
  padding: $spacing-md;
}

.stats-overview {
  margin-bottom: $spacing-md;
}

.stats-card {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg $spacing-sm;
}

.stats-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-xs;
}

.stats-icon {
  font-size: 40rpx;
}

.stats-number {
  font-size: $font-xxl;
  font-weight: 700;
  color: $primary-color;
}

.stats-label {
  font-size: $font-xs;
  color: $text-secondary;
}

.section-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.chart-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  height: 280rpx;
  gap: 4rpx;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  align-items: center;
}

.bar {
  width: 36rpx;
  background-color: $primary-color;
  border-radius: 4rpx 4rpx 0 0;
  min-height: 4rpx;
}

.bar-label {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: $spacing-xs;
}

.type-ratio-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.type-ratio-item {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
}

.type-ratio-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-xs;
}

.type-ratio-icon {
  font-size: $font-md;
}

.type-ratio-name {
  font-size: $font-sm;
  color: $text-secondary;
  flex: 1;
}

.type-ratio-percent {
  font-size: $font-sm;
  color: $text-primary;
  font-weight: 500;
}

.ratio-bar-bg {
  height: 16rpx;
  background-color: $bg-color;
  border-radius: $radius-pill;
  overflow: hidden;
}

.ratio-bar-fill {
  height: 16rpx;
  border-radius: $radius-pill;
  transition: width $transition-normal;
}

.rating-dist-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.rating-dist-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
}

.rating-star-label {
  font-size: $font-sm;
  color: $text-secondary;
  width: 60rpx;
  flex-shrink: 0;
}

.rating-bar-bg {
  flex: 1;
  height: 16rpx;
  background-color: $bg-color;
  border-radius: $radius-pill;
  overflow: hidden;
}

.rating-bar-fill {
  height: 16rpx;
  background-color: $accent-color;
  border-radius: $radius-pill;
  transition: width $transition-normal;
}

.rating-count {
  font-size: $font-sm;
  color: $text-secondary;
  width: 48rpx;
  text-align: right;
  flex-shrink: 0;
}

.tag-cloud {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.tag-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  background-color: rgba($primary-color, 0.08);
  border-radius: $radius-pill;
  gap: $spacing-xs;
}

.tag-name {
  font-size: $font-sm;
  color: $primary-color;
}

.tag-count {
  font-size: $font-xs;
  color: $text-hint;
}

.top-group {
  margin-bottom: $spacing-lg;
}

.top-group:last-child {
  margin-bottom: 0;
}

.top-group-title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.top-entry-list {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
}

.top-entry-item {
  display: flex;
  flex-direction: column;
  width: 180rpx;
  gap: $spacing-xs;
}

.top-entry-cover {
  width: 180rpx;
  height: 240rpx;
  border-radius: $radius-sm;
  overflow: hidden;
}

.cover-img {
  width: 180rpx;
  height: 240rpx;
}

.cover-placeholder {
  width: 180rpx;
  height: 240rpx;
  background-color: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-icon {
  font-size: 48rpx;
}

.top-entry-info {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.top-entry-title {
  font-size: $font-sm;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-entry-rating {
  font-size: $font-xs;
  color: $accent-color;
}

.bottom-action {
  padding: $spacing-lg 0;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-pill;
  padding: $spacing-md 0;
}

.generate-btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 500;
}

.review-canvas {
  position: fixed;
  left: -9999rpx;
  top: -9999rpx;
  width: 750rpx;
  height: 2000rpx;
}
</style>