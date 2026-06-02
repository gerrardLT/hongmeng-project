<template>
  <view class="ranking-item" :class="{ 'is-me': isMe }">
    <view class="rank-col">
      <text class="rank-num" :class="rankClass">{{ rank }}</text>
    </view>
    <view class="avatar-col">
      <image v-if="avatar" class="avatar" :src="avatar" mode="aspectFill" />
      <view v-else class="avatar-placeholder">
        <text class="avatar-text">{{ nickname.slice(0, 1) }}</text>
      </view>
    </view>
    <view class="info-col">
      <text class="nickname">{{ nickname }}</text>
    </view>
    <view class="value-col">
      <text class="value-num">{{ value }}</text>
      <text class="value-unit">{{ unit }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  rank: number
  nickname: string
  avatar?: string
  value: string
  unit: string
  isMe?: boolean
}>(), {
  avatar: '',
  isMe: false
})

const rankClass = computed(() => {
  if (props.rank === 1) return 'rank-gold'
  if (props.rank === 2) return 'rank-silver'
  if (props.rank === 3) return 'rank-bronze'
  return ''
})
</script>

<style scoped lang="scss">
.ranking-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #F5F5F5;
}

.ranking-item.is-me {
  background: #FFF3E0;
}

.rank-col {
  width: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rank-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #999999;
}

.rank-gold {
  color: #FFD700;
}

.rank-silver {
  color: #C0C0C0;
}

.rank-bronze {
  color: #CD7F32;
}

.avatar-col {
  margin-right: 16rpx;
  flex-shrink: 0;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #FF5722;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nickname {
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
}

.value-col {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  flex-shrink: 0;
}

.value-num {
  font-size: 32rpx;
  font-weight: 700;
  color: #FF5722;
  margin-right: 4rpx;
}

.value-unit {
  font-size: 22rpx;
  color: #999999;
}
</style>
