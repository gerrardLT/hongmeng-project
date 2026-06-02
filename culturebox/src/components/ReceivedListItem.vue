<template>
  <view class="received-item" @click="onClick">
    <view class="item-top">
      <text class="sender-name">{{ list.senderName }}</text>
      <view class="type-badge">
        <text class="type-text">{{ typeLabel }}</text>
      </view>
    </view>
    <view class="item-bottom">
      <text class="entry-count">{{ list.entries?.length || 0 }} 个条目</text>
      <text v-if="list.meetTime" class="meet-time">{{ list.meetTime }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ListData {
  listId: string
  senderName: string
  listType: string
  entries: unknown[]
  meetTime?: string
}

interface Props {
  list: ListData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: [listId: string]
}>()

const typeLabelMap: Record<string, string> = {
  book: '📖 书单',
  movie: '🎬 影单',
  podcast: '🎙️ 播单',
  exhibition: '🎨 展单'
}

const typeLabel = computed(() => {
  return typeLabelMap[props.list.listType] || props.list.listType
})

function onClick() {
  emit('click', props.list.listId)
}
</script>

<style scoped lang="scss">
.received-item {
  display: flex;
  flex-direction: column;
  padding: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  gap: $spacing-sm;
}

.item-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.sender-name {
  font-size: $font-md;
  font-weight: 500;
  color: $text-primary;
}

.type-badge {
  padding: 2rpx $spacing-sm;
  background-color: rgba($secondary-color, 0.08);
  border-radius: $radius-sm;
}

.type-text {
  font-size: $font-xs;
  color: $secondary-color;
}

.item-bottom {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.entry-count {
  font-size: $font-sm;
  color: $text-secondary;
}

.meet-time {
  font-size: $font-xs;
  color: $text-hint;
}
</style>
