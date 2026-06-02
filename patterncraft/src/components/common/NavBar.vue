<template>
  <view class="navbar" :style="{ backgroundColor: bgColor }">
    <!-- 状态栏占位 -->
    <view :style="{ height: statusBarHeight + 'px' }" />

    <!-- 导航内容 -->
    <view class="navbar-content">
      <view v-if="showBack" class="navbar-left" @click="onBack">
        <text class="back-icon">‹</text>
      </view>
      <view v-else class="navbar-left" />

      <text class="navbar-title">{{ title }}</text>

      <view class="navbar-right">
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
  bgColor?: string
}

withDefaults(defineProps<Props>(), {
  showBack: true,
  bgColor: '#FFFFFF'
})

const emit = defineEmits<{
  back: []
}>()

const statusBarHeight = ref(0)

// #ifdef APP-PLUS
const sysInfo = uni.getSystemInfoSync()
statusBarHeight.value = sysInfo.statusBarHeight || 0
// #endif
// #ifndef APP-PLUS
statusBarHeight.value = 20
// #endif

function onBack() {
  emit('back')
  uni.navigateBack()
}
</script>

<style scoped lang="scss">
.navbar {
  width: 100%;
  border-bottom: 2rpx solid $border-color;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 $spacing-md;
}

.navbar-left,
.navbar-right {
  width: 88rpx;
  display: flex;
  align-items: center;
}

.navbar-left {
  justify-content: flex-start;
}

.navbar-right {
  justify-content: flex-end;
}

.back-icon {
  font-size: 56rpx;
  color: $text-primary;
  line-height: 1;
  font-weight: 300;

  &:active {
    opacity: 0.5;
  }
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
