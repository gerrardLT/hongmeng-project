<template>
  <view class="create-page">
    <scroll-view class="scroll-area" scroll-y>
      <!-- 钓点选择 -->
      <view class="form-card">
        <text class="card-header">基本信息</text>

        <picker :range="spotOptions" range-key="label" @change="onSpotChange" :value="spotPickerIndex">
          <view class="form-item required">
            <text class="form-label">钓点</text>
            <view class="form-value-row">
              <text :class="['form-value', !form.spotId && 'placeholder']">
                {{ currentSpotLabel || '请选择钓点' }}
              </text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>

        <picker mode="date" :value="form.date" @change="onDateChange">
          <view class="form-item">
            <text class="form-label">日期</text>
            <view class="form-value-row">
              <text class="form-value">{{ form.date }}</text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>

        <picker mode="time" :value="form.time" @change="onTimeChange">
          <view class="form-item">
            <text class="form-label">时间</text>
            <view class="form-value-row">
              <text class="form-value">{{ form.time }}</text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>
      </view>

      <!-- 渔获信息 -->
      <view class="form-card">
        <text class="card-header">渔获信息</text>

        <picker :range="speciesOptions" @change="onSpeciesChange" :value="speciesPickerIndex">
          <view class="form-item required">
            <text class="form-label">鱼种</text>
            <view class="form-value-row">
              <text :class="['form-value', !form.fishSpecies && 'placeholder']">
                {{ form.fishSpecies || '请选择鱼种' }}
              </text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>

        <!-- 自定义鱼种输入 -->
        <view class="form-item" v-if="showCustomSpecies">
          <text class="form-label">自定义鱼种</text>
          <input
            class="form-input"
            v-model="customSpecies"
            placeholder="请输入鱼种名称"
            @blur="onCustomSpeciesBlur"
          />
        </view>

        <view class="form-item">
          <text class="form-label">重量(kg)</text>
          <input
            class="form-input"
            type="digit"
            v-model="weightStr"
            placeholder="0.0"
          />
        </view>

        <view class="form-item">
          <text class="form-label">数量</text>
          <input
            class="form-input"
            type="number"
            v-model="countStr"
            placeholder="1"
          />
        </view>

        <picker :range="methodOptions" range-key="label" @change="onMethodChange" :value="methodPickerIndex">
          <view class="form-item">
            <text class="form-label">钓法</text>
            <view class="form-value-row">
              <text class="form-value">{{ currentMethodLabel }}</text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>

        <view class="form-item">
          <text class="form-label">饵料</text>
          <input
            class="form-input"
            v-model="form.bait"
            placeholder="请输入饵料"
          />
        </view>
      </view>

      <!-- 天气信息 -->
      <view class="form-card">
        <text class="card-header">天气信息</text>

        <picker :range="weatherOptions" range-key="label" @change="onWeatherChange" :value="weatherPickerIndex">
          <view class="form-item">
            <text class="form-label">天气</text>
            <view class="form-value-row">
              <text class="form-value">{{ currentWeatherLabel }}</text>
              <text class="form-arrow">›</text>
            </view>
          </view>
        </picker>

        <view class="form-item">
          <text class="form-label">温度(°C)</text>
          <input
            class="form-input"
            type="digit"
            v-model="temperatureStr"
            placeholder="自动填充"
          />
        </view>

        <view class="form-item">
          <text class="form-label">气压(hPa)</text>
          <input
            class="form-input"
            type="digit"
            v-model="pressureStr"
            placeholder="自动填充"
          />
        </view>
      </view>

      <!-- 照片上传 -->
      <view class="form-card">
        <text class="card-header">照片（最多5张）</text>
        <view class="photo-grid">
          <view class="photo-item" v-for="(photo, idx) in photos" :key="idx">
            <image class="photo-img" :src="photo" mode="aspectFill" />
            <view class="photo-delete" @click="removePhoto(idx)">
              <text class="delete-icon">×</text>
            </view>
          </view>
          <view class="photo-add" v-if="photos.length < 5" @click="choosePhoto">
            <text class="add-icon">+</text>
            <text class="add-text">添加照片</text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-card">
        <text class="card-header">备注</text>
        <textarea
          class="form-textarea"
          v-model="form.note"
          placeholder="记录一些钓鱼心得..."
          :maxlength="500"
          auto-height
        />
      </view>

      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部保存按钮 -->
    <view class="bottom-bar">
      <view class="save-btn" :class="{ disabled: submitting }" @click="handleSubmit">
        <text class="save-btn-text">{{ isEdit ? '保存修改' : '保存渔获' }}</text>
      </view>
    </view>

    <Loading :show="submitting" :text="isEdit ? '保存中...' : '提交中...'" />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCatchesStore } from '@/store/catches'
import { useSpotsStore } from '@/store/spots'
import { useWeatherStore } from '@/store/weather'
import { createCatch, updateCatch, getCatchDetail } from '@/services/catches'
import { uploadImages } from '@/services/storage'
import { FISH_SPECIES, FISH_METHOD_MAP } from '@/types/models'
import type { FishMethod, WeatherCondition } from '@/types/models'
import Loading from '@/components/common/Loading.vue'

const catchesStore = useCatchesStore()
const spotsStore = useSpotsStore()
const weatherStore = useWeatherStore()

const isEdit = ref(false)
let editRecordId = ''
const submitting = ref(false)

// 获取当前日期时间
function getToday(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getNowTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const form = reactive({
  spotId: '',
  spotName: '',
  date: getToday(),
  time: getNowTime(),
  fishSpecies: '',
  weight: 0,
  count: 1,
  method: 'hand_rod' as FishMethod,
  bait: '',
  weather: '' as WeatherCondition | '',
  temperature: undefined as number | undefined,
  pressure: undefined as number | undefined,
  note: ''
})

const photos = ref<string[]>([])
const weightStr = ref('')
const countStr = ref('1')
const temperatureStr = ref('')
const pressureStr = ref('')
const showCustomSpecies = ref(false)
const customSpecies = ref('')

// 钓点选项
const spotPickerIndex = ref(0)
const spotOptions = computed(() => {
  return spotsStore.spotList.map((s) => ({ label: s.name, value: s.spotId }))
})
const currentSpotLabel = computed(() => {
  if (!form.spotId) return ''
  const spot = spotsStore.spotList.find((s) => s.spotId === form.spotId)
  return spot?.name || ''
})

function onSpotChange(e: any) {
  const idx = Number(e.detail.value)
  spotPickerIndex.value = idx
  const opt = spotOptions.value[idx]
  if (opt) {
    form.spotId = opt.value
    form.spotName = opt.label
  }
}

// 鱼种选项
const speciesPickerIndex = ref(0)
const speciesOptions = computed(() => [...FISH_SPECIES])

function onSpeciesChange(e: any) {
  const idx = Number(e.detail.value)
  speciesPickerIndex.value = idx
  const species = speciesOptions.value[idx]
  if (species === '其他') {
    showCustomSpecies.value = true
    form.fishSpecies = customSpecies.value || ''
  } else {
    showCustomSpecies.value = false
    customSpecies.value = ''
    form.fishSpecies = species
  }
}

function onCustomSpeciesBlur() {
  form.fishSpecies = customSpecies.value
}

// 钓法选项
const methodPickerIndex = ref(0)
const methodOptions = computed(() => {
  return Object.entries(FISH_METHOD_MAP).map(([value, label]) => ({ label, value }))
})
const currentMethodLabel = computed(() => FISH_METHOD_MAP[form.method] || '手竿')

function onMethodChange(e: any) {
  const idx = Number(e.detail.value)
  methodPickerIndex.value = idx
  form.method = methodOptions.value[idx].value as FishMethod
}

// 天气选项
const weatherPickerIndex = ref(0)
const weatherConditions: { label: string; value: WeatherCondition }[] = [
  { label: '晴天', value: 'sunny' },
  { label: '多云', value: 'cloudy' },
  { label: '阴天', value: 'overcast' },
  { label: '小雨', value: 'light_rain' },
  { label: '中雨', value: 'moderate_rain' },
  { label: '大雨', value: 'heavy_rain' },
  { label: '雷暴', value: 'thunderstorm' },
  { label: '雪', value: 'snow' },
  { label: '雾', value: 'fog' },
  { label: '大风', value: 'windy' }
]
const weatherOptions = computed(() => weatherConditions)
const currentWeatherLabel = computed(() => {
  if (!form.weather) return '请选择'
  const item = weatherConditions.find((w) => w.value === form.weather)
  return item?.label || '请选择'
})

function onWeatherChange(e: any) {
  const idx = Number(e.detail.value)
  weatherPickerIndex.value = idx
  form.weather = weatherConditions[idx].value
}

// 日期时间
function onDateChange(e: any) {
  form.date = e.detail.value
}

function onTimeChange(e: any) {
  form.time = e.detail.value
}

// 照片
function choosePhoto() {
  const remaining = 5 - photos.value.length
  if (remaining <= 0) return
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      photos.value.push(...res.tempFilePaths)
    }
  })
}

function removePhoto(idx: number) {
  photos.value.splice(idx, 1)
}

// 自动填充天气
function fillWeather() {
  const w = weatherStore.currentWeather
  if (w) {
    form.weather = w.condition
    form.temperature = w.temperature
    form.pressure = w.pressure
    temperatureStr.value = String(w.temperature)
    pressureStr.value = String(w.pressure)
    // 设置天气 picker 索引
    const wIdx = weatherConditions.findIndex((c) => c.value === w.condition)
    if (wIdx >= 0) weatherPickerIndex.value = wIdx
  }
}

// 表单校验
function validate(): boolean {
  if (!form.spotId) {
    uni.showToast({ title: '请选择钓点', icon: 'none' })
    return false
  }
  if (!form.fishSpecies) {
    uni.showToast({ title: '请选择鱼种', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (submitting.value) return
  if (!validate()) return

  // 解析数值
  form.weight = parseFloat(weightStr.value) || 0
  form.count = parseInt(countStr.value) || 1
  form.temperature = temperatureStr.value ? parseFloat(temperatureStr.value) : undefined
  form.pressure = pressureStr.value ? parseFloat(pressureStr.value) : undefined

  submitting.value = true
  try {
    // 上传新照片
    let photoUrls = photos.value.filter((p) => !p.startsWith('http') && !p.startsWith('internal://'))
    let existingPhotos = photos.value.filter((p) => p.startsWith('http') || p.startsWith('internal://'))
    if (photoUrls.length > 0) {
      const uploaded = await uploadImages(photoUrls)
      existingPhotos = [...existingPhotos, ...uploaded]
    }

    const payload = {
      spotId: form.spotId,
      spotName: form.spotName,
      date: form.date,
      time: form.time,
      fishSpecies: form.fishSpecies,
      weight: form.weight,
      count: form.count,
      method: form.method,
      bait: form.bait || undefined,
      weather: form.weather || undefined,
      temperature: form.temperature,
      pressure: form.pressure,
      note: form.note || undefined,
      photos: existingPhotos
    }

    if (isEdit.value && editRecordId) {
      const updated = await updateCatch(editRecordId, payload)
      catchesStore.updateCatch(editRecordId, updated)
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      const created = await createCatch(payload as any)
      catchesStore.addCatch(created)
      uni.showToast({ title: '记录成功', icon: 'success' })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e) {
    console.error('保存失败:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

// 编辑模式加载数据
async function loadEditData(id: string) {
  try {
    const data = await getCatchDetail(id)
    form.spotId = data.spotId
    form.spotName = data.spotName || ''
    form.date = data.date
    form.time = data.time
    form.fishSpecies = data.fishSpecies
    form.weight = data.weight
    form.count = data.count
    form.method = data.method
    form.bait = data.bait || ''
    form.weather = data.weather || ''
    form.temperature = data.temperature
    form.pressure = data.pressure
    form.note = data.note || ''
    photos.value = [...(data.photos || [])]

    weightStr.value = String(data.weight || '')
    countStr.value = String(data.count || 1)
    temperatureStr.value = data.temperature !== undefined ? String(data.temperature) : ''
    pressureStr.value = data.pressure !== undefined ? String(data.pressure) : ''

    // 同步 picker 索引
    const sIdx = spotOptions.value.findIndex((s) => s.value === data.spotId)
    if (sIdx >= 0) spotPickerIndex.value = sIdx

    const spIdx = speciesOptions.value.indexOf(data.fishSpecies as any)
    if (spIdx >= 0) {
      speciesPickerIndex.value = spIdx
    } else {
      // 自定义鱼种
      speciesPickerIndex.value = speciesOptions.value.indexOf('其他')
      showCustomSpecies.value = true
      customSpecies.value = data.fishSpecies
    }

    const mIdx = methodOptions.value.findIndex((m) => m.value === data.method)
    if (mIdx >= 0) methodPickerIndex.value = mIdx

    if (data.weather) {
      const wIdx = weatherConditions.findIndex((w) => w.value === data.weather)
      if (wIdx >= 0) weatherPickerIndex.value = wIdx
    }
  } catch (e) {
    console.error('加载编辑数据失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

onLoad((query) => {
  spotsStore.init()
  weatherStore.init()

  const rid = query?.recordId
  if (rid) {
    isEdit.value = true
    editRecordId = rid
    loadEditData(rid)
  } else {
    // 新建模式，自动填充天气
    fillWeather()
  }
})
</script>

<style scoped lang="scss">
.create-page {
  min-height: 100vh;
  background: #F5F5F5;
  position: relative;
}

.scroll-area {
  height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.form-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  margin-bottom: 24rpx;
  display: block;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #F5F5F5;

  &:last-child {
    border-bottom: none;
  }
}

.form-item.required .form-label::before {
  content: '*';
  color: #FF4444;
  margin-right: 6rpx;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
  width: 180rpx;
}

.form-value-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.form-value {
  font-size: 28rpx;
  color: #333333;
  text-align: right;
}

.form-value.placeholder {
  color: #CCCCCC;
}

.form-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  text-align: right;
  padding: 0;
  min-height: 40rpx;
}

/* 照片 */
.photo-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 0 12rpx 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 28rpx;
  color: #FFFFFF;
  line-height: 1;
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
  font-size: 48rpx;
  color: #CCCCCC;
  line-height: 1;
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 22rpx;
  color: #CCCCCC;
}

/* 备注 */
.form-textarea {
  width: 100%;
  min-height: 160rpx;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  padding: 0;
  box-sizing: border-box;
}

.bottom-spacer {
  height: 160rpx;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.save-btn {
  width: 100%;
  height: 92rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8F5E);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }

  &.disabled {
    opacity: 0.5;
  }
}

.save-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
}
</style>
