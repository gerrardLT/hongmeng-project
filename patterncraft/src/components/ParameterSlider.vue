<template>
  <view class="parameter-slider">
    <view class="slider-header">
      <text class="slider-label">{{ label }}</text>
      <text class="slider-value">{{ modelValue }}</text>
    </view>
    <slider
      class="slider-control"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      activeColor="#C41A16"
      backgroundColor="#E8DFD0"
      block-size="20"
      @change="onChange"
    />
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label: string
}

withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onChange(e: any) {
  emit('update:modelValue', e.detail.value as number)
}
</script>

<style scoped lang="scss">
.parameter-slider {
  padding: $spacing-sm 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.slider-label {
  font-size: $font-md;
  color: $text-primary;
}

.slider-value {
  font-size: $font-md;
  color: $primary-color;
  font-weight: 600;
  font-family: monospace;
}

.slider-control {
  width: 100%;
}
</style>
