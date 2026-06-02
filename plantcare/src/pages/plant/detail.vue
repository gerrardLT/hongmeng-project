<template>
  <view class="page">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!plant" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到该植物</text>
    </view>

    <view v-else>
      <!-- 顶部大图 -->
      <view class="hero-section">
        <image class="hero-image" :src="plant.photoUrl || '/static/images/default-plant.png'" mode="aspectFill" />
      </view>

      <!-- 植物信息卡 -->
      <view class="info-card">
        <view class="info-header">
          <view class="info-main">
            <text v-if="!editing" class="info-name">{{ plant.nickname }}</text>
            <input v-else v-model="editNickname" class="edit-input" placeholder="植物昵称" />
          </view>
          <view class="info-status" :class="`info-status--${plant.status}`">
            <text class="info-status-text">{{ statusLabel }}</text>
          </view>
        </view>
        <view class="info-meta">
          <text class="meta-item">📍 {{ editing ? '' : plant.location }}</text>
          <picker v-if="editing" :range="locationOptions" :value="locationOptions.indexOf(editLocation)" @change="onLocationChange">
            <text class="meta-edit-link">{{ editLocation }} ›</text>
          </picker>
          <text class="meta-item">📅 {{ plant.purchaseDate }}</text>
        </view>
      </view>

      <!-- 浇水倒计时 -->
      <view class="water-card">
        <view class="water-info">
          <text class="water-label">{{ waterCountdown.isToday ? '今日需浇水' : '距下次浇水' }}</text>
          <text class="water-days" :class="{ 'water-days--urgent': waterCountdown.isToday }">
            {{ waterCountdown.isToday ? '💧' : `还有 ${waterCountdown.days} 天` }}
          </text>
        </view>
        <view class="btn-water" @click="handleWater">
          <text class="btn-water-text">立即浇水</text>
        </view>
      </view>

      <!-- 养护记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">🌿 养护记录</text>
        </view>
        <view v-if="careList.length > 0" class="care-list">
          <view
            v-for="record in careList"
            :key="record.recordId"
            class="care-item"
          >
            <text class="care-icon">{{ careTypeIcon(record.type) }}</text>
            <view class="care-content">
              <text class="care-date">{{ record.date }}</text>
              <text v-if="record.note" class="care-note">{{ record.note }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-hint">
          <text class="empty-hint-text">暂无养护记录</text>
        </view>
      </view>

      <!-- 生长相册 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">📸 生长相册</text>
        </view>
        <scroll-view v-if="growthPhotos.length > 0" scroll-x class="album-scroll">
          <view class="album-list">
            <image
              v-for="(photo, index) in growthPhotos"
              :key="index"
              class="album-photo"
              :src="photo"
              mode="aspectFill"
              @click="previewPhoto(index)"
            />
          </view>
        </scroll-view>
        <view v-else class="empty-hint">
          <text class="empty-hint-text">暂无生长照片</text>
        </view>
      </view>

      <!-- 操作区 -->
      <view class="action-section">
        <view class="btn-growth" @click="goGrowthRecord">
          <text class="btn-growth-text">📝 记录成长</text>
        </view>
        <view class="action-row">
          <view class="btn-edit" @click="toggleEdit">
            <text class="btn-edit-text">{{ editing ? '保存' : '✏️ 编辑' }}</text>
          </view>
          <view class="btn-delete" @click="handleDelete">
            <text class="btn-delete-text">🗑️ 删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提醒设置弹窗 -->
    <ReminderModal
      :visible="showReminder"
      :plant="plant || undefined"
      @confirm="onReminderConfirm"
      @cancel="showReminder = false"
      @update:visible="showReminder = $event"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import type { Plant, CareRecord, ReminderSettings, CareType } from '@/types/models'
import { usePlantStore } from '@/store/plant'
import { useRecordStore } from '@/store/record'
import { getPlantById, deletePlant, updatePlant } from '@/services/plant'
import { addCareRecord, getCareRecordsByPlant, getGrowthRecordsByPlant } from '@/services/record'
import ReminderModal from '@/components/ReminderModal.vue'

const plantStore = usePlantStore()
const recordStore = useRecordStore()

const plant = ref<Plant | null>(null)
const loading = ref(true)
const editing = ref(false)
const editNickname = ref('')
const editLocation = ref('')
const showReminder = ref(false)

let plantId = ''

const locationOptions = ['客厅', '阳台', '卧室', '书房', '厨房', '其他']

const statusLabel = computed(() => {
  if (!plant.value) return ''
  const map: Record<string, string> = {
    healthy: '健康',
    needsWater: '需浇水',
    needsFertilizer: '需施肥',
    sick: '生病',
    dormant: '休眠',
    dead: '枯萎'
  }
  return map[plant.value.status] || ''
})

const waterCountdown = computed(() => {
  if (!plant.value) return { days: 0, isToday: false }
  const next = new Date(plant.value.nextWaterDate).getTime()
  const now = Date.now()
  const diff = Math.ceil((next - now) / (1000 * 60 * 60 * 24))
  return {
    days: Math.max(0, diff),
    isToday: diff <= 0
  }
})

const careList = computed(() => {
  if (!plantId) return []
  return getCareRecordsByPlant(plantId).slice(0, 5)
})

const growthPhotos = computed(() => {
  if (!plantId) return []
  const records = getGrowthRecordsByPlant(plantId)
  const photos: string[] = []
  for (const r of records) {
    for (const p of r.photos) {
      photos.push(p)
      if (photos.length >= 20) break
    }
    if (photos.length >= 20) break
  }
  return photos
})

function careTypeIcon(type: CareType): string {
  const map: Record<string, string> = {
    water: '💧',
    fertilize: '🧪',
    repot: '🪴',
    prune: '✂️'
  }
  return map[type] || '🌱'
}

onLoad((options) => {
  if (options?.plantId) {
    plantId = decodeURIComponent(options.plantId)
  }
})

onShow(() => {
  loadPlant()
})

function loadPlant() {
  if (!plantId) {
    loading.value = false
    return
  }

  plantStore.init()
  recordStore.init()
  plant.value = getPlantById(plantId) || null
  loading.value = false
}

async function handleWater() {
  if (!plantId) return
  try {
    await addCareRecord(plantId, 'water')
    uni.showToast({ title: '浇水完成 💧', icon: 'none' })
    loadPlant()
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

function goGrowthRecord() {
  uni.navigateTo({
    url: `/pages/records/growth?plantId=${encodeURIComponent(plantId)}`
  })
}

function toggleEdit() {
  if (editing.value) {
    // 保存编辑
    saveEdit()
  } else {
    // 进入编辑模式
    editNickname.value = plant.value?.nickname || ''
    editLocation.value = plant.value?.location || '客厅'
    editing.value = true
  }
}

async function saveEdit() {
  if (!plantId || !editNickname.value.trim()) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }

  try {
    await updatePlant(plantId, {
      nickname: editNickname.value.trim(),
      location: editLocation.value
    })
    editing.value = false
    loadPlant()
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  }
}

function onLocationChange(e: any) {
  editLocation.value = locationOptions[e.detail.value]
}

function onReminderConfirm(settings: ReminderSettings) {
  if (!plantId) return
  updatePlant(plantId, {
    reminderSettings: settings,
    reminderMode: settings.smartAdjust ? 'smart' : 'fixed'
  })
  showReminder.value = false
  loadPlant()
}

function handleDelete() {
  uni.showModal({
    title: '删除植物',
    content: `确定要删除「${plant.value?.nickname}」吗？相关记录也将被删除，且无法恢复。`,
    confirmColor: '#E74C3C',
    success(res) {
      if (res.confirm) {
        deletePlant(plantId)
        uni.showToast({ title: '已删除', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
      }
    }
  })
}

function previewPhoto(index: number) {
  uni.previewImage({
    current: index,
    urls: growthPhotos.value
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 40rpx;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 300rpx;
}

.loading-text {
  font-size: $font-md;
  color: $text-secondary;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 300rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: $font-md;
  color: $text-secondary;
}

.hero-section {
  width: 100%;
  height: 480rpx;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: 100%;
}

.info-card {
  margin: -40rpx $spacing-md 0;
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  box-shadow: $shadow-md;
  position: relative;
  z-index: 1;
}

.info-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.info-main {
  flex: 1;
}

.info-name {
  font-size: $font-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.edit-input {
  font-size: $font-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  border-bottom: 2rpx solid $primary-color;
  padding-bottom: 4rpx;
}

.info-status {
  padding: 4rpx 20rpx;
  border-radius: $radius-pill;
  background: $primary-lighter;

  &--needsWater {
    background: rgba(52, 152, 219, 0.15);
  }

  &--needsFertilizer {
    background: rgba(243, 156, 18, 0.15);
  }

  &--sick {
    background: rgba(231, 76, 60, 0.15);
  }

  &--dead {
    background: rgba(0, 0, 0, 0.08);
  }
}

.info-status-text {
  font-size: $font-xs;
  color: $primary-dark;
  font-weight: $font-weight-medium;
}

.info-meta {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  align-items: center;
}

.meta-item {
  font-size: $font-sm;
  color: $text-secondary;
}

.meta-edit-link {
  font-size: $font-sm;
  color: $primary-color;
}

.water-card {
  margin: $spacing-md;
  background: linear-gradient(135deg, $primary-lighter, #FFFFFF);
  border-radius: $radius-md;
  padding: $spacing-lg $spacing-md;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-shadow: $shadow-sm;
  border: 2rpx solid rgba(76, 175, 80, 0.2);
}

.water-info {
  display: flex;
  flex-direction: column;
}

.water-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
}

.water-days {
  font-size: $font-xxl;
  font-weight: $font-weight-bold;
  color: $primary-color;

  &--urgent {
    color: $info-color;
  }
}

.btn-water {
  padding: 16rpx 36rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-xl;
  box-shadow: $shadow-primary;
}

.btn-water-text {
  font-size: $font-md;
  color: $text-white;
  font-weight: $font-weight-bold;
}

.section {
  padding: 0 $spacing-md;
  margin-bottom: $spacing-md;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.care-list {
  background: $bg-card;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.care-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-sm $spacing-md;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.care-icon {
  font-size: 32rpx;
  margin-right: $spacing-sm;
  flex-shrink: 0;
}

.care-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.care-date {
  font-size: $font-sm;
  color: $text-secondary;
}

.care-note {
  font-size: $font-sm;
  color: $text-light;
  margin-top: 2rpx;
}

.empty-hint {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-lg;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-hint-text {
  font-size: $font-sm;
  color: $text-light;
}

.album-scroll {
  white-space: nowrap;
}

.album-list {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.album-photo {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-md;
  flex-shrink: 0;
  display: inline-block;
}

.action-section {
  padding: $spacing-md;
}

.btn-growth {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-primary;
  margin-bottom: $spacing-md;
}

.btn-growth-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}

.action-row {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
}

.btn-edit {
  flex: 1;
  height: 80rpx;
  background: $bg-card;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $border-color;
}

.btn-edit-text {
  font-size: $font-md;
  color: $text-primary;
  font-weight: $font-weight-medium;
}

.btn-delete {
  flex: 1;
  height: 80rpx;
  background: $bg-card;
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(231, 76, 60, 0.3);
}

.btn-delete-text {
  font-size: $font-md;
  color: $error-color;
  font-weight: $font-weight-medium;
}
</style>
