<template>
  <view class="settings-page">
    <!-- 鸿蒙端条件编译说明 -->
    <!-- #ifndef APP-HARMONY -->
    <view class="platform-notice">
      <text class="notice-text">⚠️ 意图框架仅在鸿蒙设备上可用</text>
    </view>
    <!-- #endif -->

    <!-- 到达钓点提醒 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">到达钓点提醒</text>
        <switch
          class="theme-switch"
          :checked="arrivalEnabled"
          :color="THEME_COLOR"
          @change="onArrivalToggle"
        />
      </view>

      <view v-if="arrivalEnabled" class="section-body">
        <!-- 选择监控的钓点 -->
        <view class="setting-label">
          <text class="label-text">监控钓点</text>
        </view>
        <view class="spot-list">
          <view
            v-for="spot in spotsStore.spotList"
            :key="spot.spotId"
            class="spot-check-item"
            @click="toggleSpotSelection(spot.spotId)"
          >
            <view
              class="checkbox"
              :class="{ checked: selectedSpotIds.includes(spot.spotId) }"
            >
              <text v-if="selectedSpotIds.includes(spot.spotId)" class="check-mark">✓</text>
            </view>
            <text class="spot-name">{{ spot.name }}</text>
          </view>
          <view v-if="spotsStore.spotList.length === 0" class="empty-tip">
            <text class="empty-text">暂无钓点，请先添加钓点</text>
          </view>
        </view>

        <!-- 提醒半径 -->
        <view class="setting-label">
          <text class="label-text">提醒半径</text>
        </view>
        <view class="radius-picker">
          <view
            v-for="r in radiusOptions"
            :key="r.value"
            class="radius-option"
            :class="{ active: arrivalRadius === r.value }"
            @click="setArrivalRadius(r.value)"
          >
            <text class="radius-text" :class="{ active: arrivalRadius === r.value }">{{ r.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 钓鱼指数提醒 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">钓鱼指数提醒</text>
        <switch
          class="theme-switch"
          :checked="weatherEnabled"
          :color="THEME_COLOR"
          @change="onWeatherToggle"
        />
      </view>

      <view v-if="weatherEnabled" class="section-body">
        <view class="setting-label">
          <text class="label-text">指数阈值</text>
        </view>
        <view class="radius-picker">
          <view
            v-for="t in thresholdOptions"
            :key="t.value"
            class="radius-option"
            :class="{ active: weatherThreshold === t.value }"
            @click="setWeatherThreshold(t.value)"
          >
            <text class="radius-text" :class="{ active: weatherThreshold === t.value }">{{ t.label }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 潮汐提醒 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">潮汐提醒</text>
        <switch
          class="theme-switch"
          :checked="tideEnabled"
          :color="THEME_COLOR"
          @change="onTideToggle"
        />
      </view>

      <view v-if="tideEnabled" class="section-body">
        <!-- 潮汐类型选择 -->
        <view class="setting-label">
          <text class="label-text">潮汐类型</text>
        </view>
        <view class="check-row">
          <view class="check-item" @click="toggleTideType('rising')">
            <view class="checkbox" :class="{ checked: tideTypes.includes('rising') }">
              <text v-if="tideTypes.includes('rising')" class="check-mark">✓</text>
            </view>
            <text class="check-label">涨潮</text>
          </view>
          <view class="check-item" @click="toggleTideType('falling')">
            <view class="checkbox" :class="{ checked: tideTypes.includes('falling') }">
              <text v-if="tideTypes.includes('falling')" class="check-mark">✓</text>
            </view>
            <text class="check-label">退潮</text>
          </view>
        </view>

        <!-- 提前提醒时间 -->
        <view class="setting-label">
          <text class="label-text">提前提醒</text>
        </view>
        <view class="radius-picker">
          <view
            v-for="a in advanceOptions"
            :key="a.value"
            class="radius-option"
            :class="{ active: tideAdvance === a.value }"
            @click="setTideAdvance(a.value)"
          >
            <text class="radius-text" :class="{ active: tideAdvance === a.value }">{{ a.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSpotsStore } from '@/store/spots'
import { useIntentsStore } from '@/store/intents'
import { createIntent, updateIntent as updateIntentApi } from '@/services/intents'

const THEME_COLOR = '#FF6B35'

const spotsStore = useSpotsStore()
const intentsStore = useIntentsStore()

// ========== 到达钓点提醒 ==========
const arrivalEnabled = ref(false)
const selectedSpotIds = ref<string[]>([])
const arrivalRadius = ref(500)

const radiusOptions = [
  { label: '100m', value: 100 },
  { label: '200m', value: 200 },
  { label: '500m', value: 500 },
  { label: '1000m', value: 1000 }
]

// ========== 钓鱼指数提醒 ==========
const weatherEnabled = ref(false)
const weatherThreshold = ref(3)

const thresholdOptions = [
  { label: '3星及以上', value: 3 },
  { label: '4星及以上', value: 4 },
  { label: '5星', value: 5 }
]

// ========== 潮汐提醒 ==========
const tideEnabled = ref(false)
const tideTypes = ref<string[]>(['rising'])
const tideAdvance = ref(30)

const advanceOptions = [
  { label: '15分钟', value: 15 },
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '2小时', value: 120 }
]

// ========== 初始化：从 Store 读取已有设置 ==========
function initSettings() {
  const arrival = intentsStore.arrivalIntents
  if (arrival.length > 0) {
    arrivalEnabled.value = arrival.some((i) => i.isEnabled)
    selectedSpotIds.value = arrival.filter((i) => i.spotId).map((i) => i.spotId!)
    const firstCondition = arrival[0]?.condition
    if (firstCondition?.radius) {
      arrivalRadius.value = firstCondition.radius
    }
  }

  const weather = intentsStore.weatherIntents
  if (weather.length > 0) {
    weatherEnabled.value = weather.some((i) => i.isEnabled)
    const firstCondition = weather[0]?.condition
    if (firstCondition?.threshold) {
      weatherThreshold.value = firstCondition.threshold
    }
  }

  const tide = intentsStore.tideIntents
  if (tide.length > 0) {
    tideEnabled.value = tide.some((i) => i.isEnabled)
    const firstCondition = tide[0]?.condition
    if (firstCondition?.tideTypes) {
      tideTypes.value = firstCondition.tideTypes
    }
    if (firstCondition?.advanceMinutes) {
      tideAdvance.value = firstCondition.advanceMinutes
    }
  }
}

initSettings()

// ========== 操作函数 ==========
function onArrivalToggle(e: any) {
  arrivalEnabled.value = e.detail.value
  saveArrivalSettings()
}

function toggleSpotSelection(spotId: string) {
  const idx = selectedSpotIds.value.indexOf(spotId)
  if (idx >= 0) {
    selectedSpotIds.value.splice(idx, 1)
  } else {
    selectedSpotIds.value.push(spotId)
  }
  saveArrivalSettings()
}

function setArrivalRadius(val: number) {
  arrivalRadius.value = val
  saveArrivalSettings()
}

function onWeatherToggle(e: any) {
  weatherEnabled.value = e.detail.value
  saveWeatherSettings()
}

function setWeatherThreshold(val: number) {
  weatherThreshold.value = val
  saveWeatherSettings()
}

function onTideToggle(e: any) {
  tideEnabled.value = e.detail.value
  saveTideSettings()
}

function toggleTideType(type: string) {
  const idx = tideTypes.value.indexOf(type)
  if (idx >= 0) {
    if (tideTypes.value.length > 1) {
      tideTypes.value.splice(idx, 1)
    }
  } else {
    tideTypes.value.push(type)
  }
  saveTideSettings()
}

function setTideAdvance(val: number) {
  tideAdvance.value = val
  saveTideSettings()
}

// ========== 保存函数 ==========
async function saveArrivalSettings() {
  const existing = intentsStore.arrivalIntents[0]
  const condition = {
    spotIds: selectedSpotIds.value,
    radius: arrivalRadius.value
  }

  if (existing) {
    intentsStore.updateIntent(existing.settingId, {
      isEnabled: arrivalEnabled.value,
      condition
    })
    try {
      await updateIntentApi(existing.settingId, { isEnabled: arrivalEnabled.value, condition })
    } catch (e) {
      console.error('保存到达提醒失败:', e)
    }
  } else if (arrivalEnabled.value) {
    try {
      const result = await createIntent({
        type: 'arrival',
        isEnabled: true,
        condition
      })
      intentsStore.addIntent(result)
    } catch (e) {
      console.error('创建到达提醒失败:', e)
    }
  }
}

async function saveWeatherSettings() {
  const existing = intentsStore.weatherIntents[0]
  const condition = {
    threshold: weatherThreshold.value
  }

  if (existing) {
    intentsStore.updateIntent(existing.settingId, {
      isEnabled: weatherEnabled.value,
      condition
    })
    try {
      await updateIntentApi(existing.settingId, { isEnabled: weatherEnabled.value, condition })
    } catch (e) {
      console.error('保存指数提醒失败:', e)
    }
  } else if (weatherEnabled.value) {
    try {
      const result = await createIntent({
        type: 'weather',
        isEnabled: true,
        condition
      })
      intentsStore.addIntent(result)
    } catch (e) {
      console.error('创建指数提醒失败:', e)
    }
  }
}

async function saveTideSettings() {
  const existing = intentsStore.tideIntents[0]
  const condition = {
    tideTypes: tideTypes.value,
    advanceMinutes: tideAdvance.value
  }

  if (existing) {
    intentsStore.updateIntent(existing.settingId, {
      isEnabled: tideEnabled.value,
      condition
    })
    try {
      await updateIntentApi(existing.settingId, { isEnabled: tideEnabled.value, condition })
    } catch (e) {
      console.error('保存潮汐提醒失败:', e)
    }
  } else if (tideEnabled.value) {
    try {
      const result = await createIntent({
        type: 'tide',
        isEnabled: true,
        condition
      })
      intentsStore.addIntent(result)
    } catch (e) {
      console.error('创建潮汐提醒失败:', e)
    }
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 24rpx;
}

.platform-notice {
  background-color: #fff8f0;
  border: 1rpx solid #ffe0cc;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #ff6b35;
}

.section-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.section-body {
  padding: 20rpx 28rpx 28rpx;
}

.setting-label {
  margin-top: 16rpx;
  margin-bottom: 16rpx;
}

.label-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

.spot-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.spot-check-item {
  display: flex;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  border: 2rpx solid #cccccc;
  margin-right: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background-color: #ff6b35;
    border-color: #ff6b35;
  }
}

.check-mark {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 700;
}

.spot-name {
  font-size: 28rpx;
  color: #333333;
}

.empty-tip {
  padding: 30rpx 0;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.radius-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.radius-option {
  padding: 14rpx 28rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  border: 2rpx solid transparent;

  &.active {
    background-color: #fff0e8;
    border-color: #ff6b35;
  }
}

.radius-text {
  font-size: 26rpx;
  color: #666666;

  &.active {
    color: #ff6b35;
    font-weight: 500;
  }
}

.check-row {
  display: flex;
  gap: 40rpx;
  margin-bottom: 8rpx;
}

.check-item {
  display: flex;
  align-items: center;
}

.check-label {
  font-size: 28rpx;
  color: #333333;
}
</style>
