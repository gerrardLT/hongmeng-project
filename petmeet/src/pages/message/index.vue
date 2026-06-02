<template>
  <view class="page">
    <view class="header">
      <text class="header__title">消息</text>
      <text
        v-if="notificationStore.hasUnread"
        class="header__read-all"
        @click="handleMarkAllRead"
      >
        全部已读
      </text>
      <text v-else class="header__read-all header__read-all--disabled">全部已读</text>
    </view>

    <Loading :loading="notificationStore.loading" text="加载中..." />

    <scroll-view
      v-if="!notificationStore.loading"
      class="notify-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view v-if="notificationStore.notifications.length > 0" class="notify-card">
        <NotifyItem
          v-for="item in notificationStore.notifications"
          :key="item.notificationId"
          :notification="item"
          @click="handleNotifyClick"
        />
      </view>
      <Empty
        v-else
        icon="📭"
        text="暂无新消息"
        sub-text="和宠友互动后会收到通知哦"
      />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useNotificationStore } from '@/store/notification'
import { useUserStore } from '@/store/user'
import NotifyItem from '@/components/NotifyItem.vue'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'
import type { Notification } from '@/types/models'

const notificationStore = useNotificationStore()
const userStore = useUserStore()
const refreshing = ref(false)

function loadData() {
  const userId = userStore.userInfo?.userId || 'default_user'
  notificationStore.loadNotifications(userId)
}

onShow(() => {
  loadData()
})

function onRefresh() {
  refreshing.value = true
  loadData()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

function handleMarkAllRead() {
  notificationStore.markAllAsRead()
}

function handleNotifyClick(notification: Notification) {
  // 标记为已读
  if (!notification.isRead) {
    notificationStore.markAsRead(notification.notificationId)
  }

  // 根据类型跳转
  switch (notification.type) {
    case 'new_friend':
      uni.navigateTo({
        url: `/pages/friends/detail?friendshipId=${notification.sourceUserId}`
      })
      break
    case 'new_diary':
    case 'new_reaction':
      if (notification.relatedDiaryId) {
        uni.navigateTo({
          url: `/pages/diary/detail?diaryId=${notification.relatedDiaryId}`
        })
      }
      break
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx 20rpx;
  background-color: #FFFFFF;
}

.header__title {
  font-size: 44rpx;
  font-weight: 700;
  color: #2D3436;
}

.header__read-all {
  font-size: 26rpx;
  color: #FF6B35;
}

.header__read-all--disabled {
  color: #B2BEC3;
}

.notify-list {
  height: calc(100vh - 120rpx);
}

.notify-card {
  margin: 20rpx 0;
  background-color: #FFFFFF;
  border-radius: 0;
}
</style>
