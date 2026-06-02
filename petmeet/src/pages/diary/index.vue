<template>
  <view class="diary-page">
    <NavBar title="日记" :left-icon="false" />

    <!-- 顶部筛选栏 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <view
          class="filter-item"
          :class="{ active: selectedPetId === '' }"
          @click="selectedPetId = ''"
        >
          <text class="filter-text">全部</text>
        </view>
        <view
          v-for="pet in petStore.myPets"
          :key="pet.petId"
          class="filter-item"
          :class="{ active: selectedPetId === pet.petId }"
          @click="selectedPetId = pet.petId"
        >
          <text class="filter-text">{{ pet.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 日记列表 -->
    <scroll-view
      class="diary-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <DiaryItem
        v-for="diary in filteredDiaries"
        :key="diary.diaryId"
        :diary="diary"
        :current-user-id="currentUserId"
        :current-reaction="diaryStore.getReactionByUser(diary.diaryId, currentUserId)"
        @click="onDiaryClick(diary.diaryId)"
        @reaction="(emoji) => onReaction(diary.diaryId, emoji)"
      />

      <Loading v-if="diaryStore.loading && diaryStore.feedDiaries.length === 0" loading text="加载中..." />
      <Empty
        v-if="!diaryStore.loading && filteredDiaries.length === 0"
        icon="📝"
        text="还没有日记，去发布第一篇吧"
      />
      <view v-if="!diaryStore.hasMore && filteredDiaries.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 右下角浮动按钮 -->
    <view class="fab" @click="onPublish">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onShow } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { usePetStore } from '@/store/pet'
import type { ReactionEmoji } from '@/types/models'
import NavBar from '@/components/common/NavBar.vue'
import DiaryItem from '@/components/DiaryItem.vue'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'

const diaryStore = useDiaryStore()
const petStore = usePetStore()

const selectedPetId = ref('')
const refreshing = ref(false)

const currentUserId = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
})

const filteredDiaries = computed(() => {
  if (!selectedPetId.value) {
    return diaryStore.feedDiaries
  }
  return diaryStore.feedDiaries.filter((d) => d.petId === selectedPetId.value)
})

onShow(() => {
  petStore.loadMyPets()
  diaryStore.refreshFeed()
})

function onRefresh() {
  refreshing.value = true
  diaryStore.refreshFeed()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

function onLoadMore() {
  diaryStore.loadMore()
}

function onDiaryClick(diaryId: string) {
  uni.navigateTo({
    url: `/pages/diary/detail?diaryId=${diaryId}`
  })
}

function onReaction(diaryId: string, emoji: ReactionEmoji) {
  const current = diaryStore.getReactionByUser(diaryId, currentUserId.value)
  if (current === emoji) {
    diaryStore.removeReaction(diaryId, currentUserId.value)
  } else {
    diaryStore.addReaction(diaryId, currentUserId.value, emoji)
  }
}

function onPublish() {
  uni.navigateTo({
    url: '/pages/diary/publish'
  })
}
</script>

<style scoped lang="scss">
.diary-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  display: flex;
  flex-direction: column;
}

/* 筛选栏 */
.filter-bar {
  background-color: #fff;
  padding: 16rpx 24rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-item {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 28rpx;
  background-color: #F8F9FA;

  &.active {
    background-color: #FF6B35;
  }
}

.filter-text {
  font-size: 26rpx;
  color: #636E72;

  .active & {
    color: #fff;
    font-weight: 500;
  }
}

/* 日记列表 */
.diary-list {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
}

.no-more {
  text-align: center;
  padding: 32rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #B2BEC3;
}

/* 浮动按钮 */
.fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #FF6B35;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 48rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
</style>
