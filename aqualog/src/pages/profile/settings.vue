<template>
  <view class="settings-page">
    <!-- 提醒设置 -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">提醒设置</text>
      </view>
      <view class="section-content">
        <!-- 换水提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">换水提醒</text>
            <text class="setting-desc">定期提醒换水</text>
          </view>
          <switch
            :checked="settingsStore.waterChangeReminder"
            color="#1E88E5"
            @change="onSwitchChange('waterChangeReminder', $event)"
          />
        </view>
        <view v-if="settingsStore.waterChangeReminder" class="setting-item sub-item">
          <text class="setting-label">换水周期</text>
          <picker
            :value="waterChangeIndex"
            :range="waterChangeOptions"
            range-key="label"
            @change="onPickerChange('waterChangeInterval', $event)"
          >
            <view class="picker-value">
              <text class="picker-text">{{ waterChangeOptions[waterChangeIndex].label }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 喂食提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">喂食提醒</text>
            <text class="setting-desc">定时提醒喂食</text>
          </view>
          <switch
            :checked="settingsStore.feedingReminder"
            color="#1E88E5"
            @change="onSwitchChange('feedingReminder', $event)"
          />
        </view>
        <view v-if="settingsStore.feedingReminder" class="setting-item sub-item">
          <text class="setting-label">喂食间隔</text>
          <picker
            :value="feedingIndex"
            :range="feedingOptions"
            range-key="label"
            @change="onPickerChange('feedingInterval', $event)"
          >
            <view class="picker-value">
              <text class="picker-text">{{ feedingOptions[feedingIndex].label }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 过滤维护提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">过滤维护提醒</text>
            <text class="setting-desc">定期提醒清洗滤材</text>
          </view>
          <switch
            :checked="settingsStore.filterReminder"
            color="#1E88E5"
            @change="onSwitchChange('filterReminder', $event)"
          />
        </view>
        <view v-if="settingsStore.filterReminder" class="setting-item sub-item">
          <text class="setting-label">维护周期</text>
          <picker
            :value="filterIndex"
            :range="filterOptions"
            range-key="label"
            @change="onPickerChange('filterInterval', $event)"
          >
            <view class="picker-value">
              <text class="picker-text">{{ filterOptions[filterIndex].label }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 未记录提醒 -->
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">未记录提醒</text>
            <text class="setting-desc">超过指定天数未记录参数时提醒</text>
          </view>
          <switch
            :checked="settingsStore.noRecordReminder"
            color="#1E88E5"
            @change="onSwitchChange('noRecordReminder', $event)"
          />
        </view>
        <view v-if="settingsStore.noRecordReminder" class="setting-item sub-item">
          <text class="setting-label">提醒天数</text>
          <picker
            :value="noRecordIndex"
            :range="noRecordOptions"
            range-key="label"
            @change="onPickerChange('noRecordDays', $event)"
          >
            <view class="picker-value">
              <text class="picker-text">{{ noRecordOptions[noRecordIndex].label }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">数据管理</text>
      </view>
      <view class="section-content">
        <view class="setting-item clickable" @click="handleExport">
          <text class="setting-label">导出数据</text>
          <text class="picker-arrow">›</text>
        </view>
        <view class="setting-item clickable" @click="handleClearData">
          <text class="setting-label danger-text">清空所有数据</text>
          <text class="picker-arrow">›</text>
        </view>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section">
      <view class="section-title">
        <text class="section-title-text">关于</text>
      </view>
      <view class="section-content">
        <view class="setting-item">
          <text class="setting-label">版本号</text>
          <text class="setting-value">1.0.0</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/store/settings'

const settingsStore = useSettingsStore()

const waterChangeOptions = [
  { label: '每3天', value: 3 },
  { label: '每5天', value: 5 },
  { label: '每7天', value: 7 },
  { label: '每10天', value: 10 },
  { label: '每14天', value: 14 },
  { label: '每30天', value: 30 }
]

const feedingOptions = [
  { label: '每天', value: 1 },
  { label: '每2天', value: 2 },
  { label: '每3天', value: 3 }
]

const filterOptions = [
  { label: '每15天', value: 15 },
  { label: '每30天', value: 30 },
  { label: '每45天', value: 45 },
  { label: '每60天', value: 60 }
]

const noRecordOptions = [
  { label: '1天', value: 1 },
  { label: '2天', value: 2 },
  { label: '3天', value: 3 },
  { label: '5天', value: 5 },
  { label: '7天', value: 7 }
]

const waterChangeIndex = computed(() => {
  const idx = waterChangeOptions.findIndex(o => o.value === settingsStore.waterChangeInterval)
  return idx >= 0 ? idx : 2
})

const feedingIndex = computed(() => {
  const idx = feedingOptions.findIndex(o => o.value === settingsStore.feedingInterval)
  return idx >= 0 ? idx : 0
})

const filterIndex = computed(() => {
  const idx = filterOptions.findIndex(o => o.value === settingsStore.filterInterval)
  return idx >= 0 ? idx : 1
})

const noRecordIndex = computed(() => {
  const idx = noRecordOptions.findIndex(o => o.value === settingsStore.noRecordDays)
  return idx >= 0 ? idx : 2
})

function onSwitchChange(key: string, e: any) {
  settingsStore.updateSetting(key as any, e.detail.value)
}

function onPickerChange(key: string, e: any) {
  const index = Number(e.detail.value)
  let options: { value: number }[]
  switch (key) {
    case 'waterChangeInterval': options = waterChangeOptions; break
    case 'feedingInterval': options = feedingOptions; break
    case 'filterInterval': options = filterOptions; break
    case 'noRecordDays': options = noRecordOptions; break
    default: return
  }
  settingsStore.updateSetting(key as any, options[index].value)
}

function handleExport() {
  uni.showToast({ title: '导出功能开发中', icon: 'none' })
}

function handleClearData() {
  uni.showModal({
    title: '警告',
    content: '确定要清空所有数据吗？此操作不可恢复！',
    confirmColor: '#E74C3C',
    success: (res) => {
      if (res.confirm) {
        uni.showModal({
          title: '二次确认',
          content: '真的要删除所有水族箱和记录数据吗？',
          confirmColor: '#E74C3C',
          success: (res2) => {
            if (res2.confirm) {
              try {
                uni.clearStorageSync()
                settingsStore.resetDefaults()
                uni.showToast({ title: '数据已清空', icon: 'success' })
                setTimeout(() => {
                  uni.switchTab({ url: '/pages/index/index' })
                }, 1500)
              } catch (e) {
                uni.showToast({ title: '清空失败', icon: 'none' })
              }
            }
          }
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.settings-page {
  min-height: 100vh;
  background-color: $bg-grey;
  padding-bottom: $spacing-xl;
}

.section {
  margin-top: $spacing-md;
}

.section-title {
  padding: $spacing-md $spacing-lg $spacing-xs;
}

.section-title-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.section-content {
  background-color: $bg-card;
  margin: 0 $spacing-md;
  border-radius: $radius-md;
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &.sub-item {
    padding-left: $spacing-xl;
    background-color: rgba(0, 0, 0, 0.01);
  }

  &.clickable {
    &:active {
      background-color: rgba(0, 0, 0, 0.03);
    }
  }
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;
}

.setting-desc {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}

.setting-value {
  font-size: $font-md;
  color: $text-secondary;
}

.danger-text {
  color: $error-color;
}

.picker-value {
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: $font-md;
  color: $text-secondary;
  margin-right: $spacing-xs;
}

.picker-arrow {
  font-size: $font-lg;
  color: $text-light;
}
</style>
