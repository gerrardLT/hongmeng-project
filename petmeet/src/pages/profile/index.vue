<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <text v-if="userStore.isLoggedIn" class="nickname">{{ userStore.userInfo?.nickname || 'PetMeet 用户' }}</text>
        <view v-else class="login-trigger" @click="goToLogin">
          <text class="nickname">点击登录</text>
        </view>
      </view>
    </view>

    <!-- 数据统计栏 -->
    <view class="stats-bar">
      <view class="stat-item" @click="goToPet">
        <text class="stat-num">{{ stats.petCount }}</text>
        <text class="stat-label">宠物数量</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goToFriends">
        <text class="stat-num">{{ stats.friendCount }}</text>
        <text class="stat-label">宠友数量</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item" @click="goToDiary">
        <text class="stat-num">{{ stats.diaryCount }}</text>
        <text class="stat-label">日记数量</text>
      </view>
    </view>

    <!-- 引导任务卡片 -->
    <view v-if="!userStore.isGuideCompleted" class="guide-card">
      <view class="guide-header">
        <text class="guide-title">新手任务</text>
        <text class="guide-progress">{{ completedTaskCount }}/3</text>
      </view>
      <view class="task-list">
        <view
          v-for="task in taskList"
          :key="task.taskType"
          class="task-item"
          @click="handleTaskClick(task.taskType)"
        >
          <text class="task-check" :class="{ checked: task.isCompleted }">
            {{ task.isCompleted ? '✅' : '⬜' }}
          </text>
          <text class="task-name" :class="{ completed: task.isCompleted }">{{ task.name }}</text>
        </view>
      </view>
    </view>
    <view v-else-if="userStore.isLoggedIn" class="guide-card completed">
      <text class="badge-text">🎖️ 已解锁 PetMeet 达人徽章</text>
    </view>

    <!-- 功能菜单列表 -->
    <view class="menu-group">
      <view class="menu-item" @click="goToPet">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的宠物</text>
        <text class="menu-arrow">&gt;</text>
      </view>
      <view class="menu-item" @click="goToSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">&gt;</text>
      </view>
      <view class="menu-item" @click="goToPrivacy">
        <text class="menu-icon">📄</text>
        <text class="menu-text">隐私政策</text>
        <text class="menu-arrow">&gt;</text>
      </view>
      <view class="menu-item" @click="showAboutDialog">
        <text class="menu-icon">💡</text>
        <text class="menu-text">关于 PetMeet</text>
        <text class="menu-arrow">&gt;</text>
      </view>
    </view>

    <!-- 关于弹窗 -->
    <Dialog
      :visible="aboutVisible"
      title="关于 PetMeet"
      content="PetMeet v1.0.0\n让宠物帮你交朋友"
      @confirm="aboutVisible = false"
      @close="aboutVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onShow } from 'vue'
import { useUserStore } from '@/store/user'
import { usePetStore } from '@/store/pet'
import { dbGetAll } from '@/utils/db'
import type { Friendship, Diary, TaskType } from '@/types/models'
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()
const petStore = usePetStore()

const stats = ref({
  petCount: 0,
  friendCount: 0,
  diaryCount: 0
})

const aboutVisible = ref(false)

const taskList = computed(() => {
  const taskMap: Record<TaskType, string> = {
    complete_profile: '完善宠物档案',
    first_diary: '发布第一篇日记',
    first_bump: '第一次碰一碰'
  }
  return userStore.guideTasks.map((task) => ({
    ...task,
    name: taskMap[task.taskType]
  }))
})

const completedTaskCount = computed(() => {
  return userStore.guideTasks.filter((t) => t.isCompleted).length
})

function loadStats() {
  petStore.loadMyPets()
  stats.value.petCount = petStore.petCount

  const userId = userStore.userInfo?.userId
  if (userId) {
    const friendships = dbGetAll<Friendship>('friendships')
    stats.value.friendCount = friendships.filter((f) => f.userId === userId).length

    const diaries = dbGetAll<Diary>('diaries')
    stats.value.diaryCount = diaries.filter((d) => d.userId === userId).length
  } else {
    stats.value.friendCount = 0
    stats.value.diaryCount = 0
  }
}

onShow(() => {
  loadStats()
})

function goToLogin() {
  uni.navigateTo({ url: '/pages/login/index' })
}

function goToPet() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  if (petStore.hasPet) {
    uni.navigateTo({ url: '/pages/pet/edit' })
  } else {
    uni.navigateTo({ url: '/pages/pet/create' })
  }
}

function goToFriends() {
  uni.switchTab({ url: '/pages/friends/index' })
}

function goToDiary() {
  uni.switchTab({ url: '/pages/diary/index' })
}

function goToSettings() {
  uni.navigateTo({ url: '/pages/profile/settings' })
}

function goToPrivacy() {
  uni.navigateTo({ url: '/pages/profile/privacy' })
}

function showAboutDialog() {
  aboutVisible.value = true
}

function handleTaskClick(taskType: TaskType) {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  switch (taskType) {
    case 'complete_profile':
      uni.navigateTo({ url: '/pages/pet/create' })
      break
    case 'first_diary':
      uni.navigateTo({ url: '/pages/diary/publish' })
      break
    case 'first_bump':
      uni.switchTab({ url: '/pages/index/index' })
      break
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #F8F9FA;
  padding-bottom: 48rpx;
}

/* 用户信息卡片 */
.user-card {
  height: 300rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  border-radius: 0 0 32rpx 32rpx;
  display: flex;
  align-items: center;
  padding: 0 48rpx;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 4rpx solid #FFFFFF;
  background-color: #FFFFFF;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.login-trigger {
  display: flex;
  align-items: center;
}

/* 数据统计栏 */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: -40rpx 32rpx 32rpx;
  padding: 32rpx 0;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #FF6B35;
}

.stat-label {
  font-size: 24rpx;
  color: #636E72;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background-color: #F8F9FA;
}

/* 引导任务卡片 */
.guide-card {
  margin: 0 32rpx 32rpx;
  padding: 32rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.guide-card.completed {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 32rpx;
}

.badge-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #FF6B35;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.guide-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2D3436;
}

.guide-progress {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.task-check {
  font-size: 32rpx;
  color: #B2BEC3;
}

.task-check.checked {
  color: #FF6B35;
}

.task-name {
  font-size: 28rpx;
  color: #2D3436;
}

.task-name.completed {
  color: #636E72;
  text-decoration: line-through;
}

/* 功能菜单列表 */
.menu-group {
  margin: 0 32rpx;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  border-bottom: 2rpx solid #F8F9FA;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #2D3436;
}

.menu-arrow {
  font-size: 28rpx;
  color: #B2BEC3;
}
</style>
