<template>
  <view v-if="visible" class="reminder-overlay" @click.stop="onCancel">
    <view class="reminder-modal" @click.stop>
      <view class="reminder-modal__handle" />
      <text class="reminder-modal__title">提醒设置</text>

      <!-- 模式切换 -->
      <view class="reminder-modal__mode">
        <view
          class="mode-tab"
          :class="{ 'mode-tab--active': currentMode === 'fixed' }"
          @click="onSwitchMode('fixed')"
        >
          <text class="mode-tab__text">固定周期</text>
        </view>
        <view
          class="mode-tab"
          :class="{ 'mode-tab--active': currentMode === 'smart' }"
          @click="onSwitchMode('smart')"
        >
          <text class="mode-tab__text">智能模式</text>
        </view>
      </view>

      <!-- 固定模式设置 -->
      <view v-if="currentMode === 'fixed'" class="reminder-modal__fixed">
        <view class="slider-group">
          <view class="slider-group__header">
            <text class="slider-group__label">浇水间隔</text>
            <text class="slider-group__value">{{ waterInterval }}天</text>
          </view>
          <slider
            class="slider-group__slider"
            :min="1"
            :max="30"
            :value="waterInterval"
            :block-size="20"
            activeColor="#4CAF50"
            backgroundColor="#E8F5E9"
            @change="onWaterChange"
          />
        </view>
        <view class="slider-group">
          <view class="slider-group__header">
            <text class="slider-group__label">施肥间隔</text>
            <text class="slider-group__value">{{ fertilizeInterval }}天</text>
          </view>
          <slider
            class="slider-group__slider"
            :min="7"
            :max="90"
            :value="fertilizeInterval"
            :block-size="20"
            activeColor="#4CAF50"
            backgroundColor="#E8F5E9"
            @change="onFertilizeChange"
          />
        </view>
      </view>

      <!-- 智能模式说明 -->
      <view v-else class="reminder-modal__smart">
        <view class="smart-info">
          <text class="smart-info__icon">🌿</text>
          <text class="smart-info__text">
            智能模式将根据当前季节、天气温湿度自动调整浇水和施肥周期。夏季高温时自动缩短浇水间隔，冬季休眠期自动延长。
          </text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="reminder-modal__actions">
        <view class="btn-cancel" @click="onCancel">
          <text class="btn-cancel__text">取消</text>
        </view>
        <view class="btn-confirm" @click="onConfirm">
          <text class="btn-confirm__text">确认</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Plant, ReminderMode, ReminderSettings } from '@/types/models'

const props = withDefaults(defineProps<{
  visible: boolean
  plant?: Plant
  mode?: ReminderMode
}>(), {
  mode: 'fixed'
})

const emit = defineEmits<{
  'confirm': [settings: ReminderSettings]
  'cancel': []
  'update:visible': [value: boolean]
}>()

const currentMode = ref<ReminderMode>(props.mode)
const waterInterval = ref(3)
const fertilizeInterval = ref(30)

watch(() => props.plant, (val) => {
  if (val) {
    currentMode.value = val.reminderMode || 'fixed'
    waterInterval.value = val.reminderSettings?.waterInterval || 3
    fertilizeInterval.value = val.reminderSettings?.fertilizeInterval || 30
  }
}, { immediate: true })

watch(() => props.mode, (val) => {
  currentMode.value = val
})

function onSwitchMode(m: ReminderMode) {
  currentMode.value = m
}

function onWaterChange(e: any) {
  waterInterval.value = e.detail.value
}

function onFertilizeChange(e: any) {
  fertilizeInterval.value = e.detail.value
}

function onConfirm() {
  const settings: ReminderSettings = {
    waterInterval: waterInterval.value,
    fertilizeInterval: fertilizeInterval.value,
    smartAdjust: currentMode.value === 'smart'
  }
  emit('confirm', settings)
  emit('update:visible', false)
}

function onCancel() {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.reminder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10000;
}

.reminder-modal {
  width: 100%;
  background-color: $bg-card;
  border-radius: $radius-lg $radius-lg 0 0;
  padding: $spacing-md $spacing-lg $spacing-xl;
  display: flex;
  flex-direction: column;

  &__handle {
    width: 60rpx;
    height: 8rpx;
    background-color: $border-color;
    border-radius: 4rpx;
    align-self: center;
    margin-bottom: $spacing-lg;
  }

  &__title {
    font-size: $font-xl;
    font-weight: $font-weight-bold;
    color: $text-primary;
    text-align: center;
    margin-bottom: $spacing-lg;
  }

  &__mode {
    display: flex;
    flex-direction: row;
    background-color: $bg-grey;
    border-radius: $radius-sm;
    padding: 4rpx;
    margin-bottom: $spacing-lg;
  }

  &__fixed {
    margin-bottom: $spacing-lg;
  }

  &__smart {
    margin-bottom: $spacing-lg;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    gap: $spacing-md;
  }
}

.mode-tab {
  flex: 1;
  height: 68rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  transition: all $transition-fast;

  &--active {
    background-color: $bg-card;
    box-shadow: $shadow-sm;
  }

  &__text {
    font-size: $font-md;
    color: $text-secondary;

    .mode-tab--active & {
      color: $primary-color;
      font-weight: $font-weight-medium;
    }
  }
}

.slider-group {
  margin-bottom: $spacing-lg;

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-sm;
  }

  &__label {
    font-size: $font-md;
    color: $text-primary;
  }

  &__value {
    font-size: $font-md;
    color: $primary-color;
    font-weight: $font-weight-bold;
  }

  &__slider {
    margin: 0;
  }
}

.smart-info {
  display: flex;
  flex-direction: row;
  background-color: $primary-lighter;
  border-radius: $radius-md;
  padding: $spacing-md;

  &__icon {
    font-size: 40rpx;
    margin-right: $spacing-sm;
    flex-shrink: 0;
  }

  &__text {
    font-size: $font-sm;
    color: $text-secondary;
    line-height: 1.8;
  }
}

.btn-cancel {
  flex: 1;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-grey;
  border-radius: $radius-xl;

  &__text {
    font-size: $font-md;
    color: $text-secondary;
    font-weight: $font-weight-medium;
  }
}

.btn-confirm {
  flex: 1;
  height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-xl;
  box-shadow: $shadow-primary;

  &__text {
    font-size: $font-md;
    color: $text-white;
    font-weight: $font-weight-bold;
  }
}
</style>
