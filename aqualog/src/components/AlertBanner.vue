<template>
  <view v-if="activeAlerts.length > 0" class="alert-banner" :class="'alert-' + topAlert.level" @click="onTapAlert">
    <swiper
      class="alert-swiper"
      :autoplay="activeAlerts.length > 1"
      :interval="4000"
      :circular="true"
      :current="currentIndex"
      @change="onSwiperChange"
    >
      <swiper-item v-for="alert in activeAlerts" :key="alert.alertId">
        <view class="alert-content">
          <view class="alert-icon">
            <text class="icon-text">{{ getAlertIcon(alert.level) }}</text>
          </view>
          <view class="alert-text">
            <text class="alert-title">{{ alert.title }}</text>
            <text class="alert-message text-ellipsis">{{ alert.message }}</text>
          </view>
          <text class="alert-arrow">›</text>
        </view>
      </swiper-item>
    </swiper>
    <view v-if="activeAlerts.length > 1" class="alert-indicator">
      <view
        v-for="(_, index) in activeAlerts"
        :key="index"
        class="indicator-dot"
        :class="{ active: index === currentIndex }"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { AlertItem } from '@/types/models'

const props = withDefaults(defineProps<{
  alerts: AlertItem[]
}>(), {})

const emit = defineEmits<{
  'tapAlert': [alertId: string]
}>()

const currentIndex = ref(0)

const levelPriority: Record<string, number> = {
  danger: 3,
  warning: 2,
  info: 1
}

const activeAlerts = computed(() => {
  return props.alerts
    .filter(a => !a.dismissed)
    .sort((a, b) => (levelPriority[b.level] || 0) - (levelPriority[a.level] || 0))
})

const topAlert = computed(() => {
  return activeAlerts.value[0] || { level: 'info' }
})

function getAlertIcon(level: string): string {
  if (level === 'danger') return '⚠'
  if (level === 'warning') return '⚡'
  return 'ℹ'
}

function onSwiperChange(e: any) {
  currentIndex.value = e.detail.current
}

function onTapAlert() {
  const alert = activeAlerts.value[currentIndex.value]
  if (alert) {
    emit('tapAlert', alert.alertId)
  }
}
</script>

<style scoped lang="scss">
.alert-banner {
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-md;
  overflow: hidden;

  &.alert-danger {
    background: linear-gradient(135deg, #E74C3C, #C0392B);
  }

  &.alert-warning {
    background: linear-gradient(135deg, #F39C12, #E67E22);
  }

  &.alert-info {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
  }
}

.alert-swiper {
  height: 96rpx;
}

.alert-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 96rpx;
}

.alert-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
  flex-shrink: 0;
}

.icon-text {
  font-size: $font-lg;
}

.alert-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alert-title {
  font-size: $font-md;
  font-weight: $font-weight-bold;
  color: $text-white;
  line-height: 1.4;
}

.alert-message {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

.alert-arrow {
  font-size: $font-xl;
  color: rgba(255, 255, 255, 0.6);
  margin-left: $spacing-sm;
  flex-shrink: 0;
}

.alert-indicator {
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding-top: $spacing-xs;
  gap: 8rpx;
}

.indicator-dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: $radius-round;
  background: rgba(255, 255, 255, 0.35);
  transition: all $transition-fast;

  &.active {
    width: 24rpx;
    border-radius: $radius-pill;
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>
