<template>
  <view class="material-card" @click="onClick">
    <view class="photo-wrap">
      <image
        class="photo"
        :src="material.photos && material.photos.length > 0 ? material.photos[0] : '/static/images/default-material.png'"
        mode="aspectFill"
      />
    </view>

    <view class="info-wrap">
      <text class="name">{{ material.name }}</text>

      <view class="tags-wrap">
        <view
          v-for="(feature, idx) in material.features.slice(0, 3)"
          :key="idx"
          class="feature-tag"
        >
          <text class="feature-tag-text">{{ feature }}</text>
        </view>
      </view>

      <view class="meta-row">
        <text class="hardness">硬度 {{ material.hardness }}</text>
        <text class="price">{{ material.priceRange }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { Material } from '@/types/models'

const props = defineProps<{
  material: Material
}>()

const emit = defineEmits<{
  click: []
}>()

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.material-card {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  padding: 24rpx;
}

.photo-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-md;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 24rpx;
}

.photo {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.info-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 12rpx;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.feature-tag {
  background-color: #FDF0F0;
  border-radius: 6rpx;
  padding: 4rpx 14rpx;
}

.feature-tag-text {
  font-size: 20rpx;
  color: $primary;
}

.meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.hardness {
  font-size: 22rpx;
  color: $text-hint;
}

.price {
  font-size: 26rpx;
  color: $primary;
  font-weight: 600;
}
</style>
