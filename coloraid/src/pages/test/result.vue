<template>
  <view class="result-page">
    <view class="result-card">
      <view class="result-icon" :class="resultType">
        <text class="icon-text">{{ typeIcon }}</text>
      </view>

      <text class="result-name">{{ typeName }}</text>
      <text class="result-desc">{{ typeDesc }}</text>

      <view v-if="mode === 'test' && confidence > 0" class="confidence-bar">
        <text class="confidence-label">检测置信度</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: confidencePercent }" />
        </view>
        <text class="confidence-value">{{ confidencePercent }}</text>
      </view>

      <view v-if="recommendedFilter" class="filter-recommend">
        <text class="filter-label">推荐滤镜</text>
        <text class="filter-name">{{ filterName }}</text>
      </view>
    </view>

    <view class="action-buttons">
      <view class="btn-primary" @click="handleUseFilter">
        <text class="btn-text">开始使用推荐滤镜</text>
      </view>
      <view class="btn-secondary" @click="handleRetest">
        <text class="btn-text">重新检测</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { ColorBlindType } from '@/types/models'
import { useSettingsStore } from '@/store/settings'

const settingsStore = useSettingsStore()

const resultType = ref<ColorBlindType>('normal')
const confidence = ref(0)
const mode = ref<'test' | 'manual'>('test')

onLoad((options) => {
  resultType.value = (options?.type as ColorBlindType) || 'normal'
  confidence.value = parseFloat(options?.confidence || '0')
  mode.value = (options?.mode as 'test' | 'manual') || 'test'
})

const confidencePercent = computed(() => {
  return `${Math.round(confidence.value * 100)}%`
})

const typeInfoMap: Record<ColorBlindType, { name: string; desc: string; icon: string }> = {
  protanopia: { name: '红色盲', desc: '难以区分红色和绿色', icon: '红' },
  deuteranopia: { name: '绿色盲', desc: '难以区分绿色和红色', icon: '绿' },
  tritanopia: { name: '蓝色盲', desc: '难以区分蓝色和黄色', icon: '蓝' },
  achromatopsia: { name: '全色盲', desc: '仅能看到灰度', icon: '灰' },
  normal: { name: '正常视觉', desc: '色彩感知正常', icon: 'N' }
}

const typeName = computed(() => typeInfoMap[resultType.value]?.name || '未知')
const typeDesc = computed(() => typeInfoMap[resultType.value]?.desc || '')
const typeIcon = computed(() => typeInfoMap[resultType.value]?.icon || '?')

const recommendedFilter = computed(() => {
  return settingsStore.getRecommendedFilter(resultType.value)
})

const filterNameMap: Record<string, string> = {
  protanopia: '红色盲辅助滤镜',
  deuteranopia: '绿色盲辅助滤镜',
  tritanopia: '蓝色盲辅助滤镜',
  achromatopsia: '全色盲辅助滤镜'
}

const filterName = computed(() => {
  return recommendedFilter.value ? filterNameMap[recommendedFilter.value] : '无'
})

function handleUseFilter() {
  settingsStore.setColorBlindType(resultType.value)
  uni.switchTab({ url: '/pages/index/index' })
}

function handleRetest() {
  uni.switchTab({ url: '/pages/test/index' })
}
</script>

<style scoped lang="scss">
.result-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-color;
  padding: $spacing-xl;
}

.result-card {
  width: 100%;
  max-width: 640rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  margin-top: 80rpx;
  margin-bottom: 60rpx;
  box-shadow: $shadow-md;
}

.result-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-lg;

  &.protanopia {
    background-color: rgba($error-color, 0.1);
    .icon-text {
      color: $error-color;
    }
  }

  &.deuteranopia {
    background-color: rgba($success-color, 0.1);
    .icon-text {
      color: $success-color;
    }
  }

  &.tritanopia {
    background-color: rgba($primary-color, 0.1);
    .icon-text {
      color: $primary-color;
    }
  }

  &.achromatopsia {
    background-color: rgba($text-secondary, 0.1);
    .icon-text {
      color: $text-secondary;
    }
  }

  &.normal {
    background-color: rgba($accent-color, 0.1);
    .icon-text {
      color: $accent-color;
    }
  }
}

.icon-text {
  font-size: 64rpx;
  font-weight: 700;
}

.result-name {
  font-size: $font-xxl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.result-desc {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-xl;
}

.confidence-bar {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-lg;
}

.confidence-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.progress-track {
  width: 100%;
  height: 16rpx;
  background-color: $border-color;
  border-radius: $radius-pill;
  overflow: hidden;
  margin-bottom: $spacing-sm;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary-color, $secondary-color);
  border-radius: $radius-pill;
  transition: width 0.5s ease;
}

.confidence-value {
  font-size: $font-lg;
  font-weight: 600;
  color: $primary-color;
}

.filter-recommend {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  background-color: $bg-color;
  border-radius: $radius-md;
  width: 100%;
}

.filter-label {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
}

.filter-name {
  font-size: $font-lg;
  font-weight: 500;
  color: $primary-color;
}

.action-buttons {
  width: 100%;
  max-width: 640rpx;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.btn-primary {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-color;
  border-radius: $radius-md;

  &:active {
    opacity: 0.9;
  }
}

.btn-secondary {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;

  &:active {
    background-color: $bg-color;
  }
}

.btn-text {
  font-size: $font-lg;
  font-weight: 500;
  color: #FFFFFF;
}

.btn-secondary .btn-text {
  color: $text-primary;
}
</style>
