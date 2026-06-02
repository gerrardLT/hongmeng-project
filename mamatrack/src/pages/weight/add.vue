<template>
  <view class="page">
    <!-- 当前信息显示 -->
    <view class="info-bar">
      <view class="info-item">
        <text class="info-label">孕周</text>
        <text class="info-value">{{ weekLabel }}</text>
      </view>
      <view class="info-divider" />
      <view class="info-item">
        <text class="info-label">日期</text>
        <text class="info-value">{{ today }}</text>
      </view>
    </view>

    <!-- 体重输入显示区域 -->
    <view class="weight-display">
      <view class="weight-number-area">
        <text class="weight-number">{{ displayWeight }}</text>
        <text class="weight-unit">kg</text>
      </view>
      <text class="weight-hint">输入范围 30-150 kg</text>
    </view>

    <!-- 数字键盘 -->
    <view class="keyboard">
      <view class="keyboard-row">
        <view class="key" @click="onKeyPress('1')"><text class="key-text">1</text></view>
        <view class="key" @click="onKeyPress('2')"><text class="key-text">2</text></view>
        <view class="key" @click="onKeyPress('3')"><text class="key-text">3</text></view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="onKeyPress('4')"><text class="key-text">4</text></view>
        <view class="key" @click="onKeyPress('5')"><text class="key-text">5</text></view>
        <view class="key" @click="onKeyPress('6')"><text class="key-text">6</text></view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="onKeyPress('7')"><text class="key-text">7</text></view>
        <view class="key" @click="onKeyPress('8')"><text class="key-text">8</text></view>
        <view class="key" @click="onKeyPress('9')"><text class="key-text">9</text></view>
      </view>
      <view class="keyboard-row">
        <view class="key" @click="onKeyPress('.')"><text class="key-text">.</text></view>
        <view class="key" @click="onKeyPress('0')"><text class="key-text">0</text></view>
        <view class="key key--delete" @click="onDelete"><text class="key-text">⌫</text></view>
      </view>
    </view>

    <!-- 实时计算显示 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-label">距孕前增重</text>
        <text class="stat-value" :class="{ 'stat-value--positive': gainFromPre > 0, 'stat-value--negative': gainFromPre < 0 }">
          {{ gainFromPre > 0 ? '+' : '' }}{{ gainFromPre.toFixed(1) }} kg
        </text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-label">距上次增重</text>
        <text class="stat-value" :class="{ 'stat-value--positive': gainFromLast > 0, 'stat-value--negative': gainFromLast < 0 }">
          {{ gainFromLast > 0 ? '↑' : gainFromLast < 0 ? '↓' : '→' }} {{ gainFromLast > 0 ? '+' : '' }}{{ gainFromLast.toFixed(1) }} kg
        </text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-label">增重状态</text>
        <text class="stat-value" :class="gainStatusClass">{{ gainStatusLabel }}</text>
      </view>
    </view>

    <!-- 备注输入 -->
    <view class="note-section">
      <input
        class="note-input"
        v-model="note"
        placeholder="添加备注（可选）"
        placeholder-class="input-placeholder"
      />
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="onSave">
      <text class="save-btn-text">保存</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { usePregnancyStore } from '@/store/pregnancy'
import { addWeightRecord } from '@/services/weight'
import { evaluateGainStatus } from '@/utils/pregnancy'
import { formatDate } from '@/utils/format'
import type { GainStatus } from '@/types/models'

const pregnancyStore = usePregnancyStore()

const weightStr = ref('')
const note = ref('')
const today = ref('')

onLoad(() => {
  pregnancyStore.init()
  today.value = formatDate(Date.now())
})

const displayWeight = computed(() => {
  if (!weightStr.value) return '0.0'
  return weightStr.value
})

const currentWeight = computed(() => {
  const w = parseFloat(weightStr.value)
  return isNaN(w) ? 0 : w
})

const weekLabel = computed(() => {
  const week = pregnancyStore.currentWeek.week
  const day = pregnancyStore.currentWeek.day
  if (week === 0) return '未建档'
  return `第${week}周+${day}天`
})

const gainFromPre = computed(() => {
  if (!pregnancyStore.currentProfile || currentWeight.value === 0) return 0
  return currentWeight.value - pregnancyStore.currentProfile.preWeight
})

const gainFromLast = computed(() => {
  if (currentWeight.value === 0) return 0
  const latest = pregnancyStore.latestWeight
  if (!latest) return gainFromPre.value
  return currentWeight.value - latest.weight
})

const currentGainStatus = computed<GainStatus>(() => {
  if (!pregnancyStore.currentProfile || currentWeight.value === 0) return 'normal'
  return evaluateGainStatus(gainFromPre.value, pregnancyStore.currentWeek.week, pregnancyStore.currentProfile.bmiCategory)
})

const gainStatusLabel = computed(() => {
  const map: Record<GainStatus, string> = {
    low: '偏低',
    normal: '正常',
    high: '偏高'
  }
  return map[currentGainStatus.value]
})

const gainStatusClass = computed(() => {
  const map: Record<GainStatus, string> = {
    low: 'stat-value--low',
    normal: 'stat-value--normal',
    high: 'stat-value--high'
  }
  return map[currentGainStatus.value]
})

function onKeyPress(key: string) {
  // 限制输入长度
  if (weightStr.value.length >= 6) return

  // 限制小数点后只能1位
  if (key === '.') {
    if (weightStr.value.includes('.')) return
    if (weightStr.value === '') {
      weightStr.value = '0.'
      return
    }
  }

  // 限制小数点后1位
  const dotIndex = weightStr.value.indexOf('.')
  if (dotIndex !== -1 && weightStr.value.length - dotIndex > 1) return

  // 避免前导0
  if (key === '0' && weightStr.value === '0') return
  if (key !== '.' && key !== '0' && weightStr.value === '0') {
    weightStr.value = key
    return
  }

  weightStr.value += key

  // 范围检查
  const w = parseFloat(weightStr.value)
  if (w > 150) {
    weightStr.value = '150'
  }
}

function onDelete() {
  if (weightStr.value.length === 0) return
  weightStr.value = weightStr.value.slice(0, -1)
}

function onSave() {
  const weight = parseFloat(weightStr.value)
  if (isNaN(weight) || weight < 30 || weight > 150) {
    uni.showToast({ title: '请输入有效体重（30-150kg）', icon: 'none' })
    return
  }

  if (!pregnancyStore.hasProfile) {
    uni.showToast({ title: '请先创建孕期档案', icon: 'none' })
    return
  }

  uni.showLoading({ title: '保存中...' })
  addWeightRecord({
    weight,
    date: today.value,
    note: note.value
  }).then(() => {
    uni.hideLoading()
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }).catch(() => {
    uni.hideLoading()
    uni.showToast({ title: '保存失败', icon: 'none' })
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $spacing-md;
  padding-bottom: 200rpx;
}

/* 当前信息 */
.info-bar {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.info-label {
  font-size: $font-xs;
  color: $text-hint;
  margin-bottom: 4rpx;
}

.info-value {
  font-size: $font-md;
  color: $text-primary;
  font-weight: bold;
}

.info-divider {
  width: 1rpx;
  height: 60rpx;
  background: $border-color;
}

/* 体重显示区域 */
.weight-display {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-xl $spacing-md;
  margin-bottom: $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $shadow-sm;
}

.weight-number-area {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  margin-bottom: $spacing-xs;
}

.weight-number {
  font-size: 96rpx;
  font-weight: bold;
  color: $primary-color;
  line-height: 1.1;
}

.weight-unit {
  font-size: $font-lg;
  color: $text-secondary;
  margin-left: $spacing-sm;
}

.weight-hint {
  font-size: $font-xs;
  color: $text-hint;
}

/* 数字键盘 */
.keyboard {
  margin-bottom: $spacing-md;
}

.keyboard-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.key {
  width: 30%;
  height: 88rpx;
  background: $bg-card;
  border-radius: $border-radius;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-sm;

  &:active {
    background: $bg-secondary;
  }
}

.key--delete {
  background: $bg-secondary;
}

.key-text {
  font-size: $font-xl;
  color: $text-primary;
  font-weight: bold;
}

/* 实时计算 */
.stats-section {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: $font-xs;
  color: $text-hint;
  margin-bottom: 4rpx;
}

.stat-value {
  font-size: $font-base;
  font-weight: bold;
  color: $text-primary;
}

.stat-value--positive {
  color: $warning-color;
}

.stat-value--negative {
  color: $info-color;
}

.stat-value--normal {
  color: $success-color;
}

.stat-value--low {
  color: $info-color;
}

.stat-value--high {
  color: $warning-color;
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background: $border-color;
}

/* 备注 */
.note-section {
  margin-bottom: $spacing-md;
}

.note-input {
  width: 100%;
  height: 80rpx;
  background: $bg-card;
  border-radius: $border-radius;
  padding: 0 $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
  box-shadow: $shadow-sm;
}

.input-placeholder {
  color: $text-hint;
}

/* 保存按钮 */
.save-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-md;
}

.save-btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: bold;
}
</style>
