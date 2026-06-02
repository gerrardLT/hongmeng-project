<template>
  <view class="entry-card" @click="onClick">
    <!-- 封面图 -->
    <view class="cover">
      <image
        v-if="entry.coverUrl"
        class="cover-img"
        :src="entry.coverUrl"
        mode="aspectFill"
      />
      <view v-else class="cover-placeholder">
        <text class="type-icon">{{ typeIcon }}</text>
      </view>
    </view>

    <!-- 右侧信息 -->
    <view class="info">
      <view class="info-top">
        <text class="type-icon-small">{{ typeIcon }}</text>
        <text class="title">{{ entry.title }}</text>
      </view>
      <text v-if="entry.subtitle" class="subtitle">{{ entry.subtitle }}</text>
      <RatingStars
        v-if="entry.rating > 0"
        :model-value="entry.rating"
        :readonly="true"
        size="24rpx"
      />
      <view class="meta-row">
        <text v-if="entry.date" class="meta-text">{{ entry.date }}</text>
        <text v-if="entry.review" class="review-preview">{{ entry.review }}</text>
      </view>
      <view v-if="entry.tags && entry.tags.length > 0" class="tags">
        <text
          v-for="tag in entry.tags.slice(0, 3)"
          :key="tag"
          class="tag"
        >{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RatingStars from './RatingStars.vue'

interface Entry {
  entryId: string
  type: string
  title: string
  subtitle?: string
  coverUrl?: string
  rating?: number
  review?: string
  date?: string
  tags?: string[]
}

interface Props {
  entry: Entry
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [entryId: string]
}>()

const typeIconMap: Record<string, string> = {
  book: '📖',
  movie: '🎬',
  podcast: '🎙️',
  exhibition: '🎨'
}

const typeIcon = computed(() => {
  return typeIconMap[props.entry.type] || '📖'
})

function onClick() {
  emit('click', props.entry.entryId)
}
</script>

<style scoped lang="scss">
.entry-card {
  display: flex;
  flex-direction: row;
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  gap: $spacing-md;
}

.cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-img {
  width: 120rpx;
  height: 160rpx;
}

.cover-placeholder {
  width: 120rpx;
  height: 160rpx;
  background-color: $bg-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder .type-icon {
  font-size: 48rpx;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.info-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-xs;
}

.type-icon-small {
  font-size: $font-sm;
  flex-shrink: 0;
}

.title {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: $font-sm;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-xs;
}

.meta-text {
  font-size: $font-xs;
  color: $text-hint;
}

.review-preview {
  font-size: $font-xs;
  color: $text-hint;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tags {
  display: flex;
  flex-direction: row;
  gap: $spacing-xs;
}

.tag {
  font-size: $font-xs;
  color: $secondary-color;
  background-color: rgba($secondary-color, 0.08);
  padding: 2rpx $spacing-xs;
  border-radius: $radius-sm;
}
</style>
