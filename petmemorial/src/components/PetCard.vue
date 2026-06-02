<template>
  <view class="pet-card" @click="onClick">
    <view class="avatar-wrap">
      <image
        class="avatar"
        :src="pet.avatar || '/static/images/default-pet.png'"
        mode="aspectFill"
      />
      <view class="type-badge" :class="pet.type">
        <text class="type-text">{{ typeLabel }}</text>
      </view>
    </view>

    <view class="info-wrap">
      <view class="name-row">
        <text class="name">{{ pet.name }}</text>
        <text class="gender-icon">{{ genderIcon }}</text>
      </view>
      <text class="breed">{{ pet.breed }}</text>
      <text class="age">{{ ageText }}</text>
    </view>

    <view class="edit-btn" @click.stop="onEdit">
      <text class="edit-icon">✎</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PetProfile, PetType, PetGender } from '@/types/models'

const TYPE_LABELS: Record<PetType, string> = {
  cat: '猫咪',
  dog: '狗狗',
  other: '其他'
}

const props = defineProps<{
  pet: PetProfile
}>()

const emit = defineEmits<{
  click: []
  edit: []
}>()

const typeLabel = computed(() => TYPE_LABELS[props.pet.type] || '宠物')

const genderIcon = computed(() => {
  const icons: Record<PetGender, string> = {
    male: '♂',
    female: '♀',
    unknown: ''
  }
  return icons[props.pet.gender] || ''
})

const ageText = computed(() => {
  if (!props.pet.birthday) return '年龄未知'
  const birth = new Date(props.pet.birthday)
  const now = new Date()
  const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (diffMonths < 1) return '不到1个月'
  if (diffMonths < 12) return `${diffMonths}个月`
  const years = Math.floor(diffMonths / 12)
  const months = diffMonths % 12
  return months > 0 ? `${years}岁${months}个月` : `${years}岁`
})

function onClick() {
  emit('click')
}

function onEdit() {
  emit('edit')
}
</script>

<style scoped lang="scss">
.pet-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.avatar-wrap {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 24rpx;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.type-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 16rpx;
  padding: 2rpx 10rpx;
}

.type-badge.cat {
  background-color: #F3E8FF;
}

.type-badge.dog {
  background-color: #FEF3C7;
}

.type-badge.other {
  background-color: #E8F5E9;
}

.type-text {
  font-size: 18rpx;
  font-weight: 500;
}

.type-badge.cat .type-text {
  color: $primary;
}

.type-badge.dog .type-text {
  color: #F59E0B;
}

.type-badge.other .type-text {
  color: $success;
}

.info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  margin-bottom: 6rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-right: 8rpx;
}

.gender-icon {
  font-size: 26rpx;
}

.breed {
  font-size: 24rpx;
  color: $text-secondary;
  margin-bottom: 4rpx;
}

.age {
  font-size: 22rpx;
  color: $text-hint;
}

.edit-btn {
  width: 64rpx;
  height: 64rpx;
  background-color: $bg-page;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.edit-icon {
  font-size: 28rpx;
  color: $text-secondary;
}
</style>
