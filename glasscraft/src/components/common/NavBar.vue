<template>
  <view class="nav-bar" :style="{ backgroundColor: bgColor || '#FFFFFF' }">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-content" :style="{ height: navBarHeight + 'px' }">
      <view class="left" @click="onBack">
        <text v-if="showBack" class="back-icon">←</text>
      </view>
      <view class="center">
        <text class="title" :style="{ color: textColor || '#212121' }">{{ title }}</text>
      </view>
      <view class="right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  showBack?: boolean
  bgColor?: string
  textColor?: string
}>(), {
  showBack: true
})

const emit = defineEmits<{
  back: []
}>()

const statusBarHeight = ref(0)
const navBarHeight = ref(44)

const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

// #ifdef APP-HARMONY
navBarHeight.value = 48
// #endif

function onBack() {
  emit('back')
  uni.navigateBack({ delta: 1, fail: () => {} })
}
</script>

<style scoped lang="scss">
.nav-bar {
  width: 100%;
  position: relative;
  z-index: 999;
}

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  align-items: center;
  padding: 0 16rpx;
}

.left {
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

.right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
}

.back-icon {
  font-size: 36rpx;
  color: $text-primary;
}

/* #ifdef APP-HARMONY */
.status-bar {
  height: env(safe-area-inset-top) !important;
}
/* #endif */
</style>
