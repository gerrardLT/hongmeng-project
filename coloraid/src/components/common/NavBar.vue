<template>
  <view class="nav-bar" :style="{ backgroundColor: bgColor || '#FFFFFF' }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-content" :style="{ height: navBarHeight + 'px' }">
      <view class="left" @click="onLeftClick">
        <text v-if="leftIcon !== false" class="iconfont icon-back">&#xe679;</text>
        <slot name="left" />
      </view>
      <view class="center">
        <text class="title">{{ title }}</text>
        <slot name="center" />
      </view>
      <view class="right" @click="onRightClick">
        <text v-if="rightText" class="right-text">{{ rightText }}</text>
        <text v-if="rightIcon" class="iconfont right-icon">{{ rightIcon }}</text>
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  leftIcon?: boolean
  rightText?: string
  rightIcon?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  leftIcon: true,
  bgColor: '#FFFFFF'
})

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

<style scoped lang="scss">
.nav-bar {
  width: 100%;
  position: relative;
}

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 $spacing-sm;
}

.left,
.right {
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
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
}

.right-text {
  font-size: $font-md;
  color: $primary-color;
}

.iconfont {
  font-size: $font-lg;
  color: $text-primary;
}

.right-icon {
  color: $text-secondary;
}
</style>
