<template>
  <view class="tag-selector">
    <!-- 已选标签 -->
    <view v-if="modelValue.length > 0" class="selected-tags">
      <view
        v-for="tag in modelValue"
        :key="tag"
        class="tag selected"
        @click="onRemove(tag)"
      >
        <text class="tag-text selected-text">{{ tag }}</text>
        <text class="tag-remove">×</text>
      </view>
    </view>

    <!-- 建议标签 -->
    <view v-if="availableSuggestions.length > 0" class="suggestion-tags">
      <view
        v-for="tag in availableSuggestions"
        :key="tag"
        class="tag suggestion"
        @click="onAdd(tag)"
      >
        <text class="tag-text suggestion-text">{{ tag }}</text>
      </view>
    </view>

    <!-- 输入新标签 -->
    <view class="input-row">
      <input
        v-model="inputValue"
        class="tag-input"
        placeholder="输入新标签"
        confirm-type="done"
        @confirm="onInputConfirm"
      />
      <view class="add-btn" @click="onInputConfirm">
        <text class="add-btn-text">添加</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string[]
  suggestions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  suggestions: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const inputValue = ref('')

const availableSuggestions = computed(() => {
  return props.suggestions.filter(s => !props.modelValue.includes(s))
})

function onAdd(tag: string) {
  if (props.modelValue.includes(tag)) return
  emit('update:modelValue', [...props.modelValue, tag])
}

function onRemove(tag: string) {
  emit('update:modelValue', props.modelValue.filter(t => t !== tag))
}

function onInputConfirm() {
  const val = inputValue.value.trim()
  if (!val) return
  if (props.modelValue.includes(val)) {
    inputValue.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, val])
  inputValue.value = ''
}
</script>

<style scoped lang="scss">
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.selected-tags,
.suggestion-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-pill;
}

.tag.selected {
  background-color: rgba($primary-color, 0.1);
  border: 1rpx solid $primary-color;
}

.tag.suggestion {
  background-color: $bg-color;
  border: 1rpx solid $border-color;
}

.tag-text {
  font-size: $font-sm;
}

.selected-text {
  color: $primary-color;
}

.suggestion-text {
  color: $text-secondary;
}

.tag-remove {
  margin-left: $spacing-xs;
  font-size: $font-md;
  color: $text-hint;
}

.input-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
}

.tag-input {
  flex: 1;
  height: 64rpx;
  padding: 0 $spacing-sm;
  font-size: $font-sm;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  background-color: $bg-card;
  color: $text-primary;
}

.add-btn {
  padding: $spacing-xs $spacing-md;
  background-color: $primary-color;
  border-radius: $radius-md;
}

.add-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
}
</style>
