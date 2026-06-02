<script setup lang="ts">
import { ref } from 'vue'
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { usePregnancyStore } from '@/store/pregnancy'
import { useRecordStore } from '@/store/record'
import { useReminderStore } from '@/store/reminder'
import { useFamilyStore } from '@/store/family'
import PrivacyModal from '@/components/PrivacyModal.vue'

const showPrivacy = ref(false)

onLaunch(() => {
  console.log('MamaTrack App Launch')
  const userStore = useUserStore()

  // 先初始化用户状态
  userStore.init()

  // 检查隐私协议状态
  if (!userStore.isPrivacyAgreed) {
    showPrivacy.value = true
    return // 未同意隐私前不初始化业务
  }

  // 已同意隐私，初始化应用
  initApp()
})

function initApp() {
  const pregnancyStore = usePregnancyStore()
  const recordStore = useRecordStore()
  const reminderStore = useReminderStore()
  const familyStore = useFamilyStore()

  // 初始化各 store
  pregnancyStore.init()
  recordStore.init()
  reminderStore.init()
  familyStore.init()

  // 检查登录状态并决定跳转
  checkLoginStatus()
}

function handlePrivacyAgree() {
  const userStore = useUserStore()
  userStore.agreePrivacy()
  showPrivacy.value = false
  initApp()
}

function handlePrivacyClose() {
  showPrivacy.value = false
  // #ifdef APP-PLUS
  plus.runtime.quit()
  // #endif
}

function checkLoginStatus() {
  const userStore = useUserStore()
  const pregnancyStore = usePregnancyStore()

  if (!userStore.isLoggedIn) {
    uni.redirectTo({ url: '/pages/login/index' })
    return
  }

  if (!pregnancyStore.hasProfile) {
    uni.redirectTo({ url: '/pages/setup/index' })
    return
  }
}
</script>

<template>
  <PrivacyModal
    :visible="showPrivacy"
    @agree="handlePrivacyAgree"
    @close="handlePrivacyClose"
  />
</template>

<style lang="scss">
@import "uni.scss";

/* 全局基础重置 */
page {
  background-color: $bg-page;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: $font-base;
  color: $text-primary;
  line-height: 1.6;
}

/* 通用卡片样式 */
.card {
  background: $bg-card;
  border-radius: $border-radius;
  padding: $spacing-base;
  margin-bottom: 20rpx;
  box-shadow: $shadow-sm;
}

/* 通用按钮样式 */
.btn-primary {
  background: $primary-color;
  color: #FFFFFF;
  border: none;
  border-radius: $border-radius-round;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: $font-lg;
  font-weight: 600;
}

.btn-primary:active {
  opacity: 0.85;
  transform: scale(0.98);
}

.btn-secondary {
  background: #FFFFFF;
  color: $primary-color;
  border: 2rpx solid $primary-color;
  border-radius: $border-radius-round;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  font-size: $font-lg;
  font-weight: 600;
}

.btn-text {
  background: transparent;
  color: $primary-color;
  border: none;
  font-size: $font-base;
}

.btn-danger {
  background: transparent;
  color: $danger-color;
  border: none;
  font-size: $font-base;
}

/* 安全区域 */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-top {
  padding-top: env(safe-area-inset-top);
}

/* 分隔线 */
.divider {
  height: 1rpx;
  background: $border-color;
  margin: 0 $spacing-base;
}

/* 徽章红点 */
.badge-dot {
  width: 16rpx;
  height: 16rpx;
  background: $danger-color;
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
}

/* 文字省略 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Flex 工具类 */
.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-1 {
  flex: 1;
}

/* 鸿蒙端特殊适配 */
/* #ifdef APP-HARMONY */
page {
  --status-bar-height: 47px;
}
/* #endif */
</style>
