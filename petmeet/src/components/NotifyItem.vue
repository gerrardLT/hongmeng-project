<template>
  <view
    class="notify-item"
    :class="{ 'notify-item--unread': !notification.isRead }"
    @click="handleClick"
  >
    <view class="notify-icon" :class="`notify-icon--${notification.type}`">
      <text class="notify-icon__emoji">{{ iconMap[notification.type] }}</text>
    </view>
    <view class="notify-content">
      <text class="notify-content__text">{{ contentText }}</text>
      <text class="notify-content__time">{{ formatTime(notification.createdAt) }}</text>
    </view>
    <view class="notify-right">
      <view v-if="!notification.isRead" class="notify-dot" />
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Notification, NotificationType } from '@/types/models'
import { formatTime } from '@/utils/format'
import { computed } from 'vue'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits<{
  click: [notification: Notification]
  delete: [notification: Notification]
}>()

const iconMap: Record<NotificationType, string> = {
  new_friend: '👋',
  new_diary: '📝',
  new_reaction: '💖'
}

const contentText = computed(() => {
  const name = props.notification.sourcePetName
  switch (props.notification.type) {
    case 'new_friend':
      return `${name} 的主人和你交换了名片`
    case 'new_diary':
      return `${name} 发布了新日记`
    case 'new_reaction':
      return `${name} 对你的日记表达了喜欢`
    default:
      return ''
  }
})

function handleClick() {
  emit('click', props.notification)
}
</script>

<style scoped>
.notify-item {
  display: flex;
  align-items: center;
  height: 120rpx;
  padding: 0 24rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #F0F0F0;
}

.notify-item--unread {
  background-color: #FFF9F5;
}

.notify-icon {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notify-icon--new_friend {
  background-color: rgba(255, 107, 53, 0.15);
}

.notify-icon--new_diary {
  background-color: rgba(78, 205, 196, 0.15);
}

.notify-icon--new_reaction {
  background-color: rgba(255, 118, 167, 0.15);
}

.notify-icon__emoji {
  font-size: 24rpx;
  line-height: 1;
}

.notify-content {
  flex: 1;
  margin-left: 20rpx;
  overflow: hidden;
}

.notify-content__text {
  font-size: 28rpx;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.notify-content__time {
  font-size: 22rpx;
  color: #B2BEC3;
  margin-top: 6rpx;
  display: block;
}

.notify-right {
  width: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notify-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #FF6B35;
}
</style>
