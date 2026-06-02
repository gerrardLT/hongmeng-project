<template>
  <view class="seal-card" @click="onClick">
    <view class="photo-wrap">
      <image
        class="photo"
        :src="sealType.photos && sealType.photos.length > 0 ? sealType.photos[0] : '/static/images/default-seal.png'"
        mode="aspectFill"
      />
      <view class="category-tag">
        <text class="category-text">{{ categoryLabel }}</text>
      </view>
    </view>

    <view class="info-wrap">
      <text class="name">{{ sealType.name }}</text>
      <text class="desc text-ellipsis-2">{{ sealType.description }}</text>
      <view class="meta-row">
        <text class="usage">{{ sealType.usage }}</text>
        <text v-if="showPrice" class="price">{{ sealType.priceRange }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SealType, SealCategory } from '@/types/models'

const CATEGORY_LABELS: Record<SealCategory, string> = {
  name: '姓名印',
  leisure: '闲章',
  bookplate: '藏书印',
  signature: '鉴藏印',
  collection: '收藏印'
}

const props = withDefaults(defineProps<{
  sealType: SealType
  showPrice?: boolean
}>(), {
  showPrice: true
})

const emit = defineEmits<{
  click: []
}>()

const categoryLabel = computed(() => CATEGORY_LABELS[props.sealType.category] || '其他')

function onClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.seal-card {
  display: flex;
  flex-direction: column;
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.photo-wrap {
  width: 100%;
  height: 280rpx;
  position: relative;
  overflow: hidden;
}

.photo {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.category-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background-color: rgba(196, 26, 26, 0.85);
  border-radius: $radius-sm;
  padding: 4rpx 16rpx;
}

.category-text {
  font-size: 20rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.info-wrap {
  padding: 20rpx 24rpx 24rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  display: block;
}

.desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.usage {
  font-size: 22rpx;
  color: $text-hint;
}

.price {
  font-size: 26rpx;
  color: $primary;
  font-weight: 600;
}
</style>
