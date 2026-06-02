<template>
  <view class="color-picker">
    <!-- 预设色块网格 -->
    <view class="preset-grid">
      <view
        v-for="color in presetColors"
        :key="color.hex"
        class="preset-item"
        :class="{ selected: modelValue === color.hex }"
        :style="{ backgroundColor: color.hex }"
        @click="selectColor(color.hex)"
      >
        <text v-if="modelValue === color.hex" class="check-mark">✓</text>
      </view>
    </view>

    <!-- HEX 输入框 -->
    <view class="hex-input-row">
      <text class="hex-label">HEX</text>
      <input
        class="hex-input"
        :value="modelValue"
        maxlength="7"
        placeholder="#000000"
        @input="onHexInput"
      />
      <view class="hex-preview" :style="{ backgroundColor: modelValue }" />
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const presetColors = [
  { hex: '#C41A16', name: '故宫红' },
  { hex: '#D4A843', name: '金色' },
  { hex: '#7BAA8E', name: '青瓷绿' },
  { hex: '#2C2C2C', name: '墨黑' },
  { hex: '#8B4513', name: '紫檀' },
  { hex: '#4A6FA5', name: '靛蓝' },
  { hex: '#F5DEB3', name: '麦芽' },
  { hex: '#E8B4B8', name: '桃粉' },
  { hex: '#6B4C3B', name: '棕褐' },
  { hex: '#A0522D', name: '赭石' },
  { hex: '#708090', name: '石青' },
  { hex: '#FFF8F0', name: '宣纸白' }
]

function selectColor(hex: string) {
  emit('update:modelValue', hex)
}

function onHexInput(e: any) {
  const val = e.detail.value as string
  if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
    emit('update:modelValue', val)
  }
}
</script>

<style scoped lang="scss">
.color-picker {
  padding: $spacing-md;
}

.preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.preset-item {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-fast;

  &:active {
    transform: scale(0.92);
  }

  &.selected {
    border: 4rpx solid $primary-color;
    box-shadow: 0 0 0 4rpx rgba(196, 26, 22, 0.2);
  }
}

.check-mark {
  font-size: $font-md;
  color: #FFFFFF;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.5);
}

.hex-input-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
  padding: $spacing-sm;
  background-color: $bg-secondary;
  border-radius: $radius-md;
}

.hex-label {
  font-size: $font-sm;
  color: $text-secondary;
  font-weight: 600;
}

.hex-input {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  font-family: monospace;
}

.hex-preview {
  width: 48rpx;
  height: 48rpx;
  border-radius: $radius-sm;
  border: 2rpx solid $border-color;
}
</style>
