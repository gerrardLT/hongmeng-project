<template>
  <view class="artwork-card" @click="onClick">
    <!-- 缩略图 -->
    <view class="thumb">
      <image
        v-if="artwork.imageUrl"
        class="thumb-img"
        :src="artwork.imageUrl"
        mode="aspectFill"
      />
      <view v-else class="thumb-placeholder">
        <text class="placeholder-icon">◈</text>
      </view>

      <!-- 场景标签 -->
      <view v-if="artwork.scene" class="scene-tag">
        <text class="scene-tag-text">{{ artwork.scene }}</text>
      </view>
    </view>

    <!-- 信息区 -->
    <view class="info">
      <text class="title">{{ artwork.title || '未命名作品' }}</text>
      <text class="time">{{ artwork.createdAt || '' }}</text>
    </view>

    <!-- 操作按钮 -->
    <view v-if="showActions" class="actions">
      <view class="action-btn" @click.stop="onEdit">
        <text class="action-icon">✎</text>
      </view>
      <view class="action-btn action-delete" @click.stop="onDelete">
        <text class="action-icon">✕</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  artwork: any
  showActions?: boolean
}

withDefaults(defineProps<Props>(), {
  showActions: true
})

const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()

function onClick() {
  emit('click')
}

function onEdit() {
  emit('edit')
}

function onDelete() {
  emit('delete')
}
</script>

<style scoped lang="scss">
.artwork-card {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
  }
}

.thumb {
  position: relative;
  width: 140rpx;
  height: 140rpx;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
}

.thumb-img {
  width: 140rpx;
  height: 140rpx;
}

.thumb-placeholder {
  width: 140rpx;
  height: 140rpx;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 56rpx;
  color: $secondary-color;
  opacity: 0.4;
}

.scene-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4rpx 0;
  background-color: rgba(44, 44, 44, 0.65);
}

.scene-tag-text {
  display: block;
  text-align: center;
  font-size: $font-xs;
  color: #FFFFFF;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  overflow: hidden;
}

.title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.time {
  font-size: $font-xs;
  color: $text-hint;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  flex-shrink: 0;
}

.action-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.6;
  }
}

.action-delete {
  background-color: rgba(244, 67, 54, 0.08);
}

.action-icon {
  font-size: $font-md;
  color: $text-secondary;
}

.action-delete .action-icon {
  color: $error-color;
}
</style>
