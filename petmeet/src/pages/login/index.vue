<template>
  <view class="login-page">
    <!-- 顶部 Logo 区域 -->
    <view class="logo-section">
      <view class="logo-icon">
        <text class="logo-text">P</text>
      </view>
      <text class="app-name">PetMeet</text>
      <text class="slogan">让宠物帮你交朋友</text>
    </view>

    <!-- 中间插画区域 - 猫爪图案 -->
    <view class="illustration">
      <view class="paw-print">
        <view class="paw-pad main-pad"></view>
        <view class="paw-pad toe toe-1"></view>
        <view class="paw-pad toe toe-2"></view>
        <view class="paw-pad toe toe-3"></view>
        <view class="paw-pad toe toe-4"></view>
      </view>
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>

    <!-- 底部登录区域 -->
    <view class="login-section">
      <!-- #ifdef APP-HARMONY -->
      <button class="login-btn harmony-btn" @click="onHarmonyLogin">
        <text class="btn-text">华为账号一键登录</text>
      </button>
      <!-- #endif -->

      <!-- #ifndef APP-HARMONY -->
      <view class="phone-login">
        <view class="input-group">
          <text class="input-label">手机号</text>
          <input
            v-model="phone"
            class="input-field"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>
        <view class="input-group">
          <text class="input-label">验证码</text>
          <view class="code-input-wrapper">
            <input
              v-model="smsCode"
              class="input-field code-input"
              type="number"
              maxlength="6"
              placeholder="请输入验证码"
              placeholder-class="input-placeholder"
            />
            <text
              class="code-btn"
              :class="{ disabled: countdown > 0 }"
              @click="onSendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </text>
          </view>
        </view>
        <button class="login-btn phone-btn" @click="onPhoneLogin">手机号登录</button>
      </view>
      <!-- #endif -->

      <!-- 隐私政策勾选 -->
      <view class="privacy-agreement">
        <view class="checkbox" @click="togglePrivacy">
          <view v-if="isPrivacyChecked" class="checkbox-inner"></view>
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click.stop="goToPrivacy('user')">《用户协议》</text>
          和
          <text class="link" @click.stop="goToPrivacy('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>

    <!-- 安全区域 -->
    <view class="safe-area"></view>

    <!-- 提示对话框 -->
    <Dialog
      :visible="showDialog"
      :title="dialogTitle"
      :content="dialogContent"
      @confirm="showDialog = false"
      @close="showDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif
// #ifndef APP-HARMONY
import { loginWithPhone } from '@/services/auth'
// #endif
import Dialog from '@/components/common/Dialog.vue'

const userStore = useUserStore()

const phone = ref('')
const smsCode = ref('')
const isPrivacyChecked = ref(false)
const countdown = ref(0)
const showDialog = ref(false)
const dialogTitle = ref('')
const dialogContent = ref('')

let timer: ReturnType<typeof setInterval> | null = null

function togglePrivacy() {
  isPrivacyChecked.value = !isPrivacyChecked.value
}

function showTip(title: string, content: string) {
  dialogTitle.value = title
  dialogContent.value = content
  showDialog.value = true
}

function checkPrivacy(): boolean {
  if (!isPrivacyChecked.value) {
    showTip('提示', '请先阅读并同意《用户协议》和《隐私政策》')
    return false
  }
  return true
}

// #ifdef APP-HARMONY
async function onHarmonyLogin() {
  if (!checkPrivacy()) return
  try {
    const { userInfo, token } = await loginWithHarmony()
    userStore.login(userInfo, token)
    userStore.agreePrivacy()
    userStore.initGuideTasks()
    uni.switchTab({ url: '/pages/index/index' })
  } catch (err: any) {
    showTip('登录失败', err.message || '华为账号登录失败，请重试')
  }
}
// #endif

// #ifndef APP-HARMONY
async function onPhoneLogin() {
  if (!checkPrivacy()) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showTip('提示', '请输入正确的11位手机号')
    return
  }
  if (!smsCode.value || smsCode.value.length !== 6) {
    showTip('提示', '请输入6位验证码')
    return
  }
  try {
    const { userInfo, token } = await loginWithPhone(phone.value, smsCode.value)
    userStore.login(userInfo, token)
    userStore.agreePrivacy()
    userStore.initGuideTasks()
    uni.switchTab({ url: '/pages/index/index' })
  } catch (err: any) {
    showTip('登录失败', err.message || '登录失败，请重试')
  }
}

function onSendCode() {
  if (countdown.value > 0) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    showTip('提示', '请输入正确的11位手机号')
    return
  }
  uni.showToast({ title: '验证码已发送', icon: 'none' })
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && timer) {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}
// #endif

function goToPrivacy(type: string) {
  uni.navigateTo({
    url: `/pages/profile/privacy?from=login&type=${type}`
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #FFFFFF;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-section {
  margin-top: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-icon {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.logo-text {
  font-size: 60rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.app-name {
  font-size: 44rpx;
  font-weight: bold;
  color: #2D3436;
  margin-bottom: 12rpx;
}

.slogan {
  font-size: 28rpx;
  color: #636E72;
}

.illustration {
  margin-top: 60rpx;
  width: 400rpx;
  height: 400rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.paw-print {
  position: relative;
  width: 200rpx;
  height: 220rpx;
}

.paw-pad {
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
  opacity: 0.85;
}

.main-pad {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 100rpx;
  border-radius: 50% 50% 45% 45%;
}

.toe {
  position: absolute;
  width: 40rpx;
  height: 50rpx;
  border-radius: 50% 50% 40% 40%;
}

.toe-1 {
  top: 0;
  left: 10rpx;
  transform: rotate(-25deg);
}

.toe-2 {
  top: -10rpx;
  left: 55rpx;
}

.toe-3 {
  top: 0;
  right: 10rpx;
  transform: rotate(25deg);
}

.toe-4 {
  top: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 35rpx;
  height: 45rpx;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background-color: #4ECDC4;
  opacity: 0.15;
}

.circle-1 {
  width: 80rpx;
  height: 80rpx;
  top: 20rpx;
  right: 30rpx;
}

.circle-2 {
  width: 50rpx;
  height: 50rpx;
  bottom: 60rpx;
  left: 20rpx;
  background-color: #FF6B35;
}

.circle-3 {
  width: 30rpx;
  height: 30rpx;
  top: 80rpx;
  left: 60rpx;
  background-color: #4ECDC4;
}

.login-section {
  margin-top: auto;
  width: 100%;
  padding: 0 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn {
  width: 90%;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  margin-bottom: 32rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: #FFFFFF;
}

.login-btn::after {
  border: none;
}

.harmony-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
}

.phone-btn {
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
}

.phone-login {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  width: 100%;
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 26rpx;
  color: #636E72;
  margin-bottom: 12rpx;
  display: block;
}

.input-field {
  width: 100%;
  height: 88rpx;
  background-color: #F8F9FA;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 30rpx;
  color: #2D3436;
  box-sizing: border-box;
}

.input-placeholder {
  color: #B2BEC3;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 180rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #FF6B35, #FF8F5A);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn.disabled {
  background: #B2BEC3;
}

.privacy-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #FF6B35;
  border-radius: 8rpx;
  margin-right: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-inner {
  width: 18rpx;
  height: 18rpx;
  background-color: #FF6B35;
  border-radius: 4rpx;
}

.agreement-text {
  font-size: 24rpx;
  color: #636E72;
}

.link {
  color: #FF6B35;
}

.safe-area {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
