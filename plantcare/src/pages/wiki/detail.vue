<template>
  <view class="page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!plant" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到该植物信息</text>
    </view>

    <view v-else>
      <!-- 顶部大图 -->
      <view class="hero-section">
        <image class="hero-image" :src="plant.imageUrl || '/static/images/default-plant.png'" mode="aspectFill" />
        <view class="hero-overlay" />
        <view class="hero-info">
          <text class="hero-name">{{ plant.name }}</text>
          <text class="hero-scientific">{{ plant.scientificName }}</text>
          <view class="hero-badge" :class="`hero-badge--${plant.difficulty}`">
            <text class="hero-badge-text">{{ difficultyLabel }}</text>
          </view>
        </view>
      </view>

      <!-- 基本介绍 -->
      <view class="section">
        <text class="section-title">📖 基本介绍</text>
        <view class="info-card">
          <text class="info-desc">{{ plant.description }}</text>
          <view class="info-row">
            <text class="info-label">科属</text>
            <text class="info-value">{{ plant.family }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">产地</text>
            <text class="info-value">{{ plant.origin }}</text>
          </view>
        </view>
      </view>

      <!-- 养护指南 -->
      <view class="section">
        <text class="section-title">🌱 养护指南</text>
        <view class="guide-grid">
          <view v-for="item in careGuideItems" :key="item.label" class="guide-item">
            <text class="guide-icon">{{ item.icon }}</text>
            <text class="guide-label">{{ item.label }}</text>
            <text class="guide-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <!-- 常见问题 -->
      <view v-if="plant.commonIssues && plant.commonIssues.length > 0" class="section">
        <text class="section-title">❓ 常见问题</text>
        <view class="issues-card">
          <view
            v-for="(issue, index) in plant.commonIssues"
            :key="index"
            class="issue-item"
          >
            <text class="issue-dot">•</text>
            <text class="issue-text">{{ issue }}</text>
          </view>
        </view>
      </view>

      <!-- 繁殖方法 -->
      <view v-if="plant.propagation" class="section">
        <text class="section-title">🌿 繁殖方法</text>
        <view class="propagation-card">
          <text class="propagation-text">{{ plant.propagation }}</text>
        </view>
      </view>

      <!-- 底部操作 -->
      <view class="bottom-action">
        <view class="btn-add" @click="goAddPlant">
          <text class="btn-add-text">🌱 添加到我的植物</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { PlantWiki } from '@/types/models'
import { getPlantDetail } from '@/services/wiki'

const plant = ref<PlantWiki | null>(null)
const loading = ref(true)
let speciesId = ''

const difficultyLabel = computed(() => {
  if (!plant.value) return ''
  const map: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    expert: '专家'
  }
  return map[plant.value.difficulty] || ''
})

const careGuideItems = computed(() => {
  if (!plant.value?.careGuide) return []
  const g = plant.value.careGuide
  return [
    { icon: '☀️', label: '光照', value: g.light },
    { icon: '💧', label: '浇水', value: g.water },
    { icon: '🌡️', label: '温度', value: g.temperature },
    { icon: '💦', label: '湿度', value: g.humidity },
    { icon: '🪴', label: '土壤', value: g.soil },
    { icon: '🧪', label: '施肥', value: g.fertilizer }
  ]
})

onLoad(async (options) => {
  if (options?.speciesId) {
    speciesId = decodeURIComponent(options.speciesId)
  }
  await loadDetail()
})

async function loadDetail() {
  if (!speciesId) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    plant.value = await getPlantDetail(speciesId)
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goAddPlant() {
  uni.navigateTo({
    url: `/pages/plant/add?speciesId=${encodeURIComponent(speciesId)}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 140rpx;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 300rpx;
}

.loading-text {
  font-size: $font-md;
  color: $text-secondary;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 300rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-md;
  color: $text-secondary;
}

.hero-section {
  position: relative;
  height: 480rpx;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.hero-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 240rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
}

.hero-info {
  position: absolute;
  bottom: 32rpx;
  left: 32rpx;
  right: 32rpx;
}

.hero-name {
  font-size: $font-title;
  font-weight: $font-weight-bold;
  color: $text-white;
  display: block;
  margin-bottom: 4rpx;
}

.hero-scientific {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  display: block;
  margin-bottom: $spacing-sm;
}

.hero-badge {
  display: inline-flex;
  padding: 4rpx 20rpx;
  border-radius: $radius-pill;
  background: rgba(255, 255, 255, 0.2);

  &--beginner {
    background: rgba(76, 175, 80, 0.8);
  }

  &--intermediate {
    background: rgba(243, 156, 18, 0.8);
  }

  &--expert {
    background: rgba(231, 76, 60, 0.8);
  }
}

.hero-badge-text {
  font-size: $font-xs;
  color: $text-white;
  font-weight: $font-weight-medium;
}

.section {
  padding: $spacing-md $spacing-md 0;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.info-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.info-desc {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.8;
  margin-bottom: $spacing-md;
  display: block;
}

.info-row {
  display: flex;
  flex-direction: row;
  padding: $spacing-xs 0;
  border-top: 1rpx solid $border-light;
}

.info-label {
  font-size: $font-md;
  color: $text-secondary;
  width: 120rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: $font-md;
  color: $text-primary;
  flex: 1;
}

.guide-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.guide-item {
  width: calc(50% - 8rpx);
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
}

.guide-icon {
  font-size: 40rpx;
  margin-bottom: $spacing-xs;
}

.guide-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: 4rpx;
}

.guide-value {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
}

.issues-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.issue-item {
  display: flex;
  flex-direction: row;
  margin-bottom: $spacing-xs;

  &:last-child {
    margin-bottom: 0;
  }
}

.issue-dot {
  font-size: $font-md;
  color: $warning-color;
  margin-right: $spacing-xs;
  flex-shrink: 0;
}

.issue-text {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
}

.propagation-card {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.propagation-text {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.8;
}

.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-md} + #{$safe-bottom});
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.btn-add {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
}

.btn-add-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}
</style>
