<template>
  <view class="page">
    <!-- 顶部统计与对比入口 -->
    <view class="record-header">
      <view class="record-header__stats">
        <view class="record-header__stat">
          <text class="record-header__stat-num">{{ totalPhotos }}</text>
          <text class="record-header__stat-label">照片总数</text>
        </view>
        <view class="record-header__divider" />
        <view class="record-header__stat">
          <text class="record-header__stat-num">{{ coveredWeeks }}</text>
          <text class="record-header__stat-label">覆盖孕周</text>
        </view>
      </view>
      <view
        v-if="recordStore.logCount >= 2"
        class="record-header__compare"
        @click="goCompare"
      >
        <text class="record-header__compare-text">照片对比</text>
        <text class="record-header__compare-arrow">›</text>
      </view>
    </view>

    <!-- 时间轴列表 -->
    <scroll-view class="record-scroll" scroll-y>
      <view v-if="weekGroups.length === 0" class="record-empty">
        <Empty text="还没有孕期照片记录" icon="📷" />
      </view>

      <view
        v-for="group in weekGroups"
        :key="group.week"
        class="record-group"
      >
        <!-- 时间轴节点 -->
        <view class="record-group__timeline">
          <view class="record-group__line" />
          <view class="record-group__dot" />
        </view>

        <view class="record-group__content">
          <!-- 组标题 -->
          <view class="record-group__header">
            <text class="record-group__title">第{{ group.week }}周</text>
            <text class="record-group__count">{{ group.logs.length }}条记录</text>
          </view>

          <!-- 记录卡片 -->
          <PhotoCard
            v-for="log in group.logs"
            :key="log.logId"
            :log="log"
            @click="onCardClick(log)"
            @compare="onCompareClick(log)"
          />
        </view>
      </view>

      <!-- 底部占位，避免被浮动按钮遮挡 -->
      <view class="record-bottom-spacer" />
    </scroll-view>

    <!-- 浮动拍照按钮 -->
    <view class="record-fab" @click="goAdd">
      <text class="record-fab__icon">📷</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/store/record'
import PhotoCard from '@/components/PhotoCard.vue'
import Empty from '@/components/common/Empty.vue'
import type { PregnancyLog } from '@/types/models'

const recordStore = useRecordStore()

// 按孕周分组并降序排列
const weekGroups = computed(() => {
  const groups = recordStore.logsByWeek
  const weeks = Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a)
  return weeks.map((week) => ({
    week,
    logs: groups[week]
  }))
})

// 照片总数（每条记录最多2张）
const totalPhotos = computed(() => {
  let count = 0
  for (const log of recordStore.logs) {
    if (log.frontPhotoUrl) count++
    if (log.sidePhotoUrl) count++
  }
  return count
})

// 覆盖孕周数
const coveredWeeks = computed(() => {
  return Object.keys(recordStore.logsByWeek).length
})

// 页面显示时刷新数据
onShow(() => {
  recordStore.init()
})

// 跳转添加页面
function goAdd() {
  uni.navigateTo({ url: '/pages/record/add' })
}

// 跳转对比页面
function goCompare() {
  uni.navigateTo({ url: '/pages/record/compare' })
}

// 卡片点击
function onCardClick(log: PregnancyLog) {
  // 预览照片
  const urls: string[] = []
  if (log.frontPhotoUrl) urls.push(log.frontPhotoUrl)
  if (log.sidePhotoUrl) urls.push(log.sidePhotoUrl)
  if (urls.length > 0) {
    uni.previewImage({ urls })
  }
}

// 对比按钮点击
function onCompareClick(log: PregnancyLog) {
  uni.navigateTo({
    url: `/pages/record/compare?week=${log.week}`
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
}

.record-header {
  background: #ffffff;
  padding: 32rpx 40rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1rpx solid $border-color;

  &__stats {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  &__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 120rpx;
  }

  &__stat-num {
    font-size: 40rpx;
    font-weight: 700;
    color: $primary-color;
    line-height: 1.2;
  }

  &__stat-label {
    font-size: 24rpx;
    color: $text-hint;
    margin-top: 4rpx;
  }

  &__divider {
    width: 1rpx;
    height: 60rpx;
    background: $border-color;
    margin: 0 32rpx;
  }

  &__compare {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: $bg-secondary;
    padding: 12rpx 24rpx;
    border-radius: $border-radius-round;
  }

  &__compare-text {
    font-size: 26rpx;
    color: $primary-color;
    font-weight: 500;
  }

  &__compare-arrow {
    font-size: 30rpx;
    color: $primary-color;
    margin-left: 4rpx;
  }
}

.record-scroll {
  height: calc(100vh - 140rpx);
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.record-empty {
  padding-top: 120rpx;
}

.record-group {
  display: flex;
  flex-direction: row;
  margin-bottom: 8rpx;

  &__timeline {
    width: 48rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex-shrink: 0;
    padding-top: 32rpx;
  }

  &__line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 4rpx;
    background: linear-gradient(180deg, $primary-light 0%, $primary-color 100%);
    border-radius: 2rpx;
  }

  &__dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: $primary-color;
    border: 4rpx solid #ffffff;
    box-shadow: 0 0 0 2rpx rgba(233, 30, 140, 0.3);
    z-index: 1;
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    padding-left: 8rpx;
    padding-bottom: 24rpx;
    min-width: 0;
  }

  &__header {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-bottom: 16rpx;
  }

  &__title {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    margin-right: 12rpx;
  }

  &__count {
    font-size: 24rpx;
    color: $text-hint;
  }
}

.record-bottom-spacer {
  height: 160rpx;
}

.record-fab {
  position: fixed;
  right: 40rpx;
  bottom: 160rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(233, 30, 140, 0.35);
  z-index: 100;

  &__icon {
    font-size: 44rpx;
  }
}
</style>
