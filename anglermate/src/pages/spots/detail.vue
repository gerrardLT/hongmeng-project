<template>
  <view class="page">
    <NavBar title="钓点详情" />

    <scroll-view class="content" scroll-y>
      <!-- 顶部照片轮播 -->
      <view class="photo-section">
        <swiper
          v-if="spot && spot.photos && spot.photos.length > 0"
          class="photo-swiper"
          indicator-dots
          indicator-active-color="#FF6B35"
          autoplay
          circular
        >
          <swiper-item v-for="(photo, idx) in spot.photos" :key="idx">
            <image class="swiper-photo" :src="photo" mode="aspectFill" @click="previewPhoto(idx)" />
          </swiper-item>
        </swiper>
        <view v-else class="photo-default">
          <text class="default-icon">📍</text>
          <text class="default-text">暂无照片</text>
        </view>
      </view>

      <!-- 基本信息 -->
      <view class="card">
        <view class="card-header">
          <text class="spot-name">{{ spot?.name || '' }}</text>
          <view class="type-badge">
            <text class="type-text">{{ typeLabel }}</text>
          </view>
        </view>
        <text class="created-time">创建于 {{ formatDate(spot?.createdAt) }}</text>
      </view>

      <!-- 位置信息 -->
      <view class="card">
        <text class="card-title">位置信息</text>
        <view class="location-info">
          <text class="coord-text">经度: {{ spot?.longitude?.toFixed(6) || '--' }}</text>
          <text class="coord-text">纬度: {{ spot?.latitude?.toFixed(6) || '--' }}</text>
          <text v-if="spot?.address" class="address-text">{{ spot.address }}</text>
        </view>
        <view v-if="spot" class="mini-map-wrap">
          <map
            class="mini-map"
            :latitude="spot.latitude"
            :longitude="spot.longitude"
            :markers="mapMarkers"
            :scale="15"
            :show-location="false"
          />
        </view>
      </view>

      <!-- 备注 -->
      <view v-if="spot?.note" class="card">
        <text class="card-title">备注</text>
        <text class="note-content">{{ spot.note }}</text>
      </view>

      <!-- 关联渔获 -->
      <view class="card">
        <view class="card-header">
          <text class="card-title">关联渔获</text>
          <text class="catch-count">{{ catches.length }}条记录</text>
        </view>
        <view v-if="catches.length > 0" class="catch-list">
          <view v-for="item in catches" :key="item.recordId" class="catch-item">
            <view class="catch-info">
              <text class="catch-species">{{ item.fishSpecies }}</text>
              <text class="catch-weight">{{ item.weight }}kg × {{ item.count }}条</text>
            </view>
            <text class="catch-date">{{ item.date }}</text>
          </view>
        </view>
        <view v-else class="empty-catches">
          <text class="empty-text">暂无渔获记录</text>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="action-btn edit-btn" @click="onEdit">
        <text class="btn-icon">✏️</text>
        <text class="btn-text">编辑</text>
      </view>
      <view class="action-btn nav-btn" @click="onNavigate">
        <text class="btn-icon">🧭</text>
        <text class="btn-text">导航</text>
      </view>
      <view class="action-btn delete-btn" @click="onDelete">
        <text class="btn-icon">🗑️</text>
        <text class="btn-text">删除</text>
      </view>
    </view>

    <Loading :show="loading" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import NavBar from '@/components/common/NavBar.vue'
import Loading from '@/components/common/Loading.vue'
import { useSpotsStore } from '@/store/spots'
import { getSpotDetail, deleteSpot } from '@/services/spots'
import { SPOT_TYPE_MAP } from '@/types/models'
import type { FishingSpot, CatchRecord } from '@/types/models'

const spotsStore = useSpotsStore()

const spot = ref<FishingSpot | null>(null)
const catches = ref<CatchRecord[]>([])
const loading = ref(false)
const spotId = ref('')

const typeLabel = computed(() => {
  if (!spot.value) return ''
  return SPOT_TYPE_MAP[spot.value.type] || '未知'
})

const mapMarkers = computed(() => {
  if (!spot.value) return []
  return [{
    id: 0,
    latitude: spot.value.latitude,
    longitude: spot.value.longitude,
    title: spot.value.name,
    width: 32,
    height: 32
  }]
})

function formatDate(dateStr?: string) {
  if (!dateStr) return '--'
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function previewPhoto(index: number) {
  if (!spot.value?.photos) return
  uni.previewImage({
    urls: spot.value.photos,
    current: index
  })
}

function onEdit() {
  uni.navigateTo({ url: `/pages/spots/create?spotId=${spotId.value}` })
}

function onNavigate() {
  if (!spot.value) return
  uni.openLocation({
    latitude: spot.value.latitude,
    longitude: spot.value.longitude,
    name: spot.value.name,
    address: spot.value.address || ''
  })
}

function onDelete() {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定删除该钓点吗？',
    confirmColor: '#FF6B35',
    success: async (res) => {
      if (res.confirm) {
        loading.value = true
        try {
          await deleteSpot(spotId.value)
          spotsStore.removeSpot(spotId.value)
          uni.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        } finally {
          loading.value = false
        }
      }
    }
  })
}

async function loadDetail() {
  if (!spotId.value) return
  loading.value = true
  try {
    const data = await getSpotDetail(spotId.value)
    spot.value = data
    spotsStore.setCurrentSpot(data)
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  spotId.value = currentPage?.$page?.options?.spotId || currentPage?.options?.spotId || ''
  if (spotId.value) {
    loadDetail()
  }
})
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F5F5F5;
}

.content {
  flex: 1;
}

.photo-section {
  width: 100%;
  height: 440rpx;
}

.photo-swiper {
  width: 100%;
  height: 440rpx;
}

.swiper-photo {
  width: 100%;
  height: 440rpx;
}

.photo-default {
  width: 100%;
  height: 440rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.default-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.default-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.card {
  margin: 24rpx 32rpx 0;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
}

.card-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.spot-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
  flex: 1;
}

.type-badge {
  background: rgba(255, 107, 53, 0.1);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

.type-text {
  font-size: 24rpx;
  color: #FF6B35;
  font-weight: 500;
}

.created-time {
  font-size: 24rpx;
  color: #999999;
  margin-top: 12rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.location-info {
  margin-top: 16rpx;
}

.coord-text {
  font-size: 26rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.address-text {
  font-size: 26rpx;
  color: #666666;
  margin-top: 8rpx;
  display: block;
}

.mini-map-wrap {
  margin-top: 20rpx;
  border-radius: 12rpx;
  overflow: hidden;
  height: 300rpx;
}

.mini-map {
  width: 100%;
  height: 300rpx;
}

.note-content {
  font-size: 28rpx;
  color: #555555;
  line-height: 1.6;
  margin-top: 16rpx;
}

.catch-count {
  font-size: 24rpx;
  color: #999999;
}

.catch-list {
  margin-top: 16rpx;
}

.catch-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F5F5F5;
}

.catch-item:last-child {
  border-bottom: none;
}

.catch-info {
  display: flex;
  flex-direction: column;
}

.catch-species {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.catch-weight {
  font-size: 24rpx;
  color: #999999;
  margin-top: 6rpx;
}

.catch-date {
  font-size: 24rpx;
  color: #BDBDBD;
}

.empty-catches {
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.bottom-placeholder {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  border-radius: 12rpx;
  margin: 0 8rpx;
}

.edit-btn {
  background: rgba(255, 107, 53, 0.08);
}

.nav-btn {
  background: rgba(33, 150, 243, 0.08);
}

.delete-btn {
  background: rgba(244, 67, 54, 0.08);
}

.btn-icon {
  font-size: 36rpx;
  margin-bottom: 4rpx;
}

.btn-text {
  font-size: 24rpx;
  color: #555555;
  font-weight: 500;
}
</style>
