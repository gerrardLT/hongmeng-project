<template>
  <view class="diary-card" @click="onCardClick">
    <!-- 头部 -->
    <view class="header">
      <view class="author">
        <image class="avatar" :src="diary.petAvatar" mode="aspectFill" />
        <view class="info">
          <text class="name">{{ diary.petName }}</text>
          <text class="time">{{ formatTime(diary.createdAt) }}</text>
        </view>
      </view>
      <view class="visibility">
        <text class="visibility-icon">{{ diary.visibility === 'public' ? '🌍' : '🔒' }}</text>
      </view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <text
        class="text"
        :class="{ expanded: isExpanded }"
        @click.stop="onTextClick"
      >
        {{ diary.content }}
      </text>
      <text v-if="diary.content.length > 60 && !isExpanded" class="expand-hint" @click.stop="isExpanded = true">
        展开全文
      </text>

      <!-- 图片区域 -->
      <view v-if="diary.images.length > 0" class="images" :class="[`layout-${imageLayout}`]">
        <image
          v-for="(img, index) in diary.images"
          :key="index"
          class="img"
          :src="img"
          mode="aspectFill"
          @click.stop="onPreviewImage(index)"
        />
      </view>
    </view>

    <!-- 底部反应区 -->
    <view v-if="showReaction" class="footer" @click.stop>
      <ReactionBar
        :reactions="diary.reactionCount"
        :current-reaction="currentReaction"
        @react="onReaction"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Diary, ReactionEmoji } from '@/types/models'
import { formatTime } from '@/utils/format'
import ReactionBar from './ReactionBar.vue'

const props = withDefaults(defineProps<{
  diary: Diary
  showReaction?: boolean
  currentUserId: string
  currentReaction?: ReactionEmoji | null
}>(), {
  showReaction: true,
  currentReaction: null
})

const emit = defineEmits<{
  click: []
  reaction: [emoji: ReactionEmoji]
}>()

const isExpanded = ref(false)

const imageLayout = computed(() => {
  const count = props.diary.images.length
  if (count === 1) return 'single'
  if (count <= 3) return 'row'
  return 'grid'
})

function onCardClick() {
  emit('click')
}

function onTextClick() {
  if (!isExpanded.value && props.diary.content.length > 60) {
    isExpanded.value = true
  } else {
    emit('click')
  }
}

function onPreviewImage(index: number) {
  uni.previewImage({
    current: props.diary.images[index],
    urls: props.diary.images
  })
}

function onReaction(emoji: ReactionEmoji) {
  emit('reaction', emoji)
}
</script>

<style scoped lang="scss">
.diary-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* 头部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.author {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2D3436;
}

.time {
  font-size: 22rpx;
  color: #B2BEC3;
}

.visibility-icon {
  font-size: 28rpx;
}

/* 内容区 */
.content {
  margin-bottom: 8rpx;
}

.text {
  font-size: 28rpx;
  color: #2D3436;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;

  &.expanded {
    -webkit-line-clamp: unset;
    display: block;
  }
}

.expand-hint {
  font-size: 24rpx;
  color: #FF6B35;
  margin-top: 8rpx;
}

/* 图片区域 */
.images {
  margin-top: 16rpx;
}

.layout-single {
  .img {
    width: 100%;
    max-height: 400rpx;
    border-radius: 8rpx;
    background-color: #f0f0f0;
  }
}

.layout-row {
  display: flex;
  gap: 8rpx;

  .img {
    flex: 1;
    height: 220rpx;
    border-radius: 8rpx;
    background-color: #f0f0f0;
    min-width: 0;
  }
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8rpx;

  .img {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8rpx;
    background-color: #f0f0f0;
  }
}
</style>
