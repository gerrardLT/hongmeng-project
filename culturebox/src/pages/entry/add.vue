<template>
  <view class="page">
    <scroll-view scroll-y class="form-scroll">
      <!-- 类型选择 -->
      <view class="section">
        <text class="section-title">选择类型</text>
        <view class="type-grid">
          <view
            v-for="item in typeOptions"
            :key="item.value"
            class="type-btn"
            :class="{ 'type-btn-active': form.type === item.value }"
            @click="form.type = item.value"
          >
            <text class="type-emoji">{{ item.icon }}</text>
            <text class="type-label" :class="{ 'type-label-active': form.type === item.value }">
              {{ item.label }}
            </text>
          </view>
        </view>
      </view>

      <!-- 表单区域 -->
      <view class="section">
        <!-- 标题 -->
        <view class="form-item">
          <text class="form-label">标题 <text class="required">*</text></text>
          <input
            v-model="form.title"
            class="form-input"
            placeholder="请输入标题"
          />
        </view>

        <!-- 副标题 -->
        <view class="form-item">
          <text class="form-label">{{ subtitleLabel }}</text>
          <input
            v-model="form.subtitle"
            class="form-input"
            :placeholder="subtitlePlaceholder"
          />
        </view>

        <!-- 日期 -->
        <view class="form-item">
          <text class="form-label">日期</text>
          <picker
            mode="date"
            :value="form.date"
            @change="onDateChange"
          >
            <view class="picker-value">
              <text :class="{ 'picker-placeholder': !form.date }">
                {{ form.date || '请选择日期' }}
              </text>
            </view>
          </picker>
        </view>

        <!-- 平台（仅电影） -->
        <view v-if="form.type === 'movie'" class="form-item">
          <text class="form-label">平台</text>
          <input
            v-model="form.platform"
            class="form-input"
            placeholder="如：影院 / Netflix"
          />
        </view>

        <!-- 封面图 -->
        <view class="form-item">
          <text class="form-label">封面图</text>
          <view class="cover-input-row">
            <input
              v-model="form.coverUrl"
              class="form-input cover-url-input"
              placeholder="输入图片URL"
            />
            <view class="upload-btn" @click="onChooseCover">
              <text class="upload-btn-text">上传</text>
            </view>
          </view>
          <image
            v-if="form.coverUrl"
            :src="form.coverUrl"
            class="cover-preview"
            mode="aspectFit"
          />
        </view>

        <!-- 展览照片上传 -->
        <view v-if="form.type === 'exhibition'" class="form-item">
          <text class="form-label">展览照片（最多9张）</text>
          <view class="photo-grid">
            <view
              v-for="(photo, index) in form.photos"
              :key="index"
              class="photo-item"
            >
              <image :src="photo" class="photo-img" mode="aspectFill" />
              <view class="photo-remove" @click="onRemovePhoto(index)">
                <text class="photo-remove-text">×</text>
              </view>
            </view>
            <view
              v-if="form.photos.length < 9"
              class="photo-add"
              @click="onChoosePhoto"
            >
              <text class="photo-add-icon">+</text>
            </view>
          </view>
        </view>

        <!-- 评分 -->
        <view class="form-item">
          <text class="form-label">评分</text>
          <RatingStars v-model="form.rating" size="48rpx" />
        </view>

        <!-- 短评 -->
        <view class="form-item">
          <text class="form-label">短评</text>
          <textarea
            v-model="form.review"
            class="form-textarea"
            placeholder="写下你的感受..."
            maxlength="500"
          />
          <text class="char-count">{{ form.review.length }}/500</text>
        </view>

        <!-- 标签 -->
        <view class="form-item">
          <text class="form-label">标签</text>
          <TagSelector
            v-model="form.tags"
            :suggestions="tagStore.tagNames"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="bottom-bar">
      <view class="save-btn" :class="{ 'save-btn-disabled': !canSave }" @click="onSave">
        <text class="save-btn-text">保存</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useEntryStore } from '@/store/entry'
import { useTagStore } from '@/store/tag'
import { useUserStore } from '@/store/user'
import RatingStars from '@/components/RatingStars.vue'
import TagSelector from '@/components/TagSelector.vue'
import type { EntryType } from '@/types/models'

const entryStore = useEntryStore()
const tagStore = useTagStore()
const userStore = useUserStore()

interface TypeOption {
  icon: string
  label: string
  value: EntryType
}

const typeOptions: TypeOption[] = [
  { icon: '📖', label: '书', value: 'book' },
  { icon: '🎬', label: '电影', value: 'movie' },
  { icon: '🎙️', label: '播客', value: 'podcast' },
  { icon: '🎨', label: '展览', value: 'exhibition' }
]

const subtitleLabels: Record<EntryType, string> = {
  book: '作者',
  movie: '导演',
  podcast: '主播',
  exhibition: '场馆'
}

const form = reactive({
  type: 'book' as EntryType,
  title: '',
  subtitle: '',
  coverUrl: '',
  date: '',
  rating: 0,
  review: '',
  tags: [] as string[],
  platform: '',
  photos: [] as string[]
})

const subtitleLabel = computed(() => subtitleLabels[form.type])
const subtitlePlaceholder = computed(() => `请输入${subtitleLabels[form.type]}`)
const canSave = computed(() => form.title.trim().length > 0)

function onDateChange(e: { detail: { value: string } }) {
  form.date = e.detail.value
}

function onChooseCover() {
  uni.chooseImage({
    count: 1,
    success(res) {
      if (res.tempFilePaths.length > 0) {
        form.coverUrl = res.tempFilePaths[0]
      }
    }
  })
}

function onChoosePhoto() {
  const remaining = 9 - form.photos.length
  if (remaining <= 0) return
  uni.chooseImage({
    count: remaining,
    success(res) {
      form.photos.push(...res.tempFilePaths)
    }
  })
}

function onRemovePhoto(index: number) {
  form.photos.splice(index, 1)
}

function onSave() {
  if (!canSave.value) {
    uni.showToast({ title: '请填写标题', icon: 'none' })
    return
  }
  entryStore.addEntry({
    userId: userStore.userId || '',
    type: form.type,
    title: form.title.trim(),
    subtitle: form.subtitle.trim(),
    coverUrl: form.coverUrl.trim(),
    date: form.date,
    rating: form.rating,
    review: form.review.trim(),
    tags: [...form.tags],
    platform: form.type === 'movie' ? form.platform.trim() : '',
    photos: form.type === 'exhibition' ? [...form.photos] : [],
    isTopOfYear: false
  })

  // 更新标签使用次数
  form.tags.forEach(tag => tagStore.incrementTagCount(tag))

  uni.showToast({ title: '添加成功', icon: 'success' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: $bg-color;
}

.form-scroll {
  flex: 1;
  padding-bottom: 140rpx;
}

.section {
  padding: $spacing-md;
}

.section-title {
  font-size: $font-lg;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.type-grid {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.type-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-md 0;
  border-radius: $radius-md;
  background-color: $bg-card;
  border: 2rpx solid $border-color;
  transition: all $transition-fast;
}

.type-btn-active {
  border-color: $primary-color;
  background-color: rgba($primary-color, 0.06);
}

.type-emoji {
  font-size: 48rpx;
  margin-bottom: $spacing-xs;
}

.type-label {
  font-size: $font-sm;
  color: $text-secondary;
}

.type-label-active {
  color: $primary-color;
  font-weight: 500;
}

.form-item {
  margin-bottom: $spacing-lg;
}

.form-label {
  font-size: $font-md;
  color: $text-primary;
  font-weight: 500;
  margin-bottom: $spacing-sm;
}

.required {
  color: $error-color;
}

.form-input {
  height: 72rpx;
  padding: 0 $spacing-md;
  background-color: $bg-card;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  font-size: $font-md;
  color: $text-primary;
}

.picker-value {
  height: 72rpx;
  display: flex;
  align-items: center;
  padding: 0 $spacing-md;
  background-color: $bg-card;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  font-size: $font-md;
  color: $text-primary;
}

.picker-placeholder {
  color: $text-hint;
}

.cover-input-row {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.cover-url-input {
  flex: 1;
}

.upload-btn {
  padding: 0 $spacing-md;
  background-color: $secondary-color;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn-text {
  font-size: $font-sm;
  color: #FFFFFF;
}

.cover-preview {
  width: 200rpx;
  height: 260rpx;
  margin-top: $spacing-sm;
  border-radius: $radius-sm;
}

.photo-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $spacing-sm;
}

.photo-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.photo-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: $radius-sm;
}

.photo-remove {
  position: absolute;
  top: -12rpx;
  right: -12rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: $error-color;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-remove-text {
  color: #FFFFFF;
  font-size: $font-sm;
  line-height: 1;
}

.photo-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed $border-color;
  border-radius: $radius-sm;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-card;
}

.photo-add-icon {
  font-size: 64rpx;
  color: $text-hint;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  padding: $spacing-md;
  background-color: $bg-card;
  border: 1rpx solid $border-color;
  border-radius: $radius-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
}

.char-count {
  font-size: $font-xs;
  color: $text-hint;
  text-align: right;
  margin-top: $spacing-xs;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: $spacing-md $spacing-lg;
  padding-bottom: calc($spacing-md + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.save-btn {
  height: 88rpx;
  background-color: $primary-color;
  border-radius: $radius-pill;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn-disabled {
  opacity: 0.5;
}

.save-btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 500;
}
</style>
