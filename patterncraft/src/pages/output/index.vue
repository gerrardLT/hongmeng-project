<template>
  <view class="output-page">
    <!-- 场景类型选择 -->
    <view class="section">
      <text class="section-title">选择输出场景</text>
      <view class="scene-grid">
        <view 
          v-for="scene in scenes" 
          :key="scene.type"
          class="scene-item"
          :class="{ active: currentScene === scene.type }"
          @click="currentScene = scene.type"
        >
          <text class="scene-icon">{{ scene.icon }}</text>
          <text class="scene-name">{{ scene.name }}</text>
        </view>
      </view>
    </view>

    <!-- 模板选择 -->
    <view class="section">
      <text class="section-title">选择模板</text>
      <scroll-view scroll-x class="template-scroll">
        <view 
          v-for="tpl in filteredTemplates" 
          :key="tpl.templateId"
          class="template-item"
          :class="{ active: selectedTemplate === tpl.templateId }"
          @click="selectedTemplate = tpl.templateId"
        >
          <view class="template-preview" />
          <text class="template-name">{{ tpl.name }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 自定义文字（贺卡/请柬） -->
    <view v-if="showTextInput" class="section">
      <text class="section-title">添加文字</text>
      <textarea 
        v-model="customText"
        class="text-input"
        placeholder="请输入祝福语或信息..."
        :maxlength="200"
      />
    </view>

    <!-- 预览区 -->
    <view class="section">
      <text class="section-title">效果预览</text>
      <view class="preview-area">
        <image v-if="previewUrl" :src="previewUrl" mode="aspectFit" class="preview-image" />
        <view v-else class="preview-placeholder">
          <text class="placeholder-text">选择模板后预览效果</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar safe-bottom">
      <view class="action-btn secondary" @click="handleExport">
        <text class="btn-text">高清导出</text>
      </view>
      <view class="action-btn primary" @click="handleSave">
        <text class="btn-text">保存相册</text>
      </view>
      <view class="action-btn outline" @click="handleShare">
        <text class="btn-text">分享</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useDesignStore } from '@/store'
import { exportAsWallpaper, exportAsCard, exportAsInvitation, exportAsPreview, saveToAlbum } from '@/services/export'
import { sceneTemplates } from '@/data/sceneTemplates'
import type { SceneType } from '@/types/models'

const designStore = useDesignStore()

const currentScene = ref<SceneType>('wallpaper')
const selectedTemplate = ref('')
const customText = ref('')
const previewUrl = ref('')
const isExporting = ref(false)

const scenes = [
  { type: 'wallpaper' as SceneType, name: '壁纸', icon: '🖼' },
  { type: 'card' as SceneType, name: '贺卡', icon: '💌' },
  { type: 'invitation' as SceneType, name: '请柬', icon: '📜' },
  { type: 'preview' as SceneType, name: '周边预览', icon: '🎁' }
]

const filteredTemplates = computed(() => {
  return sceneTemplates.filter(t => t.type === currentScene.value)
})

const showTextInput = computed(() => {
  return currentScene.value === 'card' || currentScene.value === 'invitation'
})

onLoad(() => {
  if (filteredTemplates.value.length > 0) {
    selectedTemplate.value = filteredTemplates.value[0].templateId
  }
})

async function handleExport() {
  if (isExporting.value) return
  isExporting.value = true
  try {
    const artworkData = {
      patternId: designStore.currentPattern?.patternId,
      patternParams: designStore.parameters,
      colorScheme: designStore.colorScheme,
      previewDataUrl: designStore.previewDataUrl
    }
    const template = sceneTemplates.find(t => t.templateId === selectedTemplate.value)
    if (!template) {
      uni.showToast({ title: '请选择模板', icon: 'none' })
      return
    }
    let result = ''
    switch (currentScene.value) {
      case 'wallpaper':
        result = await exportAsWallpaper(artworkData, template)
        break
      case 'card':
        result = await exportAsCard(artworkData, template, customText.value)
        break
      case 'invitation':
        result = await exportAsInvitation(artworkData, template, customText.value)
        break
      case 'preview':
        result = await exportAsPreview(artworkData, currentScene.value)
        break
    }
    if (result) {
      previewUrl.value = result
      uni.showToast({ title: '导出成功', icon: 'success' })
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '导出失败'
    console.error('[Output] export failed:', message)
    uni.showToast({ title: message, icon: 'none' })
  } finally {
    isExporting.value = false
  }
}

async function handleSave() {
  if (!previewUrl.value) {
    uni.showToast({ title: '请先导出图片', icon: 'none' })
    return
  }
  try {
    // #ifdef APP-HARMONY
    await saveToAlbum(previewUrl.value)
    // #endif
    // #ifndef APP-HARMONY
    await uni.saveImageToPhotosAlbum({ filePath: previewUrl.value })
    // #endif
    uni.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '保存失败'
    console.error('[Output] save failed:', message)
    uni.showToast({ title: message, icon: 'none' })
  }
}

function handleShare() {
  if (!previewUrl.value) {
    uni.showToast({ title: '请先导出图片', icon: 'none' })
    return
  }
  // #ifdef APP
  uni.share({
    provider: 'weixin',
    type: 2,
    imageUrl: previewUrl.value,
    success: () => uni.showToast({ title: '分享成功', icon: 'success' }),
    fail: () => uni.showToast({ title: '分享取消', icon: 'none' })
  })
  // #endif
  // #ifdef H5
  uni.showToast({ title: '请长按图片保存分享', icon: 'none' })
  // #endif
}
</script>

<style scoped lang="scss">
.output-page {
  min-height: 100vh;
  background: $bg-primary;
  padding: 24rpx;
  padding-bottom: 180rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 20rpx;
  display: block;
}

.scene-grid {
  display: flex;
  gap: 20rpx;
}

.scene-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 12rpx;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  transition: all 0.2s;
}

.scene-item.active {
  border-color: $primary-color;
  background: rgba(196, 26, 22, 0.05);
}

.scene-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}

.scene-name {
  font-size: 24rpx;
  color: $text-primary;
}

.template-scroll {
  white-space: nowrap;
}

.template-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20rpx;
  width: 160rpx;
}

.template-item.active .template-preview {
  border-color: $primary-color;
}

.template-preview {
  width: 160rpx;
  height: 200rpx;
  background: $border-color;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  margin-bottom: 8rpx;
}

.template-name {
  font-size: 22rpx;
  color: $text-secondary;
  text-align: center;
}

.text-input {
  width: 100%;
  height: 160rpx;
  padding: 20rpx;
  background: $bg-card;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
}

.preview-area {
  width: 100%;
  height: 400rpx;
  background: $bg-card;
  border-radius: $radius-md;
  border: 2rpx solid $border-color;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 26rpx;
  color: $text-hint;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  background: $bg-card;
  border-top: 1rpx solid $border-color;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, $primary-color, $secondary-color);
}

.action-btn.primary .btn-text {
  color: $bg-card;
  font-size: 28rpx;
  font-weight: 600;
}

.action-btn.secondary {
  background: $bg-secondary;
}

.action-btn.secondary .btn-text {
  color: $primary-color;
  font-size: $font-md;
  font-weight: 600;
}

.action-btn.outline {
  background: transparent;
  border: 2rpx solid $border-color;
}

.action-btn.outline .btn-text {
  color: $text-secondary;
  font-size: $font-md;
}

.safe-bottom {
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}
</style>
