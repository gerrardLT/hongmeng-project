<template>
  <view class="page">
    <!-- 已有跑团 -->
    <view v-if="clubStore.club">
      <!-- 跑团信息卡 -->
      <view class="club-card">
        <view class="club-header">
          <view class="club-icon-wrap">
            <text class="club-icon">🏃‍♂️</text>
          </view>
          <view class="club-info">
            <text class="club-name">{{ clubStore.club.name }}</text>
            <text class="club-desc">{{ clubStore.club.description || '一起跑步，一起进步' }}</text>
          </view>
        </view>
      </view>

      <!-- 数据面板 -->
      <view class="section">
        <StatPanel :items="statItems" />
      </view>

      <!-- 排名入口 -->
      <view class="section">
        <view class="ranking-entry" @click="goRanking">
          <text class="ranking-entry-icon">🏆</text>
          <text class="ranking-entry-text">查看排名统计</text>
          <text class="ranking-entry-arrow">›</text>
        </view>
      </view>

      <!-- 成员列表 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">团队成员</text>
          <text class="section-count">{{ clubStore.memberCount }}人</text>
        </view>
        <view v-if="clubStore.members.length > 0" class="member-list">
          <view
            v-for="(memberId, index) in clubStore.members"
            :key="memberId"
            class="member-item"
          >
            <view class="member-avatar-placeholder">
              <text class="member-avatar-text">{{ getMemberInitial(memberId, index) }}</text>
            </view>
            <view class="member-info">
              <text class="member-name">{{ getMemberName(memberId, index) }}</text>
              <text class="member-sub">跑团成员</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 无跑团引导 -->
    <view v-else class="empty-state">
      <view class="empty-content">
        <text class="empty-emoji">🏃</text>
        <text class="empty-title">还没有加入跑团</text>
        <text class="empty-desc">创建一个跑团，邀请跑友一起运动吧</text>
        <view class="create-club-btn" @click="showCreateModal = true">
          <text class="create-club-btn-text">创建跑团</text>
        </view>
      </view>
    </view>

    <!-- 创建跑团弹窗 -->
    <view v-if="showCreateModal" class="modal-mask" @click="showCreateModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">创建跑团</text>
        <view class="modal-form">
          <view class="modal-field">
            <text class="modal-label">跑团名称</text>
            <input
              class="modal-input"
              v-model="clubForm.name"
              placeholder="请输入跑团名称"
              maxlength="20"
            />
          </view>
          <view class="modal-field">
            <text class="modal-label">跑团简介</text>
            <textarea
              class="modal-textarea"
              v-model="clubForm.description"
              placeholder="请输入跑团简介"
              maxlength="100"
            />
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showCreateModal = false">
            <text class="modal-btn-text cancel-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleCreateClub">
            <text class="modal-btn-text">创建</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useClubStore } from '@/store/club'
import { useUserStore } from '@/store/user'
import StatPanel from '@/components/StatPanel.vue'

const clubStore = useClubStore()
const userStore = useUserStore()
const showCreateModal = ref(false)
const clubForm = ref({ name: '', description: '' })

const statItems = computed(() => [
  { label: '总成员', value: clubStore.memberCount, unit: '人' },
  { label: '月总跑量', value: clubStore.monthlyStats.totalDistance.toFixed(1), unit: 'km' },
  { label: '月活动数', value: clubStore.monthlyStats.totalActivities, unit: '场' },
  {
    label: '人均跑量',
    value: clubStore.memberCount > 0
      ? (clubStore.monthlyStats.totalDistance / clubStore.memberCount).toFixed(1)
      : '0',
    unit: 'km'
  }
])

onShow(() => {
  clubStore.loadClub()
})

function getMemberInitial(memberId: string, index: number): string {
  if (memberId === userStore.userId && userStore.nickname) {
    return userStore.nickname.slice(0, 1)
  }
  return `M${index + 1}`.slice(0, 2)
}

function getMemberName(memberId: string, index: number): string {
  if (memberId === userStore.userId) {
    return userStore.nickname || '我'
  }
  return `成员${index + 1}`
}

function goRanking() {
  uni.navigateTo({ url: '/pages/club/ranking' })
}

async function handleCreateClub() {
  if (!clubForm.value.name.trim()) {
    uni.showToast({ title: '请输入跑团名称', icon: 'none' })
    return
  }
  try {
    await clubStore.createClub(
      clubForm.value.name.trim(),
      clubForm.value.description.trim(),
      userStore.userId
    )
    showCreateModal.value = false
    clubForm.value = { name: '', description: '' }
    uni.showToast({ title: '创建成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '创建失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
}

.club-card {
  background: linear-gradient(135deg, #FF5722, #FF7043);
  padding: 40rpx 32rpx;
  margin-bottom: 12rpx;
}

.club-header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.club-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.club-icon {
  font-size: 48rpx;
}

.club-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.club-desc {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.section {
  padding: 24rpx 24rpx 0;
}

.section-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #212121;
}

.section-count {
  font-size: 26rpx;
  color: #999999;
}

.ranking-entry {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #FFFFFF;
  padding: 28rpx 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.ranking-entry-icon {
  font-size: 40rpx;
  margin-right: 16rpx;
}

.ranking-entry-text {
  flex: 1;
  font-size: 30rpx;
  color: #212121;
  font-weight: 500;
}

.ranking-entry-arrow {
  font-size: 36rpx;
  color: #CCCCCC;
}

.member-list {
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.member-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #F5F5F5;
}

.member-item:last-child {
  border-bottom: none;
}

.member-avatar-placeholder {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #FF5722;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.member-avatar-text {
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
}

.member-sub {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.empty-state {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx;
}

.empty-emoji {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 48rpx;
  text-align: center;
}

.create-club-btn {
  padding: 24rpx 80rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 48rpx;
}

.create-club-btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 40rpx;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #212121;
  text-align: center;
  margin-bottom: 32rpx;
}

.modal-field {
  margin-bottom: 24rpx;
}

.modal-label {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
  display: block;
}

.modal-input {
  font-size: 30rpx;
  color: #212121;
  padding: 16rpx 20rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
}

.modal-textarea {
  font-size: 30rpx;
  color: #212121;
  padding: 16rpx 20rpx;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  width: 100%;
  min-height: 160rpx;
}

.modal-actions {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
  margin-top: 32rpx;
}

.modal-btn {
  flex: 1;
  padding: 20rpx 0;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-btn.cancel {
  background: #F5F5F5;
}

.modal-btn.confirm {
  background: linear-gradient(135deg, #FF5722, #FF7043);
}

.modal-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.cancel-text {
  color: #666666;
}
</style>
