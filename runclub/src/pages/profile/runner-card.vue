<template>
  <view class="page">
    <!-- 名片预览 -->
    <view class="preview-section">
      <RunnerCardView v-if="previewCard" :card="previewCard" />
    </view>

    <!-- 编辑表单 -->
    <view class="form-section">
      <view class="form-card">
        <view class="form-item">
          <text class="form-label">头像</text>
          <view class="avatar-picker" @click="onChooseAvatar">
            <image v-if="form.avatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
            <view v-else class="avatar-empty">
              <text class="avatar-empty-text">+</text>
            </view>
            <text class="avatar-hint">点击更换</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">昵称</text>
          <input class="form-input" v-model="form.nickname" placeholder="请输入昵称" />
        </view>

        <view class="form-item">
          <text class="form-label">跑龄</text>
          <picker :range="runningAgeOptions" :value="runningAgeIndex" @change="onRunningAgeChange">
            <view class="picker-value">
              <text>{{ runningAgeOptions[runningAgeIndex] }}年</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="form-label">总跑量</text>
          <view class="readonly-value">
            <text class="readonly-text">{{ totalDistance }} km</text>
            <text class="readonly-hint">（自动统计）</text>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">跑步宣言</text>
          <textarea
            class="form-textarea"
            v-model="form.motto"
            placeholder="写下你的跑步态度..."
            :maxlength="100"
          />
        </view>

        <view class="form-item">
          <text class="form-label">联系方式</text>
          <input class="form-input" v-model="form.contact" placeholder="手机/微信（选填）" />
        </view>

        <view class="form-item switch-item">
          <text class="form-label">公开联系方式</text>
          <switch :checked="form.contactVisible" color="#FF5722" @change="form.contactVisible = $event.detail.value" />
        </view>
      </view>

      <!-- 保存按钮 -->
      <view class="btn-save" @click="onSave">
        <text class="btn-save-text">保存名片</text>
      </view>

      <!-- #ifdef APP-HARMONY -->
      <view class="btn-nfc" @click="onNfcExchange">
        <text class="btn-nfc-text">📱 碰一碰交换名片</text>
      </view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useRecordStore } from '@/store/record'
import { getMyCard, createCard, updateCard } from '@/services/cards'
import type { RunnerCard } from '@/types/models'
import RunnerCardView from '@/components/RunnerCardView.vue'
// #ifdef APP-HARMONY
import { exchangeCard } from '@/services/cards'
// #endif

const userStore = useUserStore()
const recordStore = useRecordStore()

const cardId = ref('')
const form = ref({
  avatar: '',
  nickname: '',
  runningAge: 1,
  motto: '',
  contact: '',
  contactVisible: true
})

const runningAgeOptions = Array.from({ length: 30 }, (_, i) => String(i + 1))
const runningAgeIndex = computed(() => form.value.runningAge - 1)

const totalDistance = computed(() =>
  recordStore.statistics.totalDistance.toFixed(1)
)

const previewCard = computed<RunnerCard | null>(() => {
  if (!form.value.nickname) return null
  return {
    cardId: cardId.value || 'preview',
    userId: userStore.userId,
    nickname: form.value.nickname,
    avatar: form.value.avatar,
    runningAge: form.value.runningAge,
    totalDistance: recordStore.statistics.totalDistance,
    motto: form.value.motto,
    contactVisible: form.value.contactVisible,
    contact: form.value.contact,
    createdAt: Date.now()
  }
})

function onRunningAgeChange(e: any) {
  form.value.runningAge = Number(e.detail.value) + 1
}

function onChooseAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.avatar = res.tempFilePaths[0]
    }
  })
}

async function onSave() {
  if (!form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  try {
    const cardData = {
      userId: userStore.userId,
      nickname: form.value.nickname,
      avatar: form.value.avatar,
      runningAge: form.value.runningAge,
      totalDistance: recordStore.statistics.totalDistance,
      motto: form.value.motto,
      contactVisible: form.value.contactVisible,
      contact: form.value.contact
    }

    if (cardId.value) {
      await updateCard(cardId.value, cardData)
    } else {
      const card = await createCard(cardData)
      cardId.value = card.cardId
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

// #ifdef APP-HARMONY
async function onNfcExchange() {
  if (!cardId.value) {
    uni.showToast({ title: '请先保存名片', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '等待碰一碰...' })
    const card = previewCard.value
    if (card) {
      const result = await exchangeCard(card)
      uni.hideLoading()
      if (result) {
        uni.showToast({ title: '名片交换成功', icon: 'success' })
      } else {
        uni.showToast({ title: '未检测到对方设备', icon: 'none' })
      }
    }
  } catch (e) {
    uni.hideLoading()
    uni.showToast({ title: '交换失败', icon: 'none' })
  }
}
// #endif

async function loadCard() {
  if (!userStore.isLoggedIn) return
  try {
    const card = await getMyCard(userStore.userId)
    if (card) {
      cardId.value = card.cardId
      form.value = {
        avatar: card.avatar,
        nickname: card.nickname,
        runningAge: card.runningAge,
        motto: card.motto,
        contact: card.contact || '',
        contactVisible: card.contactVisible
      }
    } else {
      form.value.nickname = userStore.nickname
      form.value.avatar = userStore.userInfo?.avatar || ''
    }
  } catch (e) {
    console.error('loadCard error:', e)
  }
}

onShow(() => {
  loadCard()
  recordStore.loadStatistics()
})
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 60rpx;
}

.preview-section {
  padding: 24rpx 24rpx 0;
}

.form-section {
  padding: 24rpx;
}

.form-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: 28rpx;
  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.form-input {
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.picker-value {
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 32rpx;
  color: #CCCCCC;
}

.avatar-picker {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.avatar-empty {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #F5F5F5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  border: 2rpx dashed #CCCCCC;
}

.avatar-empty-text {
  font-size: 40rpx;
  color: #CCCCCC;
}

.avatar-hint {
  font-size: 24rpx;
  color: #999999;
}

.readonly-value {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 80rpx;
  background: #FAFAFA;
  border-radius: 12rpx;
  padding: 0 20rpx;
}

.readonly-text {
  font-size: 28rpx;
  color: #FF5722;
  font-weight: 600;
}

.readonly-hint {
  font-size: 22rpx;
  color: #CCCCCC;
  margin-left: 8rpx;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.switch-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  .form-label {
    margin-bottom: 0;
  }
}

.btn-save {
  height: 88rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 87, 34, 0.3);
}

.btn-save-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.btn-nfc {
  height: 88rpx;
  background: #FFFFFF;
  border: 2rpx solid #2196F3;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20rpx;
}

.btn-nfc-text {
  font-size: 30rpx;
  color: #2196F3;
  font-weight: 600;
}
</style>
