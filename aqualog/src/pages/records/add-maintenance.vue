<template>
  <view class="page">
    <scroll-view scroll-y class="form-scroll">
      <!-- 水族箱选择 -->
      <view class="form-section">
        <text class="form-label">水族箱</text>
        <picker :range="aquariumNames" :value="pickerIndex" @change="onPickerChange">
          <view class="form-picker flex-between">
            <text class="form-picker-text">{{ currentAquariumName }}</text>
            <text class="form-picker-arrow">▶</text>
          </view>
        </picker>
      </view>

      <!-- 日期选择 -->
      <view class="form-section">
        <text class="form-label">日期</text>
        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="form-picker">
            <text class="form-picker-text">{{ form.date }}</text>
          </view>
        </picker>
      </view>

      <!-- 维护类型 6 宫格 -->
      <view class="form-section">
        <text class="section-title">维护类型</text>
        <view class="type-grid">
          <view
            v-for="item in maintenanceTypes"
            :key="item.type"
            class="type-cell"
            :class="{ active: form.type === item.type }"
            @click="form.type = item.type"
          >
            <text class="type-icon">{{ item.icon }}</text>
            <text class="type-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 换水表单 -->
      <view v-if="form.type === 'waterChange'" class="form-section">
        <text class="section-title">换水详情</text>
        <view class="param-input-group">
          <text class="form-label">换水量（%）</text>
          <view class="slider-row">
            <slider
              :value="waterChangeForm.percentage"
              :min="0"
              :max="100"
              :step="5"
              active-color="#1E88E5"
              @change="onSliderChange"
            />
            <text class="slider-value">{{ waterChangeForm.percentage }}%</text>
          </view>
        </view>
        <view class="switch-row">
          <text class="switch-label">清洗过滤</text>
          <switch :checked="waterChangeForm.filterCleaned" color="#1E88E5" @change="waterChangeForm.filterCleaned = $event.detail.value" />
        </view>
        <view class="switch-row">
          <text class="switch-label">修剪水草</text>
          <switch :checked="waterChangeForm.trimmedPlants" color="#1E88E5" @change="waterChangeForm.trimmedPlants = $event.detail.value" />
        </view>
      </view>

      <!-- 喂食表单 -->
      <view v-if="form.type === 'feeding'" class="form-section">
        <text class="section-title">喂食详情</text>
        <view class="param-input-group">
          <text class="form-label">饲料类型</text>
          <input class="form-input" v-model="feedingForm.foodType" placeholder="如：薄片、颗粒、冻干" />
        </view>
        <view class="param-input-group">
          <text class="form-label">喂食量</text>
          <input class="form-input" v-model="feedingForm.amount" placeholder="如：少量、适量" />
        </view>
        <view class="param-input-group">
          <text class="form-label">进食情况</text>
          <view class="response-grid">
            <view
              v-for="opt in feedingResponseOptions"
              :key="opt.value"
              class="response-item"
              :class="{ active: feedingForm.feedingResponse === opt.value }"
              @click="feedingForm.feedingResponse = opt.value"
            >
              <text class="response-text">{{ opt.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 滤材维护表单 -->
      <view v-if="form.type === 'filter'" class="form-section">
        <text class="section-title">滤材维护</text>
        <view class="param-input-group">
          <text class="form-label">滤材类型</text>
          <input class="form-input" v-model="filterForm.filterType" placeholder="如：生化棉、陶瓷环" />
        </view>
        <view class="param-input-group">
          <text class="form-label">操作</text>
          <view class="response-grid">
            <view
              class="response-item"
              :class="{ active: filterForm.action === 'clean' }"
              @click="filterForm.action = 'clean'"
            >
              <text class="response-text">清洗</text>
            </view>
            <view
              class="response-item"
              :class="{ active: filterForm.action === 'replace' }"
              @click="filterForm.action = 'replace'"
            >
              <text class="response-text">更换</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 灯光/CO2/其他 -->
      <view v-if="['light', 'co2', 'other'].includes(form.type)" class="form-section">
        <text class="section-title">{{ getTypeName(form.type) }}详情</text>
        <textarea
          class="form-textarea"
          v-model="otherDescription"
          placeholder="请描述具体操作内容..."
          :maxlength="500"
        />
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          v-model="form.note"
          placeholder="补充说明..."
          :maxlength="500"
        />
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="bottom-bar safe-bottom">
      <view class="btn-primary bottom-btn" @click="onSave">
        <text class="bottom-btn-text">保存日志</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAquariumStore } from '@/store/aquarium'
import { useRecordStore } from '@/store/record'
import { formatDate, formatMaintenanceType } from '@/utils/format'
import type { MaintenanceType, FeedingResponse, WaterChangeDetails, FeedingDetails, FilterDetails, OtherDetails } from '@/types/models'

const aquariumStore = useAquariumStore()
const recordStore = useRecordStore()

const pickerIndex = ref(0)

const aquariumNames = computed(() => aquariumStore.aquariums.map(a => a.name))
const currentAquarium = computed(() => aquariumStore.aquariums[pickerIndex.value] || null)
const currentAquariumName = computed(() => currentAquarium.value?.name || '请选择水族箱')

const form = reactive({
  date: formatDate(new Date()),
  type: 'waterChange' as MaintenanceType,
  note: ''
})

const waterChangeForm = reactive({
  percentage: 25,
  volume: 0,
  filterCleaned: false,
  trimmedPlants: false
})

const feedingForm = reactive({
  foodType: '',
  amount: '',
  feedingResponse: 'normal' as FeedingResponse
})

const filterForm = reactive({
  filterType: '',
  action: 'clean'
})

const otherDescription = ref('')

const maintenanceTypes = [
  { type: 'waterChange' as MaintenanceType, icon: '💧', name: '换水' },
  { type: 'feeding' as MaintenanceType, icon: '🐟', name: '喂食' },
  { type: 'filter' as MaintenanceType, icon: '🔄', name: '过滤' },
  { type: 'light' as MaintenanceType, icon: '💡', name: '灯光' },
  { type: 'co2' as MaintenanceType, icon: '🫧', name: 'CO₂' },
  { type: 'other' as MaintenanceType, icon: '🔧', name: '其他' }
]

const feedingResponseOptions = [
  { value: 'good' as FeedingResponse, label: '良好' },
  { value: 'normal' as FeedingResponse, label: '一般' },
  { value: 'poor' as FeedingResponse, label: '较差' },
  { value: 'none' as FeedingResponse, label: '未进食' }
]

function getTypeName(type: string): string {
  return formatMaintenanceType(type as MaintenanceType)
}

function onPickerChange(e: any) {
  pickerIndex.value = Number(e.detail.value)
}

function onDateChange(e: any) {
  form.date = e.detail.value
}

function onSliderChange(e: any) {
  waterChangeForm.percentage = e.detail.value
}

onLoad((options) => {
  if (options?.aquariumId) {
    const idx = aquariumStore.aquariums.findIndex(a => a.aquariumId === options.aquariumId)
    if (idx >= 0) pickerIndex.value = idx
  }
})

function buildDetails(): WaterChangeDetails | FeedingDetails | FilterDetails | OtherDetails {
  switch (form.type) {
    case 'waterChange':
      return {
        percentage: waterChangeForm.percentage,
        volume: currentAquarium.value ? Math.round(currentAquarium.value.volume * waterChangeForm.percentage / 100) : 0,
        filterCleaned: waterChangeForm.filterCleaned,
        trimmedPlants: waterChangeForm.trimmedPlants
      }
    case 'feeding':
      return {
        foodType: feedingForm.foodType,
        amount: feedingForm.amount,
        feedingResponse: feedingForm.feedingResponse
      }
    case 'filter':
      return {
        filterType: filterForm.filterType,
        action: filterForm.action
      }
    default:
      return {
        description: otherDescription.value
      }
  }
}

function onSave() {
  if (!currentAquarium.value) {
    uni.showToast({ title: '请先选择水族箱', icon: 'none' })
    return
  }

  recordStore.addMaintenanceLog({
    aquariumId: currentAquarium.value.aquariumId,
    type: form.type,
    date: form.date,
    details: buildDetails(),
    note: form.note
  })

  uni.showToast({ title: '日志已保存', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.form-scroll {
  height: calc(100vh - 140rpx);
  padding: $spacing-md $spacing-lg;
}

.form-section {
  background: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.form-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  display: block;
}

.section-title {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.form-picker {
  background: $bg-section;
  border-radius: $radius-sm;
  padding: $spacing-sm $spacing-md;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.form-picker-text {
  font-size: $font-md;
  color: $text-primary;
}

.form-picker-arrow {
  font-size: $font-xs;
  color: $text-light;
}

.type-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.type-cell {
  width: calc(33.33% - 12rpx);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-md $spacing-sm;
  border-radius: $radius-md;
  background: $bg-section;
  border: 2rpx solid transparent;
  transition: all $transition-fast;

  &.active {
    background: $primary-lighter;
    border-color: $primary-color;
  }

  &:active {
    opacity: 0.8;
  }
}

.type-icon {
  font-size: 48rpx;
  margin-bottom: $spacing-xs;
}

.type-name {
  font-size: $font-sm;
  color: $text-secondary;

  .active & {
    color: $primary-color;
    font-weight: $font-weight-medium;
  }
}

.param-input-group {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: $bg-section;
  border-radius: $radius-sm;
  padding: 0 $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
}

.slider-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
}

.slider-row slider {
  flex: 1;
}

.slider-value {
  font-size: $font-md;
  color: $primary-color;
  font-weight: $font-weight-bold;
  width: 100rpx;
  text-align: right;
}

.switch-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-sm 0;
  border-bottom: 1rpx solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.switch-label {
  font-size: $font-md;
  color: $text-primary;
}

.response-grid {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.response-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-sm;
  border-radius: $radius-sm;
  background: $bg-section;
  border: 2rpx solid transparent;
  transition: all $transition-fast;

  &.active {
    background: $primary-lighter;
    border-color: $primary-color;
  }
}

.response-text {
  font-size: $font-sm;
  color: $text-secondary;

  .active & {
    color: $primary-color;
    font-weight: $font-weight-medium;
  }
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: $bg-section;
  border-radius: $radius-sm;
  padding: $spacing-sm $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md $spacing-lg;
  background: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.bottom-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  box-shadow: $shadow-primary;

  &:active {
    opacity: 0.85;
    transform: scale(0.99);
  }
}

.bottom-btn-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}
</style>
