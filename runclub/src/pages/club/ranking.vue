<template>
  <view class="page">
    <!-- 顶部Tab -->
    <view class="tab-bar">
      <view
        v-for="tab in rankTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text" :class="{ active: activeTab === tab.value }">{{ tab.label }}</text>
        <view v-if="activeTab === tab.value" class="tab-indicator" />
      </view>
    </view>

    <!-- 排名列表 -->
    <view class="ranking-list">
      <view v-if="currentRankings.length > 0">
        <RankingItem
          v-for="(item, index) in currentRankings"
          :key="item.userId"
          :rank="index + 1"
          :nickname="item.nickname"
          :avatar="item.avatar"
          :value="formatRankValue(item.value)"
          :unit="currentUnit"
          :is-me="item.userId === userStore.userId"
        />
      </view>
      <Empty v-else icon="🏆" text="暂无排名数据" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useClubStore } from '@/store/club'
import { useUserStore } from '@/store/user'
import RankingItem from '@/components/RankingItem.vue'
import Empty from '@/components/common/Empty.vue'
import type { RankingType } from '@/types/models'

const clubStore = useClubStore()
const userStore = useUserStore()
const activeTab = ref<RankingType>('monthly_distance')

const rankTabs = [
  { label: '月跑量', value: 'monthly_distance' as RankingType },
  { label: '参与次数', value: 'participation' as RankingType },
  { label: '平均配速', value: 'avg_pace' as RankingType },
  { label: '总里程', value: 'total_distance' as RankingType }
]

const unitMap: Record<RankingType, string> = {
  monthly_distance: 'km',
  participation: '次',
  avg_pace: '/km',
  total_distance: 'km'
}

const currentRankings = computed(() => clubStore.rankings[activeTab.value] || [])
const currentUnit = computed(() => unitMap[activeTab.value])

onLoad(() => {
  clubStore.loadRankings(activeTab.value)
})

function switchTab(tab: RankingType) {
  activeTab.value = tab
  clubStore.loadRankings(tab)
}

function formatRankValue(value: number): string {
  if (activeTab.value === 'avg_pace') {
    const minutes = Math.floor(value / 60)
    const seconds = Math.round(value % 60)
    return `${minutes}'${String(seconds).padStart(2, '0')}"`
  }
  if (activeTab.value === 'participation') {
    return String(value)
  }
  return value.toFixed(1)
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  padding: 0 8rpx;
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
  font-size: 26rpx;
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

.ranking-list {
  padding: 16rpx 0;
}
</style>
