<template>
  <view class="wiki-card" @click="emit('click')">
    <view class="wiki-card__left">
      <image
        class="wiki-card__image"
        :src="wiki.imageUrl || '/static/images/plant-placeholder.png'"
        mode="aspectFill"
      />
    </view>
    <view class="wiki-card__body">
      <view class="wiki-card__title-row">
        <text class="wiki-card__name">{{ wiki.name }}</text>
        <view class="wiki-card__difficulty" :class="`wiki-card__difficulty--${wiki.difficulty}`">
          <text class="wiki-card__difficulty-text">{{ difficultyText }}</text>
        </view>
      </view>
      <text class="wiki-card__scientific">{{ wiki.scientificName }}</text>
      <text class="wiki-card__desc">{{ wiki.description }}</text>
      <view class="wiki-card__tags">
        <view
          v-for="cat in wiki.category"
          :key="cat"
          class="wiki-card__tag"
        >
          <text class="wiki-card__tag-text">{{ categoryText(cat) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlantWiki, PlantCategory } from '@/types/models'

const props = withDefaults(defineProps<{
  wiki: PlantWiki
}>(), {})

const emit = defineEmits<{
  click: []
}>()

const difficultyText = computed(() => {
  const map: Record<string, string> = {
    beginner: '新手',
    intermediate: '进阶',
    expert: '专家'
  }
  return map[props.wiki.difficulty] || ''
})

function categoryText(cat: PlantCategory): string {
  const map: Record<string, string> = {
    airPurify: '净化空气',
    ornamental: '观赏',
    easycare: '易养护',
    succulent: '多肉',
    herb: '草本',
    flower: '开花'
  }
  return map[cat] || cat
}
</script>

<style scoped lang="scss">
.wiki-card {
  display: flex;
  flex-direction: row;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  box-shadow: $shadow-sm;

  &__left {
    flex-shrink: 0;
    margin-right: $spacing-md;
  }

  &__image {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-sm;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 4rpx;
  }

  &__name {
    font-size: $font-lg;
    font-weight: $font-weight-bold;
    color: $text-primary;
    margin-right: $spacing-sm;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__difficulty {
    padding: 2rpx 12rpx;
    border-radius: $radius-pill;
    flex-shrink: 0;

    &--beginner {
      background-color: $primary-lighter;
    }

    &--intermediate {
      background-color: #FFF3E0;
    }

    &--expert {
      background-color: #FFEBEE;
    }
  }

  &__difficulty-text {
    font-size: $font-xs;

    .wiki-card__difficulty--beginner & {
      color: $primary-dark;
    }

    .wiki-card__difficulty--intermediate & {
      color: #E65100;
    }

    .wiki-card__difficulty--expert & {
      color: $error-color;
    }
  }

  &__scientific {
    font-size: $font-sm;
    color: $text-light;
    font-style: italic;
    margin-bottom: $spacing-xs;
  }

  &__desc {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    margin-bottom: $spacing-xs;
  }

  &__tags {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  &__tag {
    background-color: $bg-section;
    padding: 2rpx 14rpx;
    border-radius: $radius-pill;
  }

  &__tag-text {
    font-size: $font-xs;
    color: $text-secondary;
  }
}
</style>
