<template>
  <view class="page" v-if="checklist">
    <!-- 顶部信息 -->
    <view class="header">
      <text class="header__name">{{ checklist.name }}</text>
      <view class="header__meta">
        <text class="header__date">{{ formatDate(checklist.campingDate, 'YYYY-MM-DD') }}</text>
        <text class="header__countdown" :class="countdownClass">{{ countdownText }}</text>
      </view>
    </view>

    <!-- 进度区域 -->
    <view class="progress-section">
      <ProgressRing :percent="progress" :size="160" :stroke-width="10" />
      <view class="progress-section__info">
        <text class="progress-section__text">已准备 {{ checkedCount }}/{{ checklist.items.length }} 件</text>
        <text class="progress-section__weight">总重量 {{ formatWeightGram(checklist.totalWeight, 'kg') }}</text>
      </view>
    </view>

    <!-- 分类重量占比 -->
    <view v-if="weightBarData.length > 0" class="weight-section">
      <text class="section-title">重量分布</text>
      <WeightBar :data="weightBarData" />
    </view>

    <!-- 未准备装备 -->
    <view v-if="uncheckedItems.length > 0" class="items-section">
      <text class="section-title">未准备（{{ uncheckedItems.length }}）</text>
      <view
        v-for="item in uncheckedItems"
        :key="item.itemId"
        class="item-row"
        @click="toggleItem(item.itemId)"
      >
        <view class="item-row__check">
          <view class="item-row__checkbox" />
        </view>
        <view class="item-row__content">
          <view class="item-row__top">
            <text class="item-row__name">{{ item.name }}</text>
            <CategoryTag :category="item.category" />
          </view>
          <view class="item-row__bottom">
            <text class="item-row__weight">{{ formatWeightGram(item.weight, 'kg') }}</text>
            <text v-if="item.quantity > 1" class="item-row__qty">×{{ item.quantity }}</text>
            <text v-if="item.note" class="item-row__note">{{ item.note }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已准备装备 -->
    <view v-if="checkedItems.length > 0" class="items-section">
      <text class="section-title section-title--done">已准备（{{ checkedItems.length }}）</text>
      <view
        v-for="item in checkedItems"
        :key="item.itemId"
        class="item-row item-row--checked"
        @click="toggleItem(item.itemId)"
      >
        <view class="item-row__check">
          <view class="item-row__checkbox item-row__checkbox--checked">
            <text class="item-row__checkmark">✓</text>
          </view>
        </view>
        <view class="item-row__content">
          <view class="item-row__top">
            <text class="item-row__name item-row__name--checked">{{ item.name }}</text>
            <CategoryTag :category="item.category" />
          </view>
          <view class="item-row__bottom">
            <text class="item-row__weight">{{ formatWeightGram(item.weight, 'kg') }}</text>
            <text v-if="item.quantity > 1" class="item-row__qty">×{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 全部勾选后显示完成按钮 -->
    <view v-if="allChecked && checklist.status === 'preparing'" class="complete-section">
      <view class="btn btn--success" @click="markComplete">
        <text class="btn__text">🎉 标记为已完成</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-bar__item" @click="editChecklist">
        <text class="action-bar__icon">✏️</text>
        <text class="action-bar__label">编辑</text>
      </view>
      <view class="action-bar__item" @click="duplicateChecklist">
        <text class="action-bar__icon">📋</text>
        <text class="action-bar__label">复制</text>
      </view>
      <view class="action-bar__item" @click="shareChecklist">
        <text class="action-bar__icon">🔗</text>
        <text class="action-bar__label">分享</text>
      </view>
      <view class="action-bar__item" @click="deleteChecklist">
        <text class="action-bar__icon">🗑️</text>
        <text class="action-bar__label">删除</text>
      </view>
    </view>
  </view>

  <view v-else class="page">
    <Empty text="清单不存在" icon="❌" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { GearCategory } from '@/types/models'
import { GEAR_CATEGORY_MAP } from '@/types/models'
import { useChecklistsStore } from '@/store/checklists'
import { formatDate, formatWeightGram, getDaysUntil, calcProgress } from '@/utils/format'
import ProgressRing from '@/components/ProgressRing.vue'
import WeightBar from '@/components/WeightBar.vue'
import CategoryTag from '@/components/CategoryTag.vue'
import Empty from '@/components/common/Empty.vue'

const checklistsStore = useChecklistsStore()
const checklistId = ref('')

onLoad((options) => {
  checklistsStore.init()
  if (options?.id) {
    checklistId.value = options.id
    checklistsStore.currentId = options.id
  }
})

const checklist = computed(() => checklistsStore.currentChecklist)

const progress = computed(() => {
  if (!checklist.value) return 0
  return calcProgress(checklist.value.items)
})

const checkedCount = computed(() =>
  checklist.value?.items.filter(i => i.isChecked).length || 0
)

const uncheckedItems = computed(() =>
  checklist.value?.items.filter(i => !i.isChecked) || []
)

const checkedItems = computed(() =>
  checklist.value?.items.filter(i => i.isChecked) || []
)

const allChecked = computed(() => {
  if (!checklist.value || checklist.value.items.length === 0) return false
  return checklist.value.items.every(i => i.isChecked)
})

const daysUntil = computed(() => {
  if (!checklist.value) return 0
  return getDaysUntil(checklist.value.campingDate)
})

const countdownText = computed(() => {
  const days = daysUntil.value
  if (days > 0) return `还有${days}天`
  if (days === 0) return '就是今天'
  return '已过期'
})

const countdownClass = computed(() => {
  if (daysUntil.value < 0) return 'header__countdown--expired'
  if (daysUntil.value <= 3) return 'header__countdown--soon'
  return ''
})

const weightBarData = computed(() => {
  if (!checklist.value) return []
  const map = new Map<GearCategory, number>()
  checklist.value.items.forEach(item => {
    const w = (map.get(item.category) || 0) + item.weight * item.quantity
    map.set(item.category, w)
  })
  return Array.from(map.entries())
    .map(([category, weight]) => ({
      category,
      weight,
      label: GEAR_CATEGORY_MAP[category] || '其他'
    }))
    .sort((a, b) => b.weight - a.weight)
})

function toggleItem(itemId: string) {
  if (!checklist.value) return
  checklistsStore.toggleItem(checklist.value.checklistId, itemId)
  // 更新总重量
  const total = checklist.value.items.reduce((sum, i) => sum + i.weight * i.quantity, 0)
  checklistsStore.updateChecklist(checklist.value.checklistId, { totalWeight: total })
}

function markComplete() {
  if (!checklist.value) return
  checklistsStore.completeChecklist(checklist.value.checklistId)
  uni.showToast({ title: '已标记为完成！', icon: 'success' })
}

function editChecklist() {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

function duplicateChecklist() {
  if (!checklist.value) return
  const newCl = checklistsStore.duplicateChecklist(checklist.value.checklistId)
  if (newCl) {
    uni.showToast({ title: '已复制清单', icon: 'success' })
  }
}

function shareChecklist() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function deleteChecklist() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除吗？',
    confirmColor: '#F44336',
    success: (res) => {
      if (res.confirm && checklist.value) {
        checklistsStore.deleteChecklist(checklist.value.checklistId)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => uni.navigateBack(), 800)
      }
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F5F7F5;
  padding: 24rpx 24rpx 200rpx;
}

.header {
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  margin-bottom: 28rpx;

  &__name {
    font-size: 36rpx;
    font-weight: 700;
    color: #ffffff;
    display: block;
    margin-bottom: 12rpx;
  }

  &__meta {
    display: flex;
    align-items: center;
  }

  &__date {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.85);
    margin-right: 20rpx;
  }

  &__countdown {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;

    &--expired {
      color: #FFCDD2;
    }

    &--soon {
      color: #FFE082;
    }
  }
}

.progress-section {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  &__info {
    flex: 1;
    margin-left: 32rpx;
  }

  &__text {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    display: block;
    margin-bottom: 8rpx;
  }

  &__weight {
    font-size: 26rpx;
    color: #999999;
  }
}

.weight-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;

  &--done {
    color: #999999;
  }
}

.items-section {
  margin-bottom: 24rpx;
}

.item-row {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 10rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.04);

  &--checked {
    opacity: 0.7;
  }

  &__check {
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  &__checkbox {
    width: 44rpx;
    height: 44rpx;
    border: 3rpx solid #CCCCCC;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &--checked {
      background-color: #2E7D32;
      border-color: #2E7D32;
    }
  }

  &__checkmark {
    font-size: 24rpx;
    color: #ffffff;
    font-weight: 700;
  }

  &__content {
    flex: 1;
    overflow: hidden;
  }

  &__top {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  &__name {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
    margin-right: 12rpx;

    &--checked {
      text-decoration: line-through;
      color: #999999;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
  }

  &__weight {
    font-size: 24rpx;
    color: #999999;
  }

  &__qty {
    font-size: 24rpx;
    color: #999999;
    margin-left: 12rpx;
  }

  &__note {
    font-size: 22rpx;
    color: #BBBBBB;
    margin-left: 16rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.complete-section {
  margin: 32rpx 0;
}

.btn {
  height: 88rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &--success {
    background: linear-gradient(135deg, #2E7D32, #4CAF50);
  }

  &__text {
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
  }
}

.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  background-color: #ffffff;
  padding: 20rpx 0;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__icon {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }

  &__label {
    font-size: 22rpx;
    color: #666666;
  }
}
</style>
