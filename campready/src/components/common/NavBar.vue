<template>
  <view class="nav-bar" :style="{ backgroundColor: bgColor }">
    <!-- #ifdef APP-HARMONY -->
    <view class="harmony-safe-top" />
    <!-- #endif -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />
    <view class="nav-content">
      <view class="nav-left" @click="onBack">
        <text v-if="showBack" class="back-icon">‹</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">{{ title }}</text>
      </view>
      <view class="nav-right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  title: string
  showBack?: boolean
  bgColor?: string
}>(), {
  showBack: true,
  bgColor: '#FFFFFF'
})

const statusBarHeight = ref(0)

const systemInfo = uni.getSystemInfoSync()
statusBarHeight.value = systemInfo.statusBarHeight || 0

function onBack() {
  uni.navigateBack({ delta: 1, fail: () => {} })
}
</script>

<style scoped lang="scss">
.nav-bar {
  width: 100%;
  position: relative;
  z-index: 100;
}

/* #ifdef APP-HARMONY */
.harmony-safe-top {
  height: constant(safe-area-inset-top);
  height: env(safe-area-inset-top);
}
/* #endif */

.status-bar {
  width: 100%;
}

.nav-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
}

.nav-left {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.back-icon {
  font-size: 52rpx;
  color: #212121;
  font-weight: 300;
  line-height: 1;
}

.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #212121;
}

.nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
