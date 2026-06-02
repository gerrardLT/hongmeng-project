<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="app-logo" src="/static/images/logo.png" mode="aspectFit" />
      <text class="app-name">SealCraft</text>
      <text class="app-slogan">个人印章定制</text>
    </view>

    <!-- 隐私协议勾选区 -->
    <view class="privacy-check">
      <view class="checkbox-wrap" @click="togglePrivacy">
        <view class="checkbox" :class="{ checked: privacyAgreed }">
          <text v-if="privacyAgreed" class="check-icon">✓</text>
        </view>
      </view>
      <view class="privacy-text-wrap">
        <text class="privacy-text">我已阅读并同意</text>
        <text class="privacy-link" @click="goWebView('/static/legal/user-agreement.html', '用户协议')">《用户协议》</text>
        <text class="privacy-text">和</text>
        <text class="privacy-link" @click="goWebView('/static/legal/privacy-policy.html', '隐私政策')">《隐私政策》</text>
      </view>
    </view>

    <!-- 鸿蒙端：华为账号一键登录 -->
    <!-- #ifdef APP-HARMONY -->
    <view class="harmony-login-section">
      <view
        class="harmony-login-btn"
        :class="{ disabled: !privacyAgreed }"
        @click="onHarmonyLogin"
      >
        <text class="harmony-icon">⚡</text>
        <text class="harmony-text">华为账号一键登录</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 通用端：手机号+验证码 -->
    <!-- #ifndef APP-HARMONY -->
    <view class="phone-login-section">
      <view class="form-item">
        <text class="form-label">手机号</text>
        <view class="phone-input-wrap">
          <text class="phone-prefix">+86</text>
          <input
            v-model="phone"
            class="phone-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">验证码</text>
        <view class="code-input-wrap">
          <input
            v-model="code"
            class="code-input"
            type="number"
            maxlength="6"
            placeholder="请输入6位验证码"
            placeholder-class="input-placeholder"
          />
          <text
            class="send-code-btn"
            :class="{ disabled: countdown > 0 || !privacyAgreed }"
            @click="onSendCode"
          >{{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}</text>
        </view>
      </view>
      <view
        class="phone-login-btn"
        :class="{ disabled: !privacyAgreed }"
        @click="onPhoneLogin"
      >
        <text v-if="!loading" class="btn-text">登录</text>
        <text v-else class="btn-text">登录中...</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- 跳过登录 -->
    <view class="skip-wrap">
      <text class="skip-text" @click="onSkip">跳过登录，游客模式体验</text>
    </view>

    <!-- 隐私政策弹窗（首次进入） -->
    <Dialog
      :visible="showPrivacyDialog"
      :showCancel="false"
      @close="onPrivacyClose"
    >
      <view class="privacy-dialog-content">
        <text class="privacy-dialog-title">欢迎使用 SealCraft</text>
        <text class="privacy-dialog-desc">
          在使用本应用前，请您阅读并同意我们的
        </text>
        <view class="privacy-links">
          <text class="privacy-link" @click="goWebView('/static/legal/user-agreement.html', '用户协议')">《用户协议》</text>
          <text class="privacy-and">和</text>
          <text class="privacy-link" @click="goWebView('/static/legal/privacy-policy.html', '隐私政策')">《隐私政策》</text>
        </view>
        <text class="privacy-dialog-sub">我们将严格保护您的个人信息安全</text>
        <view class="privacy-actions">
          <text class="privacy-disagree" @click="onPrivacyDisagree">不同意</text>
          <text class="privacy-agree" @click="onPrivacyAgree">同意</text>
        </view>
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import Dialog from '@/components/common/Dialog.vue'

// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif

// #ifndef APP-HARMONY
import { loginWithPhone, sendVerificationCode } from '@/services/auth'
// #endif

const userStore = useUserStore()

const showPrivacyDialog = ref(false)
const privacyAgreed = ref(false)
const phone = ref('')
const code = ref('')
const loading = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// 同步勾选状态到 store
watch(privacyAgreed, (val) => {
  if (val) {
    userStore.agreePrivacy()
  }
})

onLoad(() => {
  // 恢复隐私协议状态
  if (userStore.isPrivacyAgreed) {
    privacyAgreed.value = true
  } else {
    showPrivacyDialog.value = true
  }
})

function togglePrivacy() {
  privacyAgreed.value = !privacyAgreed.value
}

function onPrivacyClose() {
  // 点击遮罩不关闭，用户必须主动选择
}

function onPrivacyDisagree() {
  showPrivacyDialog.value = false
  // 立即退出，不做任何延迟
  // #ifdef APP-HARMONY
  // @ts-ignore
  uni.exit && uni.exit()
  // #endif
  // #ifndef APP-HARMONY
  uni.navigateBack({ fail: () => {
    // 如果无法返回，关闭所有页面
    uni.reLaunch({ url: '/pages/login/index' })
  }})
  // #endif
}

function onPrivacyAgree() {
  privacyAgreed.value = true
  userStore.agreePrivacy()
  showPrivacyDialog.value = false
}

// #ifdef APP-HARMONY
async function onHarmonyLogin() {
  if (!privacyAgreed.value) {
    uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '登录中...' })
    const { userInfo, token } = await loginWithHarmony()
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    uni.hideLoading()
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e: any) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' })
  }
}
// #endif

// #ifndef APP-HARMONY
async function onSendCode() {
  if (!privacyAgreed.value) {
    uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
    return
  }
  if (countdown.value > 0) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  try {
    uni.showLoading({ title: '发送中...' })
    await sendVerificationCode(phone.value)
    uni.hideLoading()
    uni.showToast({ title: '验证码已发送（Mock: 123456）', icon: 'none' })
    countdown.value = 60
    countdownTimer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(countdownTimer!)
        countdownTimer = null
      }
    }, 1000)
  } catch (e: any) {
    uni.hideLoading()
    uni.showToast({ title: e?.message || '发送失败', icon: 'none' })
  }
}

async function onPhoneLogin() {
  if (!privacyAgreed.value) {
    uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
    return
  }
  if (loading.value) return
  try {
    loading.value = true
    uni.showLoading({ title: '登录中...' })
    const { userInfo, token } = await loginWithPhone(phone.value, code.value)
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    uni.hideLoading()
    loading.value = false
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e: any) {
    uni.hideLoading()
    loading.value = false
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' })
  }
}
// #endif

function onSkip() {
  uni.reLaunch({ url: '/pages/index/index' })
}

function goWebView(url: string, title: string) {
  uni.navigateTo({ url: `/pages/webview/index?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}` })
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5E6E6 0%, $bg-page 40%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 $spacing-lg;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
  margin-bottom: $spacing-lg;
}

.app-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  margin-bottom: $spacing-md;
  box-shadow: 0 8rpx 32rpx rgba(196, 26, 26, 0.25);
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: $primary;
  margin-bottom: $spacing-xs;
}

.app-slogan {
  font-size: 26rpx;
  color: $text-secondary;
}

/* 隐私协议勾选 */
.privacy-check {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: $spacing-lg;
  padding: 0 8rpx;
}

.checkbox-wrap {
  margin-right: 12rpx;
  padding-top: 4rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 6rpx;
  border: 2rpx solid $border-color;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $bg-card;
  transition: all 0.2s;

  &.checked {
    background-color: $primary;
    border-color: $primary;
  }
}

.check-icon {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.privacy-text-wrap {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.privacy-text {
  font-size: 24rpx;
  color: $text-secondary;
}

.privacy-link {
  font-size: 24rpx;
  color: $primary;
  font-weight: 500;
}

/* 鸿蒙端登录 */
.harmony-login-section {
  width: 100%;
  margin-top: $spacing-md;
}

.harmony-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 48rpx;
  gap: $spacing-sm;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.4);

  &.disabled {
    opacity: 0.5;
  }
}

.harmony-icon {
  font-size: 36rpx;
  color: #FFFFFF;
}

.harmony-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 通用端登录 */
.phone-login-section {
  width: 100%;
  margin-top: $spacing-md;
}

.form-item {
  margin-bottom: $spacing-md;
}

.form-label {
  font-size: 26rpx;
  color: $text-secondary;
  display: block;
  margin-bottom: $spacing-xs;
}

.phone-input-wrap {
  display: flex;
  align-items: center;
  height: 88rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  background-color: $bg-card;
  padding: 0 $spacing-md;
}

.phone-prefix {
  font-size: 28rpx;
  color: $text-primary;
  margin-right: $spacing-sm;
  flex-shrink: 0;
}

.phone-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.code-input-wrap {
  display: flex;
  align-items: center;
  height: 88rpx;
  border: 2rpx solid $border-color;
  border-radius: $radius-md;
  background-color: $bg-card;
  padding: 0 $spacing-md;
}

.code-input {
  flex: 1;
  font-size: 28rpx;
  color: $text-primary;
}

.send-code-btn {
  font-size: 24rpx;
  color: $primary;
  padding: 8rpx 16rpx;
  white-space: nowrap;
  flex-shrink: 0;

  &.disabled {
    color: $text-hint;
  }
}

.input-placeholder {
  color: $text-hint;
}

.phone-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: 48rpx;
  margin-top: $spacing-md;
  box-shadow: 0 8rpx 24rpx rgba(196, 26, 26, 0.4);

  &.disabled {
    opacity: 0.5;
  }
}

.btn-text {
  font-size: 32rpx;
  color: #FFFFFF;
  font-weight: 600;
}

/* 跳过登录 */
.skip-wrap {
  margin-top: $spacing-lg;
}

.skip-text {
  font-size: 26rpx;
  color: $text-hint;
  text-decoration: underline;
}

/* 隐私弹窗自定义内容 */
.privacy-dialog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.privacy-dialog-title {
  font-size: 34rpx;
  font-weight: bold;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.privacy-dialog-desc {
  font-size: 26rpx;
  color: $text-secondary;
  text-align: center;
  line-height: 1.6;
}

.privacy-links {
  display: flex;
  align-items: center;
  margin: $spacing-sm 0;
}

.privacy-link {
  font-size: 26rpx;
  color: $primary;
}

.privacy-and {
  font-size: 26rpx;
  color: $text-secondary;
  margin: 0 4rpx;
}

.privacy-dialog-sub {
  font-size: 24rpx;
  color: $text-hint;
  margin-bottom: $spacing-lg;
}

.privacy-actions {
  display: flex;
  width: 100%;
  gap: $spacing-md;
  margin-top: $spacing-sm;
}

.privacy-disagree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background-color: $bg-page;
  border-radius: $radius-md;
  font-size: 28rpx;
  color: $text-secondary;
}

.privacy-agree {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: linear-gradient(135deg, $primary, $primary-light);
  border-radius: $radius-md;
  font-size: 28rpx;
  color: #FFFFFF;
  font-weight: 600;
}
</style>
