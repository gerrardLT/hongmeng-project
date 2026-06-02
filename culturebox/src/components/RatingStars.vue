<template>
  <view class="rating-stars">
    <text
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ active: i <= current, clickable: !readonly }"
      :style="{ fontSize: size }"
      @click="onSelect(i)"
    >{{ i <= current ? '★' : '☆' }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  readonly?: boolean
  size?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: '36rpx'
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const current = computed(() => Math.min(5, Math.max(0, Math.round(props.modelValue))))

function onSelect(i: number) {
  if (props.readonly) return
  emit('update:modelValue', i)
}
</script>

<style scoped lang="scss">
.rating-stars {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.star {
  color: $text-hint;
  line-height: 1;
}

.star.active {
  color: $accent-color;
}

.star.clickable {
  cursor: pointer;
}
</style>
