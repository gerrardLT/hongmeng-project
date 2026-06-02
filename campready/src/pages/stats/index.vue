<template>
  <view class="page">
    <!-- 装备总览卡片 -->
    <view class="section-title">
      <text class="section-title-text">装备总览</text>
    </view>
    <view class="stat-card">
      <view class="stat-grid">
        <view class="stat-item">
          <text class="stat-number">{{ gearStore.totalCount }}</text>
          <text class="stat-label">装备</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-number">{{ formatWeightGram(gearStore.totalWeight, 'kg') }}</text>
          <text class="stat-label">总重</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-number">{{ categoryCount }}</text>
          <text class="stat-label">分类</text>
        </view>
      </view>
    </view>

    <!-- 分类重量占比 -->
    <view v-if="gearStore.categoryStats.length > 0" class="section">
      <view class="section-title">
        <text class="section-title-text">分类重量占比</text>
      </view>
      <view class="stat-card">
        <!-- 堆叠条 -->
        <view class="stacked-bar">
          <view
            v-for="item in categoryBarData"
            :key="item.category"
            class="bar-segment"
            :style="{
              width: item.percent + '%',
              backgroundColor: item.color
            }"
          />
        </view>
        <!-- 图例 -->
        <view class="legend-grid">
          <view
            v-for="item in categoryBarData"
            :key="item.category"
            class="legend-item"
          >
            <view class="legend-dot" :style="{ backgroundColor: item.color }" />
            <text class="legend-text">{{ item.label }}</text>
            <text class="legend-weight">{{ formatWeightGram(item.weight, 'kg') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 清单统计 -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">清单统计</text>
      </view>
      <view class="stat-card">
        <view class="stat-grid">
          <view class="stat-item">
            <text class="stat-number preparing">{{ checklistsStore.preparingList.length }}</text>
            <text class="stat-label">准备中</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-number completed">{{ checklistsStore.completedList.length }}</text>
            <text class="stat-label">已完成</text>
          </view>
          <view class="stat-divider" />
          <view class="stat-item">
            <text class="stat-number archived">{{ checklistsStore.archivedList.length }}</text>
            <text class="stat-label">历史</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近添加的装备 -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">最近添加的装备</text>
      </view>
      <view v-if="recentGears.length > 0" class="stat-card recent-list">
        <view
          v-for="gear in recentGears"
          :key="gear.gearId"
          class="recent-item"
          @click="goDetail(gear.gearId)"
        >
          <view v-if="gear.photos.length > 0" class="recent-thumb">
            <image class="recent-thumb-img" :src="gear.photos[0]" mode="aspectFill" />
          </view>
          <view v-else class="recent-thumb recent-thumb-placeholder">
            <text class="recent-thumb-icon">🏕️</text>
          </view>
          <view class="recent-info">
            <text class="recent-name">{{ gear.name }}</text>
            <view class="recent-meta">
              <view class="recent-category-dot" :style="{ backgroundColor: getCategoryColor(gear.category) }" />
              <text class="recent-category">{{ getCategoryLabel(gear.category) }}</text>
              <text class="recent-time">{{ getRelativeTime(gear.createdAt) }}</text>
            </view>
          </view>
          <text class="recent-arrow">›</text>
        </view>
      </view>
      <view v-else class="stat-card">
        <Empty icon="⛺" text="还没有装备数据" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useGearStore } from '@/store/gear'
import { useChecklistsStore } from '@/store/checklists'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP, GEAR_CATEGORY_COLORS } from '@/types/models'
import { formatWeightGram, getRelativeTime } from '@/utils/format'
import Empty from '@/components/common/Empty.vue'

const gearStore = useGearStore()
const checklistsStore = useChecklistsStore()

const categoryCount = computed(() => {
  const cats = new Set(gearStore.gears.map((g) => g.category))
  return cats.size
})

const categoryBarData = computed(() => {
  const total = gearStore.totalWeight
  if (total === 0) return []
  return gearStore.categoryStats
    .filter((s) => s.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((s) => ({
      category: s.category,
      label: GEAR_CATEGORY_MAP[s.category] || '其他',
      color: GEAR_CATEGORY_COLORS[s.category] || '#9E9E9E',
      weight: s.weight,
      percent: Math.max(2, (s.weight / total) * 100)
    }))
})

const recentGears = computed(() => {
  return [...gearStore.gears]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
})

function getCategoryColor(category: GearCategory): string {
  return GEAR_CATEGORY_COLORS[category] || '#9E9E9E'
}

function getCategoryLabel(category: GearCategory): string {
  return GEAR_CATEGORY_MAP[category] || '其他'
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/gear/detail?id=${id}` })
}

onShow(() => {
  gearStore.init()
  checklistsStore.init()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 40rpx;
}

.section {
  margin-top: 8rpx;
}

.section-title {
  padding: 20rpx 8rpx 16rpx;
}

.section-title-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stat-grid {
  display: flex;
  align-items: center;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 40rpx;
  font-weight: 700;
  color: #2E7D32;
  margin-bottom: 8rpx;

  &.preparing {
    color: #FF9800;
  }

  &.completed {
    color: #4CAF50;
  }

  &.archived {
    color: #607D8B;
  }
}

.stat-label {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: #f0f0f0;
}

.stacked-bar {
  display: flex;
  height: 32rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.bar-segment {
  height: 100%;
  min-width: 4rpx;
}

.legend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.legend-text {
  font-size: 24rpx;
  color: #666666;
  margin-right: 8rpx;
}

.legend-weight {
  font-size: 24rpx;
  color: #999999;
}

.recent-list {
  padding: 12rpx 24rpx;
}

.recent-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.recent-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.recent-thumb-img {
  width: 100%;
  height: 100%;
}

.recent-thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #E8F5E9;
}

.recent-thumb-icon {
  font-size: 36rpx;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-meta {
  display: flex;
  align-items: center;
  margin-top: 8rpx;
  gap: 8rpx;
}

.recent-category-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
}

.recent-category {
  font-size: 22rpx;
  color: #666666;
}

.recent-time {
  font-size: 22rpx;
  color: #999999;
  margin-left: auto;
}

.recent-arrow {
  font-size: 32rpx;
  color: #cccccc;
  margin-left: 8rpx;
  flex-shrink: 0;
}
</style>
