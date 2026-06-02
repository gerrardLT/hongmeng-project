<template>
  <view class="detail-page">
    <NavBar
      title="日记详情"
      left-icon
      :right-text="isOwner ? '删除' : undefined"
      @right-click="onDelete"
    />

    <view v-if="diary" class="content">
      <!-- 作者信息 -->
      <view class="author">
        <image class="avatar" :src="diary.petAvatar" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ diary.petName }}</text>
          <text class="time">{{ formatTime(diary.createdAt) }}</text>
        </view>
        <text class="visibility">{{ diary.visibility === 'public' ? '🌍' : '🔒' }}</text>
      </view>

      <!-- 文字内容 -->
      <view class="text-content">
        <text class="text">{{ diary.content }}</text>
      </view>

      <!-- 图片大图展示 -->
      <view v-if="diary.images.length > 0" class="images">
        <image
          v-for="(img, index) in diary.images"
          :key="index"
          class="img"
          :src="img"
          mode="widthFix"
          @click="onPreviewImage(index)"
        />
      </view>

      <!-- 表情反应栏 -->
      <view class="reaction-section">
        <ReactionBar
          :reactions="diary.reactionCount"
          :current-reaction="currentReaction"
          @react="onReaction"
        />
      </view>

      <!-- 反应详情 -->
      <view class="reaction-detail">
        <view
          v-for="emoji in REACTION_EMOJIS"
          :key="emoji"
          class="reaction-stat"
        >
          <text class="stat-emoji">{{ emoji }}</text>
          <text class="stat-count">{{ diary.reactionCount[emoji] || 0 }}</text>
        </view>
      </view>
    </view>

    <Empty
      v-else
      icon="📝"
      text="日记不存在或已被删除"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onLoad } from 'vue'
import { useDiaryStore } from '@/store/diary'
import { getDiary, deleteDiary } from '@/services/diary'
import { formatTime } from '@/utils/format'
import type { Diary, ReactionEmoji } from '@/types/models'
import NavBar from '@/components/common/NavBar.vue'
import ReactionBar from '@/components/ReactionBar.vue'
import Empty from '@/components/common/Empty.vue'

const REACTION_EMOJIS: ReactionEmoji[] = ['🐾', '❤️', '😍', '🤣', '👏']

const diaryStore = useDiaryStore()

const diary = ref<Diary | null>(null)
const diaryId = ref('')

const currentUserId = computed(() => {
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  return userInfo?.userId || 'default_user'
})

const isOwner = computed(() => {
  return diary.value?.userId === currentUserId.value
})

const currentReaction = computed(() => {
  if (!diary.value) return null
  return diaryStore.getReactionByUser(diary.value.diaryId, currentUserId.value)
})

onLoad((options) => {
  if (options?.diaryId) {
    diaryId.value = options.diaryId
    loadDiary()
  }
})

function loadDiary() {
  const d = getDiary(diaryId.value)
  if (d) {
    diary.value = d
    diaryStore.setCurrentDiary(d)
  }
}

function onPreviewImage(index: number) {
  if (!diary.value) return
  uni.previewImage({
    current: diary.value.images[index],
    urls: diary.value.images
  })
}

function onReaction(emoji: ReactionEmoji) {
  if (!diary.value) return
  const current = diaryStore.getReactionByUser(diary.value.diaryId, currentUserId.value)
  if (current === emoji) {
    diaryStore.removeReaction(diary.value.diaryId, currentUserId.value)
  } else {
    diaryStore.addReaction(diary.value.diaryId, currentUserId.value, emoji)
  }
  // 重新加载日记以更新 reactionCount
  loadDiary()
}

function onDelete() {
  if (!diary.value || !isOwner.value) return

  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，是否确认？',
    confirmColor: '#FF4444',
    success: (res) => {
      if (res.confirm) {
        diaryStore.deleteDiary(diary.value!.diaryId)
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack({ delta: 1, fail: () => {} })
        }, 800)
      }
    }
  })
}
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background-color: #F8F9FA;
}

.content {
  padding: 24rpx;
}

/* 作者信息 */
.author {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #2D3436;
}

.time {
  font-size: 24rpx;
  color: #B2BEC3;
}

.visibility {
  font-size: 28rpx;
}

/* 文字内容 */
.text-content {
  margin-bottom: 24rpx;
}

.text {
  font-size: 30rpx;
  color: #2D3436;
  line-height: 1.8;
  word-break: break-all;
}

/* 图片展示 */
.images {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.img {
  width: 100%;
  border-radius: 12rpx;
  background-color: #f0f0f0;
}

/* 反应区 */
.reaction-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 16rpx;
}

/* 反应详情 */
.reaction-detail {
  display: flex;
  align-items: center;
  gap: 24rpx;
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.reaction-stat {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-emoji {
  font-size: 32rpx;
}

.stat-count {
  font-size: 26rpx;
  color: #636E72;
}
</style>
