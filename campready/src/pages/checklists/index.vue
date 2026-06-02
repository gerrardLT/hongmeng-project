<template>
  <view class="page">
    <!-- 状态筛选 tabs -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tabs__item"
        :class="{ 'tabs__item--active': activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <text class="tabs__text">{{ tab.label }}</text>
        <view v-if="activeTab === tab.value" class="tabs__indicator" />
      </view>
    </view>

    <!-- 清单列表 -->
    <view class="list" v-if="filteredList.length > 0">
      <ChecklistCard
        v-for="item in filteredList"
        :key="item.checklistId"
        :checklist="item"
        @click="goDetail(item.checklistId)"
      />
    </view>

    <!-- 空状态 -->
    <Empty v-else text="暂无清单" icon="📋" />

    <!-- 悬浮新建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab__icon">＋</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useChecklistsStore } from '@/store/checklists'
import type { ChecklistStatus } from '@/types/models'
import ChecklistCard from '@/components/ChecklistCard.vue'
import Empty from '@/components/common/Empty.vue'

const checklistsStore = useChecklistsStore()

const tabs = [
  { label: '全部', value: 'all' as const },
  { label: '准备中', value: 'preparing' as const },
  { label: '已完成', value: 'completed' as const },
  { label: '历史', value: 'archived' as const }
]

const activeTab = ref<'all' | ChecklistStatus>('all')

const filteredList = computed(() => {
  const list = checklistsStore.checklists
  if (activeTab.value === 'all') {
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }
  return list
    .filter(c => c.status === activeTab.value)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

onShow(() => {
  checklistsStore.init()
})

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/checklists/detail?id=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/checklists/create' })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F5F7F5;
  padding: 0 24rpx 160rpx;
}

.tabs {
  display: flex;
  padding: 24rpx 0;
  position: sticky;
  top: 0;
  background-color: #F5F7F5;
  z-index: 10;

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16rpx 0;
    position: relative;

    &--active {
      .tabs__text {
        color: #2E7D32;
        font-weight: 600;
      }
    }
  }

  &__text {
    font-size: 28rpx;
    color: #999999;
    transition: color 0.2s;
  }

  &__indicator {
    position: absolute;
    bottom: 0;
    width: 48rpx;
    height: 6rpx;
    background-color: #2E7D32;
    border-radius: 3rpx;
  }
}

.list {
  padding-top: 8rpx;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(46, 125, 50, 0.4);
  z-index: 100;

  &__icon {
    font-size: 48rpx;
    color: #ffffff;
    font-weight: 700;
    line-height: 1;
  }
}
</style>
