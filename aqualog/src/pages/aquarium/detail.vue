<template>
  <view class="detail-page">
    <!-- 顶部信息区域 -->
    <view class="header-area">
      <view class="header-top">
        <view class="header-name-row">
          <text class="aquarium-name">{{ aquarium?.name || '未知水族箱' }}</text>
          <view class="status-dot" :class="aquarium?.status || 'normal'" />
        </view>
        <view class="header-meta">
          <text class="meta-item">{{ typeLabel }}</text>
          <text class="meta-divider">·</text>
          <text class="meta-item">{{ aquarium?.volume || 0 }}L</text>
          <text class="meta-divider">·</text>
          <text class="meta-item">开缸{{ setupDays }}天</text>
        </view>
      </view>
    </view>

    <!-- 当前参数 -->
    <view class="card-section">
      <view class="card-title">
        <text class="card-title-text">当前水质参数</text>
        <text class="card-time">{{ latestRecordTime }}</text>
      </view>
      <view v-if="latestRecord" class="param-grid">
        <view v-for="param in displayParams" :key="param.name" class="param-cell">
          <text class="param-label">{{ param.label }}</text>
          <text class="param-value" :class="param.status">{{ param.displayValue }}</text>
          <text class="param-unit">{{ param.unit }}</text>
        </view>
      </view>
      <view v-else class="empty-hint">
        <text class="empty-text">暂无参数记录</text>
      </view>
    </view>

    <!-- 最近维护 -->
    <view class="card-section">
      <view class="card-title">
        <text class="card-title-text">最近维护记录</text>
      </view>
      <view v-if="recentLogs.length > 0" class="log-list">
        <view v-for="log in recentLogs" :key="log.logId" class="log-item">
          <view class="log-icon-wrap">
            <text class="log-icon">{{ getMaintenanceIcon(log.type) }}</text>
          </view>
          <view class="log-content">
            <text class="log-title">{{ getMaintenanceTitle(log.type) }}</text>
            <text class="log-date">{{ log.date }}</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-hint">
        <text class="empty-text">暂无维护记录</text>
      </view>
    </view>

    <!-- 快捷操作 -->
    <view class="action-section">
      <view class="action-btn" @click="goAddParam">
        <text class="action-icon">📊</text>
        <text class="action-text">记录参数</text>
      </view>
      <view class="action-btn" @click="goAddMaintenance">
        <text class="action-icon">🔧</text>
        <text class="action-text">添加维护</text>
      </view>
      <view class="action-btn" @click="goTrends">
        <text class="action-icon">📈</text>
        <text class="action-text">查看趋势</text>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="bottom-actions">
      <view class="btn-edit" @click="goEdit">
        <text class="btn-edit-text">编辑水族箱</text>
      </view>
      <view class="btn-delete" @click="handleDelete">
        <text class="btn-delete-text">删除水族箱</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { Aquarium, ParameterRecord, MaintenanceLog, MaintenanceType } from '@/types/models'
import { useAquariumStore } from '@/store/aquarium'
import { useRecordStore } from '@/store/record'
import { checkParamStatus, getParamLabel, getParamUnit } from '@/utils/paramRanges'
import { formatRelativeDate } from '@/utils/format'

const aquariumStore = useAquariumStore()
const recordStore = useRecordStore()

const aquariumId = ref('')
const aquarium = ref<Aquarium | null>(null)

const latestRecord = computed(() => {
  if (!aquariumId.value) return null
  return recordStore.getLatestRecord(aquariumId.value)
})

const latestRecordTime = computed(() => {
  if (!latestRecord.value) return ''
  return formatRelativeDate(latestRecord.value.createdAt)
})

const recentLogs = computed(() => {
  if (!aquariumId.value) return []
  return recordStore.getLogsByAquarium(aquariumId.value).slice(0, 3)
})

const typeLabel = computed(() => {
  const map: Record<string, string> = {
    freshwater: '淡水缸',
    planted: '草缸',
    marine: '海水缸',
    shrimp: '虾缸'
  }
  return map[aquarium.value?.type || ''] || '未知'
})

const setupDays = computed(() => {
  if (!aquarium.value?.setupDate) return 0
  const start = new Date(aquarium.value.setupDate).getTime()
  const now = Date.now()
  return Math.floor((now - start) / (1000 * 60 * 60 * 24))
})

const displayParams = computed(() => {
  if (!latestRecord.value || !aquarium.value) return []
  const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'salinity', 'phosphate']
  const result: { name: string; label: string; displayValue: string; unit: string; status: string }[] = []

  for (const name of paramNames) {
    const value = (latestRecord.value as any)[name]
    if (value === null || value === undefined) continue
    const status = checkParamStatus(name, value, aquarium.value.safeRanges)
    result.push({
      name,
      label: getParamLabel(name),
      displayValue: String(value),
      unit: getParamUnit(name),
      status
    })
  }
  return result
})

function getMaintenanceIcon(type: MaintenanceType): string {
  const map: Record<MaintenanceType, string> = {
    waterChange: '💧',
    feeding: '🍤',
    filter: '🔄',
    light: '💡',
    co2: '🫧',
    other: '📝'
  }
  return map[type] || '📝'
}

function getMaintenanceTitle(type: MaintenanceType): string {
  const map: Record<MaintenanceType, string> = {
    waterChange: '换水',
    feeding: '喂食',
    filter: '滤材维护',
    light: '灯光调整',
    co2: 'CO₂调整',
    other: '其他维护'
  }
  return map[type] || '维护'
}

onLoad((options) => {
  if (options?.aquariumId) {
    aquariumId.value = options.aquariumId
  }
})

onShow(() => {
  if (aquariumId.value) {
    aquarium.value = aquariumStore.getAquariumById(aquariumId.value)
  }
})

function goAddParam() {
  uni.navigateTo({ url: `/pages/records/add-param?aquariumId=${aquariumId.value}` })
}

function goAddMaintenance() {
  uni.navigateTo({ url: `/pages/records/add-maintenance?aquariumId=${aquariumId.value}` })
}

function goTrends() {
  aquariumStore.setCurrentAquarium(aquariumId.value)
  uni.switchTab({ url: '/pages/index/index' })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/aquarium/add?aquariumId=${aquariumId.value}` })
}

function handleDelete() {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除"${aquarium.value?.name}"吗？所有相关记录也将被删除，此操作不可恢复。`,
    confirmColor: '#E74C3C',
    success: (res) => {
      if (res.confirm) {
        recordStore.deleteRecordsByAquarium(aquariumId.value)
        aquariumStore.deleteAquarium(aquariumId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: $bg-grey;
  padding-bottom: $spacing-xl;
}

.header-area {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: $spacing-xl $spacing-lg;
  padding-top: calc(var(--status-bar-height, 44px) + #{$spacing-lg});
}

.header-name-row {
  display: flex;
  align-items: center;
}

.aquarium-name {
  font-size: $font-xl;
  color: #ffffff;
  font-weight: bold;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;
  margin-left: $spacing-sm;

  &.normal {
    background-color: #4CAF50;
  }
  &.warning {
    background-color: #FF9800;
  }
  &.danger {
    background-color: #F44336;
  }
}

.header-meta {
  display: flex;
  align-items: center;
  margin-top: $spacing-xs;
}

.meta-item {
  font-size: $font-sm;
  color: rgba(255, 255, 255, 0.85);
}

.meta-divider {
  margin: 0 $spacing-xs;
  color: rgba(255, 255, 255, 0.5);
}

.card-section {
  background-color: $bg-card;
  margin: $spacing-md;
  border-radius: $radius-md;
  padding: $spacing-md $spacing-lg;
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.card-title-text {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.card-time {
  font-size: $font-xs;
  color: $text-light;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-sm;
}

.param-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-sm;
  background-color: $bg-grey;
  border-radius: $radius-sm;
}

.param-label {
  font-size: $font-xs;
  color: $text-light;
}

.param-value {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  margin: 4rpx 0;

  &.warning {
    color: #FF9800;
  }
  &.danger {
    color: $error-color;
  }
}

.param-unit {
  font-size: $font-xs;
  color: $text-light;
}

.empty-hint {
  padding: $spacing-lg 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: $font-sm;
  color: $text-light;
}

.log-list {
  display: flex;
  flex-direction: column;
}

.log-item {
  display: flex;
  align-items: center;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.03);

  &:last-child {
    border-bottom: none;
  }
}

.log-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background-color: $primary-lighter;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
}

.log-icon {
  font-size: 36rpx;
}

.log-content {
  display: flex;
  flex-direction: column;
}

.log-title {
  font-size: $font-md;
  color: $text-primary;
}

.log-date {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}

.action-section {
  display: flex;
  justify-content: space-around;
  margin: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-lg $spacing-md;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-icon {
  font-size: 56rpx;
}

.action-text {
  font-size: $font-xs;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.bottom-actions {
  margin: $spacing-xl $spacing-md;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.btn-edit {
  width: 100%;
  height: 88rpx;
  background-color: $primary-lighter;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit-text {
  font-size: $font-md;
  color: $primary-color;
  font-weight: 500;
}

.btn-delete {
  width: 100%;
  height: 88rpx;
  background-color: $bg-card;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-text {
  font-size: $font-md;
  color: $error-color;
}
</style>
