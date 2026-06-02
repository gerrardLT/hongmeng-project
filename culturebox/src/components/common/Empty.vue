<template>
  <view class="empty">
    <text class="icon">{{ icon }}</text>
    <text class="text">{{ text }}</text>
    <view
      v-if="buttonText"
      class="action-btn"
      @click="onAction"
    >
      <text class="action-text">{{ buttonText }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  text?: string
  buttonText?: string
}

withDefaults(defineProps<Props>(), {
  icon: '🔍',
  text: '暂无数据',
  buttonText: ''
})

const emit = defineEmits<{
  action: []
}>()

function onAction() {
  emit('action')
}
</script>

<style scoped lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2 $spacing-xl;
}

.icon {
  font-size: 96rpx;
  margin-bottom: $spacing-lg;
}

.text {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-lg;
}

.action-btn {
  padding: $spacing-sm $spacing-xl;
  background-color: $primary-color;
  border-radius: $radius-pill;
}

.action-text {
  font-size: $font-md;
  color: #FFFFFF;
}
</style>
