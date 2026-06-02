<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <text class="logo-icon">🏃</text>
      <text class="app-name">RunClub</text>
      <text class="app-subtitle">跑团活动管理</text>
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
      <text class="agreement-text">登录即表示同意</text>
      <text class="agreement-link" @click="openPrivacy">《隐私政策》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link" @click="openAgreement">《用户协议》</text>
    </view>

    <!-- 隐私协议弹窗 -->
    <PrivacyDialog
      :show="showPrivacy"
      @agree="onAgreePrivacy"
      @reject="onRejectPrivacy"
    />

    <!-- 加载中 -->
    <Loading :show="loading" text="登录中..." />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import PrivacyDialog from '@/components/common/PrivacyDialog.vue'
import Loading from '@/components/common/Loading.vue'

// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif

// #ifndef APP-HARMONY
import { loginWithPhone, sendVerifyCode } from '@/services/auth'
// #endif

const userStore = useUserStore()

const phone = ref('')
const code = ref('')
const countdown = ref(0)
const loading = ref(false)
const showPrivacy = ref(false)

let countdownTimer: ReturnType<typeof setInterval> | null = null

/** 检查隐私协议 */
function checkPrivacy(): boolean {
  if (!userStore.isPrivacyAgreed) {
    showPrivacy.value = true
    return false
  }
  return true
}

function onAgreePrivacy() {
  userStore.agreePrivacy()
  showPrivacy.value = false
}

function onRejectPrivacy() {
  showPrivacy.value = false
  uni.showToast({ title: '需同意协议才能使用', icon: 'none' })
}

// #ifdef APP-HARMONY
async function handleHuaweiLogin() {
  if (!checkPrivacy()) return

  loading.value = true
  try {
    const { userInfo, token } = await loginWithHarmony()
    userStore.login(userInfo, token)
    uni.switchTab({ url: '/pages/index/index' })
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

  loading.value = true
  try {
    const { userInfo, token } = await loginWithPhone(phone.value, code.value)
    userStore.login(userInfo, token)
    uni.switchTab({ url: '/pages/index/index' })
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

function openPrivacy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/privacy-policy.html'
  })
}

function openAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=/static/legal/user-agreement.html'
  })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: #F5F5F5;
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
  font-size: 48rpx;
  font-weight: 700;
  color: #212121;
  margin-bottom: 12rpx;
}

.app-subtitle {
  font-size: 28rpx;
  color: #999999;
}

.login-section {
  width: 100%;
}

.input-group {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 8rpx 32rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.input-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.input-item:last-child {
  border-bottom: none;
}

.input-label {
  font-size: 28rpx;
  color: #212121;
  width: 120rpx;
  flex-shrink: 0;
}

.input-field {
  flex: 1;
  font-size: 28rpx;
  color: #212121;
  height: 100rpx;
}

.placeholder {
  color: #BDBDBD;
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
  border-radius: 24rpx;
  background: rgba(255, 87, 34, 0.1);
  flex-shrink: 0;
}

.btn-code.disabled {
  opacity: 0.5;
}

.btn-code-text {
  font-size: 24rpx;
  color: #FF5722;
  font-weight: 500;
  white-space: nowrap;
}

.btn-login {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 34, 0.3);
}

.btn-login-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.btn-huawei {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #FF5722, #FF7043);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 87, 34, 0.3);
}

.btn-huawei-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.agreement-section {
  position: fixed;
  bottom: 60rpx;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 0 48rpx;
  padding-bottom: env(safe-area-inset-bottom);
}

.agreement-text {
  font-size: 24rpx;
  color: #BDBDBD;
}

.agreement-link {
  font-size: 24rpx;
  color: #FF5722;
}
</style>
