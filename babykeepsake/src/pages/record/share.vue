<template>
  <view class="share-page">
    <scroll-view class="share-scroll" scroll-y>
      <!-- 模板选择 -->
      <view class="template-section">
        <text class="section-label">选择卡片风格</text>
        <scroll-view class="template-scroll" scroll-x>
          <view
            v-for="tpl in templates"
            :key="tpl.id"
            class="template-item"
            :class="{ 'template-selected': selectedTemplate === tpl.id }"
            @click="selectedTemplate = tpl.id"
          >
            <view class="template-preview" :class="tpl.previewClass">
              <text class="template-icon">{{ tpl.icon }}</text>
            </view>
            <text class="template-name">{{ tpl.name }}</text>
          </view>
        </scroll-view>
      </view>

      <!-- 卡片预览 -->
      <view class="preview-area">
        <view class="card-frame" :class="currentTemplate.frameClass">
          <!-- 装饰边框 -->
          <view class="decoration-top" :class="currentTemplate.decoClass">
            <text class="deco-icon">{{ currentTemplate.decoIcon }}</text>
          </view>

          <!-- 卡片内容 -->
          <view class="card-content" :class="currentTemplate.contentClass">
            <!-- 宝宝照片 -->
            <view v-if="milestone?.photos?.length" class="card-photo-wrap">
              <image
                class="card-photo"
                :src="milestone.photos[0]"
                mode="aspectFill"
              />
            </view>
            <view v-else class="card-photo-placeholder">
              <text class="placeholder-icon">{{ typeIcon }}</text>
            </view>

            <!-- 宝宝名字 -->
            <text class="card-baby-name">{{ babyName }}</text>

            <!-- 里程碑标题 -->
            <text class="card-milestone-title">{{ milestone?.title || '成长里程碑' }}</text>

            <!-- 日期 -->
            <text class="card-date">{{ milestone?.recordDate || today }}</text>

            <!-- 描述 -->
            <text v-if="milestone?.description" class="card-desc">{{ milestone.description }}</text>

            <!-- 底部品牌 -->
            <view class="card-brand">
              <text class="brand-text">BabyKeepsake · 记录每一刻成长</text>
            </view>
          </view>

          <!-- 底部装饰 -->
          <view class="decoration-bottom" :class="currentTemplate.decoClass">
            <text class="deco-icon">{{ currentTemplate.decoIconBottom }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作 -->
    <view class="bottom-bar">
      <view class="action-btn save-btn" @click="saveToAlbum">
        <text class="action-icon">💾</text>
        <text class="action-text">保存到相册</text>
      </view>
      <view class="action-btn share-btn-action" @click="shareCard">
        <text class="action-icon">🔗</text>
        <text class="action-text">分享给朋友</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getMilestones } from '@/services/milestone'
import { useUserStore } from '@/store/user'
import type { Milestone, MilestoneType } from '@/types/models'

interface TemplateConfig {
  id: string
  name: string
  icon: string
  previewClass: string
  frameClass: string
  decoClass: string
  contentClass: string
  decoIcon: string
  decoIconBottom: string
}

const TYPE_ICON_MAP: Record<MilestoneType, string> = {
  first_handprint: '🖐',
  first_hair_cut: '✂️',
  first_tooth: '🦷',
  birthday: '🎂'
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'warm',
    name: '温馨',
    icon: '🌸',
    previewClass: 'preview-warm',
    frameClass: 'frame-warm',
    decoClass: 'deco-warm',
    contentClass: 'content-warm',
    decoIcon: '💕',
    decoIconBottom: '🌸'
  },
  {
    id: 'cute',
    name: '可爱',
    icon: '🧸',
    previewClass: 'preview-cute',
    frameClass: 'frame-cute',
    decoClass: 'deco-cute',
    contentClass: 'content-cute',
    decoIcon: '⭐',
    decoIconBottom: '🌈'
  },
  {
    id: 'minimal',
    name: '简约',
    icon: '✨',
    previewClass: 'preview-minimal',
    frameClass: 'frame-minimal',
    decoClass: 'deco-minimal',
    contentClass: 'content-minimal',
    decoIcon: '·',
    decoIconBottom: '·'
  },
  {
    id: 'elegant',
    name: '典雅',
    icon: '🏮',
    previewClass: 'preview-elegant',
    frameClass: 'frame-elegant',
    decoClass: 'deco-elegant',
    contentClass: 'content-elegant',
    decoIcon: '❋',
    decoIconBottom: '❋'
  }
]

const userStore = useUserStore()
const milestoneId = ref('')
const milestone = ref<Milestone | null>(null)
const selectedTemplate = ref('warm')

const babyName = computed(() => {
  const baby = userStore.selectedBaby
  return baby?.name || '宝宝'
})

const typeIcon = computed(() => {
  if (!milestone.value) return '⭐'
  return TYPE_ICON_MAP[milestone.value.type] || '⭐'
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const templates = TEMPLATES
const currentTemplate = computed(() => {
  return TEMPLATES.find((t) => t.id === selectedTemplate.value) || TEMPLATES[0]
})

function loadData() {
  if (!milestoneId.value) return
  const userId = userStore.userId || 'default_user'
  const milestones = getMilestones(userId)
  const found = milestones.find((m) => m.milestoneId === milestoneId.value)
  if (found) {
    milestone.value = found
  }
}

function saveToAlbum() {
  uni.showLoading({ title: '生成中...' })

  // 使用 html-to-canvas 思路：截取卡片区域保存
  // 在 uni-app 中，使用 uni.canvasToTempFilePath 配合 canvas 实现
  // 这里使用简化方案：截取当前页面
  setTimeout(() => {
    uni.hideLoading()

    // 尝试使用 uni.saveFile 或者直接提示用户截图
    uni.showModal({
      title: '保存分享卡片',
      content: '请长按卡片区域保存图片，或使用手机截图功能保存',
      showCancel: false,
      confirmText: '我知道了'
    })

    // 如果有 canvas 实现，可在此处调用
    // uni.saveImageToPhotosAlbum({
    //   filePath: tempFilePath,
    //   success: () => { uni.showToast({ title: '已保存到相册', icon: 'success' }) },
    //   fail: () => { uni.showToast({ title: '保存失败', icon: 'none' }) }
    // })
  }, 800)
}

function shareCard() {
  // 尝试调用 uni.share
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: `${babyName.value}的成长里程碑`,
    summary: milestone.value?.description || milestone.value?.title || '',
    href: '',
    success: () => {
      uni.showToast({ title: '分享成功', icon: 'success' })
    },
    fail: () => {
      // 回退方案：复制文字
      const shareText = `🎉 ${babyName.value}的成长里程碑\n${milestone.value?.title || ''}\n${milestone.value?.recordDate || ''}\n${milestone.value?.description || ''}\n——来自 BabyKeepsake`
      uni.setClipboardData({
        data: shareText,
        success: () => {
          uni.showToast({ title: '内容已复制，可粘贴分享', icon: 'none', duration: 2000 })
        }
      })
    }
  })
}

onLoad((options) => {
  if (options?.milestoneId) {
    milestoneId.value = options.milestoneId
  }
  loadData()
})
</script>

<style scoped lang="scss">
.share-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: $bg-page;
}

.share-scroll {
  flex: 1;
}

.template-section {
  padding: $spacing-lg $spacing-lg $spacing-sm;
}

.section-label {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: block;
}

.template-scroll {
  white-space: nowrap;
}

.template-item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin-right: $spacing-md;
}

.template-preview {
  width: 120rpx;
  height: 120rpx;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  border: 4rpx solid transparent;
}

.template-selected .template-preview {
  border-color: $primary;
  box-shadow: 0 4rpx 16rpx rgba(255, 107, 53, 0.25);
}

.preview-warm {
  background: linear-gradient(135deg, #FFE8E0, #FFD0C0);
}

.preview-cute {
  background: linear-gradient(135deg, #E8F5E9, #C8E6C9);
}

.preview-minimal {
  background: linear-gradient(135deg, #F5F5F5, #E0E0E0);
}

.preview-elegant {
  background: linear-gradient(135deg, #FFF8E1, #FFE082);
}

.template-icon {
  font-size: 40rpx;
}

.template-name {
  font-size: 22rpx;
  color: $text-secondary;
}

.template-selected .template-name {
  color: $primary;
  font-weight: 600;
}

// 卡片预览区域
.preview-area {
  padding: $spacing-md $spacing-lg $spacing-xl;
  display: flex;
  justify-content: center;
}

.card-frame {
  width: 600rpx;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
}

// 温馨模板
.frame-warm {
  background: linear-gradient(180deg, #FFF3ED, #FFE8DD, #FFF3ED);
}

// 可爱模板
.frame-cute {
  background: linear-gradient(180deg, #E8F5E9, #F1F8E9, #E8F5E9);
}

// 简约模板
.frame-minimal {
  background: linear-gradient(180deg, #FFFFFF, #FAFAFA, #FFFFFF);
}

// 典雅模板
.frame-elegant {
  background: linear-gradient(180deg, #FFF8E1, #FFFDE7, #FFF8E1);
}

.decoration-top {
  display: flex;
  justify-content: center;
  padding: 24rpx 0 8rpx;
}

.decoration-bottom {
  display: flex;
  justify-content: center;
  padding: 8rpx 0 24rpx;
}

.deco-icon {
  font-size: 36rpx;
  letter-spacing: 16rpx;
}

.deco-warm .deco-icon {
  color: $primary;
}

.deco-cute .deco-icon {
  color: #66BB6A;
}

.deco-minimal .deco-icon {
  color: $text-hint;
  font-size: 28rpx;
}

.deco-elegant .deco-icon {
  color: #F9A825;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 40rpx;
}

.card-photo-wrap {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-photo {
  width: 320rpx;
  height: 320rpx;
}

.card-photo-placeholder {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.content-warm .card-photo-placeholder {
  background: linear-gradient(135deg, #FFE0CC, #FFD0B0);
}

.content-cute .card-photo-placeholder {
  background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
}

.content-minimal .card-photo-placeholder {
  background: linear-gradient(135deg, #F5F5F5, #EEEEEE);
}

.content-elegant .card-photo-placeholder {
  background: linear-gradient(135deg, #FFE082, #FFD54F);
}

.placeholder-icon {
  font-size: 80rpx;
}

.card-baby-name {
  font-size: 40rpx;
  font-weight: 800;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.content-warm .card-baby-name {
  color: $primary-dark;
}

.content-cute .card-baby-name {
  color: #388E3C;
}

.content-minimal .card-baby-name {
  color: $text-primary;
}

.content-elegant .card-baby-name {
  color: #E65100;
}

.card-milestone-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-secondary;
  margin-bottom: 12rpx;
}

.card-date {
  font-size: 26rpx;
  color: $text-hint;
  margin-bottom: 20rpx;
}

.card-desc {
  font-size: 24rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 24rpx;
  max-width: 480rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-brand {
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.brand-text {
  font-size: 20rpx;
  color: $text-disabled;
  letter-spacing: 2rpx;
}

// 底部操作
.bottom-bar {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  border-top: 1rpx solid $border-color;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 44rpx;
}

.save-btn {
  background-color: #F5F5F5;
}

.share-btn-action {
  background: linear-gradient(135deg, $primary, $primary-light);
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}

.action-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.action-text {
  font-size: 28rpx;
  font-weight: 600;
}

.save-btn .action-text {
  color: $text-primary;
}

.share-btn-action .action-text {
  color: #FFFFFF;
}
</style>
