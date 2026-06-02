<template>
  <view class="identify-page">
    <!-- 顶部工具栏 -->
    <view class="top-bar">
      <view class="top-btn" @click="goBack">
        <text class="top-icon">&#xe679;</text>
      </view>
      <text class="top-title">颜色识别</text>
      <view class="top-btn" @click="toggleVoice">
        <text class="top-icon" :class="{ muted: !voiceEnabled }">{{ voiceEnabled ? '&#xe6aa;' : '&#xe6ab;' }}</text>
      </view>
    </view>

    <!-- 预览区 -->
    <view class="preview-area" @click="onPreviewTap" @touchstart="onPreviewTouchStart">
      <!-- 传入图片模式 -->
      <image
        v-if="imagePath"
        :src="imagePath"
        class="preview-image"
        mode="aspectFit"
        @load="onImageLoad"
      />
      <!-- 摄像头模式 -->
      <camera
        v-else
        ref="cameraRef"
        device-position="back"
        class="preview-camera"
        @error="onCameraError"
      />

      <!-- 十字准星 -->
      <view
        v-if="crosshairVisible"
        class="crosshair"
        :style="crosshairStyle"
      >
        <view class="crosshair-line-h" />
        <view class="crosshair-line-v" />
        <view class="crosshair-center" />
      </view>

      <!-- 3x3 放大预览 -->
      <view
        v-if="zoomVisible"
        class="zoom-preview"
        :style="zoomStyle"
      >
        <view
          v-for="(pixel, idx) in zoomPixels"
          :key="idx"
          class="zoom-pixel"
          :style="{ backgroundColor: pixel }"
        />
      </view>
    </view>

    <!-- 颜色信息面板 -->
    <view class="info-panel">
      <view v-if="currentColor" class="color-result">
        <ColorCard
          :color="currentColor"
          size="large"
          show-details
        />
        <view class="action-bar">
          <view class="action-btn" @click="speakColor">
            <text class="action-icon">&#xe6aa;</text>
            <text class="action-label">播报</text>
          </view>
          <view class="action-btn" @click="addToHistory">
            <text class="action-icon">&#xe6ac;</text>
            <text class="action-label">添加历史</text>
          </view>
        </view>
      </view>
      <view v-else class="color-placeholder">
        <text class="placeholder-text">点击画面任意位置识别颜色</text>
      </view>

      <!-- 本次会话历史（可折叠） -->
      <view class="session-history">
        <view class="history-toggle" @click="historyExpanded = !historyExpanded">
          <text class="history-title">本次识别 ({{ sessionColors.length }})</text>
          <text class="history-arrow" :class="{ expanded: historyExpanded }">&#xe6ad;</text>
        </view>
        <view v-if="historyExpanded && sessionColors.length > 0" class="history-list">
          <ColorCard
            v-for="(color, idx) in sessionColors"
            :key="idx"
            :color="color"
            size="small"
            @click="selectSessionColor(color)"
          />
        </view>
      </view>
    </view>

    <!-- 隐藏 canvas 用于取色 -->
    <canvas
      canvas-id="pickCanvas"
      class="hidden-canvas"
      :style="hiddenCanvasStyle"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// @ts-ignore - alpha 版本类型声明兼容
import { onLoad } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import { identifyColor } from '@/services/colorIdentify'
import { speak } from '@/services/tts'
import ColorCard from '@/components/ColorCard.vue'
import { requestCameraPermission, checkPermission } from '@/utils/permission'
import { isHarmony } from '@/utils/platform'
import type { ColorInfo } from '@/types/models'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

// 页面参数
const imagePath = ref('')
const imageLoaded = ref(false)
const imageWidth = ref(0)
const imageHeight = ref(0)

// 语音开关
const voiceEnabled = ref(settingsStore.voiceEnabled)

// 准星与取色
const crosshairVisible = ref(false)
const crosshairX = ref(0)
const crosshairY = ref(0)
const zoomVisible = ref(false)
const zoomPixels = ref<string[]>([])

// 识别结果
const currentColor = ref<ColorInfo | null>(null)

// 会话历史
const sessionColors = ref<ColorInfo[]>([])
const historyExpanded = ref(false)

// 隐藏 canvas 尺寸（用于图片/camera取色时绘制）
const hiddenCanvasStyle = computed(() => {
  const sys = uni.getSystemInfoSync()
  return {
    width: (imageWidth.value || sys.windowWidth) + 'px',
    height: (imageHeight.value || sys.windowHeight) + 'px'
  }
})

const crosshairStyle = computed(() => {
  return {
    left: crosshairX.value - 40 + 'px',
    top: crosshairY.value - 40 + 'px'
  }
})

const zoomStyle = computed(() => {
  // 放大预览显示在准星上方或下方，避免超出屏幕
  const sys = uni.getSystemInfoSync()
  let top = crosshairY.value - 160
  if (top < 120) {
    top = crosshairY.value + 60
  }
  let left = crosshairX.value - 60
  if (left < 10) left = 10
  if (left > sys.windowWidth - 130) left = sys.windowWidth - 130
  return {
    left: left + 'px',
    top: top + 'px'
  }
})

function toggleVoice() {
  voiceEnabled.value = !voiceEnabled.value
  settingsStore.setVoiceEnabled(voiceEnabled.value)
}

function goBack() {
  uni.navigateBack({ delta: 1, fail: () => {
    uni.switchTab({ url: '/pages/index/index' })
  }})
}

function onImageLoad(e: any) {
  imageWidth.value = e.detail.width || 300
  imageHeight.value = e.detail.height || 300
  imageLoaded.value = true
  // 将图片绘制到隐藏 canvas
  drawImageToCanvas()
}

function drawImageToCanvas() {
  if (!imagePath.value) return
  const ctx = uni.createCanvasContext('pickCanvas')
  ctx.drawImage(imagePath.value, 0, 0, imageWidth.value, imageHeight.value)
  ctx.draw()
}

function onCameraError(e: any) {
  console.error('camera error:', e)
  uni.showToast({ title: '相机启动失败', icon: 'none' })
}

// 预览区点击/触摸取色
function onPreviewTap(e: any) {
  const x = e.detail.x
  const y = e.detail.y
  handlePick(x, y)
}

function onPreviewTouchStart(e: any) {
  const touch = e.touches[0]
  if (touch) {
    handlePick(touch.clientX, touch.clientY)
  }
}

async function handlePick(x: number, y: number) {
  crosshairX.value = x
  crosshairY.value = y
  crosshairVisible.value = true
  zoomVisible.value = true

  try {
    let color: ColorInfo
    if (imagePath.value && imageLoaded.value) {
      // 从图片 canvas 取色
      color = await pickFromCanvas(x, y)
    } else {
      // 从 camera 截图取色
      color = await pickFromCamera(x, y)
    }
    currentColor.value = color
    // 更新放大预览像素
    updateZoomPixels(color)
    // 自动播报
    if (voiceEnabled.value) {
      speak(color.name)
    }
  } catch (err) {
    console.error('pick color error:', err)
    uni.showToast({ title: '取色失败', icon: 'none' })
  }
}

// 从图片 canvas 取色
function pickFromCanvas(x: number, y: number): Promise<ColorInfo> {
  return new Promise((resolve, reject) => {
    uni.canvasGetImageData({
      canvasId: 'pickCanvas',
      x: Math.max(0, x - 1),
      y: Math.max(0, y - 1),
      width: 3,
      height: 3,
      success: (res) => {
        try {
          const info = identifyColor(1, 1, res.data as any, 3)
          resolve(info)
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => reject(new Error(err.errMsg || 'canvas 取色失败'))
    })
  })
}

// 从 camera 截图取色
function pickFromCamera(x: number, y: number): Promise<ColorInfo> {
  return new Promise((resolve, reject) => {
    const ctx = uni.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        // 将截图绘制到临时 canvas 再取色
        const sys = uni.getSystemInfoSync()
        const w = sys.windowWidth
        const h = sys.windowHeight
        const canvasCtx = uni.createCanvasContext('pickCanvas')
        canvasCtx.drawImage(res.tempImagePath, 0, 0, w, h)
        canvasCtx.draw(false, () => {
          uni.canvasGetImageData({
            canvasId: 'pickCanvas',
            x: Math.max(0, x - 1),
            y: Math.max(0, y - 1),
            width: 3,
            height: 3,
            success: (imgRes) => {
              try {
                const info = identifyColor(1, 1, imgRes.data as any, 3)
                resolve(info)
              } catch (e) {
                reject(e)
              }
            },
            fail: (err) => reject(new Error(err.errMsg || 'camera 取色失败'))
          })
        })
      },
      fail: (err) => reject(new Error(err.errMsg || '截图失败'))
    })
  })
}

// 更新放大预览的 3x3 像素颜色
function updateZoomPixels(centerColor: ColorInfo) {
  // 简化为展示中心颜色及其近似色
  const c = centerColor.rgb
  zoomPixels.value = [
    `rgb(${Math.max(0, c.r - 30)}, ${Math.max(0, c.g - 30)}, ${Math.max(0, c.b - 30)})`,
    `rgb(${Math.max(0, c.r - 15)}, ${Math.max(0, c.g - 15)}, ${Math.max(0, c.b - 15)})`,
    `rgb(${Math.min(255, c.r + 15)}, ${Math.min(255, c.g + 15)}, ${Math.min(255, c.b + 15)})`,
    `rgb(${Math.max(0, c.r - 15)}, ${Math.max(0, c.g - 15)}, ${Math.max(0, c.b - 15)})`,
    centerColor.hex,
    `rgb(${Math.min(255, c.r + 15)}, ${Math.min(255, c.g + 15)}, ${Math.min(255, c.b + 15)})`,
    `rgb(${Math.min(255, c.r + 15)}, ${Math.min(255, c.g + 15)}, ${Math.min(255, c.b + 15)})`,
    `rgb(${Math.min(255, c.r + 30)}, ${Math.min(255, c.g + 30)}, ${Math.min(255, c.b + 30)})`,
    `rgb(${Math.min(255, c.r + 45)}, ${Math.min(255, c.g + 45)}, ${Math.min(255, c.b + 45)})`
  ]
}

function speakColor() {
  if (currentColor.value) {
    speak(currentColor.value.name)
  }
}

function addToHistory() {
  if (!currentColor.value) return
  historyStore.addHistory(currentColor.value, imagePath.value ? 'photo' : 'camera')
  // 添加到本次会话列表（去重）
  const exists = sessionColors.value.some(c => c.hex === currentColor.value!.hex)
  if (!exists) {
    sessionColors.value.unshift(currentColor.value)
  }
  uni.showToast({ title: '已添加', icon: 'success' })
}

function selectSessionColor(color: ColorInfo) {
  currentColor.value = color
  updateZoomPixels(color)
}

onLoad(async (options) => {
  settingsStore.init()
  historyStore.init()

  if (options?.image) {
    imagePath.value = decodeURIComponent(options.image)
  }

  if (!imagePath.value) {
    const permitted = await checkPermission('scope.camera')
    if (!permitted) {
      if (isHarmony()) {
        // #ifdef APP-HARMONY
        const { requestHarmonyCameraPermission } = await import('@/utils/permission')
        await requestHarmonyCameraPermission()
        // #endif
      } else {
        await requestCameraPermission()
      }
    }
  }
})
</script>

<style scoped lang="scss">
.identify-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-color;
}

/* ===== 顶部工具栏 ===== */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(env(safe-area-inset-top) + 12rpx) $spacing-md 12rpx;
  background-color: $bg-card;
}

.top-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-icon {
  font-size: $font-lg;
  color: $text-primary;

  &.muted {
    color: $text-hint;
  }
}

.top-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
}

/* ===== 预览区 ===== */
.preview-area {
  position: relative;
  flex: 1;
  background-color: #000000;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-camera {
  width: 100%;
  height: 100%;
}

/* 十字准星 */
.crosshair {
  position: absolute;
  width: 80rpx;
  height: 80rpx;
  pointer-events: none;
  z-index: 10;
}

.crosshair-line-h {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2rpx;
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-1rpx);
}

.crosshair-line-v {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2rpx;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateX(-1rpx);
}

.crosshair-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 12rpx;
  height: 12rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* 3x3 放大预览 */
.zoom-preview {
  position: absolute;
  width: 120rpx;
  height: 120rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  border: 4rpx solid #FFFFFF;
  border-radius: $radius-sm;
  overflow: hidden;
  z-index: 11;
  pointer-events: none;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
}

.zoom-pixel {
  width: 100%;
  height: 100%;
}

/* ===== 颜色信息面板 ===== */
.info-panel {
  background-color: $bg-card;
  border-top-left-radius: $radius-lg;
  border-top-right-radius: $radius-lg;
  padding: $spacing-md;
  padding-bottom: calc(env(safe-area-inset-bottom) + 24rpx);
}

.color-result {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.action-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xl;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: $spacing-sm $spacing-md;
}

.action-icon {
  font-size: $font-xl;
  color: $primary-color;
}

.action-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.color-placeholder {
  padding: $spacing-xl 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: $font-md;
  color: $text-hint;
}

/* ===== 本次会话历史 ===== */
.session-history {
  margin-top: $spacing-md;
  border-top: 1rpx solid $border-color;
  padding-top: $spacing-md;
}

.history-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.history-title {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
}

.history-arrow {
  font-size: $font-md;
  color: $text-hint;
  transition: transform $transition-fast;

  &.expanded {
    transform: rotate(180deg);
  }
}

.history-list {
  margin-top: $spacing-sm;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

/* ===== 隐藏 canvas ===== */
.hidden-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
