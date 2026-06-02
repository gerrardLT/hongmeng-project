<template>
  <view class="page">
    <!-- 基本信息 -->
    <view class="section">
      <text class="section-title">基本信息</text>
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">产检日期</text>
          <picker mode="date" :value="form.date" @change="onDateChange">
            <text class="form-value">{{ form.date }} ›</text>
          </picker>
        </view>
        <view class="form-item">
          <text class="form-label">当前孕周</text>
          <text class="form-value form-value--static">{{ weekLabel }}</text>
        </view>
      </view>
    </view>

    <!-- 检查指标 -->
    <view class="section">
      <text class="section-title">检查指标（均为可选）</text>
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">体重(kg)</text>
          <input
            class="form-input"
            v-model="form.weight"
            type="digit"
            placeholder="输入体重"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">血压</text>
          <view class="bp-row">
            <input
              class="form-input form-input--small"
              v-model="form.bloodPressureHigh"
              type="digit"
              placeholder="收缩压"
              placeholder-class="input-placeholder"
            />
            <text class="bp-divider">/</text>
            <input
              class="form-input form-input--small"
              v-model="form.bloodPressureLow"
              type="digit"
              placeholder="舒张压"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
        <view class="form-item">
          <text class="form-label">宫高(cm)</text>
          <input
            class="form-input"
            v-model="form.fundalHeight"
            type="digit"
            placeholder="输入宫高"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">腹围(cm)</text>
          <input
            class="form-input"
            v-model="form.abdominalCircumference"
            type="digit"
            placeholder="输入腹围"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="form-item">
          <text class="form-label">胎心率(次/分)</text>
          <input
            class="form-input"
            v-model="form.fetalHeartRate"
            type="digit"
            placeholder="输入胎心率"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="section">
      <text class="section-title">备注</text>
      <view class="form-card">
        <textarea
          class="form-textarea"
          v-model="form.note"
          placeholder="记录产检情况..."
          placeholder-class="input-placeholder"
          :maxlength="500"
        />
      </view>
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
import { calculateWeekForDate } from '@/utils/pregnancy'
import { formatDate } from '@/utils/format'
import { dbSet, generateId } from '@/utils/db'
import type { CheckupRecord } from '@/types/models'

const pregnancyStore = usePregnancyStore()

const form = ref({
  date: '',
  weight: '',
  bloodPressureHigh: '',
  bloodPressureLow: '',
  fundalHeight: '',
  abdominalCircumference: '',
  fetalHeartRate: '',
  note: ''
})

const weekLabel = computed(() => {
  if (!pregnancyStore.currentProfile || !form.value.date) return '自动计算'
  const { week, day } = calculateWeekForDate(form.value.date, pregnancyStore.currentProfile.dueDate)
  if (week === 0) return '未建档'
  return `第${week}周+${day}天`
})

onLoad(() => {
  pregnancyStore.init()
  form.value.date = formatDate(Date.now())
})

function onDateChange(e: any) {
  form.value.date = e.detail.value
}

function onSave() {
  if (!form.value.date) {
    uni.showToast({ title: '请选择产检日期', icon: 'none' })
    return
  }

  if (!pregnancyStore.hasProfile) {
    uni.showToast({ title: '请先创建孕期档案', icon: 'none' })
    return
  }

  const profile = pregnancyStore.currentProfile!
  const { week, day: weekDay } = calculateWeekForDate(form.value.date, profile.dueDate)

  // 构建产检记录
  const record: CheckupRecord = {
    checkupId: generateId(),
    profileId: profile.profileId,
    date: form.value.date,
    week,
    weight: form.value.weight ? parseFloat(form.value.weight) : 0,
    note: form.value.note || '',
    createdAt: Date.now()
  }

  // 可选指标
  if (form.value.bloodPressureHigh) {
    record.bloodPressureHigh = parseInt(form.value.bloodPressureHigh)
  }
  if (form.value.bloodPressureLow) {
    record.bloodPressureLow = parseInt(form.value.bloodPressureLow)
  }
  if (form.value.fundalHeight) {
    record.fundalHeight = parseFloat(form.value.fundalHeight)
  }
  if (form.value.abdominalCircumference) {
    record.abdominalCircumference = parseFloat(form.value.abdominalCircumference)
  }
  if (form.value.fetalHeartRate) {
    record.fetalHeartRate = parseInt(form.value.fetalHeartRate)
  }

  // 保存到本地存储
  dbSet('checkup_records', record.checkupId, record)

  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $spacing-md;
  padding-bottom: 200rpx;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  margin-left: $spacing-xs;
}

.form-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.form-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx $spacing-md;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  font-size: $font-md;
  color: $text-primary;
  flex-shrink: 0;
  width: 200rpx;
}

.form-value {
  font-size: $font-md;
  color: $text-secondary;
}

.form-value--static {
  color: $primary-color;
  font-weight: bold;
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: $font-md;
  color: $text-primary;
  height: 48rpx;
}

.form-input--small {
  width: 140rpx;
  flex: none;
  text-align: center;
}

.bp-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.bp-divider {
  font-size: $font-lg;
  color: $text-hint;
  margin: 0 8rpx;
}

.input-placeholder {
  color: $text-hint;
  font-size: $font-sm;
}

.form-textarea {
  width: 100%;
  height: 200rpx;
  padding: $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
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
