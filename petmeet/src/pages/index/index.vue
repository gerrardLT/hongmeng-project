<template>
  <view class="home-page">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="app-title">PetMeet</text>
      <view class="msg-icon" @click="goMessages">
        <text class="icon-text">🔔</text>
        <view v-if="hasUnread" class="badge"></view>
      </view>
    </view>

    <!-- 宠物名片区域 -->
    <view class="card-section">
      <!-- 有宠物时 -->
      <swiper
        v-if="petStore.hasPet"
        class="pet-swiper"
        :current="currentIndex"
        @change="onSwiperChange"
        indicator-dots
        indicator-color="rgba(255,107,53,0.3)"
        indicator-active-color="#FF6B35"
      >
        <swiper-item v-for="pet in petStore.myPets" :key="pet.petId">
          <PetCard :pet="pet" size="large" :showActions="true" @edit="editPet(pet)" @share="sharePet(pet)" />
        </swiper-item>
      </swiper>

      <!-- 没有宠物时的引导 -->
      <view v-else class="empty-card" @click="createPet">
        <view class="empty-icon">🐾</view>
        <text class="empty-title">创建你的第一张宠物名片</text>
        <text class="empty-sub">让宠物帮你交朋友</text>
        <view class="create-btn">
          <text class="create-btn-text">立即创建</text>
        </view>
      </view>
    </view>

    <!-- 碰一碰/交换入口 -->
    <view class="exchange-section" v-if="petStore.hasPet">
      <!-- #ifdef APP-HARMONY -->
      <view class="bump-btn" :class="{ pulsing: isBumping }" @click="handleBump">
        <text class="bump-icon">📡</text>
        <text class="bump-text">{{ isBumping ? '请将手机靠近对方...' : '碰一碰交换' }}</text>
      </view>
      <!-- #endif -->

      <!-- #ifndef APP-HARMONY -->
      <view class="qr-actions">
        <view class="qr-btn show-btn" @click="showMyQRCode">
          <text class="qr-icon">📱</text>
          <text class="qr-text">展示二维码</text>
        </view>
        <view class="qr-btn scan-btn" @click="handleScan">
          <text class="qr-icon">📷</text>
          <text class="qr-text">扫一扫</text>
        </view>
      </view>
      <!-- #endif -->
    </view>

    <!-- 引导任务区域 -->
    <TaskProgress
      v-if="!userStore.isGuideCompleted"
      :tasks="userStore.guideTasks"
      @taskClick="handleTaskClick"
    />

    <!-- 交换成功弹窗 -->
    <view v-if="showExchangeModal" class="modal-overlay" @click="closeExchangeModal">
      <view class="modal-content" @click.stop>
        <text class="modal-title">发现新宠友！</text>
        <PetCard v-if="exchangedPet" :pet="exchangedPet" size="medium" />
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="closeExchangeModal">
            <text>忽略</text>
          </view>
          <view class="modal-btn confirm" @click="confirmAddFriend">
            <text class="confirm-text">添加宠友</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PetCard from '@/components/PetCard.vue'
import TaskProgress from '@/components/TaskProgress.vue'
import { usePetStore } from '@/store/pet'
import { useUserStore } from '@/store/user'
import { useFriendStore } from '@/store/friend'
import { useNotificationStore } from '@/store/notification'
import type { Pet, TaskType } from '@/types/models'
import { mockExchange } from '@/services/share'
// #ifdef APP-HARMONY
import { startBump, stopBump } from '@/services/share'
// #endif
// #ifndef APP-HARMONY
import { generateShareQRCode, scanQRCode } from '@/services/share'
// #endif

const petStore = usePetStore()
const userStore = useUserStore()
const friendStore = useFriendStore()
const notificationStore = useNotificationStore()

const currentIndex = ref(0)
const isBumping = ref(false)
const showExchangeModal = ref(false)
const exchangedPet = ref<Pet | null>(null)
const exchangedUserId = ref('')
const hasUnread = ref(false)

onMounted(() => {
  petStore.loadMyPets()
  userStore.initGuideTasks()
  friendStore.loadFriends()
})

onShow(() => {
  const userId = uni.getStorageSync('petmeet_user')?.userInfo?.userId || 'default_user'
  notificationStore.loadNotifications(userId)
  hasUnread.value = notificationStore.hasUnread
})

function onSwiperChange(e: any) {
  currentIndex.value = e.detail.current
}

function createPet() {
  uni.navigateTo({ url: '/pages/pet/create' })
}

function editPet(pet: Pet) {
  uni.navigateTo({ url: `/pages/pet/edit?petId=${pet.petId}` })
}

function sharePet(pet: Pet) {
  // 触发交换流程
  // #ifdef APP-HARMONY
  handleBump()
  // #endif
  // #ifndef APP-HARMONY
  showMyQRCode()
  // #endif
}

// 鸿蒙碰一碰
function handleBump() {
  if (isBumping.value) {
    isBumping.value = false
    // #ifdef APP-HARMONY
    stopBump()
    // #endif
    return
  }

  isBumping.value = true
  // 开发模式模拟：3秒后收到交换数据
  setTimeout(() => {
    const result = mockExchange()
    exchangedPet.value = result.pet
    exchangedUserId.value = result.userId
    showExchangeModal.value = true
    isBumping.value = false
  }, 3000)
}

// 展示我的二维码
function showMyQRCode() {
  const currentPet = petStore.myPets[currentIndex.value]
  if (!currentPet) return
  const userId = uni.getStorageSync('petmeet_user')?.userInfo?.userId || 'default_user'
  // #ifndef APP-HARMONY
  const qrData = generateShareQRCode({ userId, pet: currentPet })
  uni.showModal({
    title: '我的宠物名片',
    content: '请让对方扫描此二维码\n\n' + currentPet.name,
    showCancel: false
  })
  // #endif
}

// 扫一扫
async function handleScan() {
  // #ifndef APP-HARMONY
  const result = await scanQRCode()
  if (result) {
    exchangedPet.value = result.pet
    exchangedUserId.value = result.userId
    showExchangeModal.value = true
  } else {
    uni.showToast({ title: '未识别到宠物名片', icon: 'none' })
  }
  // #endif
}

// 确认添加宠友
function confirmAddFriend() {
  if (!exchangedPet.value) return
  friendStore.addFriend(exchangedUserId.value, exchangedPet.value)
  userStore.updateGuideTask('first_bump', true)
  uni.showToast({ title: '添加成功！', icon: 'success' })
  closeExchangeModal()
}

function closeExchangeModal() {
  showExchangeModal.value = false
  exchangedPet.value = null
  exchangedUserId.value = ''
}

function goMessages() {
  uni.switchTab({ url: '/pages/message/index' })
}

function handleTaskClick(taskType: TaskType) {
  if (taskType === 'complete_profile') {
    if (petStore.hasPet) {
      uni.navigateTo({ url: `/pages/pet/edit?petId=${petStore.myPets[0].petId}` })
    } else {
      createPet()
    }
  } else if (taskType === 'first_diary') {
    uni.navigateTo({ url: '/pages/diary/publish' })
  } else if (taskType === 'first_bump') {
    handleBump()
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F8F9FA;
  padding: 0 24rpx;
  padding-top: 20rpx;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
}
.app-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #FF6B35;
}
.msg-icon {
  position: relative;
  padding: 10rpx;
}
.icon-text {
  font-size: 40rpx;
}
.badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background: #FF3B30;
  border-radius: 50%;
}
.card-section {
  margin: 20rpx 0;
}
.pet-swiper {
  height: 520rpx;
}
.empty-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
}
.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}
.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #2D3436;
  margin-bottom: 12rpx;
}
.empty-sub {
  display: block;
  font-size: 26rpx;
  color: #636E72;
  margin-bottom: 32rpx;
}
.create-btn {
  display: inline-block;
  background: #FF6B35;
  border-radius: 44rpx;
  padding: 20rpx 60rpx;
}
.create-btn-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}
.exchange-section {
  margin: 30rpx 0;
  display: flex;
  justify-content: center;
}
.bump-btn {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF8C5A);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(255,107,53,0.4);
}
.bump-btn.pulsing {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}
.bump-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}
.bump-text {
  font-size: 22rpx;
  color: #fff;
  font-weight: bold;
}
.qr-actions {
  display: flex;
  gap: 30rpx;
}
.qr-btn {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  text-align: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.06);
}
.qr-icon {
  display: block;
  font-size: 48rpx;
  margin-bottom: 12rpx;
}
.qr-text {
  font-size: 26rpx;
  color: #2D3436;
  font-weight: bold;
}
/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
.modal-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 80%;
  max-width: 600rpx;
}
.modal-title {
  display: block;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #2D3436;
  margin-bottom: 24rpx;
}
.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}
.modal-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-btn.cancel {
  background: #F0F0F0;
}
.modal-btn.confirm {
  background: #FF6B35;
}
.confirm-text {
  color: #fff;
  font-weight: bold;
}
</style>
