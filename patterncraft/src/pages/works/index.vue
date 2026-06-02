<template>
  <view class="works-page">
    <!-- 顶部筛选栏 -->
    <scroll-view class="filter-bar" scroll-x :show-scrollbar="false">
      <view
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: artworkStore.currentFilter === tab.value }"
        @click="artworkStore.setFilter(tab.value)"
      >
        <text class="filter-tab-text">{{ tab.label }}</text>
      </view>
    </scroll-view>

    <!-- 作品网格列表 -->
    <scroll-view class="works-scroll" scroll-y :show-scrollbar="false">
      <view v-if="artworkStore.filteredArtworks.length === 0" class="empty-wrapper">
        <Empty icon="🎨" text="还没有作品，去设计一个吧" />
        <view class="empty-action" @click="goDesign">
          <text class="empty-action-text">开始设计</text>
        </view>
      </view>

      <view v-else class="works-grid">
        <view
          v-for="item in artworkStore.filteredArtworks"
          :key="item.artworkId"
          class="grid-item"
        >
          <view class="artwork-thumb" @click="editArtwork(item)" @longpress="confirmDelete(item)">
            <image
              v-if="item.outputImageUrl"
              class="thumb-img"
              :src="item.outputImageUrl"
              mode="aspectFill"
              lazy-load
            />
            <view v-else class="thumb-placeholder">
              <text class="placeholder-icon">◈</text>
            </view>
            <!-- 场景标签 -->
            <view class="scene-badge">
              <text class="scene-badge-text">{{ sceneLabel(item.sceneType) }}</text>
            </view>
          </view>
          <view class="artwork-info">
            <text class="artwork-title">{{ item.customText || '未命名作品' }}</text>
            <text class="artwork-time">{{ formatTime(item.createdAt) }}</text>
          </view>
          <view class="artwork-actions">
            <view class="action-btn" @click="editArtwork(item)">
              <text class="action-icon">✎</text>
            </view>
            <view class="action-btn action-delete" @click="confirmDelete(item)">
              <text class="action-icon delete-icon">✕</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 删除确认弹窗 -->
    <Dialog
      :visible="deleteDialogVisible"
      title="删除作品"
      content="确定要删除这个作品吗？删除后不可恢复。"
      confirm-text="删除"
      cancel-text="取消"
      @confirm="doDelete"
      @cancel="deleteDialogVisible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useArtworkStore } from '@/store/artwork'
import type { Artwork, SceneType } from '@/types/models'
import Dialog from '@/components/common/Dialog.vue'
import Empty from '@/components/common/Empty.vue'

const artworkStore = useArtworkStore()

const filterTabs: { value: SceneType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'wallpaper', label: '壁纸' },
  { value: 'card', label: '贺卡' },
  { value: 'invitation', label: '请柬' },
  { value: 'preview', label: '周边预览' }
]

const deleteDialogVisible = ref(false)
const pendingDeleteArtwork = ref<Artwork | null>(null)

const sceneMap: Record<string, string> = {
  wallpaper: '壁纸',
  card: '贺卡',
  invitation: '请柬',
  preview: '周边'
}

function sceneLabel(type: SceneType): string {
  return sceneMap[type] || type
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function editArtwork(artwork: Artwork) {
  uni.navigateTo({
    url: `/pages/design/index?artworkId=${artwork.artworkId}`
  })
}

function confirmDelete(artwork: Artwork) {
  pendingDeleteArtwork.value = artwork
  deleteDialogVisible.value = true
}

function doDelete() {
  if (pendingDeleteArtwork.value) {
    artworkStore.deleteArtwork(pendingDeleteArtwork.value.artworkId)
    uni.showToast({ title: '已删除', icon: 'success' })
  }
  deleteDialogVisible.value = false
  pendingDeleteArtwork.value = null
}

function goDesign() {
  uni.navigateTo({ url: '/pages/design/index' })
}

onMounted(() => {
  artworkStore.loadArtworks()
})
</script>

<style scoped lang="scss">
.works-page {
  min-height: 100vh;
  background-color: $bg-primary;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  white-space: nowrap;
  padding: $spacing-md $spacing-md 0;
  flex-shrink: 0;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-xs $spacing-lg;
  margin-right: $spacing-sm;
  border-radius: $radius-pill;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;

  &.active {
    background-color: $primary-color;
    border-color: $primary-color;

    .filter-tab-text {
      color: #FFFFFF;
    }
  }
}

.filter-tab-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.works-scroll {
  flex: 1;
  padding: $spacing-md;
}

.empty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-action {
  margin-top: $spacing-lg;
  padding: $spacing-sm $spacing-xl;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  border-radius: $radius-pill;
}

.empty-action-text {
  font-size: $font-md;
  color: #FFFFFF;
  font-weight: 500;
}

.works-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-md;
}

.grid-item {
  width: calc(50% - 12rpx);
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.artwork-thumb {
  position: relative;
  width: 100%;
  height: 320rpx;
}

.thumb-img {
  width: 100%;
  height: 320rpx;
}

.thumb-placeholder {
  width: 100%;
  height: 320rpx;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 80rpx;
  color: $secondary-color;
  opacity: 0.3;
}

.scene-badge {
  position: absolute;
  top: $spacing-xs;
  left: $spacing-xs;
  padding: 4rpx 16rpx;
  background-color: rgba(196, 26, 22, 0.85);
  border-radius: $radius-pill;
}

.scene-badge-text {
  font-size: $font-xs;
  color: #FFFFFF;
}

.artwork-info {
  padding: $spacing-sm;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.artwork-title {
  font-size: $font-sm;
  font-weight: 500;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.artwork-time {
  font-size: $font-xs;
  color: $text-hint;
}

.artwork-actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-sm;
  padding: 0 $spacing-sm $spacing-sm;
}

.action-btn {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background-color: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.6;
  }
}

.action-delete {
  background-color: rgba(244, 67, 54, 0.08);
}

.action-icon {
  font-size: $font-sm;
  color: $text-secondary;
}

.delete-icon {
  color: $error-color;
}
</style>
