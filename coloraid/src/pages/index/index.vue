<template>
  <view class="index-page">
    <!-- 顶部区域 -->
    <view class="header-section">
      <view class="header-left">
        <text class="app-name">ColorAid</text>
        <view v-if="settingsStore.filterMode" class="filter-tag">
          <text class="filter-tag-text">{{ filterModeText }}</text>
        </view>
      </view>
      <view class="header-right" @click="goProfile">
        <image
          v-if="userStore.userInfo?.avatar"
          class="avatar"
          :src="userStore.userInfo.avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar avatar-placeholder">
          <text class="avatar-icon">&#xe6a2;</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能卡片区 -->
    <view class="section">
      <view class="quick-grid">
        <view
          v-for="item in quickItems"
          :key="item.name"
          class="quick-card"
          @click="onQuickClick(item)"
        >
          <view class="quick-icon-wrap" :style="{ backgroundColor: item.bgColor }">
            <text class="quick-icon">{{ item.icon }}</text>
          </view>
          <text class="quick-name">{{ item.name }}</text>
          <text class="quick-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 最近识别颜色 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近识别</text>
        <text class="section-link" @click="goHistory">查看全部</text>
      </view>
      <view v-if="historyStore.recentColors.length > 0" class="recent-list">
        <ColorCard
          v-for="record in historyStore.recentColors"
          :key="record.historyId"
          :color="record.color"
          size="small"
          @click="onColorClick(record.color)"
        />
      </view>
      <view v-else class="empty-tip">
        <text class="empty-text">还没有识别记录</text>
      </view>
    </view>

    <!-- 当前设置摘要卡片 -->
    <view class="section">
      <view class="settings-card">
        <view class="settings-row">
          <text class="settings-label">色盲类型</text>
          <text class="settings-value">{{ colorBlindTypeText }}</text>
        </view>
        <view class="settings-row">
          <text class="settings-label">滤镜模式</text>
          <text class="settings-value">{{ filterModeText || '未开启' }}</text>
        </view>
        <view class="settings-row">
          <text class="settings-label">增强强度</text>
          <text class="settings-value">{{ settingsStore.filterStrength }} / 10</text>
        </view>
        <view class="settings-action">
          <button class="btn-secondary btn-small" @click="goSettings">调整设置</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// @ts-ignore - alpha 版本类型声明兼容
import { onShow } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import { useUserStore } from '@/store/user'
import ColorCard from '@/components/ColorCard.vue'
import type { ColorInfo } from '@/types/models'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()
const userStore = useUserStore()

const filterModeText = computed(() => {
  const map: Record<string, string> = {
    protanopia: '红绿增强',
    deuteranopia: '红绿增强',
    tritanopia: '蓝黄增强',
    achromatopsia: '全色盲增强'
  }
  return settingsStore.filterMode ? map[settingsStore.filterMode] : ''
})

const colorBlindTypeText = computed(() => {
  const map: Record<string, string> = {
    normal: '正常视力',
    protanopia: '红色盲',
    deuteranopia: '绿色盲',
    tritanopia: '蓝黄色盲',
    achromatopsia: '全色盲'
  }
  return map[settingsStore.colorBlindType] || '正常视力'
})

interface QuickItem {
  name: string
  desc: string
  icon: string
  bgColor: string
  path: string
  isTabBar: boolean
}

const quickItems: QuickItem[] = [
  {
    name: '实时滤镜',
    desc: '摄像头实时增强',
    icon: '\ue6a8',
    bgColor: '#EEF2FF',
    path: '/pages/camera/index',
    isTabBar: false
  },
  {
    name: '颜色识别',
    desc: '点按识别颜色',
    icon: '\ue6a3',
    bgColor: '#FFF3E0',
    path: '/pages/camera/identify',
    isTabBar: false
  },
  {
    name: '拍照分析',
    desc: '照片色彩分析',
    icon: '\ue6a4',
    bgColor: '#E8F5E9',
    path: '/pages/photo/index',
    isTabBar: true
  },
  {
    name: '色盲检测',
    desc: '石原图测试',
    icon: '\ue6a5',
    bgColor: '#FCE4EC',
    path: '/pages/test/index',
    isTabBar: true
  }
]

function onQuickClick(item: QuickItem) {
  if (item.isTabBar) {
    uni.switchTab({ url: item.path })
  } else {
    uni.navigateTo({ url: item.path })
  }
}

function goProfile() {
  uni.navigateTo({ url: '/pages/profile/index' })
}

function goHistory() {
  uni.navigateTo({ url: '/pages/history/index' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function onColorClick(color: ColorInfo) {
  uni.navigateTo({
    url: `/pages/history/index?color=${encodeURIComponent(JSON.stringify(color))}`
  })
}

onShow(() => {
  settingsStore.init()
  historyStore.init()
  userStore.init()
})
</script>

<style scoped lang="scss">
.index-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
  padding-bottom: calc(env(safe-area-inset-bottom) + 48rpx);
}

/* ===== 顶部区域 ===== */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;
}

.header-left {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.app-name {
  font-size: $font-xxl;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -1rpx;
}

.filter-tag {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  padding: 4rpx 16rpx;
  border-radius: $radius-pill;
}

.filter-tag-text {
  font-size: $font-xs;
  color: #FFFFFF;
  font-weight: 500;
}

.header-right {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  overflow: hidden;
}

.avatar {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  background-color: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: $font-lg;
  color: $text-hint;
}

/* ===== 快捷功能网格 ===== */
.section {
  margin-bottom: $spacing-lg;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.quick-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.97);
  }
}

.quick-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4rpx;
}

.quick-icon {
  font-size: $font-xxl;
  color: $primary-color;
}

.quick-name {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.quick-desc {
  font-size: $font-sm;
  color: $text-hint;
}

/* ===== 最近识别 ===== */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.section-link {
  font-size: $font-sm;
  color: $primary-color;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.empty-tip {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-xl;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: $font-md;
  color: $text-hint;
}

/* ===== 设置摘要卡片 ===== */
.settings-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-color;

  &:last-of-type {
    border-bottom: none;
  }
}

.settings-label {
  font-size: $font-md;
  color: $text-secondary;
}

.settings-value {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.settings-action {
  margin-top: $spacing-md;
  display: flex;
  justify-content: center;
}

.btn-small {
  height: 64rpx;
  line-height: 64rpx;
  font-size: $font-sm;
  padding: 0 48rpx;
  border-radius: $radius-pill;
}
</style>
