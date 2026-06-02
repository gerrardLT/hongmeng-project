<template>
  <view class="page">
    <!-- 顶部欢迎区域 -->
    <view class="header">
      <view class="header-content">
        <text class="header-title">AquaLog</text>
        <text class="header-subtitle">水族箱智能管家</text>
      </view>
    </view>

    <!-- 统计面板 -->
    <view class="section">
      <StatPanel :stats="stats" />
    </view>

    <!-- 预警横幅 -->
    <view v-if="activeAlerts.length > 0" class="section">
      <AlertBanner :alerts="activeAlerts" @tap-alert="onTapAlert" />
    </view>

    <!-- 水族箱列表 -->
    <view v-if="hasAquariums" class="section">
      <view class="section-header">
        <text class="section-title">我的水族箱</text>
        <text class="section-count">{{ aquariumStore.aquariums.length }}个</text>
      </view>
      <scroll-view scroll-y class="aquarium-list">
        <AquariumCard
          v-for="item in aquariumStore.aquariums"
          :key="item.aquariumId"
          :aquarium="item"
          :last-record-time="getLastRecordTime(item.aquariumId)"
          @tap="goAquariumDetail(item.aquariumId)"
        />
      </scroll-view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-wrapper">
      <EmptyState
        icon="🐠"
        title="暂无水族箱"
        description="点击下方按钮添加你的第一个水族箱"
        button-text="立即添加"
        @action="goAddAquarium"
      />
    </view>

    <!-- FAB 浮动按钮 -->
    <view class="fab" @click="goAddAquarium">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAquariumStore } from '@/store/aquarium'
import { useAlertStore } from '@/store/alert'
import { useRecordStore } from '@/store/record'
import { getOverviewStats } from '@/services/analysis'
import type { AquariumStats } from '@/types/models'
import AquariumCard from '@/components/AquariumCard.vue'
import AlertBanner from '@/components/AlertBanner.vue'
import StatPanel from '@/components/StatPanel.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const aquariumStore = useAquariumStore()
const alertStore = useAlertStore()
const recordStore = useRecordStore()

const stats = ref<AquariumStats>({ totalAquariums: 0, totalRecords: 0, todayAlerts: 0, healthScore: 0 })

const hasAquariums = computed(() => aquariumStore.aquariums.length > 0)
const activeAlerts = computed(() => alertStore.alerts.filter(a => !a.dismissed))

function getLastRecordTime(aquariumId: string): number | null {
  const record = recordStore.getLatestRecord(aquariumId)
  return record ? record.createdAt : null
}

function refreshData() {
  alertStore.checkAllAlerts()
  stats.value = getOverviewStats('')
}

onShow(() => {
  refreshData()
})

function onTapAlert(alertId: string) {
  // 可跳转到预警详情或对应水族箱
  const alert = alertStore.alerts.find(a => a.alertId === alertId)
  if (alert) {
    uni.navigateTo({ url: `/pages/aquarium/detail?aquariumId=${alert.aquariumId}` })
  }
}

function goAddAquarium() {
  uni.navigateTo({ url: '/pages/aquarium/add' })
}

function goAquariumDetail(aquariumId: string) {
  uni.navigateTo({ url: `/pages/aquarium/detail?aquariumId=${aquariumId}` })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.header {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  padding: $spacing-xl $spacing-lg $spacing-lg;
  padding-top: calc(#{$spacing-xl} + env(safe-area-inset-top));
}

.header-content {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: $font-title;
  font-weight: $font-weight-bold;
  color: $text-white;
  letter-spacing: 2rpx;
}

.header-subtitle {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.8);
  margin-top: $spacing-xs;
}

.section {
  padding: 0 $spacing-lg;
  margin-top: $spacing-md;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.section-count {
  font-size: $font-sm;
  color: $text-light;
}

.aquarium-list {
  max-height: calc(100vh - 600rpx);
}

.empty-wrapper {
  padding-top: $spacing-xxl;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(160rpx + env(safe-area-inset-bottom));
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  z-index: 100;

  &:active {
    opacity: 0.85;
    transform: scale(0.95);
  }
}

.fab-icon {
  font-size: 56rpx;
  color: $text-white;
  font-weight: 300;
  line-height: 1;
}
</style>
