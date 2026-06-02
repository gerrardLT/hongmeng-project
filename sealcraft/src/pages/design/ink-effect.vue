<template>
  <view class="ink-page">
    <!-- 印泥颜色对比 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">印泥颜色对比</text>
      </view>
      <view class="ink-compare-list">
        <view
          v-for="ink in inkEffects"
          :key="ink.value"
          class="ink-compare-card"
        >
          <view class="ink-preview-box" :style="{ backgroundColor: ink.paperBg }">
            <view
              class="ink-seal-frame"
              :style="{ borderColor: ink.color }"
            >
              <view class="ink-seal-text">
                <text
                  v-for="(char, idx) in displayChars"
                  :key="idx"
                  class="ink-char"
                  :style="{ color: ink.color }"
                >{{ char }}</text>
              </view>
            </view>
          </view>
          <view class="ink-info">
            <view class="ink-name-row">
              <view class="ink-dot" :style="{ backgroundColor: ink.color }" />
              <text class="ink-name">{{ ink.label }}</text>
            </view>
            <text class="ink-desc">{{ ink.description }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 不同纸张效果 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">纸张效果模拟</text>
      </view>
      <scroll-view class="h-scroll" scroll-x enhanced :show-scrollbar="false">
        <view class="paper-list">
          <view
            v-for="paper in paperTypes"
            :key="paper.value"
            :class="['paper-card', { active: selectedPaper === paper.value }]"
            @click="selectedPaper = paper.value"
          >
            <view class="paper-preview" :style="{ backgroundColor: paper.bgColor }">
              <view
                class="paper-seal-frame"
                :style="{ borderColor: currentInkColor }"
              >
                <view class="paper-seal-text">
                  <text
                    v-for="(char, idx) in displayChars"
                    :key="idx"
                    class="paper-char"
                    :style="{ color: currentInkColor }"
                  >{{ char }}</text>
                </view>
              </view>
            </view>
            <text class="paper-name">{{ paper.label }}</text>
            <text class="paper-desc">{{ paper.desc }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 综合对比区 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">三色 × 纸张综合对比</text>
      </view>
      <view class="compare-grid">
        <view class="compare-header-row">
          <view class="compare-corner" />
          <view
            v-for="ink in inkEffects"
            :key="ink.value"
            class="compare-header-cell"
          >
            <view class="ink-dot-sm" :style="{ backgroundColor: ink.color }" />
            <text class="compare-header-text">{{ ink.label }}</text>
          </view>
        </view>
        <view
          v-for="paper in paperTypes"
          :key="paper.value"
          class="compare-row"
        >
          <view class="compare-label-cell">
            <text class="compare-label-text">{{ paper.label }}</text>
          </view>
          <view
            v-for="ink in inkEffects"
            :key="ink.value"
            class="compare-cell"
            :style="{ backgroundColor: paper.bgColor }"
          >
            <view
              class="compare-seal"
              :style="{ borderColor: ink.color }"
            >
              <view class="compare-seal-text">
                <text
                  v-for="(char, idx) in displayChars"
                  :key="idx"
                  class="compare-char"
                  :style="{ color: ink.color }"
                >{{ char }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <view class="bottom-tip safe-bottom">
      <text class="tip-text">实际效果受印泥品质、盖印力度和纸张影响，以上为模拟参考</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const content = ref('')
const fontId = ref('')
const selectedInkColor = ref<'red' | 'vermilion' | 'blue'>('red')
const selectedPaper = ref('xuan')

// 印泥效果数据
const inkEffects = computed(() => [
  {
    label: '朱砂红',
    value: 'red' as const,
    color: '#C41A1A',
    paperBg: '#FBF8F5',
    description: '传统朱砂印泥，色泽沉稳浓郁，盖印效果庄重大方，是最经典的印泥色彩'
  },
  {
    label: '朱红',
    value: 'vermilion' as const,
    color: '#E85530',
    paperBg: '#FBF8F5',
    description: '朱红印泥，色调明亮鲜艳，印迹清晰饱满，适合书画作品和日常签章'
  },
  {
    label: '靛蓝',
    value: 'blue' as const,
    color: '#2B4F8C',
    paperBg: '#FBF8F5',
    description: '靛蓝印泥，古雅清新，多用于藏书章和文房印，别具文人气质'
  }
])

// 纸张类型
const paperTypes = [
  { label: '宣纸', value: 'xuan', bgColor: '#FBF8F5', desc: '吸墨性好，印迹自然晕染' },
  { label: '白纸', value: 'white', bgColor: '#FFFFFF', desc: '光滑白纸，印迹清晰锐利' },
  { label: '牛皮纸', value: 'kraft', bgColor: '#C4A87C', desc: '粗犷质感，印迹古朴厚重' }
]

const currentInkColor = computed(() => {
  const ink = inkEffects.value.find(i => i.value === selectedInkColor.value)
  return ink?.color || '#C41A1A'
})

const displayChars = computed(() => {
  const text = content.value.trim()
  if (!text) return ['印']
  return Array.from(text)
})

onLoad((options) => {
  if (options?.content) {
    content.value = decodeURIComponent(options.content)
  }
  if (options?.fontId) {
    fontId.value = options.fontId
  }
  if (options?.inkColor) {
    selectedInkColor.value = options.inkColor as 'red' | 'vermilion' | 'blue'
  }
})
</script>

<style scoped lang="scss">
.ink-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-header {
  margin-bottom: $spacing-md;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

/* ===== 印泥颜色对比 ===== */
.ink-compare-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.ink-compare-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
}

.ink-preview-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx 24rpx;
}

.ink-seal-frame {
  border: 6rpx solid $primary;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28rpx;
  min-width: 180rpx;
  min-height: 180rpx;
}

.ink-seal-text {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
  justify-content: center;
  align-items: center;
}

.ink-char {
  font-size: 56rpx;
  font-weight: 900;
  color: $primary;
}

.ink-info {
  padding: $spacing-md;
  border-top: 1rpx solid #F0EBE6;
}

.ink-name-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.ink-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
}

.ink-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
}

.ink-desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.6;
}

/* ===== 纸张效果 ===== */
.h-scroll {
  white-space: nowrap;
}

.paper-list {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  padding: 4rpx 0;
}

.paper-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 260rpx;
  padding: 20rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  border: 2rpx solid transparent;
  flex-shrink: 0;
}

.paper-card.active {
  border-color: $primary;
}

.paper-preview {
  width: 220rpx;
  height: 220rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;
  margin-bottom: 16rpx;
}

.paper-seal-frame {
  border: 4rpx solid $primary;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  min-width: 120rpx;
  min-height: 120rpx;
}

.paper-seal-text {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4rpx;
  justify-content: center;
  align-items: center;
}

.paper-char {
  font-size: 36rpx;
  font-weight: 900;
  color: $primary;
}

.paper-name {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 6rpx;
}

.paper-desc {
  font-size: 20rpx;
  color: $text-hint;
  text-align: center;
}

/* ===== 综合对比 ===== */
.compare-grid {
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
}

.compare-header-row {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid #F0EBE6;
}

.compare-corner {
  width: 120rpx;
  flex-shrink: 0;
}

.compare-header-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx;
}

.ink-dot-sm {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-bottom: 6rpx;
}

.compare-header-text {
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 600;
}

.compare-row {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid #F0EBE6;
}

.compare-row:last-child {
  border-bottom: none;
}

.compare-label-cell {
  width: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: $bg-card;
  padding: 8rpx;
}

.compare-label-text {
  font-size: 22rpx;
  color: $text-secondary;
  font-weight: 600;
}

.compare-cell {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx;
  border-left: 1rpx solid #F0EBE6;
}

.compare-seal {
  border: 3rpx solid $primary;
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  width: 72rpx;
  height: 72rpx;
}

.compare-seal-text {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 2rpx;
  justify-content: center;
  align-items: center;
}

.compare-char {
  font-size: 20rpx;
  font-weight: 900;
  color: $primary;
}

/* ===== 底部提示 ===== */
.bottom-tip {
  padding: 32rpx 0;
  text-align: center;
}

.tip-text {
  font-size: 22rpx;
  color: $text-hint;
}
</style>
