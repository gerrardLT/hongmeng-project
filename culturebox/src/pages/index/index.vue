<template>
  <view class="page">
    <!-- 顶部统计概览 -->
    <view class="stats-section">
      <StatsCard
        :total-books="entryStore.bookCount"
        :total-movies="entryStore.movieCount"
        :total-podcasts="entryStore.podcastCount"
        :total-exhibitions="entryStore.exhibitionCount"
      />
    </view>

    <!-- 视图切换 Tab -->
    <view class="tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="onTabChange(tab.value)"
      >
        <text class="tab-text" :class="{ 'tab-text-active': currentTab === tab.value }">
          {{ tab.label }}
        </text>
      </view>
    </view>

    <!-- 条目列表 -->
    <scroll-view
      class="list-area"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="filteredList.length > 0" class="entry-list">
        <EntryCard
          v-for="entry in filteredList"
          :key="entry.entryId"
          :entry="entry"
          @click="onEntryClick"
        />
      </view>
      <Empty
        v-else
        icon="📚"
        text="还没有记录，点击下方按钮添加吧"
      />
    </scroll-view>

    <!-- 浮动添加按钮 -->
    <view class="fab" @click="onAddEntry">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useEntryStore } from '@/store/entry'
import StatsCard from '@/components/StatsCard.vue'
import EntryCard from '@/components/EntryCard.vue'
import Empty from '@/components/common/Empty.vue'
import type { EntryType } from '@/types/models'

const entryStore = useEntryStore()

const isRefreshing = ref(false)

type TabValue = 'all' | EntryType

interface Tab {
  label: string
  value: TabValue
}

const tabs: Tab[] = [
  { label: '时间线', value: 'all' },
  { label: '书', value: 'book' },
  { label: '电影', value: 'movie' },
  { label: '播客', value: 'podcast' },
  { label: '展览', value: 'exhibition' }
]

const currentTab = ref<TabValue>('all')

const filteredList = computed(() => {
  if (currentTab.value === 'all') {
    return entryStore.sortedEntries
  }
  return entryStore.entriesByType(currentTab.value as EntryType)
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
})

function onTabChange(value: TabValue) {
  currentTab.value = value
}

function onRefresh() {
  isRefreshing.value = true
  entryStore.init()
  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}

function onEntryClick(entryId: string) {
  uni.navigateTo({ url: `/pages/entry/detail?id=${entryId}` })
}

function onAddEntry() {
  uni.navigateTo({ url: '/pages/entry/add' })
}

onShow(() => {
  entryStore.init()
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
}

.stats-section {
  padding: $spacing-md $spacing-md 0;
}

.tabs {
  display: flex;
  flex-direction: row;
  padding: $spacing-md;
  gap: $spacing-xs;
}

.tab-item {
  padding: $spacing-xs $spacing-md;
  border-radius: $radius-pill;
  background-color: $bg-card;
  transition: background-color $transition-fast;
}

.tab-item.active {
  background-color: $primary-color;
}

.tab-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.tab-text-active {
  color: #FFFFFF;
}

.list-area {
  flex: 1;
  padding: 0 $spacing-md;
}

.entry-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  padding-bottom: 140rpx;
}

.fab {
  position: fixed;
  right: $spacing-lg;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background-color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $shadow-lg;
  z-index: 100;
}

.fab-icon {
  font-size: 52rpx;
  color: #FFFFFF;
  line-height: 1;
  font-weight: 300;
}
</style>
