<template>
  <view class="nav-bar" :style="{ backgroundColor: bgColor }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-content" :style="{ height: navBarHeight + 'px' }">
      <view class="left" @click="onLeftClick">
        <text v-if="leftIcon" class="icon">&#xe679;</text>
      </view>
      <view class="center">
        <text class="title">{{ title }}</text>
      </view>
      <view class="right" @click="onRightClick">
        <text v-if="rightText" class="right-text">{{ rightText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title: string
  leftIcon?: boolean
  rightText?: string
  bgColor?: string
}>()

const emit = defineEmits<{
  leftClick: []
  rightClick: []
}>()

const statusBarHeight = ref(0)
const navBarHeight = ref(44)

const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

function onLeftClick() {
  if (props.leftIcon !== false) {
    uni.navigateBack({ delta: 1, fail: () => {} })
  }
  emit('leftClick')
}

function onRightClick() {
  emit('rightClick')
}
</script>

<style scoped>
.nav-bar {
  width: 100%;
}

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 16rpx;
}

.left, .right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 32rpx;
  font-weight: 500;
  color: #2D3436;
}

.right-text {
  font-size: 28rpx;
  color: #FF6B35;
}

.icon {
  font-size: 32rpx;
  color: #2D3436;
}
</style>
