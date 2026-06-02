<template>
  <view class="photo-page">
    <!-- 入口按钮区 -->
    <view class="action-area">
      <view class="upload-card">
        <view class="btn-group" v-if="!selectedImage">
          <view class="btn-item" @click="takePhoto">
            <text class="btn-icon">📷</text>
            <text class="btn-text">拍照</text>
          </view>
          <view class="divider-v" />
          <view class="btn-item" @click="chooseFromAlbum">
            <text class="btn-icon">🖼️</text>
            <text class="btn-text">从相册选择</text>
          </view>
        </view>

        <!-- 图片预览 -->
        <view class="preview-area" v-else>
          <image class="preview-image" :src="selectedImage" mode="aspectFit" />
          <view class="preview-actions">
            <button class="btn-primary" @click="startAnalysis">开始分析</button>
            <button class="btn-secondary" @click="reselect">重新选择</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 历史记录区 -->
    <view class="history-area">
      <view class="section-header">
        <text class="section-title">分析记录</text>
        <text class="section-clear" v-if="analysisHistory.length" @click="clearHistory">清空</text>
      </view>

      <view class="history-list" v-if="analysisHistory.length">
        <view
          class="history-item"
          v-for="item in analysisHistory"
          :key="item.analysisId"
          @click="viewResult(item.analysisId)"
        >
          <image class="history-thumb" :src="item.imagePath" mode="aspectFill" />
          <view class="history-colors">
            <view
              class="history-color-dot"
              v-for="(c, idx) in item.colors.slice(0, 3)"
              :key="idx"
              :style="{ backgroundColor: c.color.hex }"
            />
          </view>
          <text class="history-time">{{ formatTime(item.analyzedAt) }}</text>
        </view>
      </view>

      <Empty
        v-else
        text="暂无分析记录"
        icon="📸"
        :showAction="true"
        actionText="去拍照"
        @action="takePhoto"
      />
    </view>

    <!-- loading -->
    <view class="loading-mask" v-if="analyzing">
      <Loading :loading="true" />
      <text class="loading-text">正在分析色彩...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { analyzeImage, saveAnalysisResult, getAnalysisHistory } from '@/services/photoAnalysis'
import type { AnalysisResult } from '@/types/models'
import Empty from '@/components/common/Empty.vue'
import Loading from '@/components/common/Loading.vue'
import { formatTime } from '@/utils/format'

const selectedImage = ref('')
const analyzing = ref(false)
const analysisHistory = ref<AnalysisResult[]>([])

onShow(() => {
  loadHistory()
})

function loadHistory() {
  analysisHistory.value = getAnalysisHistory()
}

function checkCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const auth = res.authSetting['scope.camera']
        if (auth === false) {
          uni.showModal({
            title: '需要相机权限',
            content: '请在设置中开启相机权限',
            success: (r) => {
              if (r.confirm) {
                uni.openSetting()
              }
              resolve(false)
            }
          })
        } else {
          resolve(true)
        }
      },
      fail: () => resolve(true)
    })
  })
}

async function takePhoto() {
  const granted = await checkCameraPermission()
  if (!granted) return

  uni.chooseImage({
    sourceType: ['camera'],
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      selectedImage.value = res.tempFilePaths[0]
    },
    fail: (err) => {
      console.error('拍照失败:', err)
    }
  })
}

function chooseFromAlbum() {
  uni.chooseImage({
    sourceType: ['album'],
    count: 1,
    sizeType: ['compressed'],
    success: (res) => {
      selectedImage.value = res.tempFilePaths[0]
    },
    fail: (err) => {
      console.error('选择图片失败:', err)
    }
  })
}

function reselect() {
  selectedImage.value = ''
}

async function startAnalysis() {
  if (!selectedImage.value) return

  analyzing.value = true
  try {
    const result = await analyzeImage(selectedImage.value)
    saveAnalysisResult(result)
    selectedImage.value = ''
    uni.navigateTo({
      url: `/pages/photo/result?analysisId=${result.analysisId}`
    })
  } catch (e) {
    uni.showToast({ title: '分析失败，请重试', icon: 'none' })
  } finally {
    analyzing.value = false
  }
}

function viewResult(analysisId: string) {
  uni.navigateTo({
    url: `/pages/photo/result?analysisId=${analysisId}`
  })
}

function clearHistory() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空所有分析记录吗？',
    success: (res) => {
      if (res.confirm) {
        try {
          uni.removeStorageSync('coloraid_db_analysis_results')
          loadHistory()
          uni.showToast({ title: '已清空', icon: 'success' })
        } catch (e) {
          console.error('clear analysis history error:', e)
        }
      }
    }
  })
}
</script>

<style scoped lang="scss">
.photo-page {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-md;
}

.action-area {
  margin-bottom: $spacing-lg;
}

.upload-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-lg;
}

.btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300rpx;
}

.btn-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-sm;
}

.btn-icon {
  font-size: 64rpx;
}

.btn-text {
  font-size: $font-md;
  color: $text-primary;
}

.divider-v {
  width: 2rpx;
  height: 120rpx;
  background-color: $border-color;
}

.preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
}

.preview-image {
  width: 100%;
  height: 400rpx;
  border-radius: $radius-md;
  background-color: $bg-color;
}

.preview-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-area {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
  }

  .section-title {
    font-size: $font-lg;
    font-weight: 600;
    color: $text-primary;
  }

  .section-clear {
    font-size: $font-sm;
    color: $error-color;
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.history-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: $spacing-sm;
}

.history-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.history-colors {
  flex: 1;
  display: flex;
  gap: $spacing-xs;
}

.history-color-dot {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid $border-color;
}

.history-time {
  font-size: $font-sm;
  color: $text-secondary;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.loading-text {
  margin-top: $spacing-md;
  color: #FFFFFF;
  font-size: $font-md;
}
</style>
