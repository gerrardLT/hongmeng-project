<template>
  <view class="nav-bar" :style="{ backgroundColor: bgColor }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-content" :style="{ height: navBarHeight + 'px' }">
      <view class="left" @click="onLeftClick">
        <text v-if="showBack" class="back-icon">‹</text>
        <slot name="left" />
      </view>
      <view class="center">
        <text class="title">{{ title }}</text>
        <slot name="center" />
      </view>
      <view class="right" @click="onRightClick">
        <text v-if="rightText" class="right-text">{{ rightText }}</text>
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title: string
  showBack?: boolean
  rightText?: string
  bgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  rightText: '',
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
  if (props.showBack) {
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

.back-icon {
  font-size: 48rpx;
  color: $text-primary;
  font-weight: 300;
}

.right-text {
  font-size: $font-md;
  color: $primary-color;
}
</style>
