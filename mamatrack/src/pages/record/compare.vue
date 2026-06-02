<template>
  <view class="page">
    <!-- 空状态：照片不足2周 -->
    <view v-if="availableWeeks.length < 2" class="compare-empty">
      <Empty text="需要至少2周的记录才能对比\n快去添加更多孕期照片吧" icon="📸" />
    </view>

    <view v-else class="compare-body">
      <!-- 左侧选择区 -->
      <view class="compare-col">
        <picker
          mode="selector"
          :range="weekOptions"
          :value="leftIndex"
          @change="onLeftChange"
        >
          <view class="compare-picker">
            <text class="compare-picker__text">第{{ leftWeek }}周</text>
            <text class="compare-picker__arrow">▼</text>
          </view>
        </picker>

        <view class="compare-photo-wrap">
          <image
            v-if="leftPhotoUrl"
            class="compare-photo"
            :src="leftPhotoUrl"
            mode="aspectFill"
            @click="previewLeft"
          />
          <view v-else class="compare-photo__empty">
            <text class="compare-photo__empty-text">无照片</text>
          </view>
        </view>

        <text v-if="leftLog" class="compare-date">{{ formatDate(leftLog.createdAt) }}</text>
      </view>

      <!-- 中间差距 -->
      <view class="compare-gap">
        <view class="compare-gap__line" />
        <text class="compare-gap__text">相隔{{ weekGap }}周</text>
        <view class="compare-gap__line" />
      </view>

      <!-- 右侧选择区 -->
      <view class="compare-col">
        <picker
          mode="selector"
          :range="weekOptions"
          :value="rightIndex"
          @change="onRightChange"
        >
          <view class="compare-picker">
            <text class="compare-picker__text">第{{ rightWeek }}周</text>
            <text class="compare-picker__arrow">▼</text>
          </view>
        </picker>

        <view class="compare-photo-wrap">
          <image
            v-if="rightPhotoUrl"
            class="compare-photo"
            :src="rightPhotoUrl"
            mode="aspectFill"
            @click="previewRight"
          />
          <view v-else class="compare-photo__empty">
            <text class="compare-photo__empty-text">无照片</text>
          </view>
        </view>

        <text v-if="rightLog" class="compare-date">{{ formatDate(rightLog.createdAt) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRecordStore } from '@/store/record'
import Empty from '@/components/common/Empty.vue'
import { formatDate } from '@/utils/format'

const recordStore = useRecordStore()

// 可选孕周列表（降序）
const availableWeeks = computed(() => {
  const weeks = Object.keys(recordStore.logsByWeek)
    .map(Number)
    .sort((a, b) => b - a)
  return weeks
})

// picker 选项文本
const weekOptions = computed(() => {
  return availableWeeks.value.map((w) => `第${w}周`)
})

// 左右选择的索引
const leftIndex = ref(0)
const rightIndex = ref(1)

// 左右选择的孕周
const leftWeek = computed(() => availableWeeks.value[leftIndex.value] || 0)
const rightWeek = computed(() => availableWeeks.value[rightIndex.value] || 0)

// 获取对应孕周的记录（取该周第一条，即最新的）
const leftLog = computed(() => {
  const logs = recordStore.getLogByWeek(leftWeek.value)
  return logs[0] || null
})

const rightLog = computed(() => {
  const logs = recordStore.getLogByWeek(rightWeek.value)
  return logs[0] || null
})

// 照片 URL（优先正面照）
const leftPhotoUrl = computed(() => {
  return leftLog.value?.frontPhotoUrl || leftLog.value?.sidePhotoUrl || ''
})

const rightPhotoUrl = computed(() => {
  return rightLog.value?.frontPhotoUrl || rightLog.value?.sidePhotoUrl || ''
})

// 孕周差距
const weekGap = computed(() => {
  return Math.abs(leftWeek.value - rightWeek.value)
})

// picker 变更
function onLeftChange(e: { detail: { value: number } }) {
  leftIndex.value = Number(e.detail.value)
  // 避免两边选同一周
  if (leftWeek.value === rightWeek.value && availableWeeks.value.length > 1) {
    rightIndex.value = (leftIndex.value + 1) % availableWeeks.value.length
  }
}

function onRightChange(e: { detail: { value: number } }) {
  rightIndex.value = Number(e.detail.value)
  // 避免两边选同一周
  if (leftWeek.value === rightWeek.value && availableWeeks.value.length > 1) {
    leftIndex.value = (rightIndex.value + 1) % availableWeeks.value.length
  }
}

// 预览图片
function previewLeft() {
  if (leftPhotoUrl.value) {
    uni.previewImage({ urls: [leftPhotoUrl.value] })
  }
}

function previewRight() {
  if (rightPhotoUrl.value) {
    uni.previewImage({ urls: [rightPhotoUrl.value] })
  }
}

// 页面加载
onMounted(() => {
  recordStore.init()
})

// 接收传入的孕周参数
onLoad((options: { week?: string }) => {
  if (options?.week) {
    const week = Number(options.week)
    const idx = availableWeeks.value.indexOf(week)
    if (idx !== -1) {
      leftIndex.value = idx
      // 右侧默认选另一个周
      if (availableWeeks.value.length > 1) {
        rightIndex.value = (idx + 1) % availableWeeks.value.length
      }
    }
  }
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: 32rpx;
  box-sizing: border-box;
}

.compare-empty {
  padding-top: 160rpx;
}

.compare-body {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  min-height: 60vh;
}

.compare-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 280rpx;
}

.compare-picker {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #ffffff;
  padding: 16rpx 28rpx;
  border-radius: $border-radius;
  margin-bottom: 24rpx;
  box-shadow: $shadow-sm;

  &__text {
    font-size: 28rpx;
    font-weight: 600;
    color: $primary-color;
  }

  &__arrow {
    font-size: 22rpx;
    color: $primary-color;
    margin-left: 8rpx;
  }
}

.compare-photo-wrap {
  width: 280rpx;
  height: 380rpx;
  background: #ffffff;
  border-radius: $border-radius;
  overflow: hidden;
  box-shadow: $shadow-sm;
  margin-bottom: 16rpx;
}

.compare-photo {
  width: 280rpx;
  height: 380rpx;
}

.compare-photo__empty {
  width: 280rpx;
  height: 380rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed $border-color;
  border-radius: $border-radius;
  box-sizing: border-box;

  &__empty-text {
    font-size: 28rpx;
    color: $text-hint;
  }
}

.compare-date {
  font-size: 24rpx;
  color: $text-hint;
}

.compare-gap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  padding-top: 120rpx;

  &__line {
    width: 2rpx;
    height: 60rpx;
    background: linear-gradient(180deg, transparent 0%, $primary-light 50%, transparent 100%);
  }

  &__text {
    font-size: 24rpx;
    color: $primary-color;
    font-weight: 600;
    padding: 12rpx 0;
    white-space: nowrap;
  }
}
</style>
