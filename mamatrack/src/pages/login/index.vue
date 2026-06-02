<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <text class="logo-icon">🤱</text>
      <text class="app-name">MamaTrack</text>
      <text class="app-subtitle">孕期体重曲线管理</text>
    </view>

    <!-- #ifdef APP-HARMONY -->
    <view class="login-section">
      <view class="btn-huawei" @click="handleHuaweiLogin">
        <text class="btn-huawei-text">华为账号一键登录</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef APP-HARMONY -->
    <view class="login-section">
      <view class="input-group">
        <view class="input-item">
          <text class="input-label">手机号</text>
          <input
            v-model="phone"
            class="input-field"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="placeholder"
          />
        </view>
        <view class="input-item">
          <text class="input-label">验证码</text>
          <view class="code-row">
            <input
              v-model="code"
              class="input-field code-input"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
              placeholder-class="placeholder"
            />
            <view
              class="btn-code"
              :class="{ disabled: countdown > 0 }"
              @click="handleSendCode"
            >
              <text class="btn-code-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="btn-login" @click="handlePhoneLogin">
        <text class="btn-login-text">登录</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 底部协议 -->
    <view class="agreement-section">
      <view class="agreement-check" @click="privacyChecked = !privacyChecked">
        <view class="checkbox" :class="{ 'checkbox--checked': privacyChecked }">
          <text v-if="privacyChecked" class="checkbox-icon">✓</text>
        </view>
        <text class="agreement-text">我已阅读并同意</text>
        <text class="agreement-link" @click.stop="openAgreement">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @click.stop="openPrivacy">《隐私政策》</text>
      </view>
    </view>

    <!-- 加载遮罩 -->
    <view v-if="loading" class="loading-mask">
      <text class="loading-text">登录中...</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { usePregnancyStore } from '@/store/pregnancy'

// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif

// #ifndef APP-HARMONY
import { loginWithPhone, sendVerifyCode } from '@/services/auth'
// #endif

const userStore = useUserStore()
const pregnancyStore = usePregnancyStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)
const privacyChecked = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null

onUnload(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

function checkPrivacy(): boolean {
  if (!privacyChecked.value) {
    uni.showToast({ title: '请先阅读并同意隐私政策和用户协议', icon: 'none' })
    return false
  }
  return true
}

function handleLoginSuccess() {
  // 检查是否有孕期档案
  pregnancyStore.init()
  if (pregnancyStore.hasProfile) {
    uni.switchTab({ url: '/pages/index/index' })
  } else {
    uni.redirectTo({ url: '/pages/setup/index' })
  }
}

// #ifdef APP-HARMONY
async function handleHuaweiLogin() {
  if (!checkPrivacy()) return

  userStore.agreePrivacy()
  loading.value = true
  try {
    const { userInfo, token } = await loginWithHarmony()
    userStore.login(userInfo, token)
    handleLoginSuccess()
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

// #ifndef APP-HARMONY
async function handleSendCode() {
  if (countdown.value > 0) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    await sendVerifyCode(phone.value)
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '发送失败', icon: 'none' })
  }
}

async function handlePhoneLogin() {
  if (!checkPrivacy()) return

  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  if (!code.value || code.value.length !== 6) {
    uni.showToast({ title: '请输入6位验证码', icon: 'none' })
    return
  }

  userStore.agreePrivacy()
  loading.value = true
  try {
    const { userInfo, token } = await loginWithPhone(phone.value, code.value)
    userStore.login(userInfo, token)
    handleLoginSuccess()
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

function openPrivacy() {
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent('/static/legal/privacy-policy.html')}`
  })
}

function openAgreement() {
  uni.navigateTo({
    url: `/pages/webview/index?url=${encodeURIComponent('/static/legal/user-agreement.html')}`
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: $bg-page;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 48rpx;
  padding-top: 160rpx;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: $font-title;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 12rpx;
}

.app-subtitle {
  font-size: $font-md;
  color: $text-secondary;
}

.login-section {
  width: 100%;
}

.input-group {
  background: $bg-card;
  border-radius: $border-radius-lg;
  padding: 8rpx 32rpx;
  margin-bottom: 48rpx;
  box-shadow: $shadow-md;
}

.input-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.input-label {
  font-size: $font-md;
  color: $text-primary;
  width: 120rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
  height: 100rpx;
}

.placeholder {
  color: $text-hint;
}

.code-row {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.code-input {
  flex: 1;
}

.btn-code {
  padding: 12rpx 24rpx;
  border-radius: $border-radius-sm;
  background: $bg-secondary;
  flex-shrink: 0;

  &.disabled {
    opacity: 0.5;
  }
}

.btn-code-text {
  font-size: $font-sm;
  color: $primary-color;
  font-weight: 500;
  white-space: nowrap;
}

.btn-login {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(233, 30, 140, 0.3);
}

.btn-login-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 700;
}

.btn-huawei {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $border-radius-round;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(233, 30, 140, 0.3);
}

.btn-huawei-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 700;
}

.agreement-section {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 48rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.agreement-check {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid $border-color;
  border-radius: $border-radius-sm;
  margin-right: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;

  &--checked {
    background: $primary-color;
    border-color: $primary-color;
  }
}

.checkbox-icon {
  font-size: 20rpx;
  color: #FFFFFF;
}

.agreement-text {
  font-size: $font-sm;
  color: $text-hint;
}

.agreement-link {
  font-size: $font-sm;
  color: $primary-color;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  font-size: $font-lg;
  color: #FFFFFF;
  background: rgba(0, 0, 0, 0.7);
  padding: 24rpx 48rpx;
  border-radius: $border-radius;
}
</style>
