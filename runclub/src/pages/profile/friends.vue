<template>
  <view class="page">
    <!-- 搜索框 -->
    <view class="search-bar">
      <input
        class="search-input"
        v-model="searchText"
        placeholder="搜索跑友"
        confirm-type="search"
      />
    </view>

    <!-- 跑友列表 -->
    <view v-if="loading" class="loading-wrap">
      <Loading />
    </view>
    <view v-else-if="filteredFriends.length === 0" class="empty-wrap">
      <Empty :text="searchText ? '未找到匹配的跑友' : '暂无跑友'" />
      <view v-if="!searchText" class="empty-hint">
        <text class="hint-text">使用"碰一碰"与其他跑友交换名片吧</text>
      </view>
    </view>
    <view v-else class="friend-list">
      <view
        v-for="friend in filteredFriends"
        :key="friend.friendId"
        class="friend-item"
        @click="onToggleExpand(friend.friendId)"
        @longpress="onEditRemark(friend)"
      >
        <view class="friend-row">
          <view class="friend-avatar-wrap">
            <image v-if="friend.card?.avatar" class="friend-avatar" :src="friend.card.avatar" mode="aspectFill" />
            <view v-else class="friend-avatar-placeholder">
              <text class="friend-avatar-text">{{ (friend.card?.nickname || '?').slice(0, 1) }}</text>
            </view>
          </view>
          <view class="friend-info">
            <text class="friend-name">{{ friend.card?.nickname || '未知跑友' }}</text>
            <text v-if="friend.remark" class="friend-remark">备注：{{ friend.remark }}</text>
            <text class="friend-time">{{ formatRelativeTime(friend.addedAt) }}</text>
          </view>
          <text class="expand-arrow" :class="{ expanded: expandedId === friend.friendId }">›</text>
        </view>

        <!-- 展开名片 -->
        <view v-if="expandedId === friend.friendId && friend.card" class="expand-card">
          <RunnerCardView :card="friend.card" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { getFriends, addFriendRemark, getFriendCard } from '@/services/cards'
import { formatRelativeTime } from '@/utils/format'
import type { RunnerCard } from '@/types/models'
import RunnerCardView from '@/components/RunnerCardView.vue'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'

const userStore = useUserStore()

interface FriendItem {
  friendId: string
  userId: string
  friendUserId: string
  cardId: string
  remark: string
  addedAt: number
  card?: RunnerCard
}

const friends = ref<FriendItem[]>([])
const searchText = ref('')
const expandedId = ref('')
const loading = ref(false)

const filteredFriends = computed(() => {
  if (!searchText.value.trim()) return friends.value
  const keyword = searchText.value.toLowerCase()
  return friends.value.filter((f) => {
    const name = f.card?.nickname?.toLowerCase() || ''
    const remark = f.remark?.toLowerCase() || ''
    return name.includes(keyword) || remark.includes(keyword)
  })
})

function onToggleExpand(friendId: string) {
  expandedId.value = expandedId.value === friendId ? '' : friendId
}

function onEditRemark(friend: FriendItem) {
  uni.showModal({
    title: '编辑备注',
    editable: true,
    placeholderText: '请输入备注',
    content: friend.remark || '',
    success: async (res) => {
      if (res.confirm && res.content !== undefined) {
        try {
          await addFriendRemark(friend.friendId, res.content)
          friend.remark = res.content
          uni.showToast({ title: '备注已更新', icon: 'success' })
        } catch (e) {
          uni.showToast({ title: '更新失败', icon: 'none' })
        }
      }
    }
  })
}

async function loadFriends() {
  if (!userStore.isLoggedIn) return
  loading.value = true
  try {
    const rawFriends = await getFriends(userStore.userId)
    const items: FriendItem[] = []
    for (const f of rawFriends) {
      const card = await getFriendCard(f.cardId)
      items.push({
        ...f,
        card: card || undefined
      })
    }
    friends.value = items
  } catch (e) {
    console.error('loadFriends error:', e)
  } finally {
    loading.value = false
  }
}

onShow(() => {
  loadFriends()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.search-bar {
  padding: 16rpx 24rpx;
  background: #FFFFFF;
}

.search-input {
  height: 72rpx;
  background: #F5F5F5;
  border-radius: 36rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
}

.loading-wrap {
  padding: 120rpx 0;
}

.empty-wrap {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-hint {
  margin-top: 24rpx;
}

.hint-text {
  font-size: 24rpx;
  color: #BDBDBD;
}

.friend-list {
  padding: 16rpx 24rpx;
}

.friend-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.friend-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx;
}

.friend-avatar-wrap {
  margin-right: 20rpx;
  flex-shrink: 0;
}

.friend-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
}

.friend-avatar-placeholder {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  display: flex;
  align-items: center;
  justify-content: center;
}

.friend-avatar-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 700;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #212121;
  margin-bottom: 4rpx;
}

.friend-remark {
  font-size: 22rpx;
  color: #2196F3;
  margin-bottom: 4rpx;
}

.friend-time {
  font-size: 22rpx;
  color: #BDBDBD;
}

.expand-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
  transition: transform 0.2s ease;
  &.expanded {
    transform: rotate(90deg);
  }
}

.expand-card {
  padding: 0 24rpx 24rpx;
}
</style>
