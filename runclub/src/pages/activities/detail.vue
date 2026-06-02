<template>
  <view class="page">
    <!-- 活动信息卡 -->
    <view class="activity-info-card" v-if="activity">
      <view class="info-header">
        <text class="activity-name">{{ activity.name }}</text>
        <view class="status-tag" :class="`status-${activity.status}`">
          <text class="status-text">{{ statusMap[activity.status] }}</text>
        </view>
      </view>
      <view class="info-tags">
        <view class="type-badge">
          <text class="type-text">{{ typeMap[activity.type] }}</text>
        </view>
      </view>
      <view class="info-rows">
        <view class="info-row">
          <text class="info-icon">🕐</text>
          <text class="info-value">{{ activity.date }} {{ activity.time }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">📍</text>
          <text class="info-value">{{ activity.location.name }}</text>
        </view>
        <view class="info-row">
          <text class="info-icon">📏</text>
          <text class="info-value">{{ activity.distance }}km</text>
        </view>
      </view>
    </view>

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view
        v-for="tab in detailTabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <text class="tab-text" :class="{ active: activeTab === tab.value }">{{ tab.label }}</text>
        <view v-if="activeTab === tab.value" class="tab-indicator" />
      </view>
    </view>

    <!-- 详情Tab -->
    <view v-if="activeTab === 'detail'" class="tab-content">
      <view class="detail-section" v-if="activity">
        <text class="detail-title">活动描述</text>
        <text class="detail-desc">{{ activity.description || '暂无描述' }}</text>
      </view>
      <view class="detail-section">
        <text class="detail-title">报名截止</text>
        <text class="detail-desc">{{ activity?.registrationDeadline || '--' }}</text>
      </view>
      <view v-if="activity?.maxParticipants" class="detail-section">
        <text class="detail-title">人数限制</text>
        <text class="detail-desc">{{ activity.maxParticipants }}人</text>
      </view>
    </view>

    <!-- 报名Tab -->
    <view v-if="activeTab === 'registration'" class="tab-content">
      <view class="list-header">
        <text class="list-title">已报名 {{ activityStore.registrations.length }} 人</text>
      </view>
      <view v-if="activityStore.registrations.length > 0">
        <view
          v-for="reg in activityStore.registrations"
          :key="reg.registrationId"
          class="member-item"
        >
          <view class="member-avatar-placeholder">
            <text class="member-avatar-text">{{ reg.nickname.slice(0, 1) }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ reg.nickname }}</text>
            <text v-if="reg.note" class="member-note">{{ reg.note }}</text>
          </view>
          <text class="member-time">{{ formatRelativeTime(reg.registeredAt) }}</text>
        </view>
      </view>
      <Empty v-else icon="📋" text="暂无报名" />
    </view>

    <!-- 签到Tab -->
    <view v-if="activeTab === 'checkin'" class="tab-content">
      <view class="list-header">
        <text class="list-title">已签到 {{ activityStore.checkIns.length }} 人</text>
      </view>
      <view v-if="activityStore.checkIns.length > 0">
        <view
          v-for="ci in activityStore.checkIns"
          :key="ci.checkInId"
          class="member-item"
        >
          <view class="member-avatar-placeholder">
            <text class="member-avatar-text">{{ ci.nickname.slice(0, 1) }}</text>
          </view>
          <view class="member-info">
            <text class="member-name">{{ ci.nickname }}</text>
            <text class="member-note">{{ ci.isManual ? '手动签到' : '碰一碰签到' }}</text>
          </view>
          <text class="member-time">{{ formatRelativeTime(ci.checkInTime) }}</text>
        </view>
      </view>
      <Empty v-else icon="✅" text="暂无签到记录" />
    </view>

    <!-- 成绩Tab -->
    <view v-if="activeTab === 'results'" class="tab-content">
      <view class="list-header">
        <text class="list-title">成绩排名</text>
      </view>
      <view v-if="sortedResults.length > 0">
        <view
          v-for="(result, index) in sortedResults"
          :key="result.resultId"
          class="result-item"
        >
          <text class="result-rank" :class="getRankClass(index + 1)">{{ index + 1 }}</text>
          <view class="result-info">
            <text class="result-name">{{ result.nickname }}</text>
            <text class="result-source">{{ result.source === 'manual' ? '手动录入' : '健康数据' }}</text>
          </view>
          <view class="result-data">
            <text class="result-time">{{ formatFinishTime(result.finishTime) }}</text>
            <text class="result-pace">{{ formatPace(result.pace) }}</text>
          </view>
        </view>
      </view>
      <Empty v-else icon="🏅" text="暂无成绩" />
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar" v-if="activity">
      <!-- 即将开始：报名/取消报名 -->
      <view v-if="activity.status === 'upcoming'" class="bottom-actions">
        <view
          v-if="!hasRegistered"
          class="action-btn primary"
          @click="handleRegister"
        >
          <text class="action-btn-text">报名参加</text>
        </view>
        <view v-else class="action-btn secondary" @click="handleCancelRegistration">
          <text class="action-btn-text secondary-text">取消报名</text>
        </view>
      </view>

      <!-- 进行中：签到 + 添加成绩 -->
      <view v-if="activity.status === 'ongoing'" class="bottom-actions">
        <view
          v-if="!hasCheckedIn"
          class="action-btn primary"
          @click="handleCheckIn"
        >
          <text class="action-btn-text">签到</text>
        </view>
        <!-- #ifdef APP-PLUS -->
        <view
          v-if="!hasCheckedIn"
          class="action-btn blue"
          @click="handleNfcCheckIn"
        >
          <text class="action-btn-text">碰一碰签到</text>
        </view>
        <!-- #endif -->
        <view class="action-btn primary" @click="showResultModal = true">
          <text class="action-btn-text">添加成绩</text>
        </view>
      </view>

      <!-- 已结束：查看成绩 -->
      <view v-if="activity.status === 'completed'" class="bottom-actions">
        <view class="action-btn primary" @click="showResultModal = true">
          <text class="action-btn-text">补录成绩</text>
        </view>
      </view>
    </view>

    <!-- 添加成绩弹窗 -->
    <view v-if="showResultModal" class="modal-mask" @click="showResultModal = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">添加成绩</text>
        <view class="modal-form">
          <view class="modal-field">
            <text class="modal-label">完成时间 (HH:MM:SS)</text>
            <input
              class="modal-input"
              v-model="resultForm.finishTime"
              placeholder="如 01:30:00"
            />
          </view>
          <view class="modal-field">
            <text class="modal-label">配速 (分:秒/km)</text>
            <input
              class="modal-input"
              v-model="resultForm.pace"
              placeholder="如 6:30"
            />
          </view>
        </view>
        <view class="modal-actions">
          <view class="modal-btn cancel" @click="showResultModal = false">
            <text class="modal-btn-text cancel-text">取消</text>
          </view>
          <view class="modal-btn confirm" @click="handleAddResult">
            <text class="modal-btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useActivityStore } from '@/store/activity'
import { useUserStore } from '@/store/user'
import { formatRelativeTime, formatFinishTime, formatPace } from '@/utils/format'
import Empty from '@/components/common/Empty.vue'
import type { ActivityType, ActivityStatus } from '@/types/models'

const activityStore = useActivityStore()
const userStore = useUserStore()

const activeTab = ref('detail')
const showResultModal = ref(false)
const resultForm = ref({ finishTime: '', pace: '' })

const detailTabs = [
  { label: '详情', value: 'detail' },
  { label: '报名', value: 'registration' },
  { label: '签到', value: 'checkin' },
  { label: '成绩', value: 'results' }
]

const typeMap: Record<ActivityType, string> = {
  regular: '例跑',
  training: '拉练',
  race: '比赛',
  casual: '休闲'
}

const statusMap: Record<ActivityStatus, string> = {
  upcoming: '即将开始',
  ongoing: '进行中',
  completed: '已结束',
  cancelled: '已取消'
}

const activity = computed(() => activityStore.currentActivity)

const hasRegistered = computed(() =>
  activityStore.registrations.some((r) => r.userId === userStore.userId)
)

const hasCheckedIn = computed(() =>
  activityStore.checkIns.some((c) => c.userId === userStore.userId)
)

const sortedResults = computed(() =>
  [...activityStore.results].sort((a, b) => {
    const timeA = a.finishTime.split(':').reduce((acc, v, i) => acc + parseInt(v) * Math.pow(60, 2 - i), 0)
    const timeB = b.finishTime.split(':').reduce((acc, v, i) => acc + parseInt(v) * Math.pow(60, 2 - i), 0)
    return timeA - timeB
  })
)

onLoad((options) => {
  if (options?.activityId) {
    activityStore.loadActivityDetail(options.activityId)
  }
})

function getRankClass(rank: number): string {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

async function handleRegister() {
  if (!activity.value) return
  try {
    await activityStore.register(
      activity.value.activityId,
      userStore.userId,
      userStore.nickname || '匿名跑友',
      ''
    )
    uni.showToast({ title: '报名成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '报名失败', icon: 'none' })
  }
}

async function handleCancelRegistration() {
  const reg = activityStore.registrations.find((r) => r.userId === userStore.userId)
  if (!reg) return
  try {
    await activityStore.cancelRegistration(reg.registrationId)
    uni.showToast({ title: '已取消报名', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '取消失败', icon: 'none' })
  }
}

async function handleCheckIn() {
  if (!activity.value) return
  try {
    await activityStore.checkIn(
      activity.value.activityId,
      userStore.userId,
      userStore.nickname || '匿名跑友',
      undefined,
      true
    )
    uni.showToast({ title: '签到成功', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '签到失败', icon: 'none' })
  }
}

function handleNfcCheckIn() {
  // 鸿蒙碰一碰签到（条件编译中）
  uni.showToast({ title: '请将手机靠近NFC标签', icon: 'none' })
}

async function handleAddResult() {
  if (!activity.value) return
  if (!resultForm.value.finishTime) {
    uni.showToast({ title: '请输入完成时间', icon: 'none' })
    return
  }
  if (!resultForm.value.pace) {
    uni.showToast({ title: '请输入配速', icon: 'none' })
    return
  }
  try {
    await activityStore.addResult(
      activity.value.activityId,
      userStore.userId,
      userStore.nickname || '匿名跑友',
      resultForm.value.finishTime,
      resultForm.value.pace,
      'manual'
    )
    showResultModal.value = false
    resultForm.value = { finishTime: '', pace: '' }
    uni.showToast({ title: '成绩已添加', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: 140rpx;
}

.activity-info-card {
  background: #FFFFFF;
  padding: 32rpx;
  margin-bottom: 12rpx;
}

.info-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.activity-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #212121;
  flex: 1;
  margin-right: 16rpx;
}

.status-tag {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
}

.status-text { font-size: 24rpx; font-weight: 500; }
.status-upcoming { background: #E8F5E9; .status-text { color: #4CAF50; } }
.status-ongoing { background: #FFF3E0; .status-text { color: #FF9800; } }
.status-completed { background: #F5F5F5; .status-text { color: #9E9E9E; } }
.status-cancelled { background: #FFEBEE; .status-text { color: #F44336; } }

.info-tags {
  margin-bottom: 16rpx;
}

.type-badge {
  display: inline-flex;
  background: rgba(255, 87, 34, 0.1);
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
}

.type-text {
  font-size: 22rpx;
  color: #FF5722;
  font-weight: 500;
}

.info-rows { }

.info-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 12rpx;
}

.info-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.info-value {
  font-size: 28rpx;
  color: #666666;
}

.tab-bar {
  display: flex;
  flex-direction: row;
  background: #FFFFFF;
  padding: 0 16rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 0 20rpx;
  position: relative;
}

.tab-text {
  font-size: 28rpx;
  color: #999999;
}

.tab-text.active {
  color: #FF5722;
  font-weight: 600;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  width: 48rpx;
  height: 6rpx;
  background: #FF5722;
  border-radius: 3rpx;
}

.tab-content {
  padding: 24rpx;
}

.detail-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.detail-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 12rpx;
  display: block;
}

.detail-desc {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.list-header {
  margin-bottom: 16rpx;
}

.list-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}

.member-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #FFFFFF;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.member-avatar-placeholder {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #FF5722;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 16rpx;
}

.member-avatar-text {
  font-size: 26rpx;
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

.member-note {
  font-size: 24rpx;
  color: #999999;
  margin-top: 4rpx;
}

.member-time {
  font-size: 22rpx;
  color: #CCCCCC;
  flex-shrink: 0;
}

.result-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  background: #FFFFFF;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  margin-bottom: 12rpx;
}

.result-rank {
  width: 56rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #999999;
  text-align: center;
  flex-shrink: 0;
}

.rank-gold { color: #FFD700; }
.rank-silver { color: #C0C0C0; }
.rank-bronze { color: #CD7F32; }

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 12rpx;
}

.result-name {
  font-size: 28rpx;
  color: #212121;
  font-weight: 500;
}

.result-source {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.result-data {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.result-time {
  font-size: 28rpx;
  color: #FF5722;
  font-weight: 600;
}

.result-pace {
  font-size: 22rpx;
  color: #999999;
  margin-top: 4rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #FFFFFF;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.bottom-actions {
  display: flex;
  flex-direction: row;
  gap: 20rpx;
}

.action-btn {
  flex: 1;
  padding: 24rpx 0;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.primary {
  background: linear-gradient(135deg, #FF5722, #FF7043);
}

.action-btn.secondary {
  background: #F5F5F5;
}

.action-btn.blue {
  background: linear-gradient(135deg, #2196F3, #42A5F5);
}

.action-btn-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.secondary-text {
  color: #999999;
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

.modal-form { }

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
