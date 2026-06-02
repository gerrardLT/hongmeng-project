<template>
  <view class="design-page">
    <!-- Canvas 实时预览区 -->
    <view class="preview-section">
      <view class="canvas-wrapper">
        <canvas
          id="designCanvas"
          canvas-id="designCanvas"
          type="2d"
          class="design-canvas"
        />
        <view v-if="!designStore.hasPattern" class="canvas-placeholder">
          <text class="placeholder-icon">🎨</text>
          <text class="placeholder-text">请选择纹样开始创作</text>
        </view>
      </view>
      <text class="pattern-name" v-if="designStore.currentPattern">
        {{ designStore.currentPattern.name }}
      </text>
    </view>

    <!-- 参数调节面板 -->
    <scroll-view class="panel-section" scroll-y>
      <!-- 基础参数 -->
      <view class="panel-group">
        <text class="panel-title">基础参数</text>

        <!-- 密度选择 -->
        <view class="param-row">
          <text class="param-label">密度</text>
          <view class="btn-group">
            <view
              v-for="item in densityOptions"
              :key="item.value"
              class="toggle-btn"
              :class="{ active: designStore.parameters.density === item.value }"
              @click="onDensityChange(item.value)"
            >
              <text class="toggle-text">{{ item.label }}</text>
            </view>
          </view>
        </view>

        <!-- 大小调节 -->
        <ParameterSlider
          :modelValue="designStore.parameters.size"
          label="大小"
          :min="0"
          :max="100"
          :step="1"
          @update:modelValue="onSizeChange"
        />

        <!-- 旋转选择 -->
        <view class="param-row">
          <text class="param-label">旋转</text>
          <view class="btn-group">
            <view
              v-for="item in rotationOptions"
              :key="item.value"
              class="toggle-btn"
              :class="{ active: designStore.parameters.rotation === item.value }"
              @click="onRotationChange(item.value)"
            >
              <text class="toggle-text">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 高级参数 -->
      <view
        class="panel-group"
        v-if="advancedParams.length > 0"
      >
        <text class="panel-title">高级参数</text>
        <ParameterSlider
          v-for="param in advancedParams"
          :key="param.key"
          :modelValue="Number(param.value)"
          :label="param.key"
          :min="0"
          :max="100"
          :step="1"
          @update:modelValue="(v: number) => onAdvancedChange(param.key, v)"
        />
      </view>

      <!-- 配色方案选择 -->
      <view class="panel-group">
        <view class="panel-header">
          <text class="panel-title">配色方案</text>
          <text class="panel-action" @click="goCustomColor">自定义</text>
        </view>
        <scroll-view class="color-list" scroll-x>
          <view class="color-scroll-inner">
            <ColorSwatch
              v-for="scheme in colorSchemes"
              :key="scheme.colorId"
              :scheme="[scheme.primaryColor, scheme.secondaryColor, scheme.accentColor]"
              :name="scheme.name"
              :selected="designStore.colorScheme?.colorId === scheme.colorId"
              @click="onSelectColor(scheme)"
            />
          </view>
        </scroll-view>
      </view>

      <!-- 底部留白，防止按钮遮挡 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 操作按钮栏 -->
    <view class="action-bar">
      <view class="action-btn secondary-btn" @click="onRandomize">
        <text class="btn-icon">🎲</text>
        <text class="btn-text">随机生成</text>
      </view>
      <view class="action-btn secondary-btn" @click="onSave">
        <text class="btn-icon">💾</text>
        <text class="btn-text">保存作品</text>
      </view>
      <view class="action-btn primary-btn" @click="onExport">
        <text class="btn-icon">📤</text>
        <text class="btn-text">导出</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, toRef } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useDesignStore } from '@/store/design'
import { getPatternById, loadBuiltinPatterns, recordPatternUsage } from '@/services/pattern'
import { getPresetSchemes } from '@/services/colorScheme'
import { renderToCanvas } from '@/services/render'
import { createArtwork } from '@/services/artwork'
import type { PatternDensity, PatternRotation, ColorScheme } from '@/types/models'
import ParameterSlider from '@/components/ParameterSlider.vue'
import ColorSwatch from '@/components/ColorSwatch.vue'

const designStore = useDesignStore()

const densityOptions = [
  { label: '稀疏', value: 'sparse' as PatternDensity },
  { label: '适中', value: 'medium' as PatternDensity },
  { label: '密集', value: 'dense' as PatternDensity }
]

const rotationOptions = [
  { label: '0°', value: '0' as PatternRotation },
  { label: '45°', value: '45' as PatternRotation },
  { label: '90°', value: '90' as PatternRotation },
  { label: '随机', value: 'random' as PatternRotation }
]

/** 配色方案列表 */
const colorSchemes = ref<ColorScheme[]>([])

/** 高级参数列表 */
const advancedParams = computed(() => {
  const adv = designStore.parameters.advanced || {}
  return Object.entries(adv).map(([key, value]) => ({ key, value }))
})

/** 加载配色 */
function loadColorSchemes() {
  colorSchemes.value = getPresetSchemes()
  // 如果未选配色且列表不为空，默认选第一个
  if (!designStore.colorScheme && colorSchemes.value.length > 0) {
    designStore.setColorScheme(colorSchemes.value[0])
  }
}

/** 渲染 canvas */
function doRender() {
  if (!designStore.currentPattern || !designStore.colorScheme) return
  nextTick(() => {
    renderToCanvas('designCanvas', designStore.currentPattern!, designStore.parameters, designStore.colorScheme!)
  })
}

// ===== 事件处理 =====
function onDensityChange(val: PatternDensity) {
  designStore.updateParameter('density', val)
}

function onSizeChange(val: number) {
  designStore.updateParameter('size', val)
}

function onRotationChange(val: PatternRotation) {
  designStore.updateParameter('rotation', val)
}

function onAdvancedChange(key: string, val: number) {
  designStore.updateAdvancedParameter(key, val)
}

function onSelectColor(scheme: ColorScheme) {
  designStore.setColorScheme(scheme)
}

function goCustomColor() {
  uni.showToast({ title: '自定义配色开发中', icon: 'none' })
}

function onRandomize() {
  designStore.randomize()
}

function onSave() {
  if (!designStore.currentPattern || !designStore.colorScheme) {
    uni.showToast({ title: '请先选择纹样和配色', icon: 'none' })
    return
  }
  try {
    createArtwork({
      userId: (uni.getStorageSync('userInfo') as any)?.userId || 'local',
      patternId: designStore.currentPattern.patternId,
      patternParams: { ...designStore.parameters },
      colorScheme: { ...designStore.colorScheme },
      sceneType: 'wallpaper',
      sceneTemplate: '',
      customText: '',
      outputImageUrl: designStore.previewDataUrl
    })
    uni.showToast({ title: '作品已保存', icon: 'success' })
  } catch (e) {
    console.error('[design] save error:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

function onExport() {
  if (!designStore.canExport) {
    uni.showToast({ title: '请先完成设计', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/output/index' })
}

// ===== 参数变化监听（序列化后比较，避免深层 watch 性能问题） =====
watch(
  () => JSON.stringify(designStore.parameters),
  () => {
    doRender()
  }
)

watch(
  () => designStore.colorScheme?.colorId,
  () => {
    doRender()
  }
)

// ===== 页面加载 =====
onLoad(async (options) => {
  const patternId = options?.patternId as string | undefined
  if (patternId) {
    await loadBuiltinPatterns()
    const pattern = getPatternById(patternId)
    if (pattern) {
      designStore.setPattern(pattern)
      recordPatternUsage(patternId)
    } else {
      uni.showToast({ title: '纹样不存在', icon: 'none' })
    }
  }
  loadColorSchemes()
  // 初次渲染
  nextTick(() => doRender())
})
</script>

<style scoped lang="scss">
.design-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-primary;
}

/* ===== 预览区 ===== */
.preview-section {
  flex-shrink: 0;
  padding: $spacing-md;
  background-color: $bg-card;
  border-bottom: 2rpx solid $border-color;
}

.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 400rpx;
  border-radius: $radius-lg;
  overflow: hidden;
  background-color: $bg-secondary;
}

.design-canvas {
  width: 100%;
  height: 100%;
}

.canvas-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
}

.placeholder-icon {
  font-size: 80rpx;
}

.placeholder-text {
  font-size: $font-md;
  color: $text-hint;
}

.pattern-name {
  display: block;
  text-align: center;
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
  margin-top: $spacing-sm;
}

/* ===== 面板区 ===== */
.panel-section {
  flex: 1;
  overflow: hidden;
}

.panel-group {
  padding: $spacing-md;
  margin: $spacing-sm $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.panel-action {
  font-size: $font-sm;
  color: $primary-color;
}

/* ===== 参数行 ===== */
.param-row {
  margin: $spacing-sm 0;
}

.param-label {
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: $spacing-xs;
  display: block;
}

.btn-group {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-xs;
}

.toggle-btn {
  flex: 1;
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-md;
  background-color: $bg-secondary;
  border: 2rpx solid $border-color;
  text-align: center;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.96);
  }

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;

    .toggle-text {
      color: #FFFFFF;
    }
  }
}

.toggle-text {
  font-size: $font-sm;
  color: $text-primary;
}

/* ===== 配色列表 ===== */
.color-list {
  white-space: nowrap;
  margin-top: $spacing-sm;
}

.color-scroll-inner {
  display: inline-flex;
  gap: $spacing-sm;
  padding: $spacing-xs 0;
}

/* ===== 底部留白 ===== */
.bottom-spacer {
  height: 160rpx;
}

/* ===== 操作按钮栏 ===== */
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  padding: $spacing-md 0;
  border-radius: $radius-lg;
  transition: all $transition-fast;

  &:active {
    transform: scale(0.96);
  }
}

.secondary-btn {
  background-color: $bg-secondary;
  border: 2rpx solid $border-color;

  .btn-text {
    color: $text-primary;
  }
}

.primary-btn {
  background-color: $primary-color;

  .btn-text {
    color: #FFFFFF;
  }

  .btn-icon {
    filter: brightness(10);
  }
}

.btn-icon {
  font-size: $font-lg;
}

.btn-text {
  font-size: $font-md;
  font-weight: 500;
}
</style>
