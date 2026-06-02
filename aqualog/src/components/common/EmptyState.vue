<template>
  <view class="empty-state">
    <text class="empty-icon">{{ icon || '📭' }}</text>
    <text class="empty-title">{{ title }}</text>
    <text v-if="description" class="empty-desc">{{ description }}</text>
    <view v-if="buttonText" class="empty-btn" @click="onAction">
      <text class="empty-btn-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
  buttonText?: string
}>(), {
  icon: '📭',
  description: '',
  buttonText: ''
})

const emit = defineEmits<{
  'action': []
}>()

function onAction() {
  emit('action')
}
</script>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xxl $spacing-xl;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: $spacing-lg;
}

.empty-title {
  font-size: $font-lg;
  font-weight: $font-weight-medium;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.empty-desc {
  font-size: $font-sm;
  color: $text-light;
  text-align: center;
  line-height: 1.6;
  margin-bottom: $spacing-lg;
}

.empty-btn {
  padding: $spacing-sm $spacing-xl;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-pill;
  box-shadow: $shadow-primary;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

.empty-btn-text {
  font-size: $font-md;
  color: $text-white;
  font-weight: $font-weight-medium;
}
</style>
