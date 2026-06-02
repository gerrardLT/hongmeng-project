<template>
  <view class="page">
    <!-- 装备名称 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">装备名称 <text class="required">*</text></text>
        <input
          class="form-input"
          type="text"
          placeholder="请输入装备名称"
          v-model="form.name"
        />
      </view>
    </view>

    <!-- 分类选择 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">分类 <text class="required">*</text></text>
        <picker :value="categoryIndex" :range="categoryLabels" @change="onCategoryChange">
          <view class="form-picker">
            <text :class="['picker-text', { placeholder: categoryIndex < 0 }]">
              {{ categoryIndex >= 0 ? categoryLabels[categoryIndex] : '请选择分类' }}
            </text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 重量和数量 -->
    <view class="form-section form-row">
      <view class="form-item flex-1">
        <text class="form-label">重量 (g)</text>
        <input
          class="form-input"
          type="digit"
          placeholder="0"
          :value="String(form.weight || '')"
          @input="onWeightInput"
        />
      </view>
      <view class="form-item flex-1">
        <text class="form-label">数量</text>
        <input
          class="form-input"
          type="number"
          placeholder="1"
          :value="String(form.quantity || '')"
          @input="onQuantityInput"
        />
      </view>
    </view>

    <!-- 照片 -->
    <view class="form-section">
      <text class="form-label">照片（最多3张）</text>
      <view class="photo-grid">
        <view
          v-for="(photo, idx) in form.photos"
          :key="idx"
          class="photo-item"
        >
          <image class="photo-img" :src="photo" mode="aspectFill" />
          <view class="photo-delete" @click="removePhoto(idx)">
            <text class="photo-delete-icon">✕</text>
          </view>
        </view>
        <view
          v-if="form.photos.length < 3"
          class="photo-add"
          @click="choosePhoto"
        >
          <text class="photo-add-icon">📷</text>
          <text class="photo-add-text">添加</text>
        </view>
      </view>
    </view>

    <!-- 购买链接 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">购买链接</text>
        <input
          class="form-input"
          type="text"
          placeholder="可选，填写购买链接"
          v-model="form.purchaseLink"
        />
      </view>
    </view>

    <!-- 存放位置 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">存放位置</text>
        <input
          class="form-input"
          type="text"
          placeholder="可选，如"客厅柜子""车库""
          v-model="form.storageLocation"
        />
      </view>
    </view>

    <!-- 备注 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          placeholder="可选，添加备注信息"
          v-model="form.note"
          :maxlength="500"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-wrap">
      <view class="btn-save" @click="handleSave">
        <text class="btn-save-text">{{ isEdit ? '保存修改' : '添加装备' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useGearStore } from '@/store/gear'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP } from '@/types/models'
import { addGear, updateGear } from '@/services/gear'
import { uploadImage, compressImage } from '@/services/storage'

const gearStore = useGearStore()

const isEdit = ref(false)
const editId = ref('')
const loading = ref(false)

const categoryKeys = Object.keys(GEAR_CATEGORY_MAP) as GearCategory[]
const categoryLabels = categoryKeys.map((k) => GEAR_CATEGORY_MAP[k])

const form = reactive({
  name: '',
  category: '' as GearCategory | '',
  weight: 0,
  quantity: 1,
  photos: [] as string[],
  purchaseLink: '',
  storageLocation: '',
  note: ''
})

const categoryIndex = computed(() => {
  if (!form.category) return -1
  return categoryKeys.indexOf(form.category as GearCategory)
})

function onCategoryChange(e: any) {
  const idx = Number(e.detail.value)
  form.category = categoryKeys[idx]
}

function onWeightInput(e: any) {
  form.weight = Number(e.detail.value) || 0
}

function onQuantityInput(e: any) {
  form.quantity = Math.max(1, Math.floor(Number(e.detail.value) || 1))
}

function removePhoto(idx: number) {
  form.photos.splice(idx, 1)
}

function choosePhoto() {
  const remaining = 3 - form.photos.length
  if (remaining <= 0) return

  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      for (const tempPath of res.tempFilePaths) {
        try {
          const compressed = await compressImage(tempPath)
          const savedPath = await uploadImage(compressed)
          form.photos.push(savedPath)
        } catch (err) {
          console.error('保存照片失败:', err)
          form.photos.push(tempPath)
        }
      }
    }
  })
}

async function handleSave() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入装备名称', icon: 'none' })
    return
  }
  if (!form.category) {
    uni.showToast({ title: '请选择分类', icon: 'none' })
    return
  }
  if (loading.value) return
  loading.value = true

  try {
    if (isEdit.value) {
      updateGear(editId.value, {
        name: form.name.trim(),
        category: form.category as GearCategory,
        weight: form.weight,
        quantity: form.quantity,
        photos: [...form.photos],
        purchaseLink: form.purchaseLink.trim(),
        storageLocation: form.storageLocation.trim(),
        note: form.note.trim()
      })
    } else {
      addGear({
        name: form.name.trim(),
        category: form.category as GearCategory,
        weight: form.weight,
        quantity: form.quantity,
        photos: [...form.photos],
        purchaseLink: form.purchaseLink.trim(),
        storageLocation: form.storageLocation.trim(),
        note: form.note.trim()
      })
    }
    uni.showToast({ title: isEdit.value ? '修改成功' : '添加成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (err) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((options) => {
  if (options?.id) {
    isEdit.value = true
    editId.value = options.id
    const gear = gearStore.getGearById(options.id)
    if (gear) {
      form.name = gear.name
      form.category = gear.category
      form.weight = gear.weight
      form.quantity = gear.quantity
      form.photos = [...gear.photos]
      form.purchaseLink = gear.purchaseLink
      form.storageLocation = gear.storageLocation
      form.note = gear.note
      uni.setNavigationBarTitle({ title: '编辑装备' })
    }
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
  padding-bottom: 180rpx;
}

.form-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.flex-1 {
  flex: 1;
}

.form-item {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.required {
  color: #E91E63;
}

.form-input {
  font-size: 30rpx;
  color: #333333;
  padding: 16rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.form-textarea {
  font-size: 30rpx;
  color: #333333;
  padding: 16rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  height: 200rpx;
  width: 100%;
  box-sizing: border-box;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.picker-text {
  font-size: 30rpx;
  color: #333333;

  &.placeholder {
    color: #999999;
  }
}

.picker-arrow {
  font-size: 22rpx;
  color: #999999;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 8rpx;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-delete-icon {
  font-size: 22rpx;
  color: #ffffff;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border-radius: 16rpx;
  border: 2rpx dashed #cccccc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.photo-add-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.photo-add-text {
  font-size: 24rpx;
  color: #999999;
}

.btn-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: #ffffff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.btn-save {
  height: 88rpx;
  border-radius: 44rpx;
  background-color: #2E7D32;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 500;
}
</style>
