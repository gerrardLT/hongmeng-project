<template>
  <view class="settings-page">
    <!-- 重量单位 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">重量单位</text>
      </view>
      <view class="section-body">
        <view class="radio-group">
          <view
            class="radio-item"
            :class="{ active: settings.weightUnit === 'g' }"
            @click="setWeightUnit('g')"
          >
            <view class="radio-dot" :class="{ checked: settings.weightUnit === 'g' }">
              <view v-if="settings.weightUnit === 'g'" class="radio-inner" />
            </view>
            <text class="radio-label">克 (g)</text>
          </view>
          <view
            class="radio-item"
            :class="{ active: settings.weightUnit === 'kg' }"
            @click="setWeightUnit('kg')"
          >
            <view class="radio-dot" :class="{ checked: settings.weightUnit === 'kg' }">
              <view v-if="settings.weightUnit === 'kg'" class="radio-inner" />
            </view>
            <text class="radio-label">千克 (kg)</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 重量预警阈值 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">重量预警阈值</text>
      </view>
      <view class="section-body">
        <text class="setting-desc">背包露营超重提醒，超过该重量时会提示</text>
        <view class="threshold-row">
          <view class="threshold-options">
            <view
              v-for="opt in thresholdOptions"
              :key="opt.value"
              class="threshold-option"
              :class="{ active: settings.weightThreshold === opt.value }"
              @click="setWeightThreshold(opt.value)"
            >
              <text class="threshold-text" :class="{ active: settings.weightThreshold === opt.value }">{{ opt.label }}</text>
            </view>
          </view>
        </view>
        <view class="current-value">
          <text class="current-label">当前阈值：</text>
          <text class="current-num">{{ displayThreshold }}</text>
        </view>
      </view>
    </view>

    <!-- 清除缓存 -->
    <view class="section-card">
      <view class="menu-item" @click="handleClearCache">
        <text class="menu-icon">🗑️</text>
        <text class="menu-title">清除缓存</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section-card">
      <view class="menu-item">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-title">关于 CampReady</text>
        <text class="menu-value">v1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'

const STORAGE_KEY = 'campready_settings'

interface Settings {
  weightUnit: 'g' | 'kg'
  weightThreshold: number // 以克为单位存储
}

/** 从本地读取设置 */
function loadSettings(): Settings {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY)
    if (saved) {
      return {
        weightUnit: saved.weightUnit || 'g',
        weightThreshold: saved.weightThreshold || 15000
      }
    }
  } catch (e) {
    console.error('读取设置失败:', e)
  }
  return { weightUnit: 'g', weightThreshold: 15000 }
}

/** 保存设置到本地 */
function saveSettings() {
  try {
    uni.setStorageSync(STORAGE_KEY, {
      weightUnit: settings.weightUnit,
      weightThreshold: settings.weightThreshold
    })
  } catch (e) {
    console.error('保存设置失败:', e)
  }
}

const settings = reactive<Settings>(loadSettings())

/** 阈值选项（克为单位） */
const thresholdOptions = [
  { label: '10kg', value: 10000 },
  { label: '12kg', value: 12000 },
  { label: '15kg', value: 15000 },
  { label: '18kg', value: 18000 },
  { label: '20kg', value: 20000 },
  { label: '25kg', value: 25000 }
]

/** 当前阈值显示 */
const displayThreshold = computed(() => {
  if (settings.weightUnit === 'kg') {
    return `${(settings.weightThreshold / 1000).toFixed(1)} kg`
  }
  return `${settings.weightThreshold} g`
})

/** 设置重量单位 */
function setWeightUnit(unit: 'g' | 'kg') {
  settings.weightUnit = unit
  saveSettings()
}

/** 设置重量阈值 */
function setWeightThreshold(value: number) {
  settings.weightThreshold = value
  saveSettings()
}

/** 清除缓存 */
function handleClearCache() {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？清除后需要重新登录',
    success: (res) => {
      if (res.confirm) {
        try {
          uni.clearStorageSync()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
}

.section-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.section-body {
  padding: 20rpx 28rpx 28rpx;
}

.setting-desc {
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 20rpx 16rpx;
  border-radius: 12rpx;
  background-color: #f9f9f9;
  border: 2rpx solid transparent;

  &.active {
    background-color: #E8F5E9;
    border-color: #2E7D32;
  }
}

.radio-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  border: 3rpx solid #cccccc;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    border-color: #2E7D32;
  }
}

.radio-inner {
  width: 20rpx;
  height: 20rpx;
  border-radius: 10rpx;
  background-color: #2E7D32;
}

.radio-label {
  font-size: 30rpx;
  color: #333333;
}

/* 阈值选项 */
.threshold-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.threshold-option {
  padding: 14rpx 28rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;

  &.active {
    background-color: #E8F5E9;
    border-color: #2E7D32;
  }
}

.threshold-text {
  font-size: 26rpx;
  color: #666666;

  &.active {
    color: #2E7D32;
    font-weight: 500;
  }
}

.current-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.current-label {
  font-size: 26rpx;
  color: #999999;
}

.current-num {
  font-size: 28rpx;
  color: #2E7D32;
  font-weight: 600;
}

/* 菜单项 */
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 28rpx;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}

.menu-title {
  flex: 1;
  font-size: 30rpx;
  color: #333333;
}

.menu-value {
  font-size: 26rpx;
  color: #999999;
  margin-right: 12rpx;
}

.menu-arrow {
  font-size: 36rpx;
  color: #cccccc;
}
</style>
