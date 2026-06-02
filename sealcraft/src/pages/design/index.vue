<template>
  <view class="design-page">
    <!-- 自定义导航栏 -->
    <NavBar title="设计工作台" :show-back="false" bg-color="#FBF8F5" />

    <scroll-view class="design-body" scroll-y enhanced :show-scrollbar="false">
      <!-- 刻字输入区 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">刻字内容</text>
          <text class="char-count">{{ contentLength }}/4</text>
        </view>
        <view class="input-wrap">
          <input
            class="seal-input"
            v-model="inputContent"
            placeholder="请输入1-4个字"
            maxlength="8"
            :adjust-position="true"
            @input="onContentInput"
          />
          <view v-if="inputContent" class="clear-btn" @click="onClearContent">
            <text class="clear-icon">✕</text>
          </view>
        </view>
        <view v-if="validationMessage" class="validation-msg">
          <text :class="['validation-text', isValid ? 'valid' : 'invalid']">
            {{ validationMessage }}
          </text>
        </view>
      </view>

      <!-- 字体选择区 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">字体风格</text>
          <text class="section-hint">横向滑动选择</text>
        </view>
        <scroll-view class="h-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="font-list">
            <view
              v-for="font in fontStyles"
              :key="font.fontId"
              :class="['font-item', { active: designStore.currentDraft.fontId === font.fontId }]"
              @click="onSelectFont(font.fontId)"
            >
              <view class="font-preview-box">
                <text class="font-sample">{{ font.sampleText.slice(0, 2) }}</text>
              </view>
              <text class="font-name">{{ font.name }}</text>
              <text class="font-style-label">{{ font.style }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 材质选择区 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">印章材质</text>
          <text class="section-hint">横向滑动选择</text>
        </view>
        <scroll-view class="h-scroll" scroll-x enhanced :show-scrollbar="false">
          <view class="material-list">
            <view
              v-for="mat in materials"
              :key="mat.materialId"
              :class="['material-item', { active: designStore.currentDraft.materialId === mat.materialId }]"
              @click="onSelectMaterial(mat.materialId)"
            >
              <view class="material-thumb">
                <image
                  class="material-img"
                  :src="mat.photos && mat.photos.length > 0 ? mat.photos[0] : '/static/images/default-material.png'"
                  mode="aspectFill"
                />
              </view>
              <text class="material-name">{{ mat.name }}</text>
              <text class="material-price">{{ mat.priceRange }}</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 排版选择 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">排版方式</text>
        </view>
        <view class="layout-grid">
          <view
            v-for="item in layoutOptions"
            :key="item.value"
            :class="['layout-item', { active: designStore.currentDraft.layout === item.value }]"
            @click="onSelectLayout(item.value)"
          >
            <view class="layout-icon">
              <view :class="['layout-icon-inner', item.value]" />
            </view>
            <text class="layout-label">{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 印泥颜色选择 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">印泥颜色</text>
        </view>
        <view class="ink-color-row">
          <view
            v-for="ink in inkColors"
            :key="ink.value"
            :class="['ink-color-item', { active: designStore.currentDraft.inkColor === ink.value }]"
            @click="onSelectInkColor(ink.value)"
          >
            <view class="ink-dot" :style="{ backgroundColor: ink.color }" />
            <text class="ink-name">{{ ink.label }}</text>
          </view>
        </view>
      </view>

      <!-- 实时预览区 -->
      <view class="section preview-section">
        <view class="section-header">
          <text class="section-title">实时预览</text>
        </view>
        <view class="preview-area">
          <view :class="['seal-preview', `layout-${designStore.currentDraft.layout}`]">
            <!-- 印章外框 -->
            <view :class="['seal-frame', `frame-${designStore.currentDraft.layout}`]"
              :style="{ borderColor: currentInkColor }">
              <!-- 印章文字 -->
              <view :class="['seal-text-wrap', `text-${designStore.currentDraft.layout}`]">
                <text
                  v-for="(char, idx) in displayChars"
                  :key="idx"
                  class="seal-char"
                  :style="{ color: currentInkColor }"
                >{{ char }}</text>
              </view>
            </view>
          </view>
          <view class="preview-info">
            <text class="preview-font">{{ currentFontName }}</text>
            <text class="preview-material">{{ currentMaterialName }}</text>
          </view>
        </view>
      </view>

      <!-- 占位，防止底部操作栏遮挡 -->
      <view class="bottom-spacer" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar safe-bottom">
      <view class="action-btn preview-btn" @click="onPreviewEffect">
        <text class="action-icon">👁</text>
        <text class="action-label">预览效果</text>
      </view>
      <view class="action-btn ink-btn" @click="onInkEffect">
        <text class="action-icon">🖌</text>
        <text class="action-label">印泥效果</text>
      </view>
      <view class="action-btn compare-btn" @click="onMaterialCompare">
        <text class="action-icon">⚖</text>
        <text class="action-label">材质对比</text>
      </view>
      <view class="action-btn save-btn" @click="onSaveDesign">
        <text class="action-icon">💾</text>
        <text class="action-label">保存设计</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useDesignStore } from '@/store/design'
import { getFontStyles, getMaterials } from '@/services/seal'
import { generatePreview, saveDesign } from '@/services/design'
import { isValidSealContent } from '@/utils/sensitive'
import NavBar from '@/components/common/NavBar.vue'
import type { FontStyle, Material, DesignDraft } from '@/types/models'

const designStore = useDesignStore()

// 数据
const fontStyles = ref<FontStyle[]>([])
const materials = ref<Material[]>([])
const inputContent = ref('')
const isValid = ref(true)
const validationMessage = ref('')

// 排版选项
const layoutOptions: { label: string; value: DesignDraft['layout'] }[] = [
  { label: '自动', value: 'auto' },
  { label: '横排', value: 'horizontal' },
  { label: '竖排', value: 'vertical' },
  { label: '圆章', value: 'circular' }
]

// 印泥颜色选项
const inkColors = [
  { label: '朱砂红', value: 'red' as const, color: '#C41A1A' },
  { label: '朱红', value: 'vermilion' as const, color: '#E85530' },
  { label: '靛蓝', value: 'blue' as const, color: '#2B4F8C' }
]

// 计算属性
const contentLength = computed(() => {
  return Array.from(inputContent.value.trim()).reduce((count, char) => {
    return count + (char.charCodeAt(0) > 127 ? 1 : 0.5)
  }, 0)
})

const currentInkColor = computed(() => {
  const ink = inkColors.find(i => i.value === designStore.currentDraft.inkColor)
  return ink?.color || '#C41A1A'
})

const currentFontName = computed(() => {
  const font = fontStyles.value.find(f => f.fontId === designStore.currentDraft.fontId)
  return font?.name || '未选择'
})

const currentMaterialName = computed(() => {
  const mat = materials.value.find(m => m.materialId === designStore.currentDraft.materialId)
  return mat?.name || '未选择'
})

const displayChars = computed(() => {
  const content = designStore.currentDraft.content.trim()
  if (!content) return ['预', '览']
  return Array.from(content)
})

// 方法
function onContentInput() {
  const result = isValidSealContent(inputContent.value)
  isValid.value = result.valid
  validationMessage.value = result.valid ? '' : result.message
  designStore.setContent(result.valid ? inputContent.value : inputContent.value)
}

function onClearContent() {
  inputContent.value = ''
  validationMessage.value = ''
  isValid.value = true
  designStore.setContent('')
}

function onSelectFont(fontId: string) {
  designStore.setFont(fontId)
}

function onSelectMaterial(materialId: string) {
  designStore.setMaterial(materialId)
}

function onSelectLayout(layout: DesignDraft['layout']) {
  designStore.setLayout(layout)
}

function onSelectInkColor(inkColor: DesignDraft['inkColor']) {
  designStore.setInkColor(inkColor)
}

function onPreviewEffect() {
  if (!designStore.hasContent) {
    uni.showToast({ title: '请先输入刻字内容', icon: 'none' })
    return
  }
  const preview = generatePreview(designStore.currentDraft)
  const params = encodeURIComponent(JSON.stringify(preview))
  uni.navigateTo({ url: `/pages/design/preview?data=${params}` })
}

function onInkEffect() {
  if (!designStore.hasContent) {
    uni.showToast({ title: '请先输入刻字内容', icon: 'none' })
    return
  }
  const draft = designStore.currentDraft
  uni.navigateTo({
    url: `/pages/design/ink-effect?content=${encodeURIComponent(draft.content)}&fontId=${draft.fontId}&inkColor=${draft.inkColor}`
  })
}

function onMaterialCompare() {
  const currentMatId = designStore.currentDraft.materialId
  let url = '/pages/design/material-compare'
  if (currentMatId) {
    url += `?selectedIds=${encodeURIComponent(currentMatId)}`
  }
  uni.navigateTo({ url })
}

function onSaveDesign() {
  if (!designStore.isComplete) {
    uni.showToast({ title: '请完善设计方案', icon: 'none' })
    return
  }
  saveDesign(designStore.currentDraft)
  designStore.saveToHistory()
  uni.showToast({ title: '设计已保存', icon: 'success' })
}

// 生命周期
onShow(() => {
  const fonts = getFontStyles()
  fontStyles.value = fonts
  const mats = getMaterials()
  materials.value = mats

  // 加载已保存的草稿
  designStore.loadDraft()
  inputContent.value = designStore.currentDraft.content

  // 如果草稿没有选择字体/材质，设置默认值
  if (!designStore.currentDraft.fontId && fonts.length > 0) {
    designStore.setFont(fonts[0].fontId)
  }
  if (!designStore.currentDraft.materialId && mats.length > 0) {
    designStore.setMaterial(mats[0].materialId)
  }
  if (!designStore.currentDraft.sealTypeId) {
    designStore.setSealType('seal_type_01')
  }
})
</script>

<style scoped lang="scss">
.design-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.design-body {
  flex: 1;
  padding: 0 $spacing-md;
}

/* ===== 区块通用 ===== */
.section {
  margin-top: $spacing-md;
}

.section-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
}

.section-hint {
  font-size: 22rpx;
  color: $text-hint;
}

/* ===== 刻字输入区 ===== */
.input-wrap {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  padding: 0 24rpx;
  height: 88rpx;
}

.seal-input {
  flex: 1;
  font-size: 32rpx;
  color: $text-primary;
  height: 88rpx;
}

.clear-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-icon {
  font-size: 28rpx;
  color: $text-hint;
}

.char-count {
  font-size: 24rpx;
  color: $text-hint;
}

.validation-msg {
  margin-top: 8rpx;
}

.validation-text {
  font-size: 24rpx;
}

.valid {
  color: $success;
}

.invalid {
  color: $primary;
}

/* ===== 字体选择区 ===== */
.h-scroll {
  width: 100%;
  white-space: nowrap;
}

.font-list {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 4rpx 0;
}

.font-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180rpx;
  padding: 20rpx 16rpx;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  flex-shrink: 0;
}

.font-item.active {
  border-color: $primary;
  background-color: #FDF5F5;
}

.font-preview-box {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-page;
  border-radius: $radius-sm;
  margin-bottom: 12rpx;
}

.font-sample {
  font-size: 48rpx;
  color: $primary;
  font-weight: 700;
}

.font-name {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.font-style-label {
  font-size: 20rpx;
  color: $text-hint;
}

/* ===== 材质选择区 ===== */
.material-list {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  padding: 4rpx 0;
}

.material-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160rpx;
  padding: 16rpx 12rpx;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
  flex-shrink: 0;
}

.material-item.active {
  border-color: $primary;
  background-color: #FDF5F5;
}

.material-thumb {
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-sm;
  overflow: hidden;
  margin-bottom: 12rpx;
  background-color: #F0EBE6;
}

.material-img {
  width: 100%;
  height: 100%;
}

.material-name {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4rpx;
}

.material-price {
  font-size: 18rpx;
  color: $primary;
}

/* ===== 排版选择 ===== */
.layout-grid {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
}

.layout-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
}

.layout-item.active {
  border-color: $primary;
  background-color: #FDF5F5;
}

.layout-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
}

.layout-icon-inner {
  border: 3rpx solid $text-secondary;
  border-radius: 4rpx;
  width: 48rpx;
  height: 48rpx;
}

.layout-icon-inner.auto {
  border-style: dashed;
}

.layout-icon-inner.horizontal {
  width: 56rpx;
  height: 32rpx;
}

.layout-icon-inner.vertical {
  width: 32rpx;
  height: 56rpx;
}

.layout-icon-inner.circular {
  border-radius: 50%;
  width: 48rpx;
  height: 48rpx;
}

.layout-label {
  font-size: 24rpx;
  color: $text-primary;
}

/* ===== 印泥颜色 ===== */
.ink-color-row {
  display: flex;
  flex-direction: row;
  gap: 32rpx;
}

.ink-color-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 28rpx;
  background-color: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid transparent;
}

.ink-color-item.active {
  border-color: $primary;
}

.ink-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
}

.ink-name {
  font-size: 26rpx;
  color: $text-primary;
}

/* ===== 实时预览区 ===== */
.preview-section {
  margin-top: $spacing-lg;
}

.preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 24rpx;
  background-color: $bg-card;
  border-radius: $radius-lg;
  min-height: 400rpx;
}

.seal-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.seal-frame {
  border: 6rpx solid $primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24rpx;
}

.frame-auto,
.frame-horizontal {
  border-radius: 8rpx;
  min-width: 200rpx;
  min-height: 200rpx;
}

.frame-vertical {
  border-radius: 8rpx;
  min-width: 160rpx;
  min-height: 280rpx;
}

.frame-circular {
  border-radius: 50%;
  width: 280rpx;
  height: 280rpx;
}

.seal-text-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-auto,
.text-horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
}

.text-vertical {
  flex-direction: column;
  gap: 8rpx;
}

.text-circular {
  flex-direction: column;
  gap: 4rpx;
}

.seal-char {
  font-size: 56rpx;
  font-weight: 900;
  color: $primary;
}

.preview-info {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  align-items: center;
}

.preview-font,
.preview-material {
  font-size: 24rpx;
  color: $text-hint;
}

/* ===== 底部操作栏 ===== */
.bottom-spacer {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 24rpx;
  background-color: $bg-card;
  box-shadow: 0 -2rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 16rpx;
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.action-label {
  font-size: 20rpx;
  color: $text-secondary;
}
</style>
