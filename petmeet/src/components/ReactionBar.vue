<template>
  <view class="reaction-bar">
    <view
      v-for="emoji in EMOJIS"
      :key="emoji"
      class="reaction-btn"
      :class="{ active: currentReaction === emoji, animating: animatingEmoji === emoji }"
      @click="onReact(emoji)"
    >
      <text class="emoji">{{ emoji }}</text>
      <text v-if="(reactions[emoji] || 0) > 0" class="count">{{ reactions[emoji] }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReactionEmoji } from '@/types/models'

const EMOJIS: ReactionEmoji[] = ['🐾', '❤️', '😍', '🤣', '👏']

const props = defineProps<{
  reactions: Record<ReactionEmoji, number>
  currentReaction: ReactionEmoji | null
}>()

const emit = defineEmits<{
  react: [emoji: ReactionEmoji]
}>()

const animatingEmoji = ref<ReactionEmoji | null>(null)

function onReact(emoji: ReactionEmoji) {
  animatingEmoji.value = emoji
  setTimeout(() => {
    animatingEmoji.value = null
  }, 300)
  emit('react', emoji)
}
</script>

<style scoped lang="scss">
.reaction-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.reaction-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 8rpx 20rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
  background-color: #F8F9FA;
  transition: all 0.2s ease;

  &.active {
    border-color: #FF6B35;
    background-color: #FFF3ED;
  }

  &.animating {
    animation: bounce 0.3s ease;
  }
}

@keyframes bounce {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.9);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.emoji {
  font-size: 36rpx;
  line-height: 1;
}

.count {
  font-size: 22rpx;
  color: #636E72;
  line-height: 1;
}

.reaction-btn.active .count {
  color: #FF6B35;
}
</style>
