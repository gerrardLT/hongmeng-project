<template>
  <view class="page">
    <!-- 顶部Tab切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'growth' }"
        @click="activeTab = 'growth'"
      >
        <text class="tab-text">生长记录</text>
      </view>
      <view
        class="tab-item"
        :class="{ 'tab-item--active': activeTab === 'stats' }"
        @click="activeTab = 'stats'"
      >
        <text class="tab-text">养护统计</text>
      </view>
    </view>

    <!-- 生长记录Tab -->
    <view v-if="activeTab === 'growth'" class="tab-content">
      <!-- 筛选 + 添加 -->
      <view class="action-row">
        <picker :range="plantNames" :value="filterIndex" @change="onFilterChange">
          <view class="filter-picker">
            <text class="filter-picker-text">{{ filterIndex === 0 ? '全部植物' : plantNames[filterIndex] }}</text>
            <text class="filter-arrow">▼</text>
          </view>
        </picker>
        <view class="btn-add" @click="goAddGrowth">
          <text class="btn-add-text">📷 记录成长</text>
        </view>
      </view>

      <!-- 列表 -->
      <view v-if="filteredGrowthRecords.length > 0" class="growth-list">
        <GrowthCard
          v-for="record in filteredGrowthRecords"
          :key="record.recordId"
          :record="record"
          :plant-name="getPlantName(record.plantId)"
          @click="onGrowthClick(record)"
          @delete="onDeleteGrowth(record.recordId)"
        />
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">📸</text>
        <text class="empty-text">还没有生长记录</text>
        <text class="empty-hint">拍张照片，记录植物的成长吧</text>
      </view>
    </view>

    <!-- 养护统计Tab -->
    <view v-if="activeTab === 'stats'" class="tab-content">
      <view class="stats-section">
        <StatPanel :stats="careStats" />
      </view>

      <!-- 近7天完成数 -->
      <view class="section">
        <text class="section-title">📊 近7天养护完成数</text>
        <view class="week-chart">
          <view
            v-for="(item, index) in weekData"
            :key="index"
            class="week-bar-item"
          >
            <view class="week-bar-bg">
              <view class="week-bar-fill" :style="{ height: item.height + '%' }" />
            </view>
            <text class="week-bar-label">{{ item.label }}</text>
            <text class="week-bar-count">{{ item.count }}</text>
          </view>
        </view>
      </view>

      <!-- 各植物养护概况 -->
      <view class="section">
        <text class="section-title">🌿 植物养护概况</text>
        <view v-if="plantStore.plants.length > 0" class="care-summary-list">
          <view
            v-for="plant in plantStore.plants"
            :key="plant.plantId"
            class="care-summary-item"
            @click="goPlantDetail(plant.plantId)"
          >
            <image
              class="care-summary-photo"
              :src="plant.photoUrl || '/static/images/plant-placeholder.png'"
              mode="aspectFill"
            />
            <view class="care-summary-info">
              <text class="care-summary-name">{{ plant.nickname }}</text>
              <text class="care-summary-stat">浇水 {{ getPlantCareCount(plant.plantId, 'water') }}次 · 施肥 {{ getPlantCareCount(plant.plantId, 'fertilize') }}次</text>
            </view>
            <text class="care-summary-arrow">›</text>
          </view>
        </view>
        <view v-else class="empty-hint-text">
          <text class="empty-hint">暂无植物数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import type { GrowthRecord, CareType } from '@/types/models'
import { usePlantStore } from '@/store/plant'
import { useRecordStore } from '@/store/record'
import { getCareStats } from '@/services/record'
import { formatDate } from '@/utils/format'
import GrowthCard from '@/components/GrowthCard.vue'
import StatPanel from '@/components/StatPanel.vue'

const plantStore = usePlantStore()
const recordStore = useRecordStore()

const activeTab = ref<'growth' | 'stats'>('growth')
const filterIndex = ref(0)

const plantNames = computed(() => {
  return ['全部植物', ...plantStore.plants.map((p) => p.nickname)]
})

const filteredGrowthRecords = computed(() => {
  const records = recordStore.recentGrowthRecords
  if (filterIndex.value === 0) return records
  const plant = plantStore.plants[filterIndex.value - 1]
  if (!plant) return records
  return records.filter((r) => r.plantId === plant.plantId)
})

const careStats = computed(() => getCareStats())

const weekData = computed(() => {
  const days: { label: string; count: number; height: number }[] = []
  const weekLabels = ['日', '一', '二', '三', '四', '五', '六']
  let maxCount = 1

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = formatDate(d)
    const count = recordStore.careRecords.filter((r) => r.date === dateStr).length
    if (count > maxCount) maxCount = count
    days.push({ label: weekLabels[d.getDay()], count, height: 0 })
  }

  for (const day of days) {
    day.height = maxCount > 0 ? Math.round((day.count / maxCount) * 100) : 0
  }
  return days
})

onShow(() => {
  plantStore.init()
  recordStore.init()
})

function getPlantName(plantId: string): string {
  const plant = plantStore.plants.find((p) => p.plantId === plantId)
  return plant?.nickname || '未知植物'
}

function getPlantCareCount(plantId: string, type: CareType): number {
  return recordStore.careRecords.filter((r) => r.plantId === plantId && r.type === type).length
}

function onFilterChange(e: any) {
  filterIndex.value = e.detail.value
}

function goAddGrowth() {
  uni.navigateTo({ url: '/pages/records/growth' })
}

function goPlantDetail(plantId: string) {
  uni.navigateTo({ url: `/pages/plant/detail?plantId=${plantId}` })
}

function onGrowthClick(_record: GrowthRecord) {
  // 可扩展为查看详情
}

function onDeleteGrowth(recordId: string) {
  uni.showModal({
    title: '确认删除',
    content: '删除后不可恢复，确认要删除这条记录吗？',
    success(res) {
      if (res.confirm) {
        recordStore.deleteGrowthRecord(recordId)
        uni.showToast({ title: '已删除', icon: 'none' })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background: $bg-card;
  padding: 0 $spacing-lg;
  box-shadow: $shadow-sm;
}

.tab-item {
  flex: 1;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 4rpx solid transparent;

  &--active {
    border-bottom-color: $primary-color;

    .tab-text {
      color: $primary-color;
      font-weight: $font-weight-bold;
    }
  }
}

.tab-text {
  font-size: $font-md;
  color: $text-secondary;
}

.tab-content {
  padding: $spacing-md;
}

.action-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.filter-picker {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-card;
  padding: 12rpx 24rpx;
  border-radius: $radius-pill;
  box-shadow: $shadow-sm;
}

.filter-picker-text {
  font-size: $font-sm;
  color: $text-primary;
  margin-right: 8rpx;
}

.filter-arrow {
  font-size: $font-xs;
  color: $text-light;
}

.btn-add {
  padding: 12rpx 28rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-pill;
  box-shadow: $shadow-primary;
}

.btn-add-text {
  font-size: $font-sm;
  color: $text-white;
  font-weight: $font-weight-medium;
}

.growth-list {
  padding-bottom: $spacing-lg;
}

.stats-section {
  margin-bottom: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.week-chart {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-end;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-lg $spacing-md;
  box-shadow: $shadow-sm;
  height: 320rpx;
}

.week-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60rpx;
}

.week-bar-bg {
  width: 32rpx;
  height: 200rpx;
  background: $primary-lighter;
  border-radius: $radius-sm;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.week-bar-fill {
  width: 100%;
  background: $primary-color;
  border-radius: $radius-sm;
  min-height: 4rpx;
}

.week-bar-label {
  font-size: $font-xs;
  color: $text-secondary;
  margin-bottom: 4rpx;
}

.week-bar-count {
  font-size: $font-xs;
  color: $primary-color;
  font-weight: $font-weight-bold;
}

.care-summary-list {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.care-summary-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-md;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.care-summary-photo {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-sm;
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.care-summary-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.care-summary-name {
  font-size: $font-md;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.care-summary-stat {
  font-size: $font-sm;
  color: $text-secondary;
}

.care-summary-arrow {
  font-size: 32rpx;
  color: $text-light;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.empty-hint {
  font-size: $font-md;
  color: $text-secondary;
}

.empty-hint-text {
  text-align: center;
  padding: $spacing-lg 0;
}
</style>
