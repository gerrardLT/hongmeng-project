<template>
  <view class="page">
    <!-- 顶部区域 -->
    <view class="header">
      <text class="header-title">宠友录</text>
      <text class="header-count">共 {{ friendStore.friendCount }} 位宠友</text>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchText"
          placeholder="搜索宠物名字"
          placeholder-class="search-placeholder"
          confirm-type="search"
        />
      </view>
    </view>

    <!-- 宠友列表 -->
    <scroll-view
      class="list-area"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="filteredFriends.length > 0" class="list-container">
        <FriendItem
          v-for="item in filteredFriends"
          :key="item.friendshipId"
          :friendship="item"
          @click="goDetail(item.friendshipId)"
        />
      </view>
      <Empty
        v-else-if="!loading"
        icon="🐾"
        text="还没有宠友"
        sub-text="快去碰一碰认识新朋友吧"
      />
      <Loading :loading="loading" text="加载中..." />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useFriendStore } from '@/store/friend'
import FriendItem from '@/components/FriendItem.vue'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'

const friendStore = useFriendStore()
const searchText = ref('')
const loading = ref(false)
const refreshing = ref(false)

const filteredFriends = computed(() => {
  const keyword = searchText.value.trim().toLowerCase()
  if (!keyword) return friendStore.activeFriends
  return friendStore.activeFriends.filter(f =>
    f.friendPet.name.toLowerCase().includes(keyword)
  )
})

async function loadData() {
  loading.value = true
  try {
    friendStore.loadFriends()
  } finally {
    loading.value = false
  }
}

async function onRefresh() {
  refreshing.value = true
  try {
    friendStore.loadFriends()
  } finally {
    refreshing.value = false
  }
}

function goDetail(friendshipId: string) {
  uni.navigateTo({ url: `/pages/friends/detail?friendshipId=${friendshipId}` })
}

onMounted(() => {
  loadData()
})

onShow(() => {
  friendStore.loadFriends()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F8F9FA;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 32rpx 32rpx 16rpx;
  background-color: #fff;
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
  margin-bottom: 8rpx;
}

.header-count {
  font-size: 24rpx;
  color: #636E72;
}

.search-bar {
  padding: 0 24rpx;
  margin: 24rpx 0;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  height: 72rpx;
  background-color: #F0F0F0;
  border-radius: 36rpx;
  padding: 0 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #2D3436;
  height: 72rpx;
}

.search-placeholder {
  color: #B2BEC3;
  font-size: 28rpx;
}

.list-area {
  flex: 1;
  padding: 0 24rpx 24rpx;
}

.list-container {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
</style>
