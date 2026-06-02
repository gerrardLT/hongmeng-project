<template>
  <view class="page">
    <!-- 顶部Tab切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <text class="tab-text" :class="{ active: activeTab === tab.value }">{{ tab.label }}</text>
        <view v-if="activeTab === tab.value" class="tab-indicator" />
      </view>
    </view>

    <!-- 活动列表 -->
    <view class="list-container">
      <view v-if="filteredActivities.length > 0" class="activity-list">
        <ActivityCard
          v-for="item in filteredActivities"
          :key="item.activityId"
          :activity="item"
          @click="goDetail"
        />
      </view>
      <Empty
        v-else
        icon="📅"
        text="暂无活动"
        action-text="创建活动"
        @action="goCreate"
      />
    </view>

    <!-- 浮动创建按钮 -->
    <view class="fab" @click="goCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useActivityStore } from '@/store/activity'
import ActivityCard from '@/components/ActivityCard.vue'
import Empty from '@/components/common/Empty.vue'

const activityStore = useActivityStore()
const activeTab = ref('all')

const tabs = [
  { label: '全部', value: 'all' },
  { label: '即将开始', value: 'upcoming' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'completed' }
]

const filteredActivities = computed(() => {
  if (activeTab.value === 'all') return activityStore.activities
  if (activeTab.value === 'upcoming') return activityStore.upcomingActivities
  if (activeTab.value === 'ongoing') return activityStore.ongoingActivities
  if (activeTab.value === 'completed') return activityStore.completedActivities
  return activityStore.activities
})

onShow(() => {
  activityStore.loadActivities()
})

onPullDownRefresh(async () => {
  await activityStore.loadActivities()
  uni.stopPullDownRefresh()
})

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/activities/detail?activityId=${id}` })
}

function goCreate() {
  uni.navigateTo({ url: '/pages/activities/create' })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 120rpx;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  padding: 0 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 20rpx;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #999999;
  font-weight: 400;
}

.tab-text.active {
  color: #FF5722;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  background: #FF5722;
  border-radius: 3rpx;
}

.list-container {
  padding: 24rpx;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 180rpx;
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 34, 0.4);
  z-index: 20;
}

.fab-icon {
  font-size: 48rpx;
  color: #FFFFFF;
  font-weight: 300;
  line-height: 1;
}
</style>
