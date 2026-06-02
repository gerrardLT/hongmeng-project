<template>
  <view class="pattern-card" :class="[`size-${size}`]" @click="onClick">
    <!-- 预览图 -->
    <view class="preview">
      <image
        v-if="pattern.imageUrl"
        class="preview-img"
        :src="pattern.imageUrl"
        :title="pattern.name"
        mode="aspectFill"
        lazy-load
      />
      <view v-else class="preview-placeholder">
        <text class="placeholder-icon">◇</text>
      </view>

      <!-- 收藏按钮 -->
      <view
        v-if="showFavorite"
        class="fav-btn"
        @click.stop="onFavorite"
      >
        <text class="fav-icon" :class="{ 'fav-active': pattern.isFavorite }">
          {{ pattern.isFavorite ? '♥' : '♡' }}
        </text>
      </view>
    </view>

    <!-- 信息区 -->
    <view class="info">
      <text class="name">{{ pattern.name }}</text>
      <view v-if="pattern.category" class="tag-row">
        <text class="category-tag">{{ pattern.category }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
/** PatternCard 展示数据 */
interface PatternCardData {
  name: string
  category?: string
  imageUrl?: string
  isFavorite?: boolean
}

interface Props {
  pattern: PatternCardData
  showFavorite?: boolean
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  showFavorite: true,
  size: 'medium'
})

const emit = defineEmits<{
  click: []
  favorite: []
}>()

function onClick() {
  emit('click')
}

function onFavorite() {
  emit('favorite')
}
</script>

<style scoped lang="scss">
.pattern-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.98);
  }
}

.preview {
  position: relative;
  width: 100%;
}

.size-small .preview {
  height: 180rpx;
}

.size-medium .preview {
  height: 260rpx;
}

.size-large .preview {
  height: 360rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
}

.preview-placeholder {
  width: 100%;
  height: 100%;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 72rpx;
  color: $secondary-color;
  opacity: 0.4;
}

.fav-btn {
  position: absolute;
  top: $spacing-sm;
  right: $spacing-sm;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.fav-icon {
  font-size: $font-xl;
  color: $text-hint;
}

.fav-active {
  color: $primary-color;
}

.info {
  padding: $spacing-sm;
}

.name {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-row {
  margin-top: $spacing-xs;
}

.category-tag {
  font-size: $font-xs;
  color: $secondary-color;
  background-color: rgba(212, 168, 67, 0.1);
  padding: 2rpx $spacing-sm;
  border-radius: $radius-sm;
}
</style>
