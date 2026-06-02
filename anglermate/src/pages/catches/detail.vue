<template>
  <view class="detail-page">
    <!-- 顶部照片轮播 -->
    <view class="photo-section">
      <swiper
        v-if="record && record.photos && record.photos.length > 0"
        class="photo-swiper"
        :indicator-dots="record.photos.length > 1"
        indicator-color="rgba(255,255,255,0.4)"
        indicator-active-color="#FFFFFF"
        :autoplay="false"
        :circular="true"
      >
        <swiper-item v-for="(photo, idx) in record.photos" :key="idx">
          <image class="swiper-photo" :src="photo" mode="aspectFill" @click="previewPhoto(idx)" />
        </swiper-item>
      </swiper>
      <view v-else class="photo-empty">
        <text class="photo-empty-icon">🐟</text>
        <text class="photo-empty-text">暂无照片</text>
      </view>
    </view>

    <view class="content-area" v-if="record">
      <!-- 基本信息卡片 -->
      <view class="card info-card">
        <view class="info-header">
          <text class="fish-name">{{ record.fishSpecies }}</text>
          <view class="method-tag">
            <text class="method-tag-text">{{ methodLabel }}</text>
          </view>
        </view>

        <view class="info-metrics">
          <view class="metric-item">
            <text class="metric-value">{{ record.weight }}</text>
            <text class="metric-unit">kg</text>
          </view>
          <view class="metric-divider" />
          <view class="metric-item">
            <text class="metric-value">{{ record.count }}</text>
            <text class="metric-unit">条</text>
          </view>
        </view>

        <view v-if="record.bait" class="info-row">
          <text class="info-label">饵料</text>
          <text class="info-value">{{ record.bait }}</text>
        </view>

        <view class="info-row">
          <text class="info-label">时间</text>
          <text class="info-value">{{ record.date }} {{ record.time }}</text>
        </view>
      </view>

      <!-- 钓点信息 -->
      <view class="card spot-card" v-if="record.spotName" @click="goSpotDetail">
        <view class="card-title-row">
          <text class="card-title">钓点信息</text>
          <text class="card-arrow">›</text>
        </view>
        <view class="spot-row">
          <text class="spot-icon">📍</text>
          <text class="spot-name">{{ record.spotName }}</text>
        </view>
      </view>

      <!-- 天气快照 -->
      <view class="card weather-card" v-if="record.weather || record.temperature || record.pressure">
        <text class="card-title">天气快照</text>
        <view class="weather-grid">
          <view class="weather-item" v-if="record.weather">
            <text class="weather-icon">{{ weatherIcon }}</text>
            <text class="weather-text">{{ weatherLabel }}</text>
          </view>
          <view class="weather-item" v-if="record.temperature !== undefined">
            <text class="weather-icon">🌡️</text>
            <text class="weather-text">{{ record.temperature }}°C</text>
          </view>
          <view class="weather-item" v-if="record.pressure !== undefined">
            <text class="weather-icon">📊</text>
            <text class="weather-text">{{ record.pressure }}hPa</text>
          </view>
          <view class="weather-item" v-if="record.windSpeed !== undefined">
            <text class="weather-icon">💨</text>
            <text class="weather-text">{{ record.windSpeed }}m/s</text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="card note-card" v-if="record.note">
        <text class="card-title">备注</text>
        <text class="note-content">{{ record.note }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <Empty v-if="!loading && !record" text="渔获记录不存在" icon="😕" />

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="record">
      <view class="bar-btn edit-btn" @click="goEdit">
        <text class="bar-btn-icon">✏️</text>
        <text class="bar-btn-text">编辑</text>
      </view>
      <view class="bar-btn delete-btn" @click="confirmDelete">
        <text class="bar-btn-icon">🗑️</text>
        <text class="bar-btn-text">删除</text>
      </view>
    </view>

    <Loading :show="loading" text="加载中..." />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useCatchesStore } from '@/store/catches'
import { getCatchDetail, deleteCatch } from '@/services/catches'
import { FISH_METHOD_MAP } from '@/types/models'
import type { CatchRecord, WeatherCondition } from '@/types/models'
import Loading from '@/components/common/Loading.vue'
import Empty from '@/components/common/Empty.vue'

const catchesStore = useCatchesStore()
const record = ref<CatchRecord | null>(null)
const loading = ref(false)
let recordId = ''

const WEATHER_MAP: Record<WeatherCondition, { icon: string; label: string }> = {
  sunny: { icon: '☀️', label: '晴天' },
  cloudy: { icon: '⛅', label: '多云' },
  overcast: { icon: '☁️', label: '阴天' },
  light_rain: { icon: '🌦️', label: '小雨' },
  moderate_rain: { icon: '🌧️', label: '中雨' },
  heavy_rain: { icon: '⛈️', label: '大雨' },
  thunderstorm: { icon: '🌩️', label: '雷暴' },
  snow: { icon: '❄️', label: '雪' },
  fog: { icon: '🌫️', label: '雾' },
  windy: { icon: '💨', label: '大风' }
}

const methodLabel = computed(() => {
  if (!record.value) return ''
  return FISH_METHOD_MAP[record.value.method] || '其他'
})

const weatherIcon = computed(() => {
  if (!record.value?.weather) return '🌤️'
  return WEATHER_MAP[record.value.weather]?.icon || '🌤️'
})

const weatherLabel = computed(() => {
  if (!record.value?.weather) return '未知'
  return WEATHER_MAP[record.value.weather]?.label || '未知'
})

async function fetchDetail() {
  if (!recordId) return
  loading.value = true
  try {
    const data = await getCatchDetail(recordId)
    record.value = data
    catchesStore.setCurrentCatch(data)
  } catch (e) {
    console.error('获取渔获详情失败:', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function previewPhoto(index: number) {
  if (!record.value?.photos?.length) return
  uni.previewImage({
    urls: record.value.photos,
    current: index
  })
}

function goSpotDetail() {
  if (!record.value?.spotId) return
  uni.navigateTo({ url: `/pages/spots/detail?spotId=${record.value.spotId}` })
}

function goEdit() {
  uni.navigateTo({ url: `/pages/catches/create?recordId=${recordId}` })
}

function confirmDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后不可恢复，确定要删除这条渔获记录吗？',
    confirmColor: '#FF4444',
    success: async (res) => {
      if (res.confirm) {
        await doDelete()
      }
    }
  })
}

async function doDelete() {
  loading.value = true
  try {
    await deleteCatch(recordId)
    catchesStore.removeCatch(recordId)
    uni.showToast({ title: '已删除', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (e) {
    console.error('删除失败:', e)
    uni.showToast({ title: '删除失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((query) => {
  recordId = query?.recordId || ''
  if (recordId) {
    fetchDetail()
  }
})
</script>

<style scoped lang="scss">
.detail-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 140rpx;
}

/* 照片区域 */
.photo-section {
  width: 100%;
  height: 480rpx;
  background: #2B2B2B;
}

.photo-swiper {
  width: 100%;
  height: 480rpx;
}

.swiper-photo {
  width: 100%;
  height: 480rpx;
}

.photo-empty {
  width: 100%;
  height: 480rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3A3A3A, #2B2B2B);
}

.photo-empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.photo-empty-text {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.5);
}

/* 内容区 */
.content-area {
  padding: 24rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
}

.card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 基本信息 */
.info-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.fish-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #212121;
}

.method-tag {
  background: rgba(255, 107, 53, 0.12);
  padding: 6rpx 20rpx;
  border-radius: 16rpx;
}

.method-tag-text {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.info-metrics {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24rpx 0;
  margin-bottom: 20rpx;
  border-top: 2rpx solid #F5F5F5;
  border-bottom: 2rpx solid #F5F5F5;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  gap: 6rpx;
}

.metric-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #FF6B35;
}

.metric-unit {
  font-size: 24rpx;
  color: #999999;
}

.metric-divider {
  width: 2rpx;
  height: 48rpx;
  background: #EEEEEE;
}

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 14rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: #999999;
}

.info-value {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

/* 钓点 */
.card-title-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.card-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
}

.spot-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
}

.spot-icon {
  font-size: 28rpx;
}

.spot-name {
  font-size: 28rpx;
  color: #FF6B35;
  font-weight: 500;
}

/* 天气 */
.weather-card .card-title {
  margin-bottom: 20rpx;
}

.weather-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 20rpx;
}

.weather-item {
  width: calc(50% - 10rpx);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12rpx;
  background: #FAFAFA;
  padding: 18rpx 20rpx;
  border-radius: 12rpx;
  box-sizing: border-box;
}

.weather-icon {
  font-size: 32rpx;
}

.weather-text {
  font-size: 26rpx;
  color: #555555;
}

/* 备注 */
.note-card .card-title {
  margin-bottom: 16rpx;
}

.note-content {
  font-size: 28rpx;
  color: #555555;
  line-height: 1.7;
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  padding: 20rpx 40rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
  gap: 24rpx;
  z-index: 100;
}

.bar-btn {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx 0;
  border-radius: 16rpx;

  &:active {
    opacity: 0.8;
  }
}

.edit-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8F5E);
}

.delete-btn {
  background: #F5F5F5;
}

.bar-btn-icon {
  font-size: 28rpx;
}

.bar-btn-text {
  font-size: 28rpx;
  font-weight: 500;
}

.edit-btn .bar-btn-text {
  color: #FFFFFF;
}

.delete-btn .bar-btn-text {
  color: #666666;
}
</style>
