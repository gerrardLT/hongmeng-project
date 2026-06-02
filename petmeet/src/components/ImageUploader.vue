<template>
  <view class="image-uploader" :class="[`mode-${mode}`]">
    <!-- avatar 模式 -->
    <template v-if="mode === 'avatar'">
      <view class="avatar-wrap" @click="onChoose">
        <image
          v-if="modelValue.length > 0"
          class="avatar-img"
          :src="modelValue[0]"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <text class="placeholder-icon">+</text>
          <text class="placeholder-text">上传头像</text>
        </view>
        <view class="avatar-change">
          <text class="change-text">更换</text>
        </view>
      </view>
    </template>

    <!-- multi 模式 -->
    <template v-else>
      <view class="grid-wrap">
        <view
          v-for="(img, index) in modelValue"
          :key="index"
          class="grid-item"
        >
          <image
            class="grid-img"
            :src="img"
            mode="aspectFill"
            @click="onPreview(index)"
          />
          <view class="delete-btn" @click.stop="onRemove(index)">
            <text class="delete-icon">×</text>
          </view>
        </view>

        <view
          v-if="modelValue.length < maxCount"
          class="grid-item add-item"
          @click="onChoose"
        >
          <text class="add-icon">+</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { chooseImage, compressImage, saveImage } from '@/services/storage'

const props = withDefaults(defineProps<{
  modelValue: string[]
  maxCount?: number
  mode?: 'avatar' | 'multi'
}>(), {
  maxCount: 9,
  mode: 'multi'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

async function onChoose() {
  try {
    const count = props.mode === 'avatar' ? 1 : props.maxCount - props.modelValue.length
    if (count <= 0) return

    const tempPaths = await chooseImage(count)
    const processedPaths: string[] = []

    for (const path of tempPaths) {
      try {
        const compressed = await compressImage(path)
        const saved = await saveImage(compressed)
        processedPaths.push(saved)
      } catch (e) {
        console.error('处理图片失败:', e)
        processedPaths.push(path)
      }
    }

    if (props.mode === 'avatar') {
      emit('update:modelValue', processedPaths)
    } else {
      emit('update:modelValue', [...props.modelValue, ...processedPaths])
    }
  } catch (e) {
    // 用户取消选择，不做处理
    console.log('选择图片取消或失败:', e)
  }
}

function onRemove(index: number) {
  const list = [...props.modelValue]
  list.splice(index, 1)
  emit('update:modelValue', list)
}

function onPreview(index: number) {
  uni.previewImage({
    current: props.modelValue[index],
    urls: props.modelValue
  })
}
</script>

<style scoped lang="scss">
.image-uploader {
  width: 100%;
}

/* avatar 模式 */
.avatar-wrap {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto;
}

.avatar-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.avatar-placeholder {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background-color: #F8F9FA;
  border: 2rpx dashed #B2BEC3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 48rpx;
  color: #B2BEC3;
  line-height: 1;
  margin-bottom: 8rpx;
}

.placeholder-text {
  font-size: 24rpx;
  color: #B2BEC3;
}

.avatar-change {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4rpx solid #fff;
}

.change-text {
  font-size: 20rpx;
  color: #fff;
}

/* multi 模式 */
.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.grid-item {
  position: relative;
  width: calc((100% - 32rpx) / 3);
  aspect-ratio: 1;
}

.grid-img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background-color: #f0f0f0;
}

.delete-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: #FF4444;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #fff;
}

.delete-icon {
  color: #fff;
  font-size: 24rpx;
  line-height: 1;
}

.add-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #B2BEC3;
  border-radius: 12rpx;
  background-color: #F8F9FA;
}

.add-icon {
  font-size: 48rpx;
  color: #B2BEC3;
  line-height: 1;
}
</style>
