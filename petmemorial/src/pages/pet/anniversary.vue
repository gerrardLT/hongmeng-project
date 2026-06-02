<template>
  <view class="anniversary-page">
    <!-- 头部 -->
    <view class="header">
      <text class="title">纪念日管理</text>
      <text class="subtitle" v-if="petName">{{ petName }} 的纪念日</text>
    </view>

    <!-- 纪念日列表 -->
    <view class="list-section">
      <view
        v-for="item in anniversaryList"
        :key="item.anniversaryId"
        class="anniversary-item"
      >
        <view class="item-left">
          <text class="item-icon">{{ getIcon(item.type) }}</text>
          <view class="item-info">
            <text class="item-title">{{ item.title }}</text>
            <text class="item-date">{{ item.date }}</text>
            <text class="item-days">{{ getDaysText(item.date) }}</text>
          </view>
        </view>
        <view class="item-right">
          <switch
            :checked="item.enabled"
            color="#8B5CF6"
            @change="(e: any) => toggleReminder(item, e.detail.value)"
          />
          <text
            v-if="item.type === 'custom'"
            class="delete-btn"
            @click="deleteAnniversary(item.anniversaryId)"
          >✕</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="anniversaryList.length === 0" class="empty-state">
        <text class="empty-text">暂无纪念日</text>
      </view>
    </view>

    <!-- 添加纪念日按钮 -->
    <view class="add-btn-wrap">
      <view class="add-btn" @click="showAddForm = true">
        <text class="add-icon">＋</text>
        <text class="add-text">添加纪念日</text>
      </view>
    </view>

    <!-- 添加纪念日弹窗 -->
    <view v-if="showAddForm" class="form-overlay" @click.self="showAddForm = false">
      <view class="form-box">
        <text class="form-title">添加纪念日</text>

        <view class="form-item">
          <text class="form-label">纪念日名称</text>
          <input
            v-model="newForm.title"
            class="form-input"
            placeholder="如：第一次洗澡"
            placeholder-class="input-placeholder"
          />
        </view>

        <view class="form-item">
          <text class="form-label">日期</text>
          <picker mode="date" @change="onDateChange">
            <view class="form-picker">
              <text :class="{ placeholder: !newForm.date }">{{ newForm.date || '请选择日期' }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">提前提醒</text>
          <view class="reminder-options">
            <view
              class="reminder-option"
              :class="{ active: newForm.reminderDays.includes(3) }"
              @click="toggleReminderDay(3)"
            >
              <text class="option-text">提前3天</text>
            </view>
            <view
              class="reminder-option"
              :class="{ active: newForm.reminderDays.includes(1) }"
              @click="toggleReminderDay(1)"
            >
              <text class="option-text">提前1天</text>
            </view>
          </view>
        </view>

        <view class="form-actions">
          <text class="form-cancel" @click="showAddForm = false">取消</text>
          <text class="form-confirm" @click="addAnniversary">添加</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { Anniversary, AnniversaryType } from '@/types/models'
import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'
import { getPetById } from '@/services/pet'
import { useUserStore } from '@/store/user'

const ANNIVERSARY_COLLECTION = 'anniversaries'
const userStore = useUserStore()

const petId = ref('')
const petName = ref('')
const anniversaryList = ref<Anniversary[]>([])
const showAddForm = ref(false)

const newForm = ref({
  title: '',
  date: '',
  reminderDays: [] as number[]
})

const ICON_MAP: Record<AnniversaryType, string> = {
  birthday: '🎂',
  'adopt-day': '🏠',
  'memorial-day': '🌸',
  custom: '⭐'
}

function getIcon(type: AnniversaryType) {
  return ICON_MAP[type] || '📅'
}

function getDaysText(dateStr: string): string {
  if (!dateStr) return ''
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(dateStr)
  // 计算今年的这个日期
  const thisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  if (thisYear < today) {
    thisYear.setFullYear(thisYear.getFullYear() + 1)
  }
  const diff = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '今天 🎉'
  if (diff === 1) return '明天'
  return `还有 ${diff} 天`
}

function loadAnniversaries() {
  if (!petId.value) return
  anniversaryList.value = dbQuery<Anniversary>(
    ANNIVERSARY_COLLECTION,
    (a) => a.petId === petId.value
  ).sort((a, b) => {
    // 内置的排前面
    const typeOrder: Record<AnniversaryType, number> = {
      birthday: 0,
      'adopt-day': 1,
      'memorial-day': 2,
      custom: 3
    }
    return typeOrder[a.type] - typeOrder[b.type]
  })
}

function createBuiltinAnniversaries(pet: { petId: string; userId: string; name: string; birthday: string; adoptDate: string }) {
  const existing = dbQuery<Anniversary>(ANNIVERSARY_COLLECTION, (a) => a.petId === pet.petId)
  const types = existing.map((a) => a.type)

  if (pet.birthday && !types.includes('birthday')) {
    const item: Anniversary = {
      anniversaryId: generateId(),
      petId: pet.petId,
      userId: pet.userId,
      type: 'birthday',
      title: `${pet.name} 的生日`,
      date: pet.birthday,
      reminderDays: [3, 1],
      enabled: true,
      createdAt: Date.now()
    }
    dbSet(ANNIVERSARY_COLLECTION, item.anniversaryId, item)
  }

  if (pet.adoptDate && !types.includes('adopt-day')) {
    const item: Anniversary = {
      anniversaryId: generateId(),
      petId: pet.petId,
      userId: pet.userId,
      type: 'adopt-day',
      title: `${pet.name} 的到家纪念日`,
      date: pet.adoptDate,
      reminderDays: [3, 1],
      enabled: true,
      createdAt: Date.now()
    }
    dbSet(ANNIVERSARY_COLLECTION, item.anniversaryId, item)
  }
}

onLoad((options) => {
  if (options?.petId) {
    petId.value = options.petId
    const pet = getPetById(options.petId)
    if (pet) {
      petName.value = pet.name
      createBuiltinAnniversaries(pet)
    }
    loadAnniversaries()
  }
})

function toggleReminderDay(day: number) {
  const idx = newForm.value.reminderDays.indexOf(day)
  if (idx === -1) {
    newForm.value.reminderDays.push(day)
  } else {
    newForm.value.reminderDays.splice(idx, 1)
  }
}

function onDateChange(e: any) {
  newForm.value.date = e.detail.value
}

function addAnniversary() {
  if (!newForm.value.title.trim()) {
    uni.showToast({ title: '请输入纪念日名称', icon: 'none' })
    return
  }
  if (!newForm.value.date) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }

  const item: Anniversary = {
    anniversaryId: generateId(),
    petId: petId.value,
    userId: userStore.userId,
    type: 'custom',
    title: newForm.value.title.trim(),
    date: newForm.value.date,
    reminderDays: newForm.value.reminderDays,
    enabled: true,
    createdAt: Date.now()
  }

  dbSet(ANNIVERSARY_COLLECTION, item.anniversaryId, item)
  loadAnniversaries()

  newForm.value = { title: '', date: '', reminderDays: [] }
  showAddForm.value = false
  uni.showToast({ title: '添加成功', icon: 'success' })
}

function toggleReminder(item: Anniversary, enabled: boolean) {
  const updated = { ...item, enabled }
  dbSet(ANNIVERSARY_COLLECTION, item.anniversaryId, updated)
  const idx = anniversaryList.value.findIndex((a) => a.anniversaryId === item.anniversaryId)
  if (idx !== -1) anniversaryList.value[idx] = updated
}

function deleteAnniversary(anniversaryId: string) {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这个纪念日吗？',
    success: (res) => {
      if (res.confirm) {
        dbDelete(ANNIVERSARY_COLLECTION, anniversaryId)
        loadAnniversaries()
        uni.showToast({ title: '已删除', icon: 'success' })
      }
    }
  })
}
</script>

<style scoped lang="scss">
.anniversary-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 180rpx;
}

.header {
  padding: $spacing-xl $spacing-xl $spacing-md;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 0 0 $radius-xl $radius-xl;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
  margin-bottom: $spacing-xs;
}

.subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.list-section {
  margin: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.anniversary-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.item-left {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.item-icon {
  font-size: 40rpx;
  margin-right: $spacing-md;
  flex-shrink: 0;
}

.item-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.item-title {
  font-size: 28rpx;
  color: $text-primary;
  font-weight: 500;
}

.item-date {
  font-size: 24rpx;
  color: $text-secondary;
  margin-top: 4rpx;
}

.item-days {
  font-size: 22rpx;
  color: $primary;
  margin-top: 4rpx;
}

.item-right {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.delete-btn {
  font-size: 28rpx;
  color: $text-hint;
  padding: 8rpx;
}

.empty-state {
  padding: $spacing-xl;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 28rpx;
  color: $text-hint;
}

.add-btn-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-xl;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  gap: $spacing-xs;
}

.add-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.add-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

// 弹窗表单
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.form-box {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  padding: $spacing-xl $spacing-xl;
  padding-bottom: calc(#{$spacing-xl} + env(safe-area-inset-bottom));
}

.form-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: $spacing-lg;
  text-align: center;
}

.form-item {
  margin-bottom: $spacing-md;
}

.form-label {
  font-size: 26rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: $spacing-xs;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-hint;
}

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  padding: 0 $spacing-md;

  text {
    font-size: 28rpx;
    color: $text-primary;

    &.placeholder {
      color: $text-hint;
    }
  }
}

.picker-arrow {
  font-size: 32rpx;
  color: $text-hint;
}

.reminder-options {
  display: flex;
  gap: $spacing-sm;
}

.reminder-option {
  flex: 1;
  height: 72rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    border-color: $primary;
    background-color: rgba(139, 92, 246, 0.08);
  }
}

.option-text {
  font-size: 26rpx;
  color: $text-primary;
}

.reminder-option.active .option-text {
  color: $primary;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-lg;
}

.form-cancel {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: $bg-page;
  border-radius: 44rpx;
  font-size: 30rpx;
  color: $text-secondary;
}

.form-confirm {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
