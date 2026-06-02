<template>
  <view class="tabbar">
    <view
      v-for="tab in tabs"
      :key="tab.path"
      class="tab-item"
      :class="{ active: currentPath === tab.path }"
      @click="onSwitch(tab.path)"
    >
      <text class="tab-icon">{{ tab.icon }}</text>
      <text class="tab-label">{{ tab.label }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface TabItem {
  path: string
  icon: string
  label: string
}

const tabs: TabItem[] = [
  { path: '/pages/index/index', icon: '📚', label: '首页' },
  { path: '/pages/browse/index', icon: '🔍', label: '浏览' },
  { path: '/pages/review/index', icon: '📊', label: '回顾' },
  { path: '/pages/exchange/index', icon: '🤝', label: '交换' },
  { path: '/pages/profile/index', icon: '👤', label: '我的' }
]

const currentPath = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1]
    currentPath.value = '/' + currentPage.route
  }
})

function onSwitch(path: string) {
  if (currentPath.value === path) return
  currentPath.value = path
  uni.switchTab({
    url: path,
    fail: () => {
      uni.navigateTo({ url: path })
    }
  })
}
</script>

<style scoped lang="scss">
.tabbar {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100rpx;
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.tab-icon {
  font-size: 44rpx;
  line-height: 1;
}

.tab-label {
  font-size: $font-xs;
  color: $text-hint;
}

.tab-item.active {
  .tab-label {
    color: $primary-color;
  }
}
</style>
