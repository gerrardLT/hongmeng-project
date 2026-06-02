<template>
  <view class="page">
    <NavBar :title="isEdit ? '编辑钓点' : '记录钓点'" />

    <scroll-view class="content" scroll-y>
      <!-- GPS 定位 & 地图选点 -->
      <view class="card">
        <text class="card-title">位置信息</text>
        <view class="location-row">
          <view class="coord-info">
            <text class="coord-label">经度</text>
            <text class="coord-value">{{ form.longitude?.toFixed(6) || '获取中...' }}</text>
          </view>
          <view class="coord-info">
            <text class="coord-label">纬度</text>
            <text class="coord-value">{{ form.latitude?.toFixed(6) || '获取中...' }}</text>
          </view>
          <view class="relocate-btn" @click="relocate">
            <text class="relocate-text">重新定位</text>
          </view>
        </view>
        <view class="map-wrap">
          <map
            class="picker-map"
            :latitude="form.latitude || 30.0"
            :longitude="form.longitude || 120.0"
            :markers="mapMarkers"
            :scale="15"
            show-location
            @regionchange="onMapRegionChange"
          />
          <view class="map-center-pin">
            <text class="pin-icon">📍</text>
          </view>
        </view>
        <text class="map-tip">拖动地图可微调钓点位置</text>
      </view>

      <!-- 基本信息 -->
      <view class="card">
        <text class="card-title">基本信息</text>

        <view class="form-item">
          <text class="form-label">钓点名称 <text class="required">*</text></text>
          <input
            class="form-input"
            type="text"
            placeholder="请输入钓点名称"
            :value="form.name"
            @input="form.name = $event.detail.value"
            maxlength="30"
          />
        </view>

        <view class="form-item">
          <text class="form-label">钓点类型 <text class="required">*</text></text>
          <picker :range="typeOptions" :range-key="'label'" :value="typeIndex" @change="onTypePick">
            <view class="picker-value">
              <text :class="['picker-text', { placeholder: typeIndex < 0 }]">
                {{ typeIndex >= 0 ? typeOptions[typeIndex].label : '请选择钓点类型' }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">备注</text>
          <textarea
            class="form-textarea"
            placeholder="添加备注信息（选填）"
            :value="form.note"
            @input="form.note = $event.detail.value"
            maxlength="500"
            :auto-height="true"
          />
        </view>
      </view>

      <!-- 照片上传 -->
      <view class="card">
        <text class="card-title">照片（最多5张）</text>
        <view class="photo-grid">
          <view v-for="(photo, idx) in form.photos" :key="idx" class="photo-item">
            <image class="photo-thumb" :src="photo" mode="aspectFill" @click="previewPhoto(idx)" />
            <view class="photo-delete" @click="removePhoto(idx)">
              <text class="delete-icon">✕</text>
            </view>
          </view>
          <view v-if="form.photos.length < 5" class="photo-add" @click="choosePhoto">
            <text class="add-icon">+</text>
            <text class="add-text">添加照片</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="bottom-bar">
      <view class="submit-btn" :class="{ disabled: submitting }" @click="onSubmit">
        <text class="submit-text">{{ submitting ? '保存中...' : '保存钓点' }}</text>
      </view>
    </view>

    <Loading :show="loading" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import Loading from '@/components/common/Loading.vue'
import { useSpotsStore } from '@/store/spots'
import { createSpot, updateSpot, getSpotDetail } from '@/services/spots'
import { uploadImages } from '@/services/storage'
import { getCurrentLocation } from '@/utils/location'
import type { SpotType } from '@/types/models'

const spotsStore = useSpotsStore()

const isEdit = ref(false)
const editSpotId = ref('')
const loading = ref(false)
const submitting = ref(false)

const typeOptions = [
  { label: '河流', value: 'river' as SpotType },
  { label: '湖泊', value: 'lake' as SpotType },
  { label: '水库', value: 'reservoir' as SpotType },
  { label: '池塘', value: 'pond' as SpotType },
  { label: '海域', value: 'sea' as SpotType }
]

const typeIndex = ref(-1)

const form = reactive({
  name: '',
  type: '' as SpotType | '',
  latitude: 0,
  longitude: 0,
  note: '',
  photos: [] as string[]
})

const mapMarkers = computed(() => {
  if (!form.latitude || !form.longitude) return []
  return [{
    id: 0,
    latitude: form.latitude,
    longitude: form.longitude,
    width: 1,
    height: 1
  }]
})

function onTypePick(e: any) {
  const idx = Number(e.detail.value)
  typeIndex.value = idx
  form.type = typeOptions[idx].value
}

function onMapRegionChange(e: any) {
  if (e.type === 'end' && e.detail) {
    const { centerLocation } = e.detail
    if (centerLocation) {
      form.latitude = centerLocation.latitude
      form.longitude = centerLocation.longitude
    }
  }
}

async function relocate() {
  try {
    const loc = await getCurrentLocation()
    form.latitude = loc.latitude
    form.longitude = loc.longitude
    uni.showToast({ title: '定位成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '定位失败', icon: 'none' })
  }
}

function choosePhoto() {
  const remaining = 5 - form.photos.length
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.photos.push(...res.tempFilePaths)
    }
  })
}

function removePhoto(index: number) {
  form.photos.splice(index, 1)
}

function previewPhoto(index: number) {
  uni.previewImage({
    urls: form.photos,
    current: index
  })
}

function validate(): boolean {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入钓点名称', icon: 'none' })
    return false
  }
  if (!form.type) {
    uni.showToast({ title: '请选择钓点类型', icon: 'none' })
    return false
  }
  if (!form.latitude || !form.longitude) {
    uni.showToast({ title: '请等待定位完成', icon: 'none' })
    return false
  }
  return true
}

async function onSubmit() {
  if (submitting.value) return
  if (!validate()) return

  submitting.value = true
  try {
    // 上传新照片（临时路径）
    const newPhotos: string[] = []
    const existingPhotos: string[] = []
    for (const p of form.photos) {
      if (p.startsWith('http') || p.startsWith('internal://') || p.includes('/anglermate/')) {
        existingPhotos.push(p)
      } else {
        newPhotos.push(p)
      }
    }
    let uploadedPhotos: string[] = []
    if (newPhotos.length > 0) {
      uploadedPhotos = await uploadImages(newPhotos)
    }
    const allPhotos = [...existingPhotos, ...uploadedPhotos]

    const spotData = {
      name: form.name.trim(),
      type: form.type as SpotType,
      latitude: form.latitude,
      longitude: form.longitude,
      note: form.note || undefined,
      photos: allPhotos
    }

    if (isEdit.value && editSpotId.value) {
      const updated = await updateSpot(editSpotId.value, spotData)
      spotsStore.updateSpot(editSpotId.value, updated)
      uni.showToast({ title: '更新成功', icon: 'success' })
    } else {
      const created = await createSpot(spotData)
      spotsStore.addSpot(created)
      uni.showToast({ title: '保存成功', icon: 'success' })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e) {
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function loadEditData() {
  if (!editSpotId.value) return
  loading.value = true
  try {
    const data = await getSpotDetail(editSpotId.value)
    form.name = data.name
    form.type = data.type
    form.latitude = data.latitude
    form.longitude = data.longitude
    form.note = data.note || ''
    form.photos = [...data.photos]
    // 设置类型选择器
    const idx = typeOptions.findIndex((t) => t.value === data.type)
    if (idx >= 0) typeIndex.value = idx
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const spotId = currentPage?.$page?.options?.spotId || currentPage?.options?.spotId || ''

  if (spotId) {
    isEdit.value = true
    editSpotId.value = spotId
    await loadEditData()
  } else {
    // 新建模式，自动定位
    try {
      const loc = await getCurrentLocation()
      form.latitude = loc.latitude
      form.longitude = loc.longitude
    } catch (e) {
      uni.showToast({ title: '定位失败，请手动选择位置', icon: 'none' })
    }
  }
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.content {
  flex: 1;
}

.card {
  margin: 24rpx 32rpx 0;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
  display: block;
}

.location-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
}

.coord-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.coord-label {
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 4rpx;
}

.coord-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

.relocate-btn {
  padding: 12rpx 24rpx;
  background: rgba(255, 107, 53, 0.1);
  border-radius: 24rpx;
}

.relocate-text {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.map-wrap {
  position: relative;
  height: 360rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.picker-map {
  width: 100%;
  height: 360rpx;
}

.map-center-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.pin-icon {
  font-size: 48rpx;
}

.map-tip {
  font-size: 22rpx;
  color: #999999;
  margin-top: 12rpx;
  text-align: center;
  display: block;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.required {
  color: #FF6B35;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
}

.picker-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 0 24rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333333;
}

.picker-text.placeholder {
  color: #CCCCCC;
}

.picker-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #F8F8F8;
  border-radius: 12rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.photo-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.photo-thumb {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 22rpx;
  color: #FFFFFF;
}

.photo-add {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  border: 2rpx dashed #DDDDDD;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #FAFAFA;
}

.add-icon {
  font-size: 56rpx;
  color: #CCCCCC;
  line-height: 1;
}

.add-text {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

.bottom-placeholder {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  background: #FF6B35;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn.disabled {
  opacity: 0.6;
}

.submit-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
