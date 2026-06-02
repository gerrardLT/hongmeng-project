<template>
  <view class="style-choose-page">
    <!-- 项目标题 -->
    <view v-if="project" class="project-header">
      <text class="project-name">{{ project.name }}</text>
      <text class="project-desc">请选择您喜欢的颜色和形状</text>
    </view>

    <!-- 颜色选择 -->
    <view v-if="project && project.colors.length > 0" class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">选择颜色</text>
        </view>
      </view>
      <view class="color-grid">
        <view
          v-for="(color, idx) in project.colors"
          :key="idx"
          class="color-card"
          :class="{ active: selectedColor === color }"
          @click="selectColor(color)"
        >
          <view class="color-block-outer">
            <view class="color-block" :style="{ backgroundColor: mapColor(color) }"></view>
          </view>
          <text class="color-name">{{ color }}</text>
          <view v-if="selectedColor === color" class="check-mark">
            <text class="check-text">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 形状选择 -->
    <view v-if="project && project.shapes.length > 0" class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">选择形状</text>
        </view>
      </view>
      <view class="shape-grid">
        <view
          v-for="(shape, idx) in project.shapes"
          :key="idx"
          class="shape-card"
          :class="{ active: selectedShape === shape }"
          @click="selectShape(shape)"
        >
          <text class="shape-icon">{{ shapeIcon(shape) }}</text>
          <text class="shape-name">{{ shape }}</text>
          <view v-if="selectedShape === shape" class="shape-check">
            <text class="shape-check-text">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 效果预览 -->
    <view class="preview-section">
      <view class="section-header">
        <view class="section-title-wrap">
          <view class="section-accent"></view>
          <text class="section-title">效果预览</text>
        </view>
      </view>
      <view class="preview-card">
        <view v-if="selectedColor || selectedShape" class="preview-content">
          <view class="preview-visual">
            <view
              class="preview-shape"
              :style="{ backgroundColor: selectedColor ? mapColor(selectedColor) : '#E0E0E0' }"
            >
              <text v-if="selectedShape" class="preview-shape-text">{{ selectedShape }}</text>
            </view>
          </view>
          <view class="preview-info">
            <text class="preview-label">当前选择</text>
            <text class="preview-value">
              {{ previewText }}
            </text>
          </view>
        </view>
        <view v-else class="preview-empty">
          <text class="preview-empty-icon">🎨</text>
          <text class="preview-empty-text">请先选择颜色和形状</text>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view class="bottom-placeholder"></view>

    <!-- 底部固定按钮 -->
    <view class="bottom-bar">
      <view class="bottom-inner">
        <view
          class="confirm-btn"
          :class="{ disabled: !selectedColor || !selectedShape }"
          @click="confirmSelection"
        >
          <text class="confirm-btn-text">确认选择</text>
        </view>
      </view>
      <view class="safe-bottom"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProjectDetail } from '@/services/project'
import type { Project } from '@/types/models'

const project = ref<Project | null>(null)
const selectedColor = ref('')
const selectedShape = ref('')

const colorMap: Record<string, string> = {
  '琥珀金': '#D4A017',
  '深海蓝': '#1E3A5F',
  '樱花粉': '#FFB7C5',
  '翡翠绿': '#50C878',
  '透明色': '#E8F4F8',
  '彩虹渐变': '#FF6B6B',
  '日落橙红': '#FF7043',
  '海洋蓝绿': '#26A69A',
  '紫罗兰': '#9C27B0',
  '冰透白': '#F0F8FF',
  '香槟金': '#F7E7CE',
  '玫瑰粉': '#E91E63',
  '夜空蓝': '#1A237E',
  '磨砂白': '#F5F5F5',
  '渐变蓝': '#42A5F5',
  '琥珀黄': '#FFC107',
  '深蓝星空': '#0D1B2A',
  '紫色星云': '#7B1FA2',
  '银河银白': '#C0C0C0',
  '极光绿': '#69F0AE',
  '粉边绿': '#A5D6A7',
  '蓝灰': '#78909C',
  '果冻色': '#FFCCBC',
  '浅蓝': '#81D4FA',
  '淡紫': '#CE93D8',
  '薄荷绿': '#B2DFDB',
  '朱砂红': '#D32F2F',
  '孔雀蓝': '#00838F',
  '墨玉黑': '#212121'
}

const shapeIcons: Record<string, string> = {
  '圆环': '⭕',
  '波浪': '〰',
  '扭曲': '🌀',
  '水滴': '💧',
  '圆形': '🔵',
  '长条': '📏',
  '心形': '❤️',
  '菱形': '🔶',
  '椭圆': '🥚',
  '六边形': '⬡',
  '圆球': '⚪',
  '细长颈': '🍾',
  '宽口': '🏺',
  '立方体': '📦',
  '莲花掌': '🪷',
  '石莲花': '🌸',
  '佛珠': '📿',
  '直筒': '🧪',
  '锥形': '🔺',
  '螺旋': '🧬',
  '圆珠': '⚫',
  '桶珠': '🛢',
  '扁圆': '🥏'
}

const previewText = computed(() => {
  const parts: string[] = []
  if (selectedColor.value) parts.push(selectedColor.value)
  if (selectedShape.value) parts.push(selectedShape.value)
  return parts.length > 0 ? parts.join(' + ') : '未选择'
})

function mapColor(name: string): string {
  return colorMap[name] || '#E0E0E0'
}

function shapeIcon(name: string): string {
  return shapeIcons[name] || '✨'
}

function selectColor(color: string) {
  selectedColor.value = color
}

function selectShape(shape: string) {
  selectedShape.value = shape
}

async function loadData(projectId: string) {
  try {
    const res = await getProjectDetail(projectId)
    project.value = res
  } catch (e) {
    console.error('load project error:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

function confirmSelection() {
  if (!selectedColor.value || !selectedShape.value) {
    uni.showToast({ title: '请选择颜色和形状', icon: 'none' })
    return
  }
  if (!project.value) return

  uni.navigateTo({
    url: `/pages/booking/create?projectId=${project.value.projectId}&studioId=${project.value.studioId}&color=${encodeURIComponent(selectedColor.value)}&shape=${encodeURIComponent(selectedShape.value)}`
  })
}

onLoad((options) => {
  const projectId = options?.projectId as string
  if (projectId) {
    loadData(projectId)
  }
})
</script>

<style scoped lang="scss">
.style-choose-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 120rpx;
}

/* 项目标题 */
.project-header {
  background: linear-gradient(180deg, #FFF0F0 0%, $bg-page 100%);
  padding: 32rpx 32rpx 24rpx;
}

.project-name {
  font-size: 34rpx;
  font-weight: 700;
  color: $text-primary;
  display: block;
  margin-bottom: 8rpx;
}

.project-desc {
  font-size: 26rpx;
  color: $text-secondary;
}

/* 通用 section */
.section {
  margin: 24rpx 32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.section-accent {
  width: 6rpx;
  height: 32rpx;
  background: linear-gradient(180deg, #FF6B6B, #4ECDC4);
  border-radius: 3rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-primary;
}

/* 颜色网格 */
.color-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.color-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  background-color: #FAFAFA;
  position: relative;
  width: calc(25% - 15rpx);
  min-width: 120rpx;
}

.color-card.active {
  border-color: $primary;
  background-color: #FFF5F5;
}

.color-block-outer {
  padding: 4rpx;
  border-radius: 50%;
  border: 2rpx solid transparent;
}

.color-card.active .color-block-outer {
  border-color: $primary;
}

.color-block {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 0, 0, 0.06);
}

.color-name {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
}

.color-card.active .color-name {
  color: $primary;
  font-weight: 600;
}

.check-mark {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.check-text {
  font-size: 18rpx;
  color: #FFFFFF;
  font-weight: 700;
}

/* 形状网格 */
.shape-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.shape-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx 16rpx;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  background-color: #FAFAFA;
  position: relative;
  width: calc(33.333% - 14rpx);
  min-width: 160rpx;
}

.shape-card.active {
  border-color: $primary;
  background-color: #FFF5F5;
}

.shape-icon {
  font-size: 40rpx;
}

.shape-name {
  font-size: 24rpx;
  color: $text-secondary;
}

.shape-card.active .shape-name {
  color: $primary;
  font-weight: 600;
}

.shape-check {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background-color: $primary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shape-check-text {
  font-size: 18rpx;
  color: #FFFFFF;
  font-weight: 700;
}

/* 预览区 */
.preview-section {
  margin: 24rpx 32rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.preview-card {
  background-color: #FAFAFA;
  border-radius: $radius-md;
  padding: 32rpx;
}

.preview-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32rpx;
}

.preview-visual {
  flex-shrink: 0;
}

.preview-shape {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid $border-color;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.preview-shape-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 600;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.3);
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.preview-label {
  font-size: 24rpx;
  color: $text-hint;
}

.preview-value {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.preview-empty-icon {
  font-size: 64rpx;
  margin-bottom: 12rpx;
}

.preview-empty-text {
  font-size: 26rpx;
  color: $text-hint;
}

/* 底部占位 */
.bottom-placeholder {
  height: 140rpx;
}

/* 底部固定栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
  z-index: 100;
}

.bottom-inner {
  padding: 20rpx 32rpx;
}

.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.confirm-btn.disabled {
  background: #E0E0E0;
}

.confirm-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.confirm-btn.disabled .confirm-btn-text {
  color: $text-disabled;
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
