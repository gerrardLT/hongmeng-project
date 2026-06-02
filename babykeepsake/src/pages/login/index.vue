<template>
  <view class="login-page">
    <!-- 顶部 Logo 区域 -->
    <view class="logo-section">
      <view class="logo-icon">
        <text class="logo-text">B</text>
      </view>
      <text class="app-name">BabyKeepsake</text>
      <text class="slogan">珍藏每一刻成长记忆</text>
    </view>

    <!-- 插画区域 - 脚印图案 -->
    <view class="illustration">
      <view class="footprint">
        <view class="foot-pad main-pad"></view>
        <view class="foot-pad toe toe-1"></view>
        <view class="foot-pad toe toe-2"></view>
        <view class="foot-pad toe toe-3"></view>
        <view class="foot-pad toe toe-4"></view>
        <view class="foot-pad toe toe-5"></view>
      </view>
      <view class="decoration-circle circle-1"></view>
      <view class="decoration-circle circle-2"></view>
      <view class="decoration-circle circle-3"></view>
    </view>

    <!-- 底部登录区域 -->
    <view class="login-section">
      <!-- #ifdef APP-HARMONY -->
      <button
        class="login-btn harmony-btn"
        :class="{ disabled: !isPrivacyChecked }"
        @click="onHarmonyLogin"
      >
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
        <button
          class="login-btn phone-btn"
          :class="{ disabled: !isPrivacyChecked }"
          @click="onPhoneLogin"
        >
          手机号登录
        </button>
      </view>
      <!-- #endif -->

      <!-- 隐私政策勾选 -->
      <view class="privacy-agreement">
        <view class="checkbox" @click="togglePrivacy">
          <view v-if="isPrivacyChecked" class="checkbox-inner"></view>
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click.stop="openLegalPage('user-agreement', '用户协议')">《用户协议》</text>
          和
          <text class="link" @click.stop="openLegalPage('privacy-policy', '隐私政策')">《隐私政策》</text>
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

    <!-- 首次登录隐私政策弹窗 -->
    <Dialog
      :visible="showPrivacyDialog"
      title="隐私政策提示"
      content="欢迎使用 BabyKeepsake！使用前请阅读并同意《用户协议》和《隐私政策》"
      :show-cancel="true"
      confirm-text="同意并继续"
      cancel-text="不同意"
      @confirm="onAgreePrivacyDialog"
      @cancel="onDisagreePrivacyDialog"
      @close="showPrivacyDialog = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif
// #ifndef APP-HARMONY
import { loginWithPhone, sendVerifyCode } from '@/services/auth'
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
const showPrivacyDialog = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 如果未同意过隐私政策，弹出提示
  if (!userStore.isPrivacyAgreed) {
    showPrivacyDialog.value = true
  }
})

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

function onAgreePrivacyDialog() {
  isPrivacyChecked.value = true
  userStore.agreePrivacy()
  showPrivacyDialog.value = false
}

function onDisagreePrivacyDialog() {
  showPrivacyDialog.value = false
  // 不同意则返回上一页或首页
  uni.navigateBack({ delta: 1, fail: () => {
    uni.switchTab({ url: '/pages/index/index' })
  }})
}

function openLegalPage(filename: string, title: string) {
  uni.navigateTo({
    url: `/pages/webview/index?url=/static/legal/${filename}.html&title=${encodeURIComponent(title)}`
  })
}

// #ifdef APP-HARMONY
async function onHarmonyLogin() {
  if (!checkPrivacy()) return
  try {
    const { userInfo, token } = await loginWithHarmony()
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    userStore.agreePrivacy()
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
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    userStore.agreePrivacy()
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
  try {
    sendVerifyCode(phone.value)
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)
  } catch (err: any) {
    showTip('发送失败', err.message || '验证码发送失败')
  }
}
// #endif
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background-color: $bg-card;
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
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-xl;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
}

.logo-text {
  font-size: 60rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.app-name {
  font-size: 44rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.slogan {
  font-size: 28rpx;
  color: $text-secondary;
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

.footprint {
  position: relative;
  width: 200rpx;
  height: 260rpx;
}

.foot-pad {
  background: linear-gradient(135deg, $primary, $primary-light);
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
  width: 36rpx;
  height: 46rpx;
  border-radius: 50% 50% 40% 40%;
}

.toe-1 {
  top: 20rpx;
  left: 10rpx;
  transform: rotate(-20deg);
}

.toe-2 {
  top: 0;
  left: 55rpx;
}

.toe-3 {
  top: 0;
  right: 10rpx;
  transform: rotate(20deg);
}

.toe-4 {
  top: 50rpx;
  left: -5rpx;
  transform: rotate(-35deg);
  width: 32rpx;
  height: 40rpx;
}

.toe-5 {
  top: 50rpx;
  right: -5rpx;
  transform: rotate(35deg);
  width: 32rpx;
  height: 40rpx;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background-color: $primary;
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
  background-color: $primary-light;
}

.circle-3 {
  width: 30rpx;
  height: 30rpx;
  top: 80rpx;
  left: 60rpx;
}

.login-section {
  margin-top: auto;
  width: 100%;
  padding: 0 $spacing-xl $spacing-xl;
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
  margin-bottom: $spacing-md;
  font-size: 32rpx;
  font-weight: 500;
  color: #FFFFFF;
}

.login-btn::after {
  border: none;
}

.login-btn.disabled {
  opacity: 0.5;
}

.harmony-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.phone-btn {
  background: linear-gradient(135deg, $primary, $primary-light);
}

.phone-login {
  width: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input-group {
  width: 100%;
  margin-bottom: $spacing-md;
}

.input-label {
  font-size: 26rpx;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
  display: block;
}

.input-field {
  width: 100%;
  height: 88rpx;
  background-color: $bg-page;
  border-radius: $radius-md;
  padding: 0 $spacing-sm;
  font-size: 30rpx;
  color: $text-primary;
  box-sizing: border-box;
}

.input-placeholder {
  color: $text-hint;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.code-input {
  flex: 1;
}

.code-btn {
  width: 180rpx;
  height: 88rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  color: #FFFFFF;
  font-size: 26rpx;
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.code-btn.disabled {
  background: $text-hint;
}

.privacy-agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-sm;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid $primary;
  border-radius: $radius-sm;
  margin-right: $spacing-xs;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox-inner {
  width: 18rpx;
  height: 18rpx;
  background-color: $primary;
  border-radius: 4rpx;
}

.agreement-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.link {
  color: $primary;
}

.safe-area {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}
</style>
