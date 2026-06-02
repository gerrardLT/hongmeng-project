<template>
  <view class="page">
    <!-- 选择植物 -->
    <view class="section">
      <text class="section-label">选择植物</text>
      <picker :range="plantNames" :value="selectedPlantIndex" @change="onPlantChange">
        <view class="picker-display">
          <text class="picker-text" :class="{ 'picker-text--placeholder': selectedPlantIndex < 0 }">
            {{ selectedPlantIndex >= 0 ? plantNames[selectedPlantIndex] : '请选择植物' }}
          </text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 照片区域 -->
    <view class="section">
      <text class="section-label">拍照记录</text>
      <view class="photo-grid">
        <view
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-item"
        >
          <image class="photo-image" :src="photo" mode="aspectFill" />
          <view class="photo-delete" @click="removePhoto(index)">
            <text class="photo-delete-icon">×</text>
          </view>
        </view>
        <view v-if="photos.length < 6" class="photo-add" @click="choosePhoto">
          <text class="photo-add-icon">+</text>
          <text class="photo-add-text">{{ photos.length }}/6</text>
        </view>
      </view>
    </view>

    <!-- 文字记录 -->
    <view class="section">
      <text class="section-label">文字记录</text>
      <textarea
        v-model="content"
        class="text-area"
        placeholder="记录今天植物的变化..."
        :maxlength="500"
        placeholder-class="placeholder"
      />
      <text class="char-count">{{ content.length }}/500</text>
    </view>

    <!-- 日期选择 -->
    <view class="section">
      <text class="section-label">记录日期</text>
      <picker mode="date" :value="recordDate" @change="onDateChange">
        <view class="picker-display">
          <text class="picker-text">{{ recordDate }}</text>
          <text class="picker-arrow">›</text>
        </view>
      </picker>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <view class="btn-submit" :class="{ 'btn-submit--disabled': !canSubmit }" @click="handleSubmit">
        <text class="btn-submit-text">{{ submitting ? '提交中...' : '保存记录' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePlantStore } from '@/store/plant'
import { addGrowthRecord } from '@/services/record'
import { formatDate } from '@/utils/format'

const plantStore = usePlantStore()

const selectedPlantIndex = ref(-1)
const photos = ref<string[]>([])
const content = ref('')
const recordDate = ref(formatDate(Date.now()))
const submitting = ref(false)

const plantNames = computed(() => {
  return plantStore.plants.map((p) => p.nickname)
})

const canSubmit = computed(() => {
  return selectedPlantIndex.value >= 0 && (content.value.trim() || photos.value.length > 0) && !submitting.value
})

onLoad((options) => {
  plantStore.init()

  if (options?.plantId) {
    const plantId = decodeURIComponent(options.plantId)
    const index = plantStore.plants.findIndex((p) => p.plantId === plantId)
    if (index >= 0) {
      selectedPlantIndex.value = index
    }
  }
})

function onPlantChange(e: any) {
  selectedPlantIndex.value = e.detail.value
}

function onDateChange(e: any) {
  recordDate.value = e.detail.value
}

function choosePhoto() {
  const remaining = 6 - photos.value.length
  if (remaining <= 0) return

  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      photos.value = [...photos.value, ...res.tempFilePaths].slice(0, 6)
    }
  })
}

function removePhoto(index: number) {
  photos.value.splice(index, 1)
}

async function handleSubmit() {
  if (!canSubmit.value) return

  const plant = plantStore.plants[selectedPlantIndex.value]
  if (!plant) {
    uni.showToast({ title: '请选择植物', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    await addGrowthRecord(plant.plantId, content.value.trim(), photos.value)
    uni.showToast({ title: '记录成功 🌱', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1200)
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
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

  &--placeholder {
    color: $text-placeholder;
  }
}

.picker-arrow {
  font-size: $font-lg;
  color: $text-light;
}

.photo-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
}

.photo-image {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: $radius-round;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-delete-icon {
  font-size: 24rpx;
  color: $text-white;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  border: 2rpx dashed $border-color;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: $bg-card;
}

.photo-add-icon {
  font-size: 56rpx;
  color: $text-light;
  line-height: 1;
}

.photo-add-text {
  font-size: $font-xs;
  color: $text-light;
  margin-top: 4rpx;
}

.text-area {
  width: 100%;
  min-height: 200rpx;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.8;
  box-shadow: $shadow-sm;
  box-sizing: border-box;
}

.placeholder {
  color: $text-placeholder;
}

.char-count {
  font-size: $font-xs;
  color: $text-light;
  text-align: right;
  margin-top: $spacing-xs;
  display: block;
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
