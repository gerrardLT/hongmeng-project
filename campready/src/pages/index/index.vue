<template>
  <view class="page">
    <!-- 欢迎语 -->
    <view class="page__header">
      <text class="page__welcome">欢迎回来，</text>
      <text class="page__nickname">{{ nickname }}</text>
    </view>

    <!-- 最近露营倒计时卡片 -->
    <view v-if="nextCamping" class="next-card" @click="goDetail(nextCamping.checklistId)">
      <view class="next-card__icon">
        <text class="next-card__emoji">🏕️</text>
      </view>
      <view class="next-card__info">
        <text class="next-card__label">最近露营</text>
        <text class="next-card__name">{{ nextCamping.name }}</text>
        <view class="next-card__row">
          <text class="next-card__countdown">还有 {{ daysUntilNext }} 天</text>
          <text class="next-card__progress">进度 {{ nextProgress }}%</text>
        </view>
      </view>
    </view>

    <!-- 新建清单按钮 -->
    <view class="create-btn" @click="goCreate">
      <text class="create-btn__icon">＋</text>
      <text class="create-btn__text">新建清单</text>
    </view>

    <!-- 最近清单 -->
    <view v-if="recentChecklists.length > 0" class="section">
      <text class="section__title">最近清单</text>
      <ChecklistCard
        v-for="item in recentChecklists"
        :key="item.checklistId"
        :checklist="item"
        @click="goDetail(item.checklistId)"
      />
    </view>

    <!-- 无清单提示 -->
    <Empty v-if="checklistsStore.checklists.length === 0" text="还没有清单，开始创建第一个吧" icon="📋" />

    <!-- 快速统计 -->
    <view v-if="gearStore.gears.length > 0" class="stats-bar">
      <text class="stats-bar__title">快速统计</text>
      <view class="stats-bar__row">
        <view class="stats-bar__item">
          <text class="stats-bar__value">{{ gearStore.totalCount }}</text>
          <text class="stats-bar__label">装备(件)</text>
        </view>
        <view class="stats-bar__divider" />
        <view class="stats-bar__item">
          <text class="stats-bar__value">{{ formatWeightGram(gearStore.totalWeight, 'kg') }}</text>
          <text class="stats-bar__label">总重量</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { useChecklistsStore } from '@/store/checklists'
import { useGearStore } from '@/store/gear'
import { getDaysUntil, calcProgress, formatWeightGram } from '@/utils/format'
import ChecklistCard from '@/components/ChecklistCard.vue'
import Empty from '@/components/common/Empty.vue'

const userStore = useUserStore()
const checklistsStore = useChecklistsStore()
const gearStore = useGearStore()

const nickname = computed(() =>
  userStore.isLoggedIn ? userStore.userInfo?.nickname || '露营爱好者' : '露营爱好者'
)

const nextCamping = computed(() => checklistsStore.nextCamping)

const daysUntilNext = computed(() => {
  if (!nextCamping.value) return 0
  return getDaysUntil(nextCamping.value.campingDate)
})

const nextProgress = computed(() => {
  if (!nextCamping.value) return 0
  return calcProgress(nextCamping.value.items)
})

const recentChecklists = computed(() => {
  return [...checklistsStore.checklists]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
})

onShow(() => {
  checklistsStore.init()
  gearStore.init()
})

function goCreate() {
  uni.navigateTo({ url: '/pages/checklists/create' })
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/checklists/detail?id=${id}` })
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  background-color: #F5F7F5;
  padding: 24rpx 24rpx 120rpx;

  &__header {
    padding: 40rpx 0 32rpx;
    display: flex;
    align-items: baseline;
  }

  &__welcome {
    font-size: 34rpx;
    color: #666666;
  }

  &__nickname {
    font-size: 36rpx;
    font-weight: 700;
    color: #1B5E20;
  }
}

.next-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #2E7D32, #4CAF50);
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(46, 125, 50, 0.25);

  &__icon {
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  &__emoji {
    font-size: 64rpx;
  }

  &__info {
    flex: 1;
  }

  &__label {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8rpx;
  }

  &__name {
    font-size: 32rpx;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 12rpx;
    display: block;
  }

  &__row {
    display: flex;
    align-items: center;
  }

  &__countdown {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
    margin-right: 24rpx;
  }

  &__progress {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
  }
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1B5E20;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 40rpx;

  &__icon {
    font-size: 36rpx;
    color: #ffffff;
    margin-right: 12rpx;
    font-weight: 700;
  }

  &__text {
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 600;
  }
}

.section {
  margin-bottom: 40rpx;

  &__title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 20rpx;
    display: block;
  }
}

.stats-bar {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 2rpx 16rpx rgba(0, 0, 0, 0.06);

  &__title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 20rpx;
    display: block;
  }

  &__row {
    display: flex;
    align-items: center;
  }

  &__item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__value {
    font-size: 36rpx;
    font-weight: 700;
    color: #2E7D32;
    margin-bottom: 8rpx;
  }

  &__label {
    font-size: 24rpx;
    color: #999999;
  }

  &__divider {
    width: 2rpx;
    height: 60rpx;
    background-color: #E8E8E8;
  }
}
</style>
