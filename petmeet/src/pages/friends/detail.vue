<template>
  <view class="page">
    <!-- 导航栏 -->
    <NavBar
      title="宠友详情"
      :left-icon="true"
      right-text="···"
      @right-click="onMoreClick"
    />

    <scroll-view scroll-y class="content">
      <!-- 宠物名片 -->
      <view v-if="friendship" class="card pet-card-wrap">
        <PetCard :pet="friendship.friendPet" size="large" />
      </view>

      <!-- 相遇信息 -->
      <view v-if="friendship" class="card meet-card">
        <text class="card-title">相遇信息</text>
        <view class="meet-row">
          <text class="meet-label">相遇时间</text>
          <text class="meet-value">{{ meetTimeFormatted }}</text>
        </view>
        <view class="meet-row">
          <text class="meet-label">相遇地点</text>
          <text class="meet-value">{{ friendship.meetLocation || '未记录' }}</text>
        </view>
      </view>

      <!-- 备注区域 -->
      <view v-if="friendship" class="card remark-card">
        <view class="remark-header">
          <text class="card-title">备注</text>
          <text class="edit-btn" @click="onEditRemark">编辑备注</text>
        </view>
        <text class="remark-content" :class="{ empty: !friendship.remark }">
          {{ friendship.remark || '暂无备注' }}
        </text>
      </view>

      <!-- 查看日记入口 -->
      <view v-if="friendship" class="card diary-entry" @click="onViewDiary">
        <text class="diary-entry-text">查看 TA 的日记</text>
        <text class="diary-arrow">›</text>
      </view>

      <!-- 底部操作区 -->
      <view v-if="friendship" class="actions">
        <text class="action-delete" @click="onDelete">删除宠友</text>
        <text class="action-block" @click="onBlock">拉黑</text>
      </view>
    </scroll-view>

    <!-- 删除确认弹窗 -->
    <Dialog
      :visible="showDeleteDialog"
      title="删除宠友"
      content="确定要删除这位宠友吗？删除后将无法恢复。"
      :show-cancel="true"
      confirm-text="删除"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
      @close="showDeleteDialog = false"
    />

    <!-- 拉黑确认弹窗 -->
    <Dialog
      :visible="showBlockDialog"
      title="拉黑宠友"
      content="确定要拉黑这位宠友吗？拉黑后将不再显示在宠友列表中。"
      :show-cancel="true"
      confirm-text="拉黑"
      @confirm="confirmBlock"
      @cancel="showBlockDialog = false"
      @close="showBlockDialog = false"
    />

    <!-- Loading -->
    <Loading :loading="loading" text="加载中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useFriendStore } from '@/store/friend'
import * as friendService from '@/services/friend'
import type { Friendship } from '@/types/models'
import NavBar from '@/components/common/NavBar.vue'
import PetCard from '@/components/PetCard.vue'
import Dialog from '@/components/common/Dialog.vue'
import Loading from '@/components/common/Loading.vue'

const friendStore = useFriendStore()

const friendshipId = ref('')
const friendship = ref<Friendship | null>(null)
const loading = ref(false)
const showDeleteDialog = ref(false)
const showBlockDialog = ref(false)

const meetTimeFormatted = computed(() => {
  if (!friendship.value) return ''
  const d = new Date(friendship.value.meetTime)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
})

function loadDetail() {
  loading.value = true
  try {
    // 先从 store 找
    const fromStore = friendStore.friends.find(f => f.friendshipId === friendshipId.value)
    if (fromStore) {
      friendship.value = { ...fromStore }
    } else {
      const fromService = friendService.getFriend(friendshipId.value)
      friendship.value = fromService
    }
  } finally {
    loading.value = false
  }
}

function onMoreClick() {
  uni.showActionSheet({
    itemList: ['编辑备注', '删除宠友', '拉黑'],
    success: (res) => {
      if (res.tapIndex === 0) onEditRemark()
      else if (res.tapIndex === 1) onDelete()
      else if (res.tapIndex === 2) onBlock()
    }
  })
}

function onEditRemark() {
  const currentRemark = friendship.value?.remark || ''
  uni.showModal({
    title: '编辑备注',
    editable: true,
    placeholderText: '请输入备注信息',
    content: currentRemark,
    success: (res) => {
      if (res.confirm && res.content !== undefined) {
        const newRemark = res.content.trim()
        friendStore.updateFriend(friendshipId.value, { remark: newRemark })
        if (friendship.value) {
          friendship.value = { ...friendship.value, remark: newRemark }
        }
        uni.showToast({ title: '备注已更新', icon: 'success' })
      }
    }
  })
}

function onViewDiary() {
  uni.showToast({ title: '功能开发中', icon: 'none' })
}

function onDelete() {
  showDeleteDialog.value = true
}

function onBlock() {
  showBlockDialog.value = true
}

function confirmDelete() {
  showDeleteDialog.value = false
  friendStore.removeFriend(friendshipId.value)
  uni.showToast({ title: '已删除宠友', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

function confirmBlock() {
  showBlockDialog.value = false
  friendStore.blockFriend(friendshipId.value)
  uni.showToast({ title: '已拉黑', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

onLoad((options) => {
  if (options?.friendshipId) {
    friendshipId.value = options.friendshipId
    loadDetail()
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F8F9FA;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 20rpx;
}

.card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 20rpx;
  display: block;
}

.pet-card-wrap {
  padding: 24rpx;
}

/* 相遇信息 */
.meet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.meet-label {
  font-size: 26rpx;
  color: #636E72;
}

.meet-value {
  font-size: 26rpx;
  color: #2D3436;
}

/* 备注区域 */
.remark-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.remark-header .card-title {
  margin-bottom: 0;
}

.edit-btn {
  font-size: 26rpx;
  color: #FF6B35;
}

.remark-content {
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;

  &.empty {
    color: #B2BEC3;
  }
}

/* 日记入口 */
.diary-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:active {
    background-color: #f5f5f5;
  }
}

.diary-entry-text {
  font-size: 28rpx;
  color: #2D3436;
}

.diary-arrow {
  font-size: 36rpx;
  color: #B2BEC3;
}

/* 底部操作 */
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 40rpx 0 60rpx;
}

.action-delete {
  font-size: 28rpx;
  color: #FF3B30;
}

.action-block {
  font-size: 28rpx;
  color: #636E72;
}
</style>
