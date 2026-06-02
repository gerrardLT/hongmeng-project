<template>
  <view v-if="entry" class="page">
    <!-- 封面大图 -->
    <view class="cover-section">
      <image
        v-if="entry.coverUrl"
        :src="entry.coverUrl"
        class="cover-img"
        mode="aspectFill"
      />
      <view v-else class="cover-placeholder">
        <text class="cover-type-icon">{{ typeIcon }}</text>
      </view>
    </view>

    <!-- 信息区 -->
    <view class="info-section">
      <!-- 类型标签 + 标题 -->
      <view class="title-row">
        <view class="type-badge">
          <text class="type-badge-text">{{ typeLabel }}</text>
        </view>
        <view v-if="entry.isTopOfYear" class="top-badge">
          <text class="top-badge-text">⭐ 年度精选</text>
        </view>
      </view>
      <text class="title">{{ entry.title }}</text>
      <text v-if="entry.subtitle" class="subtitle">{{ entry.subtitle }}</text>

      <!-- 评分 -->
      <view v-if="entry.rating > 0" class="rating-row">
        <RatingStars :model-value="entry.rating" :readonly="true" size="40rpx" />
        <text class="rating-text">{{ entry.rating }}/5</text>
      </view>

      <!-- 日期 -->
      <view v-if="entry.date" class="meta-item">
        <text class="meta-icon">📅</text>
        <text class="meta-text">{{ entry.date }}</text>
      </view>

      <!-- 平台（仅电影） -->
      <view v-if="entry.type === 'movie' && entry.platform" class="meta-item">
        <text class="meta-icon">🎭</text>
        <text class="meta-text">{{ entry.platform }}</text>
      </view>

      <!-- 标签 -->
      <view v-if="entry.tags && entry.tags.length > 0" class="tags-row">
        <text
          v-for="tag in entry.tags"
          :key="tag"
          class="tag"
        >{{ tag }}</text>
      </view>

      <!-- 短评 -->
      <view v-if="entry.review" class="review-section">
        <text class="review-label">短评</text>
        <text class="review-content">{{ entry.review }}</text>
      </view>

      <!-- 展览照片网格（仅展览） -->
      <view v-if="entry.type === 'exhibition' && entry.photos && entry.photos.length > 0" class="photos-section">
        <text class="photos-label">现场照片</text>
        <view class="photos-grid">
          <image
            v-for="(photo, idx) in entry.photos"
            :key="idx"
            :src="photo"
            class="photos-grid-img"
            mode="aspectFill"
            @click="onPreviewPhoto(idx)"
          />
        </view>
      </view>
    </view>

    <!-- 操作区 -->
    <view class="action-section">
      <!-- 年度精选切换 -->
      <view class="action-btn star-btn" @click="onToggleTopOfYear">
        <text class="action-btn-icon">{{ entry.isTopOfYear ? '⭐' : '☆' }}</text>
        <text class="action-btn-label">{{ entry.isTopOfYear ? '取消精选' : '年度精选' }}</text>
      </view>

      <!-- 碰一碰推荐（仅鸿蒙端） -->
      <!-- #ifdef APP-HARMONY -->
      <view class="action-btn nfc-btn" @click="onNfcShare">
        <text class="action-btn-icon">📡</text>
        <text class="action-btn-label">碰一碰推荐</text>
      </view>
      <!-- #endif -->

      <!-- 编辑 -->
      <view class="action-btn edit-btn" @click="onEdit">
        <text class="action-btn-icon">✏️</text>
        <text class="action-btn-label">编辑</text>
      </view>

      <!-- 删除 -->
      <view class="action-btn delete-btn" @click="showDeleteDialog = true">
        <text class="action-btn-icon">🗑️</text>
        <text class="action-btn-label delete-label">删除</text>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <Dialog
      v-model:visible="showDeleteDialog"
      title="删除条目"
      content="确定要删除这条记录吗？删除后不可恢复。"
      confirm-text="删除"
      cancel-text="取消"
      :show-cancel="true"
      @confirm="onConfirmDelete"
    />
  </view>

  <!-- 加载中 / 不存在 -->
  <view v-else class="page page-center">
    <Empty icon="😕" text="条目不存在或已被删除" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useEntryStore } from '@/store/entry'
import RatingStars from '@/components/RatingStars.vue'
import Dialog from '@/components/common/Dialog.vue'
import Empty from '@/components/common/Empty.vue'
import type { Entry, EntryType } from '@/types/models'

const entryStore = useEntryStore()

const entryId = ref('')
const showDeleteDialog = ref(false)

const entry = computed<Entry | undefined>(() => {
  if (!entryId.value) return undefined
  return entryStore.getEntryById(entryId.value)
})

const typeIconMap: Record<EntryType, string> = {
  book: '📖',
  movie: '🎬',
  podcast: '🎙️',
  exhibition: '🎨'
}

const typeLabelMap: Record<EntryType, string> = {
  book: '书籍',
  movie: '电影',
  podcast: '播客',
  exhibition: '展览'
}

const typeIcon = computed(() => {
  if (!entry.value) return '📖'
  return typeIconMap[entry.value.type] || '📖'
})

const typeLabel = computed(() => {
  if (!entry.value) return ''
  return typeLabelMap[entry.value.type] || ''
})

function onEdit() {
  if (!entry.value) return
  uni.navigateTo({ url: `/pages/entry/edit?id=${entry.value.entryId}` })
}

function onToggleTopOfYear() {
  if (!entry.value) return
  entryStore.toggleTopOfYear(entry.value.entryId)
}

function onConfirmDelete() {
  if (!entry.value) return
  entryStore.deleteEntry(entry.value.entryId)
  uni.showToast({ title: '已删除', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

function onPreviewPhoto(index: number) {
  if (!entry.value || !entry.value.photos) return
  uni.previewImage({
    current: entry.value.photos[index],
    urls: entry.value.photos
  })
}

// 碰一碰推荐（鸿蒙端）
function onNfcShare() {
  uni.showToast({ title: '准备碰一碰推荐', icon: 'none' })
}

onLoad((query) => {
  if (query && query.id) {
    entryId.value = query.id as string
  }
  entryStore.init()
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
}

.page-center {
  align-items: center;
  justify-content: center;
}

.cover-section {
  width: 100%;
  height: 400rpx;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 400rpx;
}

.cover-placeholder {
  width: 100%;
  height: 400rpx;
  background-color: $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-type-icon {
  font-size: 128rpx;
}

.info-section {
  padding: $spacing-lg $spacing-md;
  background-color: $bg-card;
  margin: -$spacing-md $spacing-md 0;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
}

.title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.type-badge {
  padding: 4rpx $spacing-sm;
  background-color: rgba($primary-color, 0.1);
  border-radius: $radius-sm;
}

.type-badge-text {
  font-size: $font-xs;
  color: $primary-color;
}

.top-badge {
  padding: 4rpx $spacing-sm;
  background-color: rgba($accent-color, 0.1);
  border-radius: $radius-sm;
}

.top-badge-text {
  font-size: $font-xs;
  color: $accent-color;
}

.title {
  font-size: $font-xxl;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.3;
  margin-bottom: $spacing-xs;
}

.subtitle {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: $spacing-md;
}

.rating-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.rating-text {
  font-size: $font-sm;
  color: $accent-color;
}

.meta-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.meta-icon {
  font-size: $font-md;
}

.meta-text {
  font-size: $font-sm;
  color: $text-secondary;
}

.tags-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.tag {
  font-size: $font-xs;
  color: $secondary-color;
  background-color: rgba($secondary-color, 0.08);
  padding: 4rpx $spacing-sm;
  border-radius: $radius-sm;
}

.review-section {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1rpx solid $border-color;
}

.review-label {
  font-size: $font-sm;
  color: $text-hint;
  margin-bottom: $spacing-sm;
}

.review-content {
  font-size: $font-md;
  color: $text-primary;
  line-height: 1.6;
}

.photos-section {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1rpx solid $border-color;
}

.photos-label {
  font-size: $font-sm;
  color: $text-hint;
  margin-bottom: $spacing-sm;
}

.photos-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.photos-grid-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-sm;
}

.action-section {
  display: flex;
  flex-direction: row;
  padding: $spacing-md;
  margin: $spacing-md;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  gap: $spacing-sm;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md 0;
  border-radius: $radius-md;
  background-color: $bg-color;
}

.action-btn-icon {
  font-size: 40rpx;
  margin-bottom: $spacing-xs;
}

.action-btn-label {
  font-size: $font-xs;
  color: $text-secondary;
}

.delete-label {
  color: $error-color;
}

.star-btn {
  background-color: rgba($accent-color, 0.06);
}

.edit-btn {
  background-color: rgba($secondary-color, 0.06);
}

.delete-btn {
  background-color: rgba($error-color, 0.06);
}

.nfc-btn {
  background-color: rgba($primary-color, 0.06);
}
</style>
