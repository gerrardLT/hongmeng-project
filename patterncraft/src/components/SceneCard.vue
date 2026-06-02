<template>
  <view class="scene-card" :class="{ selected }" @click="onClick">
    <text class="scene-icon">{{ scene.icon || '🏮' }}</text>
    <view class="scene-info">
      <text class="scene-name">{{ scene.name }}</text>
      <text v-if="scene.description" class="scene-desc">{{ scene.description }}</text>
    </view>
    <view v-if="selected" class="selected-badge">
      <text class="badge-icon">✓</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  scene: any
  selected?: boolean
}

withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.scene-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.98);
  }

  &.selected {
    border-color: $primary-color;
    background-color: rgba(196, 26, 22, 0.03);
  }
}

.scene-icon {
  font-size: 56rpx;
  flex-shrink: 0;
}

.scene-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  overflow: hidden;
}

.scene-name {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
}

.scene-desc {
  font-size: $font-sm;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-badge {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $primary-color;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge-icon {
  font-size: $font-xs;
  color: #FFFFFF;
}
</style>
