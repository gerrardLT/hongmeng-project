<template>
  <view class="history-page">
    <!-- Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'camera' }"
        @click="switchTab('camera')"
      >
        <text class="tab-text">颜色识别</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'photo' }"
        @click="switchTab('photo')"
      >
        <text class="tab-text">拍照分析</text>
      </view>
    </view>

    <!-- 清空按钮 -->
    <view class="header-action" v-if="showClearBtn">
      <text class="clear-btn" @click="clearCurrent">清空</text>
    </view>

    <!-- 颜色识别记录 -->
    <scroll-view scroll-y class="content-scroll" v-if="activeTab === 'camera'">
      <view v-if="groupedCameraRecords.length">
        <view v-for="group in groupedCameraRecords" :key="group.date">
          <text class="date-label">{{ group.date }}</text>
          <view class="record-list">
            <view
              class="record-wrap"
              v-for="item in group.records"
              :key="item.historyId"
            >
              <view class="record-actions">
                <view class="action-delete" @click="deleteColorHistory(item.historyId)">删除</view>
              </view>
              <view
                class="record-content"
                :style="{ transform: `translateX(${swipeOffset[item.historyId] || 0}px)` }"
                @touchstart="onTouchStart($event, item.historyId)"
                @touchmove="onTouchMove($event, item.historyId)"
                @touchend="onTouchEnd($event, item.historyId)"
              >
                <ColorCard :color="item.color" size="small" />
                <text class="record-time">{{ formatTime(item.createdAt) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <Empty v-else text="暂无颜色识别记录" icon="🎨" />
    </scroll-view>

    <!-- 拍照分析记录 -->
    <scroll-view scroll-y class="content-scroll" v-if="activeTab === 'photo'">
      <view v-if="analysisRecords.length">
        <view class="analysis-list">
          <view
            class="analysis-item"
            v-for="item in analysisRecords"
            :key="item.analysisId"
            @click="viewAnalysisDetail(item.analysisId)"
          >
            <image class="analysis-thumb" :src="item.imagePath" mode="aspectFill" />
            <view class="analysis-info">
              <view class="analysis-colors">
                <view
                  class="analysis-dot"
                  v-for="(c, idx) in item.colors.slice(0, 4)"
                  :key="idx"
                  :style="{ backgroundColor: c.color.hex }"
                />
              </view>
              <text class="analysis-time">{{ formatDate(item.analyzedAt, 'MM-dd HH:mm') }}</text>
            </view>
          </view>
        </view>
      </view>
      <Empty v-else text="暂无拍照分析记录" icon="📸" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useHistoryStore } from '@/store/history'
import { getAnalysisHistory } from '@/services/photoAnalysis'
import type { ColorHistory, AnalysisResult } from '@/types/models'
import ColorCard from '@/components/ColorCard.vue'
import Empty from '@/components/common/Empty.vue'
import { formatDate, formatTime } from '@/utils/format'

const activeTab = ref<'camera' | 'photo'>('camera')
const historyStore = useHistoryStore()
const analysisRecords = ref<AnalysisResult[]>([])
const swipeOffset = ref<Record<string, number>>({})
const touchStartX = ref<Record<string, number>>({})

const cameraRecords = computed(() => {
  return historyStore.histories.filter((h) => h.source === 'camera')
})

const showClearBtn = computed(() => {
  if (activeTab.value === 'camera') return cameraRecords.value.length > 0
  return analysisRecords.value.length > 0
})

const groupedCameraRecords = computed(() => {
  const groups: Record<string, ColorHistory[]> = {}
  for (const record of cameraRecords.value) {
    const date = formatDate(record.createdAt)
    if (!groups[date]) groups[date] = []
    groups[date].push(record)
  }
  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, records]) => ({ date, records }))
})

onShow(() => {
  historyStore.init()
  analysisRecords.value = getAnalysisHistory()
})

function switchTab(tab: 'camera' | 'photo') {
  activeTab.value = tab
  // 重置所有滑动位置
  swipeOffset.value = {}
}

function clearCurrent() {
  if (activeTab.value === 'camera') {
    if (cameraRecords.value.length === 0) return
    uni.showModal({
      title: '确认清空',
      content: '确定要清空所有颜色识别记录吗？',
      success: (res) => {
        if (res.confirm) {
          const remaining = historyStore.histories.filter((h) => h.source !== 'camera')
          try {
            uni.setStorageSync('coloraid_histories', remaining)
            historyStore.histories = remaining
            uni.showToast({ title: '已清空', icon: 'success' })
          } catch (e) {
            console.error('clear camera records error:', e)
          }
        }
      }
    })
  } else {
    if (analysisRecords.value.length === 0) return
    uni.showModal({
      title: '确认清空',
      content: '确定要清空所有拍照分析记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            uni.removeStorageSync('coloraid_db_analysis_results')
            analysisRecords.value = []
            uni.showToast({ title: '已清空', icon: 'success' })
          } catch (e) {
            console.error('clear analysis records error:', e)
          }
        }
      }
    })
  }
}

function deleteColorHistory(historyId: string) {
  historyStore.removeHistory(historyId)
  swipeOffset.value[historyId] = 0
}

function viewAnalysisDetail(analysisId: string) {
  uni.navigateTo({
    url: `/pages/photo/result?analysisId=${analysisId}`
  })
}

// 左滑删除手势
function onTouchStart(e: TouchEvent, id: string) {
  touchStartX.value[id] = e.touches[0].clientX
  // 收起其他项
  for (const key of Object.keys(swipeOffset.value)) {
    if (key !== id) swipeOffset.value[key] = 0
  }
}

function onTouchMove(e: TouchEvent, id: string) {
  const startX = touchStartX.value[id] || 0
  const moveX = e.touches[0].clientX
  const diff = moveX - startX
  const maxOffset = -uni.upx2px(160)
  const offset = Math.max(maxOffset, Math.min(0, diff))
  swipeOffset.value[id] = offset
}

function onTouchEnd(e: TouchEvent, id: string) {
  const offset = swipeOffset.value[id] || 0
  const threshold = -uni.upx2px(80)
  const maxOffset = -uni.upx2px(160)
  if (offset < threshold) {
    swipeOffset.value[id] = maxOffset
  } else {
    swipeOffset.value[id] = 0
  }
}
</script>

<style scoped lang="scss">
.history-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.tab-bar {
  display: flex;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: $spacing-md 0;
  position: relative;

  &.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 30%;
    right: 30%;
    height: 4rpx;
    background-color: $primary-color;
    border-radius: 2rpx;
  }
}

.tab-text {
  font-size: $font-md;
  color: $text-secondary;

  .active & {
    color: $primary-color;
    font-weight: 600;
  }
}

.header-action {
  display: flex;
  justify-content: flex-end;
  padding: $spacing-sm $spacing-md;
}

.clear-btn {
  font-size: $font-sm;
  color: $error-color;
}

.content-scroll {
  height: calc(100vh - 180rpx);
  padding: 0 $spacing-md;
}

.date-label {
  font-size: $font-sm;
  color: $text-secondary;
  padding: $spacing-md 0 $spacing-sm;
  display: block;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.record-wrap {
  position: relative;
  overflow: hidden;
  border-radius: $radius-md;
}

.record-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 160rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $error-color;
  z-index: 1;
}

.action-delete {
  font-size: $font-md;
  color: #FFFFFF;
}

.record-content {
  position: relative;
  background-color: $bg-card;
  padding: $spacing-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  transition: transform 0.2s ease;
}

.record-time {
  font-size: $font-sm;
  color: $text-secondary;
}

.analysis-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  padding-top: $spacing-sm;
}

.analysis-item {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;

  &:active {
    opacity: 0.8;
  }
}

.analysis-thumb {
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.analysis-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.analysis-colors {
  display: flex;
  gap: $spacing-xs;
}

.analysis-dot {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
}

.analysis-time {
  font-size: $font-sm;
  color: $text-secondary;
}
</style>
