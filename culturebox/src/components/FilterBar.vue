<template>
  <view class="filter-bar">
    <!-- 类型筛选 -->
    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-group">
        <view
          v-for="item in typeOptions"
          :key="item.value"
          class="filter-btn"
          :class="{ active: activeType === item.value }"
          @click="onTypeChange(item.value)"
        >
          <text class="filter-label">{{ item.icon }} {{ item.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 年份筛选 -->
    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-group">
        <view
          class="filter-btn"
          :class="{ active: activeYear === null }"
          @click="onYearChange(null)"
        >
          <text class="filter-label">全部年份</text>
        </view>
        <view
          v-for="year in yearList"
          :key="year"
          class="filter-btn"
          :class="{ active: activeYear === year }"
          @click="onYearChange(year)"
        >
          <text class="filter-label">{{ year }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 评分筛选 -->
    <scroll-view scroll-x class="filter-scroll">
      <view class="filter-group">
        <view
          v-for="item in ratingOptions"
          :key="item.value"
          class="filter-btn"
          :class="{ active: activeRating === item.value }"
          @click="onRatingChange(item.value)"
        >
          <text class="filter-label">{{ item.label }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  activeType?: string
  activeYear?: number | null
  activeRating?: number | null
  activeTags?: string[]
}

withDefaults(defineProps<Props>(), {
  activeType: 'all',
  activeYear: null,
  activeRating: null,
  activeTags: () => []
})

const emit = defineEmits<{
  'update:activeType': [value: string]
  'update:activeYear': [value: number | null]
  'update:activeRating': [value: number | null]
  'update:activeTags': [value: string[]]
}>()

const typeOptions = [
  { value: 'all', label: '全部', icon: '' },
  { value: 'book', label: '书', icon: '📖' },
  { value: 'movie', label: '电影', icon: '🎬' },
  { value: 'podcast', label: '播客', icon: '🎙️' },
  { value: 'exhibition', label: '展览', icon: '🎨' }
]

const ratingOptions = [
  { value: null, label: '全部评分' },
  { value: 5, label: '5星' },
  { value: 4, label: '4星+' },
  { value: 3, label: '3星+' }
]

const yearList = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= currentYear - 10; y--) {
    years.push(y)
  }
  return years
})

function onTypeChange(value: string) {
  emit('update:activeType', value)
}

function onYearChange(value: number | null) {
  emit('update:activeYear', value)
}

function onRatingChange(value: number | null) {
  emit('update:activeRating', value)
}
</script>

<style scoped lang="scss">
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.filter-scroll {
  width: 100%;
  white-space: nowrap;
}

.filter-group {
  display: flex;
  flex-direction: row;
  gap: $spacing-xs;
  padding: 0 $spacing-xs;
}

.filter-btn {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-xs $spacing-md;
  background-color: $bg-color;
  border-radius: $radius-pill;
  border: 1rpx solid $border-color;
  flex-shrink: 0;
}

.filter-btn.active {
  background-color: rgba($primary-color, 0.1);
  border-color: $primary-color;
}

.filter-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.filter-btn.active .filter-label {
  color: $primary-color;
  font-weight: 500;
}
</style>
