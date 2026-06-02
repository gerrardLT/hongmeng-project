<template>
  <view class="login-page">
    <!-- Logo 区域 -->
    <view class="logo-area">
      <view class="logo-icon">
        <text class="logo-text">C</text>
      </view>
      <text class="app-name">ColorAid</text>
      <text class="app-slogan">色彩辅助，看见更多</text>
    </view>

    <!-- 登录区域 -->
    <view class="login-area">
      <!-- #ifdef APP-HARMONY -->
      <view class="login-btn harmony" @click="handleHarmonyLogin">
        <text class="btn-text">华为账号一键登录</text>
      </view>
      <!-- #endif -->

      <!-- #ifndef APP-HARMONY -->
      <view class="form-group">
        <input
          v-model="phone"
          class="form-input"
          type="number"
          maxlength="11"
          placeholder="请输入手机号"
        />
        <view class="code-row">
          <input
            v-model="code"
            class="form-input code-input"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
          />
          <text
            class="send-code-btn"
            :class="{ disabled: countdown > 0 }"
            @click="handleSendCode"
          >
            {{ codeText }}
          </text>
        </view>
        <view class="login-btn primary" @click="handlePhoneLogin">
          <text class="btn-text">登录</text>
        </view>
      </view>
      <!-- #endif -->

      <view class="guest-btn" @click="handleGuestLogin">
        <text class="guest-text">跳过登录，直接体验</text>
      </view>
    </view>

    <!-- 隐私政策弹窗 -->
    <Dialog
      v-model:visible="privacyVisible"
      title="用户协议与隐私政策"
      confirm-text="同意"
      cancel-text="不同意"
      :show-cancel="true"
      @confirm="handleAgreePrivacy"
      @cancel="handleDisagreePrivacy"
    >
      <view class="privacy-content">
        <text class="privacy-text">
          欢迎您使用 ColorAid！在使用本应用前，请您仔细阅读并理解以下条款：

本应用为色盲色弱辅助工具，非医疗器械。相机、存储权限仅用于实时滤镜、拍照分析与结果保存，所有图像数据均在端侧处理，不会上传至服务器。您的账号信息（华为账号ID/手机号）仅用于登录认证与数据同步，我们将采取加密措施保障数据安全。

使用本应用即表示您同意我们的
        </text>
        <text class="privacy-link" @click="openUserAgreement">《用户协议》</text>
        <text class="privacy-text">和</text>
        <text class="privacy-link" @click="openPrivacyPolicy">《隐私政策》</text>
        <text class="privacy-text">。如您不同意，将无法使用本应用的核心功能。</text>
      </view>
    </Dialog>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import { useSettingsStore } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import Dialog from '@/components/common/Dialog.vue'

// #ifdef APP-HARMONY
import { loginWithHarmony } from '@/services/auth'
// #endif
// #ifndef APP-HARMONY
import { loginWithPhone } from '@/services/auth'
// #endif

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const privacyVisible = ref(false)
const phone = ref('')
const code = ref('')
const countdown = ref(0)

const codeText = computed(() => {
  return countdown.value > 0 ? `${countdown.value}s` : '获取验证码'
})

onMounted(() => {
  // 初始化 store 状态
  userStore.init()
  settingsStore.init()
  historyStore.init()

  // 首次启动检查隐私政策同意状态
  if (!userStore.isPrivacyAgreed) {
    privacyVisible.value = true
  }
})

function handleAgreePrivacy() {
  userStore.agreePrivacy()
}

function handleDisagreePrivacy() {
  uni.showToast({
    title: '需同意协议方可使用',
    icon: 'none'
  })
  // 再次弹出，必须同意
  setTimeout(() => {
    privacyVisible.value = true
  }, 500)
}

function handleSendCode() {
  if (countdown.value > 0) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  // 模拟发送验证码
  uni.showToast({ title: '验证码已发送', icon: 'none' })
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// #ifdef APP-HARMONY
async function handleHarmonyLogin() {
  if (!userStore.isPrivacyAgreed) {
    privacyVisible.value = true
    return
  }
  try {
    const { userInfo, token } = await loginWithHarmony()
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    onLoginSuccess()
  } catch (err: any) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  }
}
// #endif

// #ifndef APP-HARMONY
async function handlePhoneLogin() {
  if (!userStore.isPrivacyAgreed) {
    privacyVisible.value = true
    return
  }
  try {
    const { userInfo, token } = await loginWithPhone(phone.value, code.value)
    userStore.setUserInfo(userInfo)
    userStore.setToken(token)
    onLoginSuccess()
  } catch (err: any) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  }
}
// #endif

function handleGuestLogin() {
  if (!userStore.isPrivacyAgreed) {
    privacyVisible.value = true
    return
  }
  onLoginSuccess()
}

function openUserAgreement() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/user-agreement.html')
  })
}

function openPrivacyPolicy() {
  uni.navigateTo({
    url: '/pages/webview/index?url=' + encodeURIComponent('/static/legal/privacy-policy.html')
  })
}

function onLoginSuccess() {
  // 检查是否已做过色盲检测
  const hasTested = settingsStore.colorBlindType !== 'normal' || historyStore.histories.length > 0
  if (hasTested) {
    uni.switchTab({ url: '/pages/index/index' })
  } else {
    uni.switchTab({ url: '/pages/test/index' })
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: $bg-color;
  padding: $spacing-xl;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
  margin-bottom: 80rpx;
}

.logo-icon {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-lg;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-md;
}

.logo-text {
  font-size: 80rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.app-name {
  font-size: $font-xxl;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.app-slogan {
  font-size: $font-md;
  color: $text-secondary;
}

.login-area {
  width: 100%;
  max-width: 600rpx;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background-color: $bg-card;
  border-radius: $radius-md;
  padding: 0 $spacing-md;
  font-size: $font-md;
  color: $text-primary;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  flex-direction: row;
  gap: $spacing-md;
  align-items: center;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  width: 200rpx;
  height: 96rpx;
  line-height: 96rpx;
  text-align: center;
  background-color: $primary-color;
  color: #FFFFFF;
  border-radius: $radius-md;
  font-size: $font-sm;

  &.disabled {
    background-color: $border-color;
    color: $text-hint;
  }
}

.login-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-md;

  &.primary {
    background-color: $primary-color;
  }

  &.harmony {
    background-color: #CF0A2C;
  }
}

.btn-text {
  font-size: $font-lg;
  color: #FFFFFF;
  font-weight: 500;
}

.guest-btn {
  display: flex;
  justify-content: center;
  padding: $spacing-md 0;
}

.guest-text {
  font-size: $font-md;
  color: $text-secondary;

  &:active {
    color: $primary-color;
  }
}

.privacy-content {
  max-height: 400rpx;
  overflow-y: auto;
  margin-bottom: $spacing-xl;
  padding: 0 $spacing-sm;
}

.privacy-text {
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
  white-space: pre-line;
}

.privacy-link {
  font-size: $font-sm;
  color: $primary-color;
  line-height: 1.6;
}
</style>
