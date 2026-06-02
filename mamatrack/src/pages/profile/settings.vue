<template>
  <view class="page">
    <!-- 称重提醒 -->
    <view class="section">
      <text class="section-title">称重提醒</text>
      <view class="setting-card">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">⚖️</text>
            <text class="setting-label">称重提醒</text>
          </view>
          <switch :checked="settings.weightReminder" color="#E91E8C" @change="onWeightReminderChange" />
        </view>
        <view v-if="settings.weightReminder" class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🕐</text>
            <text class="setting-label">提醒时间</text>
          </view>
          <picker mode="time" :value="settings.weightReminderTime" @change="onTimeChange">
            <text class="setting-value">{{ settings.weightReminderTime }} ›</text>
          </picker>
        </view>
        <view v-if="settings.weightReminder" class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">📅</text>
            <text class="setting-label">提醒日</text>
          </view>
          <view class="days-row" @click="showDayPicker = true">
            <text class="setting-value">{{ dayLabel }} ›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提醒日选择弹窗 -->
    <view v-if="showDayPicker" class="day-picker-mask" @click="showDayPicker = false">
      <view class="day-picker" @click.stop>
        <text class="day-picker-title">选择提醒日</text>
        <view class="day-picker-grid">
          <view
            v-for="(day, index) in weekDays"
            :key="index"
            class="day-item"
            :class="{ 'day-item--active': selectedDays.includes(index + 1) }"
            @click="toggleDay(index + 1)"
          >
            <text class="day-item-text">{{ day }}</text>
          </view>
        </view>
        <view class="day-picker-btn" @click="onDayConfirm">
          <text class="day-picker-btn-text">确定</text>
        </view>
      </view>
    </view>

    <!-- 产检提醒 -->
    <view class="section">
      <text class="section-title">产检提醒</text>
      <view class="setting-card">
        <view class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">🏥</text>
            <text class="setting-label">产检提醒</text>
          </view>
          <switch :checked="settings.checkupReminder" color="#E91E8C" @change="onCheckupReminderChange" />
        </view>
        <view v-if="settings.checkupReminder" class="setting-item">
          <view class="setting-left">
            <text class="setting-icon">📆</text>
            <text class="setting-label">下次产检日期</text>
          </view>
          <picker mode="date" :value="settings.nextCheckupDate" @change="onCheckupDateChange">
            <text class="setting-value">{{ settings.nextCheckupDate || '请选择' }} ›</text>
          </picker>
        </view>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="section">
      <text class="section-title">数据管理</text>
      <view class="setting-card">
        <view class="setting-item" @click="handleClearCache">
          <view class="setting-left">
            <text class="setting-icon">🗑️</text>
            <text class="setting-label">清除缓存</text>
          </view>
          <text class="setting-value">{{ cacheSize }} ›</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="onSave">
      <text class="save-btn-text">保存</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useReminderStore } from '@/store/reminder'
import type { ReminderSettings } from '@/types/models'

const reminderStore = useReminderStore()
const showDayPicker = ref(false)
const selectedDays = ref<number[]>([])
const cacheSize = ref('0 KB')

const settings = ref<ReminderSettings>({
  weightReminder: true,
  weightReminderTime: '08:00',
  weightReminderDays: [1, 3, 5],
  checkupReminder: true,
  nextCheckupDate: ''
})

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

const dayLabel = computed(() => {
  if (settings.value.weightReminderDays.length === 7) return '每天'
  if (settings.value.weightReminderDays.length === 0) return '未选择'
  return settings.value.weightReminderDays
    .map((d) => weekDays[d - 1])
    .join('、')
})

onLoad(() => {
  reminderStore.init()
  settings.value = { ...reminderStore.settings }
  selectedDays.value = [...settings.value.weightReminderDays]
  calculateCacheSize()
})

function onWeightReminderChange(e: any) {
  settings.value.weightReminder = e.detail.value
}

function onTimeChange(e: any) {
  settings.value.weightReminderTime = e.detail.value
}

function onCheckupReminderChange(e: any) {
  settings.value.checkupReminder = e.detail.value
}

function onCheckupDateChange(e: any) {
  settings.value.nextCheckupDate = e.detail.value
}

function toggleDay(day: number) {
  const index = selectedDays.value.indexOf(day)
  if (index === -1) {
    selectedDays.value.push(day)
    selectedDays.value.sort()
  } else {
    selectedDays.value.splice(index, 1)
  }
}

function onDayConfirm() {
  settings.value.weightReminderDays = [...selectedDays.value]
  showDayPicker.value = false
}

function calculateCacheSize() {
  try {
    const info = uni.getStorageInfoSync()
    const sizeKB = info.currentSize
    if (sizeKB > 1024) {
      cacheSize.value = `${(sizeKB / 1024).toFixed(1)} MB`
    } else {
      cacheSize.value = `${sizeKB} KB`
    }
  } catch (e) {
    cacheSize.value = '0 KB'
  }
}

function handleClearCache() {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除缓存数据吗？这不会影响您的孕期记录和体重数据。',
    success(res) {
      if (res.confirm) {
        try {
          // 仅清除非核心数据
          uni.removeStorageSync('mamatrack_wiki_data')
          calculateCacheSize()
          uni.showToast({ title: '缓存已清除', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '清除失败', icon: 'none' })
        }
      }
    }
  })
}

function onSave() {
  reminderStore.updateSettings(settings.value)
  uni.showToast({ title: '设置已保存', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $spacing-md;
  padding-bottom: 180rpx;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  margin-left: $spacing-xs;
}

.setting-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.setting-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx $spacing-md;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.setting-left {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.setting-icon {
  font-size: 36rpx;
  margin-right: $spacing-sm;
}

.setting-label {
  font-size: $font-md;
  color: $text-primary;
}

.setting-value {
  font-size: $font-md;
  color: $text-secondary;
}

.days-row {
  padding: 8rpx 0;
}

/* 提醒日选择弹窗 */
.day-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.day-picker {
  width: 100%;
  background: $bg-card;
  border-radius: $border-radius-lg $border-radius-lg 0 0;
  padding: $spacing-lg $spacing-md;
  padding-bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
}

.day-picker-title {
  font-size: $font-lg;
  font-weight: bold;
  color: $text-primary;
  text-align: center;
  margin-bottom: $spacing-md;
}

.day-picker-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.day-item {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
  background: $bg-secondary;
}

.day-item--active {
  background: $primary-color;
}

.day-item-text {
  font-size: $font-sm;
  color: $text-primary;
}

.day-item--active .day-item-text {
  color: #FFFFFF;
  font-weight: bold;
}

.day-picker-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-picker-btn-text {
  font-size: $font-md;
  color: #FFFFFF;
  font-weight: bold;
}

/* 保存按钮 */
.save-btn {
  position: fixed;
  left: $spacing-md;
  right: $spacing-md;
  bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
}

.save-btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: bold;
}
</style>
