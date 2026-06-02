<template>
  <view class="login-page">
    <view class="logo-area">
      <text class="logo-icon">🐠</text>
      <text class="app-name">AquaLog</text>
      <text class="app-desc">水族箱智能管家</text>
    </view>

    <!-- #ifdef APP-HARMONY -->
    <view class="harmony-login">
      <view class="btn-login" @click="harmonyLogin">
        <text class="btn-login-text">华为账号一键登录</text>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifndef APP-HARMONY -->
    <view class="phone-login">
      <view class="input-group">
        <input
          v-model="phone"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
          class="input-field"
        />
      </view>
      <view class="input-group code-group">
        <input
          v-model="code"
          type="number"
          placeholder="验证码"
          maxlength="6"
          class="input-field code-input"
        />
        <view class="code-btn" :class="{ disabled: countdown > 0 }" @click="getCode">
          <text class="code-btn-text">{{ countdown > 0 ? `${countdown}s` : '获取验证码' }}</text>
        </view>
      </view>
      <view class="btn-login" @click="phoneLogin">
        <text class="btn-login-text">登录</text>
      </view>
    </view>
    <!-- #endif -->

    <view class="agreement-area">
      <text class="agreement-text">登录即表示同意</text>
      <text class="agreement-link" @click="openPrivacy">《隐私政策》</text>
      <text class="agreement-text">和</text>
      <text class="agreement-link" @click="openAgreement">《用户协议》</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
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
let timer: ReturnType<typeof setInterval> | null = null

// #ifdef APP-HARMONY
async function harmonyLogin() {
  if (loading.value) return
  loading.value = true
  try {
    userStore.agreePrivacy()
    const { userInfo, token } = await loginWithHarmony()
    userStore.login(userInfo, token)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

// #ifndef APP-HARMONY
function getCode() {
  if (countdown.value > 0) return
  if (!phone.value || !/^1[3-9]\d{9}$/.test(phone.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }
  sendVerifyCode(phone.value)
    .then(() => {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (timer) clearInterval(timer)
          timer = null
        }
      }, 1000)
    })
    .catch((e: any) => {
      uni.showToast({ title: e.message || '发送失败', icon: 'none' })
    })
}

async function phoneLogin() {
  if (loading.value) return
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
    userStore.agreePrivacy()
    const { userInfo, token } = await loginWithPhone(phone.value, code.value)
    userStore.login(userInfo, token)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1000)
  } catch (e: any) {
    uni.showToast({ title: e.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
// #endif

function openPrivacy() {
  uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/privacy') })
}

function openAgreement() {
  uni.navigateTo({ url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/agreement') })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 $spacing-xl;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 200rpx;
  margin-bottom: 100rpx;
}

.logo-icon {
  font-size: 120rpx;
}

.app-name {
  font-size: $font-xl;
  font-weight: bold;
  color: $primary-color;
  margin-top: $spacing-md;
}

.app-desc {
  font-size: $font-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.harmony-login,
.phone-login {
  width: 100%;
}

.input-group {
  margin-bottom: $spacing-md;
}

.input-field {
  width: 100%;
  height: 96rpx;
  background-color: $bg-grey;
  border-radius: $radius-md;
  padding: 0 $spacing-lg;
  font-size: $font-md;
}

.code-group {
  display: flex;
  align-items: center;
}

.code-input {
  flex: 1;
}

.code-btn {
  margin-left: $spacing-md;
  padding: 0 $spacing-lg;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $primary-lighter;
  border-radius: $radius-md;
  white-space: nowrap;

  &.disabled {
    opacity: 0.5;
  }
}

.code-btn-text {
  font-size: $font-sm;
  color: $primary-color;
}

.btn-login {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  border-radius: $radius-md;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: $spacing-lg;
}

.btn-login-text {
  font-size: $font-md;
  color: #ffffff;
  font-weight: bold;
}

.agreement-area {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: $spacing-xl;
}

.agreement-text {
  font-size: $font-xs;
  color: $text-light;
}

.agreement-link {
  font-size: $font-xs;
  color: $primary-color;
}
</style>
