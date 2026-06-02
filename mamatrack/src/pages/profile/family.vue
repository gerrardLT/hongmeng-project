<template>
  <view class="page">
    <!-- 我的邀请码 -->
    <view class="section">
      <text class="section-title">我的邀请码</text>
      <view class="invite-card">
        <view v-if="familyStore.myInviteCode" class="invite-code-row">
          <text class="invite-code">{{ familyStore.myInviteCode }}</text>
          <view class="copy-btn" @click="onCopyCode">
            <text class="copy-btn-text">复制</text>
          </view>
        </view>
        <view v-else class="invite-empty">
          <text class="invite-empty-text">暂无邀请码，点击下方按钮生成</text>
        </view>
        <view class="generate-btn" @click="onGenerateCode">
          <text class="generate-btn-text">生成新邀请码</text>
        </view>
      </view>
    </view>

    <!-- 添加家人 -->
    <view class="section">
      <text class="section-title">邀请家人</text>
      <view class="add-card">
        <input
          class="nickname-input"
          v-model="familyNickname"
          placeholder="输入家人昵称"
          placeholder-class="input-placeholder"
        />
        <view class="invite-btn" @click="onInviteFamily">
          <text class="invite-btn-text">邀请家人</text>
        </view>
        <text class="add-hint">家人可通过邀请码查看您的体重曲线和孕期记录（仅查看权限）</text>
      </view>
    </view>

    <!-- 已共享家人列表 -->
    <view class="section">
      <text class="section-title">已共享家人</text>
      <view v-if="familyStore.activeShares.length > 0" class="family-list">
        <view
          v-for="share in familyStore.activeShares"
          :key="share.shareId"
          class="family-item"
        >
          <view class="family-info">
            <view class="family-avatar">
              <text class="family-avatar-text">{{ share.familyNickname.slice(0, 1) }}</text>
            </view>
            <view class="family-detail">
              <text class="family-name">{{ share.familyNickname }}</text>
              <text class="family-time">共享于 {{ formatShareTime(share.createdAt) }}</text>
            </view>
          </view>
          <view class="revoke-btn" @click="onRevokeShare(share.shareId)">
            <text class="revoke-btn-text">取消共享</text>
          </view>
        </view>
      </view>
      <view v-else class="empty-state">
        <text class="empty-icon">👨‍👩‍👧</text>
        <text class="empty-text">还没有共享给家人</text>
        <text class="empty-hint">生成邀请码，让家人一起关注孕期健康</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useFamilyStore } from '@/store/family'
import { inviteFamily, revokeShare } from '@/services/family'

const familyStore = useFamilyStore()
const familyNickname = ref('')

onShow(() => {
  familyStore.init()
})

function onCopyCode() {
  if (!familyStore.myInviteCode) return
  uni.setClipboardData({
    data: familyStore.myInviteCode,
    success() {
      uni.showToast({ title: '邀请码已复制', icon: 'success' })
    }
  })
}

function onGenerateCode() {
  const code = familyStore.generateInviteCode()
  uni.showToast({ title: '邀请码已生成', icon: 'success' })
}

function onInviteFamily() {
  if (!familyNickname.value.trim()) {
    uni.showToast({ title: '请输入家人昵称', icon: 'none' })
    return
  }

  uni.showLoading({ title: '邀请中...' })
  inviteFamily(familyNickname.value.trim()).then(() => {
    uni.hideLoading()
    uni.showToast({ title: '邀请成功', icon: 'success' })
    familyNickname.value = ''
  }).catch(() => {
    uni.hideLoading()
    uni.showToast({ title: '邀请失败', icon: 'none' })
  })
}

function onRevokeShare(shareId: string) {
  uni.showModal({
    title: '取消共享',
    content: '确定要取消该家人的查看权限吗？',
    confirmColor: '#F44336',
    success(res) {
      if (res.confirm) {
        revokeShare(shareId).then(() => {
          uni.showToast({ title: '已取消共享', icon: 'success' })
        }).catch(() => {
          uni.showToast({ title: '操作失败', icon: 'none' })
        })
      }
    }
  })
}

function formatShareTime(timestamp: number): string {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: $bg-page;
  padding: $spacing-md;
}

.section {
  margin-bottom: $spacing-lg;
}

.section-title {
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
  margin-left: $spacing-xs;
}

/* 邀请码卡片 */
.invite-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.invite-code-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.invite-code {
  font-size: $font-title;
  font-weight: bold;
  color: $primary-color;
  letter-spacing: 12rpx;
  margin-right: $spacing-md;
}

.copy-btn {
  padding: 8rpx 24rpx;
  border-radius: $border-radius-round;
  background: $bg-secondary;
}

.copy-btn-text {
  font-size: $font-sm;
  color: $primary-color;
}

.invite-empty {
  margin-bottom: $spacing-md;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-empty-text {
  font-size: $font-sm;
  color: $text-hint;
}

.generate-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generate-btn-text {
  font-size: $font-md;
  color: #FFFFFF;
  font-weight: bold;
}

/* 添加家人卡片 */
.add-card {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.nickname-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid $border-color;
  border-radius: $border-radius;
  padding: 0 $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: $spacing-sm;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-hint;
}

.invite-btn {
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-sm;
}

.invite-btn-text {
  font-size: $font-md;
  color: #FFFFFF;
  font-weight: bold;
}

.add-hint {
  font-size: $font-xs;
  color: $text-hint;
  text-align: center;
}

/* 家人列表 */
.family-list {
  background: $bg-card;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.family-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.family-info {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.family-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: $bg-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: $spacing-sm;
}

.family-avatar-text {
  font-size: $font-lg;
  color: $primary-color;
  font-weight: bold;
}

.family-detail {
  display: flex;
  flex-direction: column;
}

.family-name {
  font-size: $font-md;
  color: $text-primary;
  font-weight: bold;
}

.family-time {
  font-size: $font-xs;
  color: $text-hint;
  margin-top: 4rpx;
}

.revoke-btn {
  padding: 8rpx 20rpx;
  border-radius: $border-radius-round;
  border: 1rpx solid $danger-color;
}

.revoke-btn-text {
  font-size: $font-xs;
  color: $danger-color;
}

/* 空状态 */
.empty-state {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: $spacing-xl $spacing-md;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: $shadow-sm;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: $spacing-sm;
}

.empty-text {
  font-size: $font-md;
  color: $text-secondary;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: $font-sm;
  color: $text-hint;
}
</style>
