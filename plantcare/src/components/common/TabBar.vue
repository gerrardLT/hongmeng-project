<template>
  <view class="tab-bar">
    <!-- #ifdef APP-HARMONY -->
    <view class="harmony-safe-bottom" />
    <!-- #endif -->
    <view class="tab-bar__content">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ 'tab-item--active': currentTab === tab.key }"
        @click="onTabChange(tab.key)"
      >
        <text class="tab-item__icon">{{ tab.icon }}</text>
        <text class="tab-item__label">{{ tab.label }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

withDefaults(defineProps<{
  currentTab?: string
}>(), {
  currentTab: 'home'
})

const emit = defineEmits<{
  change: [tab: string]
}>()

const tabs = reactive([
  { key: 'home', label: '首页', icon: '🏠' },
  { key: 'wiki', label: '百科', icon: '📖' },
  { key: 'records', label: '记录', icon: '📝' },
  { key: 'profile', label: '我的', icon: '👤' }
])

function onTabChange(tab: string) {
  emit('change', tab)
}
</script>

<style scoped lang="scss">
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: $bg-card;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* #ifdef APP-HARMONY */
.harmony-safe-bottom {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
/* #endif */

.tab-bar__content {
  display: flex;
  flex-direction: row;
  height: 100rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: color $transition-fast;

  &__icon {
    font-size: 40rpx;
    margin-bottom: 4rpx;
  }

  &__label {
    font-size: $font-xs;
    color: $text-light;
  }

  &--active {
    .tab-item__label {
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }
}
</style>
