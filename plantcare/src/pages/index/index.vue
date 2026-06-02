<template>
  <view class="page">
    <!-- 欢迎语 + 日期 -->
    <view class="welcome-section">
      <view class="welcome-content">
        <text class="welcome-hello">你好，{{ userStore.nickname || '花友' }} 🌿</text>
        <text class="welcome-date">{{ todayStr }}</text>
      </view>
    </view>

    <!-- 已登录且有植物 -->
    <view v-if="plantStore.plants.length > 0">
      <!-- 今日待浇水 -->
      <view v-if="plantStore.plantsNeedingWater.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">💧 今日待浇水</text>
          <text class="section-badge">{{ plantStore.plantsNeedingWater.length }}</text>
        </view>
        <scroll-view scroll-x class="water-scroll">
          <view class="water-list">
            <view
              v-for="plant in plantStore.plantsNeedingWater"
              :key="plant.plantId"
              class="water-item"
            >
              <PlantCard
                :plant="plant"
                @click="goPlantDetail(plant.plantId)"
                @water="handleWater(plant.plantId)"
                @edit="goPlantDetail(plant.plantId)"
              />
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 按位置分组的植物列表 -->
      <view
        v-for="(plants, location) in plantStore.plantsByLocation"
        :key="location"
        class="section"
      >
        <view class="section-header">
          <text class="section-title">📍 {{ location }}</text>
          <text class="section-count">{{ plants.length }}棵</text>
        </view>
        <PlantCard
          v-for="plant in plants"
          :key="plant.plantId"
          :plant="plant"
          @click="goPlantDetail(plant.plantId)"
          @water="handleWater(plant.plantId)"
          @edit="goPlantDetail(plant.plantId)"
        />
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">🌱</text>
      <text class="empty-title">还没有植物</text>
      <text class="empty-desc">添加你的第一棵植物，开始养护之旅吧！</text>
      <view class="empty-btn" @click="goAddPlant">
        <text class="empty-btn-text">+ 添加植物</text>
      </view>
    </view>

    <!-- 浮动添加按钮 -->
    <view v-if="plantStore.plants.length > 0" class="fab" @click="goAddPlant">
      <text class="fab-text">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { usePlantStore } from '@/store/plant'
import { useUserStore } from '@/store/user'
import { useRecordStore } from '@/store/record'
import { markCareComplete, rebuildReminders } from '@/services/reminder'
import PlantCard from '@/components/PlantCard.vue'

const plantStore = usePlantStore()
const userStore = useUserStore()
const recordStore = useRecordStore()

const todayStr = computed(() => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`
})

onShow(() => {
  plantStore.init()
  recordStore.init()
  rebuildReminders()
})

function goPlantDetail(plantId: string) {
  uni.navigateTo({ url: `/pages/plant/detail?plantId=${plantId}` })
}

function goAddPlant() {
  uni.navigateTo({ url: '/pages/plant/add' })
}

async function handleWater(plantId: string) {
  try {
    await markCareComplete(plantId, 'water')
    uni.showToast({ title: '浇水完成 💧', icon: 'none' })
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: $bg-color;
  padding-bottom: 120rpx;
}

.welcome-section {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  padding: 48rpx 32rpx 40rpx;
}

.welcome-content {
  display: flex;
  flex-direction: column;
}

.welcome-hello {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-white;
  margin-bottom: 8rpx;
}

.welcome-date {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
}

.section {
  padding: $spacing-md $spacing-md 0;
}

.section-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.section-title {
  font-size: $font-lg;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.section-badge {
  font-size: $font-sm;
  color: $text-white;
  background: $error-color;
  padding: 2rpx 16rpx;
  border-radius: $radius-pill;
  font-weight: $font-weight-medium;
}

.section-count {
  font-size: $font-sm;
  color: $text-secondary;
}

.water-scroll {
  white-space: nowrap;
}

.water-list {
  display: flex;
  flex-direction: row;
  gap: $spacing-sm;
}

.water-item {
  width: 560rpx;
  flex-shrink: 0;
  display: inline-block;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: $font-xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 24rpx 64rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-xl;
  box-shadow: $shadow-primary;
}

.empty-btn-text {
  font-size: $font-lg;
  color: $text-white;
  font-weight: $font-weight-bold;
}

.fab {
  position: fixed;
  right: 32rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: $radius-round;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  box-shadow: $shadow-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.fab-text {
  font-size: 52rpx;
  color: $text-white;
  font-weight: 300;
  line-height: 1;
}
</style>
