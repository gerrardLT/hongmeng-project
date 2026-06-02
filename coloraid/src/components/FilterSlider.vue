<template>
  <view class="filter-slider">
    <view class="slider-header">
      <text class="slider-label slider-label-weak">弱</text>
      <text class="slider-value">{{ modelValue }}</text>
      <text class="slider-label slider-label-strong">强</text>
    </view>
    <view class="slider-track-wrap">
      <slider
        :value="modelValue"
        :min="min"
        :max="max"
        :disabled="disabled"
        :active-color="activeColor"
        :background-color="backgroundColor"
        :block-size="24"
        class="slider"
        @change="onChange"
        @changing="onChanging"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max?: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  min: 1,
  max: 10,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number]
}>()

const activeColor = '#5B6EF5'
const backgroundColor = '#E0E0E0'

function onChange(e: { detail: { value: number } }) {
  const value = e.detail.value
  emit('update:modelValue', value)
  emit('change', value)
}

function onChanging(e: { detail: { value: number } }) {
  emit('update:modelValue', e.detail.value)
}
</script>

<style scoped lang="scss">
.filter-slider {
  padding: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-md;
}

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-xs;
}

.slider-label {
  font-size: $font-sm;
  color: $text-hint;
}

.slider-value {
  font-size: $font-xl;
  font-weight: 600;
  color: $primary-color;
  min-width: 48rpx;
  text-align: center;
}

.slider-track-wrap {
  width: 100%;
}

.slider {
  margin: 0;
}
</style>
