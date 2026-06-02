<template>
  <view class="page">
    <view v-if="gear" class="detail-content">
      <!-- 照片轮播 -->
      <view class="photo-section">
        <swiper
          v-if="gear.photos.length > 0"
          class="photo-swiper"
          indicator-dots
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#ffffff"
          circular
        >
          <swiper-item v-for="(photo, idx) in gear.photos" :key="idx">
            <image class="photo-img" :src="photo" mode="aspectFill" @click="previewImage(idx)" />
          </swiper-item>
        </swiper>
        <view v-else class="photo-placeholder">
          <text class="photo-placeholder-icon">🏕️</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="info-card">
        <text class="gear-name">{{ gear.name }}</text>
        <view class="category-tag" :style="{ backgroundColor: getCategoryBg(gear.category) }">
          <view class="category-dot" :style="{ backgroundColor: getCategoryColor(gear.category) }" />
          <text class="category-text" :style="{ color: getCategoryColor(gear.category) }">
            {{ getCategoryLabel(gear.category) }}
          </text>
        </view>
      </view>

      <!-- 详细信息 -->
      <view class="detail-card">
        <view class="detail-row">
          <text class="detail-label">重量</text>
          <text class="detail-value">{{ formatWeightGram(gear.weight) }} / {{ formatWeightGram(gear.weight, 'kg') }}</text>
        </view>
        <view class="detail-row">
          <text class="detail-label">数量</text>
          <text class="detail-value">{{ gear.quantity }}</text>
        </view>
        <view v-if="gear.storageLocation" class="detail-row">
          <text class="detail-label">存放位置</text>
          <text class="detail-value">{{ gear.storageLocation }}</text>
        </view>
        <view v-if="gear.purchaseLink" class="detail-row">
          <text class="detail-label">购买链接</text>
          <text class="detail-value link" @click="copyLink">{{ gear.purchaseLink }}</text>
        </view>
        <view v-if="gear.note" class="detail-row column">
          <text class="detail-label">备注</text>
          <text class="detail-note">{{ gear.note }}</text>
        </view>
      </view>

      <!-- 时间信息 -->
      <view class="time-card">
        <view class="time-row">
          <text class="time-label">创建时间</text>
          <text class="time-value">{{ formatDate(gear.createdAt, 'YYYY-MM-DD HH:mm') }}</text>
        </view>
        <view class="time-row">
          <text class="time-label">更新时间</text>
          <text class="time-value">{{ formatDate(gear.updatedAt, 'YYYY-MM-DD HH:mm') }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <Empty v-else icon="❓" text="装备不存在" />

    <!-- 底部操作栏 -->
    <view v-if="gear" class="bottom-bar">
      <view class="btn-edit" @click="goEdit">
        <text class="btn-edit-text">编辑</text>
      </view>
      <view class="btn-delete" @click="handleDelete">
        <text class="btn-delete-text">删除</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useGearStore } from '@/store/gear'
import { useChecklistsStore } from '@/store/checklists'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP, GEAR_CATEGORY_COLORS } from '@/types/models'
import { formatWeightGram, formatDate } from '@/utils/format'
import { deleteGear, isGearInUse } from '@/services/gear'
import Empty from '@/components/common/Empty.vue'

const gearStore = useGearStore()
const checklistsStore = useChecklistsStore()

const gearId = ref('')
const gear = computed(() => gearStore.getGearById(gearId.value))

function getCategoryColor(category: GearCategory): string {
  return GEAR_CATEGORY_COLORS[category] || '#9E9E9E'
}

function getCategoryBg(category: GearCategory): string {
  const color = GEAR_CATEGORY_COLORS[category] || '#9E9E9E'
  return color + '18'
}

function getCategoryLabel(category: GearCategory): string {
  return GEAR_CATEGORY_MAP[category] || '其他'
}

function previewImage(idx: number) {
  if (!gear.value) return
  uni.previewImage({
    urls: gear.value.photos,
    current: idx
  })
}

function copyLink() {
  if (!gear.value?.purchaseLink) return
  uni.setClipboardData({
    data: gear.value.purchaseLink,
    success: () => {
      uni.showToast({ title: '链接已复制', icon: 'success' })
    }
  })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/gear/create?id=${gearId.value}` })
}

function handleDelete() {
  if (!gear.value) return

  // 检查是否被清单引用
  const inUse = isGearInUse(gearId.value)
  const usedCount = inUse
    ? checklistsStore.checklists.filter((c) =>
        c.items.some((item) => item.gearId === gearId.value)
      ).length
    : 0

  const message = inUse
    ? `该装备正在被${usedCount}个清单使用，确定删除？`
    : '确定删除该装备？'

  uni.showModal({
    title: '删除确认',
    content: message,
    confirmColor: '#E91E63',
    success: (res) => {
      if (res.confirm) {
        deleteGear(gearId.value)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      }
    }
  })
}

onLoad((options) => {
  if (options?.id) {
    gearId.value = options.id
  }
  gearStore.init()
  checklistsStore.init()
})

onShow(() => {
  gearStore.init()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 160rpx;
}

.photo-section {
  width: 100%;
}

.photo-swiper {
  width: 100%;
  height: 500rpx;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  width: 100%;
  height: 400rpx;
  background-color: #E8F5E9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-placeholder-icon {
  font-size: 120rpx;
}

.info-card {
  background-color: #ffffff;
  padding: 32rpx 24rpx;
  margin: -20rpx 24rpx 0;
  border-radius: 20rpx;
  position: relative;
  z-index: 1;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.gear-name {
  font-size: 40rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.category-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.category-text {
  font-size: 26rpx;
  font-weight: 500;
}

.detail-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin: 24rpx;
  padding: 8rpx 24rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.column {
    flex-direction: column;
    align-items: flex-start;
  }
}

.detail-label {
  font-size: 28rpx;
  color: #666666;
  flex-shrink: 0;
}

.detail-value {
  font-size: 28rpx;
  color: #333333;
  text-align: right;
  word-break: break-all;

  &.link {
    color: #2E7D32;
    text-decoration: underline;
  }
}

.detail-note {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  margin-top: 12rpx;
}

.time-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin: 0 24rpx 24rpx;
  padding: 8rpx 24rpx;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.time-label {
  font-size: 26rpx;
  color: #999999;
}

.time-value {
  font-size: 26rpx;
  color: #999999;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: 20rpx;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-edit {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #2E7D32;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}

.btn-delete {
  width: 180rpx;
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #ffffff;
  border: 2rpx solid #E91E63;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-text {
  font-size: 32rpx;
  color: #E91E63;
  font-weight: 500;
}
</style>
