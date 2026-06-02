<template>
  <view class="timeline-page">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <text class="page-title">成长记录</text>
      <view class="add-btn" @click="showAddModal = true">
        <text class="add-icon">+</text>
        <text class="add-text">添加里程碑</text>
      </view>
    </view>

    <scroll-view class="timeline-scroll" scroll-y>
      <!-- 时间轴内容 -->
      <view v-if="milestones.length > 0" class="timeline-container">
        <view
          v-for="(item, index) in milestones"
          :key="item.milestoneId"
          class="timeline-node"
        >
          <!-- 左侧时间线 -->
          <view class="node-left">
            <view class="date-label">
              <text class="date-month">{{ getMonth(item.recordDate) }}</text>
              <text class="date-day">{{ getDay(item.recordDate) }}</text>
            </view>
            <view class="timeline-line-wrap">
              <view class="timeline-dot" :class="getDotClass(item.type)" />
              <view v-if="index < milestones.length - 1" class="timeline-line" />
            </view>
          </view>

          <!-- 右侧内容 -->
          <view class="node-right">
            <MilestoneCard
              :milestone="item"
              @click="onMilestoneClick(item)"
              @share="onMilestoneShare(item)"
            />
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <EmptyState
        v-else
        icon="🌱"
        title="暂无成长记录"
        description="记录宝宝的每一个重要时刻，留下珍贵的成长足迹"
        action-text="添加第一条"
        :show-action="true"
        @action="showAddModal = true"
      />
    </scroll-view>

    <!-- 添加里程碑弹窗 -->
    <view v-if="showAddModal" class="modal-mask" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加里程碑</text>
          <view class="modal-close" @click="showAddModal = false">
            <text class="close-icon">✕</text>
          </view>
        </view>

        <view class="modal-body">
          <!-- 类型选择 -->
          <view class="form-group">
            <text class="form-label">里程碑类型</text>
            <view class="type-selector">
              <view
                v-for="opt in typeOptions"
                :key="opt.value"
                class="type-option"
                :class="{ 'type-selected': formData.type === opt.value }"
                @click="formData.type = opt.value"
              >
                <text class="type-icon">{{ opt.icon }}</text>
                <text class="type-label">{{ opt.label }}</text>
              </view>
            </view>
          </view>

          <!-- 标题 -->
          <view class="form-group">
            <text class="form-label">标题</text>
            <input
              v-model="formData.title"
              class="form-input"
              placeholder="给这个时刻起个名字"
              placeholder-class="input-placeholder"
            />
          </view>

          <!-- 描述 -->
          <view class="form-group">
            <text class="form-label">描述</text>
            <textarea
              v-model="formData.description"
              class="form-textarea"
              placeholder="记录这个特别时刻的细节..."
              placeholder-class="input-placeholder"
              :maxlength="200"
            />
          </view>

          <!-- 日期 -->
          <view class="form-group">
            <text class="form-label">日期</text>
            <picker
              mode="date"
              :value="formData.recordDate"
              @change="onDateChange"
            >
              <view class="form-picker">
                <text class="picker-text">{{ formData.recordDate || '选择日期' }}</text>
                <text class="picker-arrow">›</text>
              </view>
            </picker>
          </view>
        </view>

        <view class="modal-footer">
          <view class="cancel-btn" @click="showAddModal = false">
            <text class="cancel-text">取消</text>
          </view>
          <view class="confirm-btn" @click="onAddMilestone">
            <text class="confirm-text">确认添加</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMilestones, addMilestone } from '@/services/milestone'
import { useUserStore } from '@/store/user'
import type { Milestone, MilestoneType } from '@/types/models'
import MilestoneCard from '@/components/MilestoneCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const TYPE_OPTIONS: { value: MilestoneType; icon: string; label: string }[] = [
  { value: 'first_handprint', icon: '🖐', label: '第一次手印' },
  { value: 'first_hair_cut', icon: '✂️', label: '第一次理发' },
  { value: 'first_tooth', icon: '🦷', label: '第一颗乳牙' },
  { value: 'birthday', icon: '🎂', label: '生日纪念' }
]

const userStore = useUserStore()
const milestones = ref<Milestone[]>([])
const showAddModal = ref(false)

const formData = ref({
  type: 'first_handprint' as MilestoneType,
  title: '',
  description: '',
  recordDate: ''
})

function getMonth(dateStr: string): string {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const date = new Date(dateStr)
  return months[date.getMonth()] || ''
}

function getDay(dateStr: string): string {
  const date = new Date(dateStr)
  return String(date.getDate())
}

function getDotClass(type: MilestoneType): string {
  const classMap: Record<MilestoneType, string> = {
    first_handprint: 'dot-handprint',
    first_hair_cut: 'dot-hair',
    first_tooth: 'dot-tooth',
    birthday: 'dot-birthday'
  }
  return classMap[type] || 'dot-default'
}

const typeOptions = TYPE_OPTIONS

function onDateChange(e: any) {
  formData.value.recordDate = e.detail.value
}

function loadData() {
  const userId = userStore.userId || 'default_user'
  milestones.value = getMilestones(userId)
}

function onMilestoneClick(item: Milestone) {
  uni.navigateTo({
    url: `/pages/record/share?milestoneId=${item.milestoneId}`
  })
}

function onMilestoneShare(item: Milestone) {
  uni.navigateTo({
    url: `/pages/record/share?milestoneId=${item.milestoneId}`
  })
}

function onAddMilestone() {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!formData.value.recordDate) {
    uni.showToast({ title: '请选择日期', icon: 'none' })
    return
  }

  const userId = userStore.userId || 'default_user'
  const newMilestone = addMilestone({
    userId,
    bookingId: 'booking_default',
    type: formData.value.type,
    title: formData.value.title.trim(),
    description: formData.value.description.trim(),
    recordDate: formData.value.recordDate,
    photos: []
  })

  milestones.value.unshift(newMilestone)
  showAddModal.value = false

  // 重置表单
  formData.value = {
    type: 'first_handprint',
    title: '',
    description: '',
    recordDate: ''
  }

  uni.showToast({ title: '添加成功', icon: 'success' })
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.timeline-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.top-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  background-color: $bg-card;
  border-bottom: 1rpx solid $border-color;
}

.page-title {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
}

.add-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 32rpx;
  padding: 10rpx 24rpx;
}

.add-icon {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 700;
  margin-right: 6rpx;
}

.add-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.timeline-scroll {
  flex: 1;
  padding: $spacing-md $spacing-lg;
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-node {
  display: flex;
  flex-direction: row;
}

.node-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
  flex-shrink: 0;
}

.date-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12rpx;
}

.date-month {
  font-size: 22rpx;
  color: $text-hint;
  font-weight: 500;
}

.date-day {
  font-size: 36rpx;
  color: $text-primary;
  font-weight: 700;
  line-height: 1.2;
}

.timeline-line-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.timeline-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  flex-shrink: 0;
  border: 4rpx solid #FFFFFF;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.12);
}

.dot-handprint {
  background-color: $primary;
}

.dot-hair {
  background-color: #AB47BC;
}

.dot-tooth {
  background-color: #42A5F5;
}

.dot-birthday {
  background-color: #EF5350;
}

.dot-default {
  background-color: $primary;
}

.timeline-line {
  flex: 1;
  width: 4rpx;
  background: linear-gradient(180deg, $border-color, rgba(224, 224, 224, 0.3));
  min-height: 40rpx;
}

.node-right {
  flex: 1;
  padding-left: $spacing-md;
  padding-bottom: $spacing-lg;
}

// 弹窗样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-xl $radius-xl 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-lg;
  border-bottom: 1rpx solid $border-color;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

.modal-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon {
  font-size: 28rpx;
  color: $text-hint;
}

.modal-body {
  padding: $spacing-lg;
  overflow-y: auto;
}

.form-group {
  margin-bottom: $spacing-lg;
}

.form-label {
  font-size: 26rpx;
  color: $text-secondary;
  font-weight: 600;
  margin-bottom: $spacing-sm;
  display: block;
}

.type-selector {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.type-option {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12rpx 24rpx;
  border-radius: $radius-lg;
  background-color: #F5F5F5;
  border: 2rpx solid transparent;
}

.type-selected {
  background-color: #FFF3ED;
  border-color: $primary;
}

.type-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.type-label {
  font-size: 24rpx;
  color: $text-primary;
}

.type-selected .type-label {
  color: $primary;
  font-weight: 600;
}

.form-input {
  height: 80rpx;
  background-color: #F5F5F5;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  font-size: 28rpx;
  color: $text-primary;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background-color: #F5F5F5;
  border-radius: $radius-md;
  padding: $spacing-md;
  font-size: 28rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-disabled;
}

.form-picker {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  background-color: #F5F5F5;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
}

.picker-text {
  font-size: 28rpx;
  color: $text-primary;
}

.picker-arrow {
  font-size: 28rpx;
  color: $text-hint;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  padding: $spacing-lg;
  padding-bottom: calc(#{$spacing-lg} + env(safe-area-inset-bottom));
  border-top: 1rpx solid $border-color;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  background-color: #F5F5F5;
}

.cancel-text {
  font-size: 28rpx;
  color: $text-secondary;
  font-weight: 500;
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.confirm-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
