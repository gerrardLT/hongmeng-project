<template>
  <view class="keepsake-card" :class="[`size-${size}`]" @click="onClick">
    <view class="cover-wrap" @click.stop="onPreview">
      <image
        class="cover"
        :src="keepsake.photos && keepsake.photos.length > 0 ? keepsake.photos[0] : '/static/images/default-keepsake.png'"
        mode="aspectFill"
      />
      <view class="category-tag">
        <text class="category-text">{{ categoryLabel }}</text>
      </view>
    </view>

    <view class="info-wrap">
      <text class="name">{{ keepsake.name }}</text>
      <text class="desc text-ellipsis-2">{{ keepsake.description }}</text>

      <view class="meta-row">
        <view v-if="showPrice" class="price">
          <text class="price-text">{{ keepsake.priceRange }}</text>
        </view>
        <view class="duration">
          <text class="duration-icon">⏱</text>
          <text class="duration-text">{{ keepsake.duration }}</text>
        </view>
      </view>
    </view>

    <view class="card-action">
      <view class="action-gradient-btn">
        <text class="action-gradient-text">立即定制</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KeepsakeType, KeepsakeCategory } from '@/types/models'

const props = withDefaults(defineProps<{
  keepsake: KeepsakeType
  showPrice?: boolean
  size?: 'compact' | 'normal'
}>(), {
  showPrice: true,
  size: 'normal'
})

const emit = defineEmits<{
  click: []
  preview: []
}>()

const categoryMap: Record<KeepsakeCategory, string> = {
  handprint: '手足印',
  hair: '胎发',
  tooth: '乳牙',
  birth: '出生纪念',
  growth: '成长记录'
}

const categoryLabel = computed(() => categoryMap[props.keepsake.category] || '其他')

function onClick() {
  emit('click')
}

function onPreview() {
  emit('preview')
}
</script>

<style scoped lang="scss">
.keepsake-card {
  background-color: $bg-card;
  border-radius: $radius-lg;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.size-compact {
  .cover-wrap {
    height: 240rpx;
  }
}

.size-normal {
  .cover-wrap {
    height: 320rpx;
  }
}

.cover-wrap {
  position: relative;
  width: 100%;
}

.cover {
  width: 100%;
  height: 100%;
  background-color: #F5F5F5;
}

.category-tag {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 20rpx;
  padding: 6rpx 20rpx;
}

.category-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.info-wrap {
  padding: 20rpx 24rpx 0;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: 8rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc {
  font-size: 24rpx;
  color: $text-secondary;
  line-height: 1.5;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  background-color: #FFF3ED;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}

.price-text {
  font-size: 24rpx;
  color: $primary;
  font-weight: 600;
}

.duration {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.duration-icon {
  font-size: 22rpx;
}

.duration-text {
  font-size: 22rpx;
  color: $text-hint;
}

.card-action {
  padding: 20rpx 24rpx 24rpx;
}

.action-gradient-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 44rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-gradient-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
