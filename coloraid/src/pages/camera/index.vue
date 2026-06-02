<template>
  <view class="camera-page">
    <!-- 摄像头预览区 -->
    <view class="preview-wrap" :style="previewStyle">
      <camera
        v-if="showCamera"
        :device-position="devicePosition"
        :flash="flashMode"
        :resolution="resolution"
        class="camera"
        @error="onCameraError"
      />
      <!-- 增强画面 Canvas -->
      <canvas
        v-if="enhancedReady"
        canvas-id="enhancedCanvas"
        class="enhanced-canvas"
        :style="{ opacity: showEnhanced ? 1 : 0 }"
      />
      <!-- 原始画面占位（对比模式） -->
      <image
        v-if="originalImageUrl"
        :src="originalImageUrl"
        class="original-image"
        :style="{ opacity: showOriginal ? 1 : 0 }"
        mode="aspectFill"
      />
    </view>

    <!-- 隐藏的处理 canvas（拍照后处理用） -->
    <canvas
      canvas-id="processCanvas"
      class="process-canvas"
    />

    <!-- 顶部工具栏 -->
    <view class="top-toolbar">
      <view class="toolbar-btn" @click="goBack">
        <text class="toolbar-icon">&#xe679;</text>
      </view>
      <view
        class="toolbar-btn compare-btn"
        @touchstart="onCompareStart"
        @touchend="onCompareEnd"
      >
        <text class="toolbar-icon">&#xe6a6;</text>
        <text class="toolbar-btn-text">原始</text>
      </view>
    </view>

    <!-- 权限提示 -->
    <view v-if="!hasPermission" class="permission-tip">
      <text class="permission-text">需要相机权限才能使用实时滤镜</text>
      <button class="btn-primary btn-small" @click="requestPermission">授权相机</button>
    </view>

    <!-- 底部控制浮层 -->
    <view class="bottom-panel">
      <!-- 滤镜模式切换 -->
      <view class="mode-bar">
        <view
          v-for="mode in filterModes"
          :key="mode.value ?? 'off'"
          class="mode-btn"
          :class="{ active: currentMode === mode.value }"
          @click="switchMode(mode.value)"
        >
          <text class="mode-btn-text">{{ mode.label }}</text>
        </view>
      </view>

      <!-- 强度滑块 -->
      <view class="slider-bar">
        <FilterSlider
          v-model="currentStrength"
          :min="1"
          :max="10"
          @change="onStrengthChange"
        />
      </view>

      <!-- 功能按钮栏 -->
      <view class="func-bar">
        <view class="func-btn" @click="toggleCamera">
          <text class="func-icon">&#xe6a7;</text>
          <text class="func-label">切换</text>
        </view>
        <view class="capture-btn-wrap" @click="takePhoto">
          <view class="capture-btn" />
        </view>
        <view class="func-btn" @click="toggleFlash">
          <text class="func-icon" :class="{ active: flashMode === 'on' || flashMode === 'torch' }">&#xe6a9;</text>
          <text class="func-label">灯光</text>
        </view>
      </view>
    </view>

    <!-- 鸿蒙端：Core Vision Kit 预留注释 -->
    <!-- #ifdef APP-HARMONY
    鸿蒙端可在此处接入 Core Vision Kit 实现更高效的原生实时滤镜处理：
    1. 通过 @kit.CoreVisionKit 调用色彩增强接口
    2. 使用 XComponent + Camera 实现原生预览与处理管线
    3. 条件编译确保仅在鸿蒙端编译此段逻辑
    #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// @ts-ignore - alpha 版本类型声明兼容
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store/settings'
import { applyDaltonization } from '@/services/colorFilter'
import FilterSlider from '@/components/FilterSlider.vue'
import { requestCameraPermission, checkPermission } from '@/utils/permission'
import { isHarmony } from '@/utils/platform'
import type { FilterMode, FilterStrength } from '@/types/models'

const settingsStore = useSettingsStore()

// 预览尺寸
const previewStyle = computed(() => {
  const sys = uni.getSystemInfoSync()
  return {
    width: sys.windowWidth + 'px',
    height: sys.windowHeight + 'px'
  }
})

// 相机状态
const showCamera = ref(true)
const devicePosition = ref<'front' | 'back'>('back')
const flashMode = ref<'auto' | 'on' | 'off' | 'torch'>('off')
const resolution = ref('high')
const hasPermission = ref(true)

// 增强状态
const currentMode = ref<FilterMode | null>(settingsStore.filterMode)
const currentStrength = ref<number>(settingsStore.filterStrength)
const showEnhanced = ref(false)
const showOriginal = ref(false)
const enhancedReady = ref(false)
const originalImageUrl = ref('')

// 定时器
let enhanceTimer: ReturnType<typeof setInterval> | null = null

const filterModes = [
  { label: '红绿', value: 'protanopia' as FilterMode },
  { label: '蓝黄', value: 'tritanopia' as FilterMode },
  { label: '全色盲', value: 'achromatopsia' as FilterMode },
  { label: '关闭', value: null as null }
]

function switchMode(mode: FilterMode | null) {
  currentMode.value = mode
  settingsStore.setFilterMode(mode)
  if (mode) {
    enhancedReady.value = true
    startEnhanceLoop()
  } else {
    stopEnhanceLoop()
    showEnhanced.value = false
    enhancedReady.value = false
  }
}

function onStrengthChange(val: number) {
  currentStrength.value = val
  settingsStore.setFilterStrength(val as FilterStrength)
}

function toggleCamera() {
  devicePosition.value = devicePosition.value === 'back' ? 'front' : 'back'
}

function toggleFlash() {
  const modes: Array<'auto' | 'on' | 'off' | 'torch'> = ['off', 'on', 'torch', 'auto']
  const idx = modes.indexOf(flashMode.value)
  flashMode.value = modes[(idx + 1) % modes.length]
}

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => {
    uni.switchTab({ url: '/pages/index/index' })
  }})
}

// 对比按钮：按住显示原始，松开恢复增强
function onCompareStart() {
  showEnhanced.value = false
  showOriginal.value = true
}

function onCompareEnd() {
  showOriginal.value = false
  if (currentMode.value) {
    showEnhanced.value = true
  }
}

// 拍照
function takePhoto() {
  const ctx = uni.createCameraContext()
  ctx.takePhoto({
    quality: 'high',
    success: (res) => {
      const imagePath = res.tempImagePath
      if (currentMode.value) {
        processAndNavigate(imagePath)
      } else {
        uni.navigateTo({
          url: `/pages/camera/identify?image=${encodeURIComponent(imagePath)}`
        })
      }
    },
    fail: (err) => {
      uni.showToast({ title: '拍照失败', icon: 'none' })
      console.error('takePhoto fail:', err)
    }
  })
}

// 对图片做 Daltonization 处理并跳转
function processAndNavigate(imagePath: string) {
  const sys = uni.getSystemInfoSync()
  const canvasWidth = sys.windowWidth
  const canvasHeight = sys.windowHeight
  const ctx = uni.createCanvasContext('processCanvas')

  ctx.drawImage(imagePath, 0, 0, canvasWidth, canvasHeight)
  ctx.draw(false, () => {
    uni.canvasGetImageData({
      canvasId: 'processCanvas',
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      success: (imgRes) => {
        const enhanced = applyDaltonization(
          imgRes.data,
          canvasWidth,
          canvasHeight,
          currentMode.value!,
          currentStrength.value as FilterStrength
        )
        uni.canvasPutImageData({
          canvasId: 'processCanvas',
          x: 0,
          y: 0,
          width: canvasWidth,
          height: canvasHeight,
          data: enhanced as any,
          success: () => {
            uni.canvasToTempFilePath({
              canvasId: 'processCanvas',
              success: (fileRes) => {
                uni.navigateTo({
                  url: `/pages/camera/identify?image=${encodeURIComponent(fileRes.tempFilePath)}`
                })
              },
              fail: () => {
                uni.navigateTo({
                  url: `/pages/camera/identify?image=${encodeURIComponent(imagePath)}`
                })
              }
            })
          },
          fail: () => {
            uni.navigateTo({
              url: `/pages/camera/identify?image=${encodeURIComponent(imagePath)}`
            })
          }
        })
      },
      fail: () => {
        uni.navigateTo({
          url: `/pages/camera/identify?image=${encodeURIComponent(imagePath)}`
        })
      }
    })
  })
}

// 启动增强循环（定时取帧处理）
function startEnhanceLoop() {
  stopEnhanceLoop()
  showEnhanced.value = true
  enhanceFrame()
  enhanceTimer = setInterval(() => {
    enhanceFrame()
  }, 300)
}

function stopEnhanceLoop() {
  if (enhanceTimer) {
    clearInterval(enhanceTimer)
    enhanceTimer = null
  }
}

// 单帧增强处理
function enhanceFrame() {
  if (!currentMode.value) return
  const ctx = uni.createCameraContext()
  ctx.takePhoto({
    quality: 'low',
    success: (res) => {
      originalImageUrl.value = res.tempImagePath
      const sys = uni.getSystemInfoSync()
      const w = sys.windowWidth
      const h = sys.windowHeight
      const canvasCtx = uni.createCanvasContext('enhancedCanvas')
      canvasCtx.drawImage(res.tempImagePath, 0, 0, w, h)
      canvasCtx.draw(false, () => {
        uni.canvasGetImageData({
          canvasId: 'enhancedCanvas',
          x: 0,
          y: 0,
          width: w,
          height: h,
          success: (imgRes) => {
            const enhanced = applyDaltonization(
              imgRes.data,
              w,
              h,
              currentMode.value!,
              currentStrength.value as FilterStrength
            )
            uni.canvasPutImageData({
              canvasId: 'enhancedCanvas',
              x: 0,
              y: 0,
              width: w,
              height: h,
              data: enhanced as any,
              success: () => {
                // canvas 已更新，无需额外操作
              }
            })
          }
        })
      })
    }
  })
}

function onCameraError(e: any) {
  console.error('camera error:', e)
  uni.showToast({ title: '相机启动失败', icon: 'none' })
}

async function requestPermission() {
  if (isHarmony()) {
    // #ifdef APP-HARMONY
    const { requestHarmonyCameraPermission } = await import('@/utils/permission')
    const ok = await requestHarmonyCameraPermission()
    hasPermission.value = ok
    // #endif
  } else {
    const ok = await requestCameraPermission()
    hasPermission.value = ok
  }
}

onLoad(async () => {
  const permitted = await checkPermission('scope.camera')
  hasPermission.value = permitted
  if (!permitted) {
    await requestPermission()
  }
  if (settingsStore.filterMode) {
    currentMode.value = settingsStore.filterMode
    currentStrength.value = settingsStore.filterStrength
    enhancedReady.value = true
    startEnhanceLoop()
  }
})

onUnload(() => {
  stopEnhanceLoop()
})
</script>

<style scoped lang="scss">
.camera-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  overflow: hidden;
}

.preview-wrap {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}

.camera {
  width: 100%;
  height: 100%;
}

.enhanced-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.original-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

/* ===== 顶部工具栏 ===== */
.top-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding-top: calc(env(safe-area-inset-top) + 20rpx);
  padding-left: $spacing-sm;
  padding-right: $spacing-sm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
}

.toolbar-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.toolbar-icon {
  font-size: $font-lg;
  color: #FFFFFF;
}

.toolbar-btn-text {
  font-size: $font-xs;
  color: #FFFFFF;
}

.compare-btn {
  width: 88rpx;
  height: 88rpx;
}

/* ===== 权限提示 ===== */
.permission-tip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: $radius-md;
  padding: $spacing-xl;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.permission-text {
  font-size: $font-md;
  color: #FFFFFF;
  text-align: center;
}

.btn-small {
  height: 64rpx;
  line-height: 64rpx;
  font-size: $font-sm;
  padding: 0 48rpx;
}

/* ===== 底部控制浮层 ===== */
.bottom-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
  padding-left: $spacing-md;
  padding-right: $spacing-md;
  z-index: 10;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.mode-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.mode-btn {
  padding: 10rpx 28rpx;
  border-radius: $radius-pill;
  background-color: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  transition: all $transition-fast;

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;
  }
}

.mode-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
  font-weight: 500;
}

.slider-bar {
  margin-bottom: $spacing-md;
}

.func-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48rpx;
}

.func-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
}

.func-icon {
  font-size: $font-xl;
  color: #FFFFFF;

  &.active {
    color: $warning-color;
  }
}

.func-label {
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.8);
}

.capture-btn-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.capture-btn {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  border: 4rpx solid $primary-color;
}

/* ===== 隐藏处理 canvas ===== */
.process-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
