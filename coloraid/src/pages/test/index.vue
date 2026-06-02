<template>
  <view class="test-page">
    <!-- 石原图测试模式 -->
    <view v-if="!showManualMode" class="test-mode">
      <view class="header-bar">
        <text class="page-title">色盲类型检测</text>
        <text class="skip-test" @click="handleSkipTest">跳过测试</text>
      </view>

      <view class="plate-container" :key="currentIndex">
        <IshiharaPlate
          v-if="plates.length > 0 && currentIndex < plates.length"
          :plate="plates[currentIndex]"
          :current-index="currentIndex"
          :total="plates.length"
          @answer="handleAnswer"
          @skip="handleSkipPlate"
        />
      </view>
    </view>

    <!-- 手动选择模式 -->
    <view v-else class="manual-mode">
      <view class="manual-header">
        <text class="manual-title">选择您的视觉类型</text>
        <text class="manual-subtitle">如果已知自己的色盲类型，可直接选择</text>
      </view>

      <view class="type-cards">
        <view
          v-for="item in manualOptions"
          :key="item.value"
          class="type-card"
          :class="item.value"
          @click="handleManualSelect(item.value)"
        >
          <view class="card-icon">
            <text class="icon-text">{{ item.icon }}</text>
          </view>
          <text class="card-title">{{ item.label }}</text>
          <text class="card-desc">{{ item.desc }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { IshiharaPlate as IshiharaPlateType, ColorBlindType } from '@/types/models'
import { getTestPlates, evaluateTest } from '@/services/colorTest'
import IshiharaPlate from '@/components/IshiharaPlate.vue'

const plates = ref<IshiharaPlateType[]>([])
const currentIndex = ref(0)
const answers = ref<{ plateId: string; selected: string }[]>([])
const showManualMode = ref(false)

onMounted(() => {
  plates.value = getTestPlates()
})

function handleAnswer(selected: string) {
  const plate = plates.value[currentIndex.value]
  answers.value.push({ plateId: plate.plateId, selected })

  if (currentIndex.value < plates.value.length - 1) {
    currentIndex.value++
  } else {
    // 答完所有题，评估结果
    const result = evaluateTest(answers.value)
    goToResult(result.colorBlindType, result.confidence, 'test')
  }
}

function handleSkipPlate() {
  if (currentIndex.value < plates.value.length - 1) {
    currentIndex.value++
  } else {
    // 最后一题也跳过
    if (answers.value.length === 0) {
      showManualMode.value = true
    } else {
      const result = evaluateTest(answers.value)
      goToResult(result.colorBlindType, result.confidence, 'test')
    }
  }
}

function handleSkipTest() {
  showManualMode.value = true
}

const manualOptions = [
  {
    value: 'deuteranopia' as ColorBlindType,
    label: '红绿色盲',
    desc: '难以区分红色和绿色',
    icon: 'RG'
  },
  {
    value: 'tritanopia' as ColorBlindType,
    label: '蓝黄色盲',
    desc: '难以区分蓝色和黄色',
    icon: 'BY'
  },
  {
    value: 'achromatopsia' as ColorBlindType,
    label: '全色盲',
    desc: '仅能看到灰度',
    icon: 'AC'
  },
  {
    value: 'normal' as ColorBlindType,
    label: '正常视觉',
    desc: '色彩感知正常',
    icon: 'N'
  }
]

function handleManualSelect(type: ColorBlindType) {
  goToResult(type, 0, 'manual')
}

function goToResult(type: ColorBlindType, confidence: number, mode: 'test' | 'manual') {
  uni.navigateTo({
    url: `/pages/test/result?type=${type}&confidence=${confidence}&mode=${mode}`
  })
}
</script>

<style scoped lang="scss">
.test-page {
  min-height: 100vh;
  background-color: $bg-color;
}

.test-mode {
  display: flex;
  flex-direction: column;
}

.header-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-lg;
  background-color: $bg-card;
}

.page-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
}

.skip-test {
  font-size: $font-sm;
  color: $text-hint;

  &:active {
    color: $primary-color;
  }
}

.plate-container {
  animation: slideIn 0.3s ease;
}

.manual-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl;
}

.manual-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60rpx;
  margin-bottom: 60rpx;
}

.manual-title {
  font-size: $font-xl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.manual-subtitle {
  font-size: $font-md;
  color: $text-secondary;
}

.type-cards {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $spacing-md;
}

.type-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-lg $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.96);
    border-color: $primary-color;
  }

  &.deuteranopia {
    .card-icon {
      background-color: rgba($error-color, 0.1);
    }
    .icon-text {
      color: $error-color;
    }
  }

  &.tritanopia {
    .card-icon {
      background-color: rgba($warning-color, 0.1);
    }
    .icon-text {
      color: $warning-color;
    }
  }

  &.achromatopsia {
    .card-icon {
      background-color: rgba($text-secondary, 0.1);
    }
    .icon-text {
      color: $text-secondary;
    }
  }

  &.normal {
    .card-icon {
      background-color: rgba($success-color, 0.1);
    }
    .icon-text {
      color: $success-color;
    }
  }
}

.card-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.icon-text {
  font-size: $font-md;
  font-weight: 600;
}

.card-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.card-desc {
  font-size: $font-sm;
  color: $text-secondary;
  text-align: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
