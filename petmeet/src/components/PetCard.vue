<template>
  <view class="pet-card" :class="[`size-${size}`]">
    <view class="avatar-wrap">
      <image
        class="avatar"
        :src="pet.avatar || '/static/default-pet.png'"
        mode="aspectFill"
      />
      <view class="gender-badge" :class="pet.gender">
        <text class="gender-icon">{{ genderIcon }}</text>
      </view>
    </view>

    <view class="info-wrap">
      <text class="name">{{ pet.name }}</text>
      <text class="breed">{{ speciesLabel }} · {{ pet.breed || '未知品种' }}</text>
      <text class="age">{{ pet.age }}岁</text>
    </view>

    <view class="tags-wrap">
      <view
        v-for="(tag, index) in displayTags"
        :key="index"
        class="tag"
      >
        <text class="tag-text">{{ tag }}</text>
      </view>
    </view>

    <view v-if="showActions" class="actions-wrap">
      <view class="action-btn" @click.stop="onEdit">
        <text class="action-text">编辑</text>
      </view>
      <view class="action-divider" />
      <view class="action-btn" @click.stop="onShare">
        <text class="action-text">分享</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Pet, PetSpecies } from '@/types/models'

const props = withDefaults(defineProps<{
  pet: Pet
  showActions?: boolean
  size?: 'small' | 'medium' | 'large'
}>(), {
  showActions: false,
  size: 'medium'
})

const emit = defineEmits<{
  edit: []
  share: []
}>()

const speciesMap: Record<PetSpecies, string> = {
  dog: '狗狗',
  cat: '猫咪',
  bird: '鸟类',
  fish: '鱼类',
  hamster: '仓鼠',
  rabbit: '兔子',
  turtle: '乌龟',
  other: '其他'
}

const speciesLabel = computed(() => speciesMap[props.pet.species] || '其他')

const genderIcon = computed(() => {
  switch (props.pet.gender) {
    case 'male': return '♂'
    case 'female': return '♀'
    default: return '?'
  }
})

const displayTags = computed(() => {
  return (props.pet.personality || []).slice(0, 3)
})

function onEdit() {
  emit('edit')
}

function onShare() {
  emit('share')
}
</script>

<style scoped lang="scss">
.pet-card {
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  margin-bottom: 20rpx;
}

.avatar {
  border-radius: 50%;
  background-color: #f0f0f0;
}

.size-small .avatar {
  width: 80rpx;
  height: 80rpx;
}

.size-medium .avatar {
  width: 120rpx;
  height: 120rpx;
}

.size-large .avatar {
  width: 160rpx;
  height: 160rpx;
}

.gender-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
}

.gender-badge.male {
  background-color: #4A90D9;
}

.gender-badge.female {
  background-color: #FF6B9D;
}

.gender-badge.unknown {
  background-color: #B2BEC3;
}

.gender-icon {
  color: #fff;
  font-size: 20rpx;
  line-height: 1;
}

.info-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;
}

.name {
  font-size: 36rpx;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 8rpx;
}

.breed {
  font-size: 24rpx;
  color: #636E72;
  margin-bottom: 4rpx;
}

.age {
  font-size: 24rpx;
  color: #B2BEC3;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  background-color: #FFF3ED;
  border-radius: 24rpx;
  padding: 8rpx 20rpx;
}

.tag-text {
  font-size: 22rpx;
  color: #FF6B35;
}

.actions-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  border-top: 1rpx solid #F0F0F0;
  padding-top: 20rpx;
  margin-top: 8rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-text {
  font-size: 26rpx;
  color: #636E72;
}

.action-divider {
  width: 1rpx;
  height: 28rpx;
  background-color: #E0E0E0;
}
</style>
