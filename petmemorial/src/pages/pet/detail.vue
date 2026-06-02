<template>
  <view class="pet-detail-page">
    <!-- 顶部头像区域 -->
    <view class="hero-section">
      <view class="avatar-wrap">
        <image
          class="avatar"
          :src="pet?.avatar || '/static/images/default-pet.png'"
          mode="aspectFill"
        />
      </view>
      <text class="pet-name">{{ pet?.name || '加载中...' }}</text>
      <view class="pet-tags" v-if="pet">
        <text class="tag type-tag">{{ typeLabel }}</text>
        <text class="tag gender-tag">{{ genderLabel }}</text>
      </view>
    </view>

    <!-- 基本信息卡片 -->
    <view class="card" v-if="pet">
      <text class="card-title">基本信息</text>
      <view class="info-row">
        <text class="info-label">品种</text>
        <text class="info-value">{{ pet.breed || '未填写' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">性别</text>
        <text class="info-value">{{ genderLabel }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">年龄</text>
        <text class="info-value">{{ ageText }}</text>
      </view>
      <view class="info-row" v-if="pet.personality">
        <text class="info-label">性格</text>
        <text class="info-value personality">{{ pet.personality }}</text>
      </view>
    </view>

    <!-- 重要日期卡片 -->
    <view class="card" v-if="pet">
      <text class="card-title">重要日期</text>
      <view class="info-row">
        <text class="info-label">🎂 生日</text>
        <text class="info-value">{{ pet.birthday || '未填写' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">🏠 到家日期</text>
        <text class="info-value">{{ pet.adoptDate || '未填写' }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">❤️ 已陪伴</text>
        <text class="info-value accent">{{ companionDays }} 天</text>
      </view>
    </view>

    <!-- 照片相册 -->
    <view class="card" v-if="pet">
      <view class="card-title-row">
        <text class="card-title">照片相册</text>
        <text class="add-photo-btn" @click="addPhoto">＋ 添加照片</text>
      </view>
      <view v-if="pet.photos.length > 0" class="photo-grid">
        <image
          v-for="(photo, index) in pet.photos"
          :key="index"
          class="photo-item"
          :src="photo"
          mode="aspectFill"
          @click="previewPhoto(index)"
        />
      </view>
      <view v-else class="photo-empty">
        <text class="photo-empty-text">还没有照片，快来添加吧</text>
      </view>
    </view>

    <!-- 操作菜单 -->
    <view class="action-section" v-if="pet">
      <view class="action-item" @click="goEdit">
        <text class="action-icon">✎</text>
        <text class="action-text">编辑资料</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item" @click="goAnniversary">
        <text class="action-icon">📅</text>
        <text class="action-text">管理纪念日</text>
        <text class="action-arrow">›</text>
      </view>
      <view class="action-item danger" @click="confirmDelete">
        <text class="action-icon">🗑</text>
        <text class="action-text danger-text">删除档案</text>
        <text class="action-arrow">›</text>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <Dialog
      :visible="showDeleteDialog"
      title="删除宠物档案"
      :content="`确定要删除「${pet?.name}」的档案吗？删除后数据将无法恢复。`"
      confirmText="删除"
      cancelText="取消"
      :showCancel="true"
      @confirm="onDeleteConfirm"
      @cancel="showDeleteDialog = false"
      @close="showDeleteDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import type { PetProfile, PetType, PetGender } from '@/types/models'
import { getPetById, deletePet, addPetPhoto } from '@/services/pet'
import { usePetStore } from '@/store/pet'
import Dialog from '@/components/common/Dialog.vue'

const petStore = usePetStore()
const pet = ref<PetProfile | null>(null)
const showDeleteDialog = ref(false)

const TYPE_LABELS: Record<PetType, string> = { cat: '猫咪', dog: '狗狗', other: '其他' }
const GENDER_LABELS: Record<PetGender, string> = { male: '公 ♂', female: '母 ♀', unknown: '未知' }

const typeLabel = computed(() => pet.value ? TYPE_LABELS[pet.value.type] : '')
const genderLabel = computed(() => pet.value ? GENDER_LABELS[pet.value.gender] : '')

const ageText = computed(() => {
  if (!pet.value?.birthday) return '年龄未知'
  const birth = new Date(pet.value.birthday)
  const now = new Date()
  const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (diffMonths < 1) return '不到1个月'
  if (diffMonths < 12) return `${diffMonths}个月`
  const years = Math.floor(diffMonths / 12)
  const months = diffMonths % 12
  return months > 0 ? `${years}岁${months}个月` : `${years}岁`
})

const companionDays = computed(() => {
  if (!pet.value?.adoptDate) return 0
  const adoptDate = new Date(pet.value.adoptDate)
  const now = new Date()
  const diff = now.getTime() - adoptDate.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
})

onLoad((options) => {
  if (options?.petId) {
    pet.value = getPetById(options.petId)
    if (!pet.value) {
      uni.showToast({ title: '宠物档案不存在', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
    }
  }
})

function previewPhoto(index: number) {
  if (!pet.value) return
  uni.previewImage({
    urls: pet.value.photos,
    current: pet.value.photos[index]
  })
}

function addPhoto() {
  if (!pet.value) return
  uni.chooseImage({
    count: 9,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFilePaths.forEach((photoUrl) => {
        if (!pet.value) return
        const updated = addPetPhoto(pet.value.petId, photoUrl)
        if (updated) {
          pet.value = updated
          petStore.updatePet(updated.petId, { photos: updated.photos })
        }
      })
    }
  })
}

function goEdit() {
  if (!pet.value) return
  uni.navigateTo({ url: `/pages/pet/create?petId=${pet.value.petId}` })
}

function goAnniversary() {
  if (!pet.value) return
  uni.navigateTo({ url: `/pages/pet/anniversary?petId=${pet.value.petId}` })
}

function confirmDelete() {
  showDeleteDialog.value = true
}

function onDeleteConfirm() {
  if (!pet.value) return
  const success = deletePet(pet.value.petId)
  if (success) {
    petStore.deletePet(pet.value.petId)
    showDeleteDialog.value = false
    uni.showToast({ title: '删除成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1200)
  }
}
</script>

<style scoped lang="scss">
.pet-detail-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 60rpx;
}

.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-xl $spacing-lg $spacing-lg;
  background: linear-gradient(135deg, $primary, $primary-light);
}

.avatar-wrap {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 6rpx solid rgba(255, 255, 255, 0.6);
  margin-bottom: $spacing-md;
}

.avatar {
  width: 100%;
  height: 100%;
}

.pet-name {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: $spacing-sm;
}

.pet-tags {
  display: flex;
  gap: $spacing-sm;
}

.tag {
  padding: 6rpx 20rpx;
  border-radius: 32rpx;
  font-size: 22rpx;
}

.type-tag {
  background-color: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

.gender-tag {
  background-color: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
}

.card {
  margin: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
  display: block;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-md;
}

.add-photo-btn {
  font-size: 24rpx;
  color: $primary;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: $spacing-sm 0;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 26rpx;
  color: $text-secondary;
  width: 180rpx;
  flex-shrink: 0;
}

.info-value {
  font-size: 26rpx;
  color: $text-primary;
  flex: 1;

  &.personality {
    line-height: 1.6;
  }

  &.accent {
    color: $primary;
    font-weight: 600;
  }
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-xs;
}

.photo-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: $radius-sm;
  background-color: $bg-page;
}

.photo-empty {
  padding: $spacing-lg 0;
  display: flex;
  justify-content: center;
}

.photo-empty-text {
  font-size: 26rpx;
  color: $text-hint;
}

.action-section {
  margin: $spacing-md $spacing-lg;
  background-color: $bg-card;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.action-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 2rpx solid $bg-page;

  &:last-child {
    border-bottom: none;
  }

  &.danger {
    background-color: #FFF5F5;
  }
}

.action-icon {
  font-size: 32rpx;
  margin-right: $spacing-md;
}

.action-text {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;

  &.danger-text {
    color: $error;
  }
}

.action-arrow {
  font-size: 32rpx;
  color: $text-hint;
}
</style>
