<template>
  <view class="page">
    <!-- 植物照片 -->
    <view class="section">
      <text class="section-label">植物照片</text>
      <view class="photo-area" @click="choosePhoto">
        <image v-if="photoUrl" class="photo-preview" :src="photoUrl" mode="aspectFill" />
        <view v-else class="photo-placeholder">
          <text class="photo-icon">📷</text>
          <text class="photo-hint">拍照或从相册选择</text>
        </view>
      </view>
    </view>

    <!-- 昵称 -->
    <view class="section">
      <text class="section-label">植物昵称 <text class="required">*</text></text>
      <input
        v-model="nickname"
        class="input-field"
        placeholder="给你的植物取个名字吧"
        placeholder-class="placeholder"
        maxlength="20"
      />
    </view>

    <!-- 位置选择 -->
    <view class="section">
      <text class="section-label">放置位置</text>
      <view class="location-grid">
        <view
          v-for="loc in locationOptions"
          :key="loc"
          class="location-tag"
          :class="{ 'location-tag--active': location === loc }"
          @click="location = loc"
        >
          <text class="location-text">{{ loc }}</text>
        </view>
      </view>
    </view>

    <!-- 购买日期 -->
    <view class="section">
      <text class="section-label">购买日期</text>
      <picker mode="date" :value="purchaseDate" @change="onDateChange">
        <view class="picker-display">
          <text class="picker-text">{{ purchaseDate }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 提醒模式 -->
    <view class="section">
      <text class="section-label">提醒模式</text>
      <view class="mode-switch">
        <view
          class="mode-tab"
          :class="{ 'mode-tab--active': reminderMode === 'fixed' }"
          @click="reminderMode = 'fixed'"
        >
          <text class="mode-text">固定周期</text>
        </view>
        <view
          class="mode-tab"
          :class="{ 'mode-tab--active': reminderMode === 'smart' }"
          @click="reminderMode = 'smart'"
        >
          <text class="mode-text">智能模式</text>
        </view>
      </view>

      <!-- 固定模式设置 -->
      <view v-if="reminderMode === 'fixed'" class="slider-section">
        <view class="slider-group">
          <view class="slider-header">
            <text class="slider-label">浇水间隔</text>
            <text class="slider-value">{{ waterInterval }}天</text>
          </view>
          <slider
            :min="1"
            :max="30"
            :value="waterInterval"
            :block-size="20"
            activeColor="#4CAF50"
            backgroundColor="#E8F5E9"
            @change="onWaterSliderChange"
          />
        </view>
        <view class="slider-group">
          <view class="slider-header">
            <text class="slider-label">施肥间隔</text>
            <text class="slider-value">{{ fertilizeInterval }}天</text>
          </view>
          <slider
            :min="7"
            :max="90"
            :value="fertilizeInterval"
            :block-size="20"
            activeColor="#4CAF50"
            backgroundColor="#E8F5E9"
            @change="onFertilizeSliderChange"
          />
        </view>
      </view>

      <!-- 智能模式说明 -->
      <view v-else class="smart-info">
        <text class="smart-icon">🌿</text>
        <text class="smart-text">
          智能模式将根据季节和天气自动调整浇水施肥周期
        </text>
      </view>
    </view>

    <!-- 提交 -->
    <view class="submit-section">
      <view class="btn-submit" :class="{ 'btn-submit--disabled': !canSubmit }" @click="handleSubmit">
        <text class="btn-submit-text">{{ submitting ? '添加中...' : '添加植物' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ReminderMode } from '@/types/models'
import { addPlant } from '@/services/plant'
import { getPlantDetail } from '@/services/wiki'
import { formatDate } from '@/utils/format'

const photoUrl = ref('')
const nickname = ref('')
const location = ref('客厅')
const purchaseDate = ref(formatDate(Date.now()))
const reminderMode = ref<ReminderMode>('fixed')
const waterInterval = ref(3)
const fertilizeInterval = ref(30)
const submitting = ref(false)

const locationOptions = ['客厅', '阳台', '卧室', '书房', '厨房', '其他']

const canSubmit = computed(() => {
  return nickname.value.trim() && !submitting.value
})

onLoad(async (options) => {
  if (options?.speciesId) {
    const speciesId = decodeURIComponent(options.speciesId)
    try {
      const wiki = await getPlantDetail(speciesId)
      if (wiki) {
        nickname.value = wiki.name
        photoUrl.value = wiki.imageUrl || ''
      }
    } catch (e) {
      console.error('[plant/add] prefill error:', e)
    }
  }
})

function choosePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      photoUrl.value = res.tempFilePaths[0]
    }
  })
}

function onDateChange(e: any) {
  purchaseDate.value = e.detail.value
}

function onWaterSliderChange(e: any) {
  waterInterval.value = e.detail.value
}

function onFertilizeSliderChange(e: any) {
  fertilizeInterval.value = e.detail.value
}

async function handleSubmit() {
  if (!canSubmit.value) return

  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入植物昵称', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await addPlant({
      nickname: nickname.value.trim(),
      photoUrl: photoUrl.value,
      location: location.value,
      purchaseDate: purchaseDate.value,
      reminderMode: reminderMode.value,
      reminderSettings: {
        waterInterval: waterInterval.value,
        fertilizeInterval: fertilizeInterval.value,
        smartAdjust: reminderMode.value === 'smart'
      }
    })
    uni.showToast({ title: '添加成功 🌱', icon: 'none' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1200)
  } catch (e: any) {
    uni.showToast({ title: e.message || '添加失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding: $spacing-md;
  padding-bottom: 160rpx;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-label {
  font-size: $font-md;
  font-weight: $font-weight-medium;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.required {
  color: $error-color;
}

.photo-area {
  width: 100%;
  height: 360rpx;
  border-radius: $radius-md;
  overflow: hidden;
  background: $bg-card;
  box-shadow: $shadow-sm;
}

.photo-preview {
  width: 100%;
  height: 100%;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $border-color;
  border-radius: $radius-md;
}

.photo-icon {
  font-size: 64rpx;
  margin-bottom: $spacing-sm;
}

.photo-hint {
  font-size: $font-sm;
  color: $text-light;
}

.input-field {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-shadow: $shadow-sm;
}

.placeholder {
  color: $text-placeholder;
}

.location-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.location-tag {
  padding: 16rpx 32rpx;
  border-radius: $radius-pill;
  background: $bg-card;
  border: 2rpx solid $border-color;
  box-shadow: $shadow-sm;

  &--active {
    background: $primary-lighter;
    border-color: $primary-color;
  }
}

.location-text {
  font-size: $font-md;
  color: $text-primary;

  .location-tag--active & {
    color: $primary-dark;
    font-weight: $font-weight-medium;
  }
}

.picker-display {
  background: $bg-card;
  border-radius: $radius-md;
  padding: 24rpx $spacing-md;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow-sm;
}

.picker-text {
  font-size: $font-md;
  color: $text-primary;
}

.picker-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.mode-switch {
  display: flex;
  flex-direction: row;
  background: $bg-grey;
  border-radius: $radius-sm;
  padding: 4rpx;
  margin-bottom: $spacing-md;
}

.mode-tab {
  flex: 1;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;

  &--active {
    background: $bg-card;
    box-shadow: $shadow-sm;
  }
}

.mode-text {
  font-size: $font-md;
  color: $text-secondary;

  .mode-tab--active & {
    color: $primary-color;
    font-weight: $font-weight-medium;
  }
}

.slider-section {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.slider-group {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.slider-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.slider-label {
  font-size: $font-md;
  color: $text-primary;
}

.slider-value {
  font-size: $font-md;
  color: $primary-color;
  font-weight: $font-weight-bold;
}

.smart-info {
  display: flex;
  flex-direction: row;
  background: $primary-lighter;
  border-radius: $radius-md;
  padding: $spacing-md;
}

.smart-icon {
  font-size: 40rpx;
  margin-right: $spacing-sm;
  flex-shrink: 0;
}

.smart-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.8;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-md} + #{$safe-bottom});
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;

  &--disabled {
    opacity: 0.5;
  }
}

.btn-submit-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}
</style>
