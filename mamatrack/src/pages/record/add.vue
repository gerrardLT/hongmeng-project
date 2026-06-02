<template>
  <view class="page">
    <!-- 当前孕周 -->
    <view class="add-header">
      <text class="add-header__label">当前孕周</text>
      <text class="add-header__week">{{ currentWeekText }}</text>
    </view>

    <!-- 照片选择区 -->
    <view class="add-photos">
      <view class="add-photo__item" @click="chooseFrontPhoto">
        <image
          v-if="frontPhotoUrl"
          class="add-photo__image"
          :src="frontPhotoUrl"
          mode="aspectFill"
        />
        <view v-else class="add-photo__placeholder">
          <text class="add-photo__plus">+</text>
          <text class="add-photo__label">正面照</text>
        </view>
      </view>

      <view class="add-photo__item" @click="chooseSidePhoto">
        <image
          v-if="sidePhotoUrl"
          class="add-photo__image"
          :src="sidePhotoUrl"
          mode="aspectFill"
        />
        <view v-else class="add-photo__placeholder">
          <text class="add-photo__plus">+</text>
          <text class="add-photo__label">侧面照</text>
        </view>
      </view>
    </view>

    <!-- 备注输入 -->
    <view class="add-note">
      <textarea
        v-model="note"
        class="add-note__textarea"
        placeholder="记录这一刻的心情..."
        :maxlength="200"
        :show-confirm-bar="false"
      />
      <text class="add-note__count">{{ note.length }}/200</text>
    </view>

    <!-- 保存按钮 -->
    <view class="add-actions">
      <button
        class="add-btn"
        :class="{ 'add-btn--disabled': !canSave }"
        :disabled="!canSave"
        @click="onSave"
      >
        <text class="add-btn__text">保存记录</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePregnancyStore } from '@/store/pregnancy'
import { choosePhoto, addPhotoLog } from '@/services/photo'
import { formatWeek } from '@/utils/format'

const pregnancyStore = usePregnancyStore()

// 当前孕周文本
const currentWeekText = computed(() => {
  const { week, day } = pregnancyStore.currentWeek
  if (week <= 0) return '未建立孕期档案'
  return formatWeek(week, day)
})

// 照片路径
const frontPhotoUrl = ref('')
const sidePhotoUrl = ref('')
const note = ref('')

// 是否可保存（至少选一张照片）
const canSave = computed(() => {
  return !!frontPhotoUrl.value || !!sidePhotoUrl.value
})

// 选择正面照
async function chooseFrontPhoto() {
  try {
    const url = await choosePhoto()
    frontPhotoUrl.value = url
  } catch (e) {
    // 用户取消选择，不处理
  }
}

// 选择侧面照
async function chooseSidePhoto() {
  try {
    const url = await choosePhoto()
    sidePhotoUrl.value = url
  } catch (e) {
    // 用户取消选择，不处理
  }
}

// 保存记录
async function onSave() {
  if (!canSave.value) {
    uni.showToast({ title: '请至少选择一张照片', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '保存中...' })

    await addPhotoLog({
      frontPhotoUrl: frontPhotoUrl.value,
      sidePhotoUrl: sidePhotoUrl.value,
      note: note.value
    })

    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })

    setTimeout(() => {
      uni.navigateBack()
    }, 800)
  } catch (e) {
    uni.hideLoading()
    uni.showToast({
      title: e instanceof Error ? e.message : '保存失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: 32rpx;
  box-sizing: border-box;
}

.add-header {
  background: #ffffff;
  border-radius: $border-radius;
  padding: 32rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  box-shadow: $shadow-sm;

  &__label {
    font-size: 28rpx;
    color: $text-secondary;
  }

  &__week {
    font-size: 36rpx;
    font-weight: 700;
    color: $primary-color;
  }
}

.add-photos {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.add-photo__item {
  width: 330rpx;
  height: 440rpx;
  background: #ffffff;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: $shadow-sm;
  position: relative;
}

.add-photo__image {
  width: 330rpx;
  height: 440rpx;
}

.add-photo__placeholder {
  width: 330rpx;
  height: 440rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $primary-light;
  border-radius: $border-radius;
  box-sizing: border-box;

  &:active {
    background: $bg-secondary;
  }
}

.add-photo__plus {
  font-size: 60rpx;
  color: $primary-light;
  line-height: 1;
  margin-bottom: 12rpx;
}

.add-photo__label {
  font-size: 28rpx;
  color: $text-hint;
}

.add-note {
  background: #ffffff;
  border-radius: $border-radius;
  padding: 24rpx;
  margin-bottom: 40rpx;
  box-shadow: $shadow-sm;
  position: relative;

  &__textarea {
    width: 100%;
    height: 180rpx;
    font-size: 28rpx;
    color: $text-primary;
    line-height: 1.6;
  }

  &__count {
    position: absolute;
    right: 24rpx;
    bottom: 16rpx;
    font-size: 22rpx;
    color: $text-hint;
  }
}

.add-actions {
  padding: 0 20rpx;
}

.add-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background: linear-gradient(135deg, $primary-color 0%, $primary-light 100%);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: $border-radius-round;
  border: none;
  text-align: center;

  &:active {
    opacity: 0.9;
  }

  &--disabled {
    background: $text-disabled;
    opacity: 0.6;
  }

  &__text {
    color: #ffffff;
  }
}
</style>
