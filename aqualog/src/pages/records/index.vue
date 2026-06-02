<template>
  <view class="page">
    <!-- 水族箱选择器 -->
    <view class="picker-bar">
      <picker :range="aquariumNames" :value="pickerIndex" @change="onPickerChange">
        <view class="picker-trigger flex-row">
          <text class="picker-label">{{ currentAquariumName }}</text>
          <text class="picker-arrow">▼</text>
        </view>
      </picker>
    </view>

    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'param' }" @click="activeTab = 'param'">
        <text class="tab-text" :class="{ active: activeTab === 'param' }">参数记录</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'maintenance' }" @click="activeTab = 'maintenance'">
        <text class="tab-text" :class="{ active: activeTab === 'maintenance' }">维护日志</text>
      </view>
      <view class="tab-indicator" :class="{ right: activeTab === 'maintenance' }" />
    </view>

    <!-- 参数记录列表 -->
    <scroll-view v-if="activeTab === 'param'" scroll-y class="list-wrapper">
      <view v-if="groupedRecords.length > 0">
        <view v-for="group in groupedRecords" :key="group.date" class="date-group">
          <text class="date-label">{{ group.date }}</text>
          <view
            v-for="record in group.items"
            :key="record.recordId"
            class="record-card card"
          >
            <text class="record-time">{{ record.time }}</text>
            <view class="param-row">
              <view class="param-mini">
                <text class="param-mini-label">温度</text>
                <text class="param-mini-value">{{ formatVal(record.temperature, '°C') }}</text>
              </view>
              <view class="param-mini">
                <text class="param-mini-label">pH</text>
                <text class="param-mini-value">{{ formatVal(record.ph, '') }}</text>
              </view>
              <view class="param-mini">
                <text class="param-mini-label">氨氮</text>
                <text class="param-mini-value">{{ formatVal(record.ammonia, 'mg/L') }}</text>
              </view>
              <view class="param-mini">
                <text class="param-mini-label">亚硝酸盐</text>
                <text class="param-mini-value">{{ formatVal(record.nitrite, 'mg/L') }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <EmptyState
        v-else
        icon="📊"
        title="暂无参数记录"
        description="定期记录水质参数，掌握水族箱健康状态"
        button-text="立即记录"
        @action="goAddParam"
      />
    </scroll-view>

    <!-- 维护日志列表 -->
    <scroll-view v-if="activeTab === 'maintenance'" scroll-y class="list-wrapper">
      <view v-if="groupedLogs.length > 0">
        <view v-for="group in groupedLogs" :key="group.date" class="date-group">
          <text class="date-label">{{ group.date }}</text>
          <view
            v-for="log in group.items"
            :key="log.logId"
            class="record-card card"
          >
            <view class="log-header">
              <view class="log-type-tag">
                <text class="log-type-text">{{ formatMaintenanceType(log.type) }}</text>
              </view>
              <text class="log-note text-ellipsis">{{ log.note || getLogSummary(log) }}</text>
            </view>
          </view>
        </view>
      </view>
      <EmptyState
        v-else
        icon="🔧"
        title="暂无维护日志"
        description="记录换水、喂食等维护操作"
        button-text="添加日志"
        @action="goAddMaintenance"
      />
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="bottom-bar safe-bottom">
      <view class="btn-primary bottom-btn" @click="activeTab === 'param' ? goAddParam() : goAddMaintenance()">
        <text class="bottom-btn-text">{{ activeTab === 'param' ? '记录参数' : '添加日志' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAquariumStore } from '@/store/aquarium'
import { useRecordStore } from '@/store/record'
import { formatParamValue, formatMaintenanceType } from '@/utils/format'
import type { ParameterRecord, MaintenanceLog, FeedingDetails, WaterChangeDetails } from '@/types/models'
import EmptyState from '@/components/common/EmptyState.vue'

const aquariumStore = useAquariumStore()
const recordStore = useRecordStore()

const activeTab = ref<'param' | 'maintenance'>('param')
const pickerIndex = ref(0)

const aquariumNames = computed(() => aquariumStore.aquariums.map(a => a.name))
const currentAquariumId = computed(() => {
  const list = aquariumStore.aquariums
  return list.length > 0 ? list[pickerIndex.value]?.aquariumId || '' : ''
})
const currentAquariumName = computed(() => {
  const list = aquariumStore.aquariums
  return list.length > 0 ? list[pickerIndex.value]?.name || '请选择水族箱' : '暂无水族箱'
})

// 按日期分组参数记录
const groupedRecords = computed(() => {
  if (!currentAquariumId.value) return []
  const records = recordStore.getRecordsByAquarium(currentAquariumId.value)
  return groupByDate<ParameterRecord>(records, r => r.date)
})

// 按日期分组维护日志
const groupedLogs = computed(() => {
  if (!currentAquariumId.value) return []
  const logs = recordStore.getLogsByAquarium(currentAquariumId.value)
  return groupByDate<MaintenanceLog>(logs, l => l.date)
})

function groupByDate<T>(items: T[], getDate: (item: T) => string): { date: string; items: T[] }[] {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const date = getDate(item)
    if (!map.has(date)) map.set(date, [])
    map.get(date)!.push(item)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, items]) => ({ date, items }))
}

function formatVal(value: number | null, unit: string): string {
  return formatParamValue(value, unit)
}

function getLogSummary(log: MaintenanceLog): string {
  if (log.type === 'waterChange') {
    const d = log.details as WaterChangeDetails
    return `换水${d.percentage}%`
  }
  if (log.type === 'feeding') {
    const d = log.details as FeedingDetails
    return d.foodType || '喂食'
  }
  return ''
}

function onPickerChange(e: any) {
  pickerIndex.value = Number(e.detail.value)
}

onShow(() => {
  // 同步当前水族箱
  if (aquariumStore.currentAquariumId) {
    const idx = aquariumStore.aquariums.findIndex(a => a.aquariumId === aquariumStore.currentAquariumId)
    if (idx >= 0) pickerIndex.value = idx
  }
})

function goAddParam() {
  uni.navigateTo({ url: `/pages/records/add-param?aquariumId=${currentAquariumId.value}` })
}

function goAddMaintenance() {
  uni.navigateTo({ url: `/pages/records/add-maintenance?aquariumId=${currentAquariumId.value}` })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.picker-bar {
  background: $bg-card;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid $border-light;
}

.picker-trigger {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.picker-label {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.picker-arrow {
  font-size: $font-xs;
  color: $text-light;
  margin-left: $spacing-sm;
}

.tab-bar {
  background: $bg-card;
  display: flex;
  flex-direction: row;
  position: relative;
  border-bottom: 1rpx solid $border-light;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-md 0;
}

.tab-text {
  font-size: $font-md;
  color: $text-secondary;
  font-weight: $font-weight-normal;
  transition: color $transition-fast;

  &.active {
    color: $primary-color;
    font-weight: $font-weight-bold;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50%;
  height: 4rpx;
  background: $primary-color;
  border-radius: $radius-pill;
  transition: transform $transition-normal;

  &.right {
    transform: translateX(100%);
  }
}

.list-wrapper {
  padding: $spacing-md $spacing-lg;
  height: calc(100vh - 300rpx);
}

.date-group {
  margin-bottom: $spacing-md;
}

.date-label {
  font-size: $font-sm;
  color: $text-light;
  font-weight: $font-weight-medium;
  margin-bottom: $spacing-sm;
  display: block;
}

.record-card {
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  border-radius: $radius-md;
  background: $bg-card;
  box-shadow: $shadow-sm;
}

.record-time {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.param-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.param-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.param-mini-label {
  font-size: $font-xs;
  color: $text-light;
  margin-bottom: 4rpx;
}

.param-mini-value {
  font-size: $font-md;
  color: $text-primary;
  font-weight: $font-weight-medium;
}

.log-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.log-type-tag {
  background: $primary-lighter;
  padding: 4rpx 16rpx;
  border-radius: $radius-pill;
  margin-right: $spacing-sm;
  flex-shrink: 0;
}

.log-type-text {
  font-size: $font-xs;
  color: $primary-color;
  font-weight: $font-weight-medium;
}

.log-note {
  font-size: $font-sm;
  color: $text-secondary;
  flex: 1;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md $spacing-lg;
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.bottom-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  box-shadow: $shadow-primary;

  &:active {
    opacity: 0.85;
    transform: scale(0.99);
  }
}

.bottom-btn-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}
</style>
