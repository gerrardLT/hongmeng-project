<template>
  <view class="page">
    <NavBar title="选择风格" />

    <scroll-view class="content" scroll-y>
      <!-- 页面标题 -->
      <view class="page-header">
        <text class="page-title">选择您喜欢的设计风格</text>
        <text class="page-subtitle">最多可选择3种风格，我们将为您推荐匹配的纪念品设计</text>
      </view>

      <!-- 风格卡片列表 -->
      <view class="style-list">
        <view
          v-for="item in styleList"
          :key="item.value"
          class="style-card"
          :class="{ active: selectedStyles.includes(item.value) }"
          @click="toggleStyle(item.value)"
        >
          <!-- 勾选标记 -->
          <view v-if="selectedStyles.includes(item.value)" class="check-mark">
            <text class="check-icon">✓</text>
          </view>

          <!-- 风格预览区域 -->
          <view class="style-preview" :style="{ background: item.gradient }">
            <text class="preview-emoji">{{ item.emoji }}</text>
          </view>

          <!-- 风格信息 -->
          <view class="style-info">
            <text class="style-name">{{ item.name }}</text>
            <text class="style-desc">{{ item.description }}</text>
          </view>

          <!-- 代表色 -->
          <view class="color-dots">
            <view
              v-for="(color, idx) in item.colors"
              :key="idx"
              class="color-dot"
              :style="{ backgroundColor: color }"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部确认按钮 -->
    <view class="footer">
      <view class="selected-count">
        <text class="count-text">已选择 {{ selectedStyles.length }}/3 种风格</text>
      </view>
      <view
        class="confirm-btn"
        :class="{ disabled: selectedStyles.length === 0 }"
        @click="onConfirm"
      >
        <text class="confirm-text">确认选择</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import type { DesignStyle } from '@/types/models'

interface StyleItem {
  value: DesignStyle
  name: string
  description: string
  emoji: string
  gradient: string
  colors: string[]
}

const styleList: StyleItem[] = [
  {
    value: 'modern',
    name: '简约现代',
    description: '线条简洁、色彩明快，以留白和几何元素营造高级质感',
    emoji: '◇',
    gradient: 'linear-gradient(135deg, #E8E8E8 0%, #F5F5F5 50%, #FFFFFF 100%)',
    colors: ['#212121', '#757575', '#E0E0E0']
  },
  {
    value: 'vintage',
    name: '复古欧式',
    description: '华丽花纹与复古色调，呈现经典欧洲贵族气质的浪漫风格',
    emoji: '❋',
    gradient: 'linear-gradient(135deg, #8B6914 0%, #C9A96E 50%, #F5E6CC 100%)',
    colors: ['#8B6914', '#C9A96E', '#F5E6CC']
  },
  {
    value: 'cartoon',
    name: '卡通可爱',
    description: '圆润造型与缤纷色彩，让纪念品充满童趣与活泼气息',
    emoji: '★',
    gradient: 'linear-gradient(135deg, #FFB6C1 0%, #FFDAB9 50%, #FFFACD 100%)',
    colors: ['#FF6B9D', '#FFB347', '#87CEEB']
  },
  {
    value: 'traditional',
    name: '中式传统',
    description: '祥云纹样与水墨意境，传承东方美学与文化底蕴',
    emoji: '卍',
    gradient: 'linear-gradient(135deg, #8B0000 0%, #CD853F 50%, #F5DEB3 100%)',
    colors: ['#8B0000', '#CD853F', '#F5DEB3']
  },
  {
    value: 'custom',
    name: '个性定制',
    description: '完全按您的想法设计，从元素到配色都可自由定义',
    emoji: '✦',
    gradient: 'linear-gradient(135deg, #FF6B35 0%, #FF8C5A 50%, #FFD700 100%)',
    colors: ['#FF6B35', '#FF8C5A', '#FFD700']
  }
]

const selectedStyles = ref<DesignStyle[]>([])

function toggleStyle(style: DesignStyle) {
  const idx = selectedStyles.value.indexOf(style)
  if (idx > -1) {
    selectedStyles.value.splice(idx, 1)
  } else {
    if (selectedStyles.value.length >= 3) {
      uni.showToast({ title: '最多选择3种风格', icon: 'none' })
      return
    }
    selectedStyles.value.push(style)
  }
}

function onConfirm() {
  if (selectedStyles.value.length === 0) {
    uni.showToast({ title: '请至少选择一种风格', icon: 'none' })
    return
  }

  const stylesParam = selectedStyles.value.join(',')

  // 保存到本地缓存
  uni.setStorageSync('selectedDesignStyles', selectedStyles.value)

  uni.showToast({
    title: '风格已保存',
    icon: 'success',
    success: () => {
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages/design/preview?style=${stylesParam}`
        })
      }, 1200)
    }
  })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: $bg-page;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  overflow: hidden;
}

.page-header {
  padding: 32rpx 32rpx 16rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 12rpx;
}

.page-subtitle {
  font-size: 26rpx;
  color: $text-secondary;
  line-height: 1.5;
}

.style-list {
  padding: 0 24rpx 24rpx;
}

.style-card {
  position: relative;
  background-color: $bg-card;
  border-radius: $radius-lg;
  margin-bottom: 24rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  border: 4rpx solid transparent;
  transition: all 0.3s;
  overflow: hidden;
}

.style-card.active {
  border-color: $primary;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.2);
}

.check-mark {
  position: absolute;
  top: 0;
  right: 0;
  width: 52rpx;
  height: 52rpx;
  background-color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: $radius-md;
}

.check-icon {
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.style-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.preview-emoji {
  font-size: 48rpx;
  color: rgba(0, 0, 0, 0.35);
}

.style-info {
  flex: 1;
  min-width: 0;
}

.style-name {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.style-desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  display: block;
}

.color-dots {
  display: flex;
  gap: 10rpx;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.color-dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
}

.footer {
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
}

.selected-count {
  text-align: center;
  margin-bottom: 16rpx;
}

.count-text {
  font-size: 26rpx;
  color: $text-secondary;
}

.confirm-btn {
  height: 88rpx;
  background-color: $primary;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-btn.disabled {
  background-color: $text-disabled;
}

.confirm-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}
</style>
