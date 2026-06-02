<template>
  <view class="settings-page">
    <!-- 色盲类型设置 -->
    <view class="section">
      <text class="section-title">色觉类型</text>
      <view class="type-list">
        <view
          v-for="item in typeList"
          :key="item.value"
          class="type-card"
          :class="{ active: settingsStore.colorBlindType === item.value }"
          @click="settingsStore.setColorBlindType(item.value)"
        >
          <text class="type-name">{{ item.label }}</text>
          <text class="type-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 滤镜设置 -->
    <view class="section">
      <text class="section-title">滤镜设置</text>
      <view class="setting-card">
        <view class="setting-row">
          <text class="setting-label">滤镜强度</text>
        </view>
        <FilterSlider
          v-model="filterStrengthProxy"
          :min="1"
          :max="10"
          @change="settingsStore.setFilterStrength($event as FilterStrength)"
        />
        <view class="setting-row switch-row">
          <text class="setting-label">自动启动滤镜</text>
          <switch
            :checked="settingsStore.autoFilter"
            color="#5B6EF5"
            @change="onAutoFilterChange"
          />
        </view>
      </view>
    </view>

    <!-- 语音设置 -->
    <view class="section">
      <text class="section-title">语音设置</text>
      <view class="setting-card">
        <view class="setting-row switch-row">
          <text class="setting-label">语音播报</text>
          <switch
            :checked="settingsStore.voiceEnabled"
            color="#5B6EF5"
            @change="onVoiceEnabledChange"
          />
        </view>
        <view class="setting-row" v-if="settingsStore.voiceEnabled">
          <text class="setting-label">音量 {{ settingsStore.voiceVolume }}</text>
        </view>
        <slider
          v-if="settingsStore.voiceEnabled"
          :value="settingsStore.voiceVolume"
          :min="0"
          :max="100"
          :block-size="24"
          active-color="#5B6EF5"
          background-color="#E0E0E0"
          @change="onVolumeChange"
          @changing="onVolumeChanging"
        />
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="setting-card">
        <view class="danger-row" @click="clearHistories">
          <text class="danger-text">清除历史记录</text>
        </view>
        <view class="danger-divider" />
        <view class="danger-row" @click="logout">
          <text class="danger-text">退出登录</text>
        </view>
        <view class="danger-divider" />
        <view class="danger-row" @click="deleteAllData">
          <text class="danger-text">删除所有数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useSettingsStore } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import { clearAllData } from '@/services/storage'
import type { FilterStrength, ColorBlindType } from '@/types/models'
import FilterSlider from '@/components/FilterSlider.vue'

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const typeList: { value: ColorBlindType; label: string; desc: string }[] = [
  { value: 'protanopia', label: '红色盲', desc: '难以区分红绿色，红色偏暗' },
  { value: 'deuteranopia', label: '绿色盲', desc: '难以区分红绿色，绿色偏黄' },
  { value: 'tritanopia', label: '蓝色盲', desc: '难以区分蓝黄色' },
  { value: 'achromatopsia', label: '全色盲', desc: '只能感知明暗灰度' }
]

const filterStrengthProxy = computed({
  get: () => settingsStore.filterStrength,
  set: (val: number) => settingsStore.setFilterStrength(val as FilterStrength)
})

function onVolumeChange(e: { detail: { value: number } }) {
  settingsStore.setVoiceVolume(e.detail.value)
}

function onVolumeChanging(e: { detail: { value: number } }) {
  settingsStore.setVoiceVolume(e.detail.value)
}

function onAutoFilterChange(e: any) {
  settingsStore.setAutoFilter(e.detail.value)
}

function onVoiceEnabledChange(e: any) {
  settingsStore.setVoiceEnabled(e.detail.value)
}

function clearHistories() {
  uni.showModal({
    title: '确认清除',
    content: '确定要清除所有历史记录吗？此操作不可恢复。',
    success: (res) => {
      if (res.confirm) {
        historyStore.clearAll()
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

function logout() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '当前未登录', icon: 'none' })
    return
  }
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'success' })
      }
    }
  })
}

function deleteAllData() {
  uni.showModal({
    title: '危险操作',
    content: '确定要删除所有本地数据吗？包括设置、历史记录和分析结果，此操作不可恢复。',
    confirmColor: '#F44336',
    success: (res) => {
      if (res.confirm) {
        clearAllData()
        // 重置 store 状态
        settingsStore.reset()
        historyStore.clearAll()
        userStore.logout()
        uni.showToast({ title: '数据已清除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  display: block;
  padding-left: $spacing-sm;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.type-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  border: 2rpx solid transparent;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.99);
  }

  &.active {
    border-color: $primary-color;
    background-color: rgba(91, 110, 245, 0.06);
  }
}

.type-name {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-xs;
}

.type-desc {
  font-size: $font-sm;
  color: $text-secondary;
}

.setting-card {
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-row {
  margin-top: $spacing-md;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;
}

.danger-row {
  padding: $spacing-md 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.7;
  }
}

.danger-text {
  font-size: $font-md;
  color: $error-color;
}

.danger-divider {
  height: 1rpx;
  background-color: $border-color;
}
</style>
