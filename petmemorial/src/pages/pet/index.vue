<template>
  <view class="pet-list-page">
    <!-- 顶部区域 -->
    <view class="header">
      <text class="title">宠物档案</text>
      <text class="subtitle">管理你的萌宠信息</text>
    </view>

    <!-- 宠物列表 -->
    <view v-if="petStore.pets.length > 0" class="pet-list">
      <PetCard
        v-for="pet in petStore.pets"
        :key="pet.petId"
        :pet="pet"
        @click="goToDetail(pet.petId)"
        @edit="goToEdit(pet.petId)"
      />
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">🐾</text>
      <text class="empty-text">还没有添加宠物</text>
      <text class="empty-hint">快来创建第一个宠物档案吧</text>
    </view>

    <!-- 添加宠物按钮 -->
    <view class="add-btn-wrap">
      <view class="add-btn" @click="goToCreate">
        <text class="add-icon">＋</text>
        <text class="add-text">添加宠物</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow } from '@dcloudio/uni-app'
import { usePetStore } from '@/store/pet'
import { useUserStore } from '@/store/user'
import { getPets } from '@/services/pet'
import PetCard from '@/components/PetCard.vue'

const petStore = usePetStore()
const userStore = useUserStore()

onShow(() => {
  if (userStore.isLoggedIn) {
    const pets = getPets(userStore.userId)
    petStore.pets = pets
    petStore.persist()
  }
})

function goToDetail(petId: string) {
  uni.navigateTo({ url: `/pages/pet/detail?petId=${petId}` })
}

function goToEdit(petId: string) {
  uni.navigateTo({ url: `/pages/pet/create?petId=${petId}` })
}

function goToCreate() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/index' })
    return
  }
  uni.navigateTo({ url: '/pages/pet/create' })
}
</script>

<style scoped lang="scss">
.pet-list-page {
  min-height: 100vh;
  background-color: $bg-page;
  padding-bottom: 180rpx;
}

.header {
  padding: $spacing-xl $spacing-xl $spacing-md;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 0 0 $radius-xl $radius-xl;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
  margin-bottom: $spacing-xs;
}

.subtitle {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
}

.pet-list {
  padding: $spacing-md $spacing-lg;
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: $spacing-md;
}

.empty-text {
  font-size: 32rpx;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
}

.empty-hint {
  font-size: 26rpx;
  color: $text-hint;
}

.add-btn-wrap {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: $spacing-md $spacing-xl;
  padding-bottom: calc(#{$spacing-md} + env(safe-area-inset-bottom));
  background-color: $bg-card;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  gap: $spacing-xs;
}

.add-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.add-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
