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

      <!-- 日期时间 -->
      <view class="form-section">
        <view class="form-row">
          <view class="form-half">
            <text class="form-label">日期</text>
            <picker mode="date" :value="form.date" @change="onDateChange">
              <view class="form-picker">
                <text class="form-picker-text">{{ form.date }}</text>
              </view>
            </picker>
          </view>
          <view class="form-half">
            <text class="form-label">时间</text>
            <picker mode="time" :value="form.time" @change="onTimeChange">
              <view class="form-picker">
                <text class="form-picker-text">{{ form.time }}</text>
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 基础参数 -->
      <view class="form-section">
        <text class="section-title">基础参数</text>
        <view v-for="param in basicParams" :key="param.key" class="param-input-group">
          <view class="param-input-header">
            <text class="form-label">{{ param.label }}</text>
            <text class="param-range" :class="getStatusClass(param.key)">
              安全范围: {{ getRangeText(param.key) }}
            </text>
          </view>
          <view class="param-input-wrap" :class="getStatusClass(param.key)">
            <input
              class="param-input"
              type="digit"
              :placeholder="param.placeholder"
              :value="getParamValue(param.key)"
              @input="onParamInput(param.key, $event)"
            />
            <text v-if="param.unit" class="param-input-unit">{{ param.unit }}</text>
          </view>
        </view>
      </view>

      <!-- 展开进阶参数 -->
      <view class="form-section">
        <view class="expand-header" @click="showAdvanced = !showAdvanced">
          <text class="section-title">进阶参数</text>
          <text class="expand-arrow">{{ showAdvanced ? '▲' : '▼' }}</text>
        </view>
        <view v-if="showAdvanced" class="advanced-params">
          <view v-for="param in advancedParams" :key="param.key" class="param-input-group">
            <view class="param-input-header">
              <text class="form-label">{{ param.label }}</text>
              <text class="param-range" :class="getStatusClass(param.key)">
                安全范围: {{ getRangeText(param.key) }}
              </text>
            </view>
            <view class="param-input-wrap" :class="getStatusClass(param.key)">
              <input
                class="param-input"
                type="digit"
                :placeholder="param.placeholder"
                :value="getParamValue(param.key)"
                @input="onParamInput(param.key, $event)"
              />
              <text v-if="param.unit" class="param-input-unit">{{ param.unit }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          v-model="form.note"
          placeholder="记录水族箱状况、特殊情况等..."
          :maxlength="500"
        />
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="bottom-bar safe-bottom">
      <view class="btn-primary bottom-btn" @click="onSave">
        <text class="bottom-btn-text">保存记录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAquariumStore } from '@/store/aquarium'
import { useRecordStore } from '@/store/record'
import { checkParamStatus, getParamLabel, getParamUnit } from '@/utils/paramRanges'
import { formatDate } from '@/utils/format'
import type { SafeRanges } from '@/types/models'

const aquariumStore = useAquariumStore()
const recordStore = useRecordStore()

const pickerIndex = ref(0)
const showAdvanced = ref(false)

const aquariumNames = computed(() => aquariumStore.aquariums.map(a => a.name))
const currentAquarium = computed(() => aquariumStore.aquariums[pickerIndex.value] || null)
const currentAquariumName = computed(() => currentAquarium.value?.name || '请选择水族箱')
const currentSafeRanges = computed<SafeRanges | null>(() => currentAquarium.value?.safeRanges || null)
const isMarine = computed(() => currentAquarium.value?.type === 'marine')

const now = new Date()
const form = reactive({
  date: formatDate(now),
  time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  temperature: null as number | null,
  ph: null as number | null,
  ammonia: null as number | null,
  nitrite: null as number | null,
  nitrate: null as number | null,
  gh: null as number | null,
  kh: null as number | null,
  salinity: null as number | null,
  phosphate: null as number | null,
  note: ''
})

const basicParams = [
  { key: 'temperature', label: '温度', unit: '°C', placeholder: '如 25.5' },
  { key: 'ph', label: 'pH', unit: '', placeholder: '如 7.0' },
  { key: 'ammonia', label: '氨氮', unit: 'mg/L', placeholder: '如 0' },
  { key: 'nitrite', label: '亚硝酸盐', unit: 'mg/L', placeholder: '如 0' }
]

const advancedParams = computed(() => {
  const list = [
    { key: 'nitrate', label: '硝酸盐', unit: 'mg/L', placeholder: '如 10' },
    { key: 'gh', label: 'GH', unit: 'dGH', placeholder: '如 6' },
    { key: 'kh', label: 'KH', unit: 'dKH', placeholder: '如 4' },
    { key: 'phosphate', label: '磷酸盐', unit: 'mg/L', placeholder: '如 0.5' }
  ]
  if (isMarine.value) {
    list.splice(1, 0, { key: 'salinity', label: '盐度', unit: '‰', placeholder: '如 35' })
  }
  return list
})

function getParamValue(key: string): string {
  const v = (form as any)[key]
  return v === null ? '' : String(v)
}

function onParamInput(key: string, e: any) {
  const val = e.detail.value
  ;(form as any)[key] = val === '' ? null : Number(val)
}

function getStatusClass(key: string): string {
  const value = (form as any)[key]
  if (value === null || !currentSafeRanges.value) return ''
  const status = checkParamStatus(key, value, currentSafeRanges.value)
  if (status === 'danger') return 'status-danger'
  if (status === 'warning') return 'status-warning'
  return ''
}

function getRangeText(key: string): string {
  if (!currentSafeRanges.value) return '--'
  const range = (currentSafeRanges.value as any)[key] as { min: number; max: number } | undefined
  if (!range) return '--'
  const unit = getParamUnit(key)
  return `${range.min}-${range.max}${unit}`
}

function onPickerChange(e: any) {
  pickerIndex.value = Number(e.detail.value)
}

function onDateChange(e: any) {
  form.date = e.detail.value
}

function onTimeChange(e: any) {
  form.time = e.detail.value
}

onLoad((options) => {
  if (options?.aquariumId) {
    const idx = aquariumStore.aquariums.findIndex(a => a.aquariumId === options.aquariumId)
    if (idx >= 0) pickerIndex.value = idx
  }
})

function onSave() {
  if (!currentAquarium.value) {
    uni.showToast({ title: '请先选择水族箱', icon: 'none' })
    return
  }

  recordStore.addParameterRecord({
    aquariumId: currentAquarium.value.aquariumId,
    date: form.date,
    time: form.time,
    temperature: form.temperature,
    ph: form.ph,
    ammonia: form.ammonia,
    nitrite: form.nitrite,
    nitrate: form.nitrate,
    gh: form.gh,
    kh: form.kh,
    salinity: form.salinity,
    phosphate: form.phosphate,
    photoUrl: '',
    note: form.note
  })

  // 更新水族箱状态
  aquariumStore.updateStatus(currentAquarium.value.aquariumId, form)

  uni.showToast({ title: '记录已保存', icon: 'success' })
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

.form-row {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
}

.form-half {
  flex: 1;
}

.param-input-group {
  margin-bottom: $spacing-md;

  &:last-child {
    margin-bottom: 0;
  }
}

.param-input-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xs;
}

.param-range {
  font-size: $font-xs;
  color: $text-light;

  &.status-warning {
    color: $warning-color;
  }

  &.status-danger {
    color: $error-color;
    font-weight: $font-weight-medium;
  }
}

.param-input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: $bg-section;
  border-radius: $radius-sm;
  padding: 0 $spacing-md;
  border: 2rpx solid transparent;
  transition: border-color $transition-fast;

  &.status-warning {
    border-color: $warning-color;
  }

  &.status-danger {
    border-color: $error-color;
    background: rgba(231, 76, 60, 0.05);
  }
}

.param-input {
  flex: 1;
  height: 80rpx;
  font-size: $font-md;
  color: $text-primary;
}

.param-input-unit {
  font-size: $font-sm;
  color: $text-light;
  margin-left: $spacing-sm;
  flex-shrink: 0;
}

.expand-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.expand-arrow {
  font-size: $font-sm;
  color: $text-light;
}

.advanced-params {
  margin-top: $spacing-sm;
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
