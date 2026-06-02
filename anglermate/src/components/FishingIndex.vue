<template>
  <view class="fishing-index">
    <text class="index-stars">{{ stars }}</text>
    <text v-if="desc" class="index-desc">{{ desc }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  index: number
  desc?: string
}>()

const stars = computed(() => {
  const idx = Math.min(5, Math.max(1, props.index))
  return '★'.repeat(idx) + '☆'.repeat(5 - idx)
})
</script>

<style scoped lang="scss">
.fishing-index {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.index-stars {
  font-size: 30rpx;
  color: #FF6B35;
  letter-spacing: 4rpx;
}

.index-desc {
  font-size: 24rpx;
  color: #999999;
}
</style>
