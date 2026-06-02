<template>
  <view class="setup-page safe-bottom">
    <view class="setup-header">
      <text class="setup-title">创建孕期档案</text>
      <text class="setup-subtitle">填写基础信息，开启孕期记录之旅</text>
    </view>

    <view class="form-card">
      <!-- 身高 -->
      <view class="form-item">
        <text class="form-label">身高</text>
        <view class="form-input-wrap">
          <input
            v-model="form.height"
            class="form-input"
            type="digit"
            placeholder="请输入身高"
            placeholder-class="placeholder"
            @blur="onCalc"
          />
          <text class="form-unit">cm</text>
        </view>
      </view>

      <!-- 孕前体重 -->
      <view class="form-item">
        <text class="form-label">孕前体重</text>
        <view class="form-input-wrap">
          <input
            v-model="form.preWeight"
            class="form-input"
            type="digit"
            placeholder="请输入孕前体重"
            placeholder-class="placeholder"
            @blur="onCalc"
          />
          <text class="form-unit">kg</text>
        </view>
      </view>

      <!-- 预产期 -->
      <view class="form-item">
        <text class="form-label">预产期</text>
        <picker mode="date" :value="form.dueDate" :start="minDueDate" :end="maxDueDate" @change="onDueDateChange">
          <view class="form-picker" :class="{ 'form-picker--empty': !form.dueDate }">
            <text>{{ form.dueDate || '请选择预产期' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 实时计算结果 -->
    <view v-if="showResult" class="result-card">
      <view class="result-row">
        <text class="result-label">BMI</text>
        <text class="result-value">{{ bmi }}</text>
        <text class="result-tag" :class="`result-tag--${bmiCategory}`">{{ bmiCategoryText }}</text>
      </view>
      <view class="result-row">
        <text class="result-label">建议总增重</text>
        <text class="result-value">{{ gainRange }}</text>
      </view>
      <view class="result-row">
        <text class="result-label">建议每周增重</text>
        <text class="result-value">{{ weeklyGainRange }}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-wrap">
      <view class="btn-submit" @click="handleSubmit">
        <text class="btn-submit-text">开始记录</text>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="footer-tip">
      <text class="footer-tip-text">以上数据仅供参考，不构成医疗建议</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { usePregnancyStore } from '@/store/pregnancy'
import { calculateBMI, getBMICategory, getRecommendedGainRange, getWeeklyGainRange } from '@/utils/pregnancy'
import type { BMICategory } from '@/types/models'

const userStore = useUserStore()
const pregnancyStore = usePregnancyStore()

const form = ref({
  height: '',
  preWeight: '',
  dueDate: ''
})

const bmi = ref(0)
const bmiCategory = ref<BMICategory>('normal')

const bmiCategoryText = computed(() => {
  const map: Record<BMICategory, string> = {
    underweight: '偏瘦',
    normal: '正常',
    overweight: '偏胖',
    obese: '肥胖'
  }
  return map[bmiCategory.value]
})

const gainRange = computed(() => {
  if (!showResult.value) return ''
  const range = getRecommendedGainRange(bmiCategory.value)
  return `${range.min} - ${range.max} kg`
})

const weeklyGainRange = computed(() => {
  if (!showResult.value) return ''
  const range = getWeeklyGainRange(bmiCategory.value)
  return `${range.min} - ${range.max} kg`
})

const showResult = computed(() => {
  const h = parseFloat(form.value.height)
  const w = parseFloat(form.value.preWeight)
  return h > 0 && w > 0 && bmi.value > 0
})

// 预产期范围：今天 ~ 今天+280天
const today = new Date()
const minDueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 14) // 至少14天后
  return formatDate(d)
})
const maxDueDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 300)
  return formatDate(d)
})

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function onCalc() {
  const h = parseFloat(form.value.height)
  const w = parseFloat(form.value.preWeight)
  if (h > 0 && w > 0) {
    bmi.value = calculateBMI(h, w)
    bmiCategory.value = getBMICategory(bmi.value)
  }
}

function onDueDateChange(e: any) {
  form.value.dueDate = e.detail.value
}

function validate(): boolean {
  const h = parseFloat(form.value.height)
  const w = parseFloat(form.value.preWeight)

  if (!h || h < 140 || h > 200) {
    uni.showToast({ title: '请输入正确的身高（140-200cm）', icon: 'none' })
    return false
  }
  if (!w || w < 30 || w > 150) {
    uni.showToast({ title: '请输入正确的体重（30-150kg）', icon: 'none' })
    return false
  }
  if (!form.value.dueDate) {
    uni.showToast({ title: '请选择预产期', icon: 'none' })
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return

  const height = parseFloat(form.value.height)
  const preWeight = parseFloat(form.value.preWeight)
  const dueDate = form.value.dueDate

  const bmiVal = calculateBMI(height, preWeight)
  const category = getBMICategory(bmiVal)
  const recGain = getRecommendedGainRange(category)

  try {
    pregnancyStore.createProfile({
      userId: userStore.userId || `local_${Date.now()}`,
      height,
      preWeight,
      preBMI: bmiVal,
      bmiCategory: category,
      dueDate,
      startDate: formatDate(new Date()),
      targetGainMin: recGain.min,
      targetGainMax: recGain.max,
      status: 'active'
    })

    uni.showToast({ title: '档案创建成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 800)
  } catch (e) {
    uni.showToast({ title: '创建失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.setup-page {
  min-height: 100vh;
  background: $bg-page;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
}

.setup-header {
  margin-bottom: 48rpx;
}

.setup-title {
  display: block;
  font-size: $font-title;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 12rpx;
}

.setup-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.form-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: 8rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: $shadow-sm;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 100rpx;
  border-bottom: 1rpx solid $border-color;
  padding: 16rpx 0;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: $font-md;
  color: $text-primary;
  width: 160rpx;
  flex-shrink: 0;
}

.form-input-wrap {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  height: 60rpx;
}

.placeholder {
  color: $text-hint;
}

.form-unit {
  font-size: $font-md;
  color: $text-hint;
  margin-left: 8rpx;
}

.form-picker {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 60rpx;

  &--empty {
    color: $text-hint;
  }
}

.picker-arrow {
  color: $text-hint;
  font-size: 32rpx;
}

.result-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: 24rpx 32rpx;
  margin-bottom: 48rpx;
  box-shadow: $shadow-sm;
}

.result-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.result-label {
  font-size: $font-md;
  color: $text-secondary;
  width: 200rpx;
  flex-shrink: 0;
}

.result-value {
  flex: 1;
  font-size: $font-lg;
  color: $text-primary;
  font-weight: 600;
}

.result-tag {
  font-size: $font-sm;
  padding: 4rpx 16rpx;
  border-radius: $border-radius-sm;
  font-weight: 500;

  &--underweight {
    background: #E3F2FD;
    color: #2196F3;
  }

  &--normal {
    background: #E8F5E9;
    color: #4CAF50;
  }

  &--overweight {
    background: #FFF3E0;
    color: #FF9800;
  }

  &--obese {
    background: #FFEBEE;
    color: #F44336;
  }
}

.submit-wrap {
  margin-bottom: 24rpx;
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(233, 30, 140, 0.3);
}

.btn-submit-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 700;
}

.footer-tip {
  text-align: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.footer-tip-text {
  font-size: $font-sm;
  color: $text-hint;
}
</style>
