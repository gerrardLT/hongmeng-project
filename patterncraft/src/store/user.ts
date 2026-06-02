import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/models'

const STORAGE_KEY = 'patterncraft_user'

interface UserStorageState {
  userInfo: UserInfo | null
  token: string
  isPrivacyAgreed: boolean
  isTermsAgreed: boolean
}

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  const isPrivacyAgreed = ref<boolean>(false)
  const isTermsAgreed = ref<boolean>(false)

  // getters
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userId = computed(() => userInfo.value?.userId || '')

  /**
   * 持久化用户状态到本地存储
   */
  function persist() {
    const state: UserStorageState = {
      userInfo: userInfo.value,
      token: token.value,
      isPrivacyAgreed: isPrivacyAgreed.value,
      isTermsAgreed: isTermsAgreed.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist user state error:', e)
    }
  }

  /**
   * 从本地存储初始化恢复用户状态
   */
  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as UserStorageState | undefined
      if (state) {
        userInfo.value = state.userInfo ?? null
        token.value = state.token || ''
        isPrivacyAgreed.value = state.isPrivacyAgreed || false
        isTermsAgreed.value = state.isTermsAgreed || false
      }
      const savedToken = uni.getStorageSync('token') as string | undefined
      if (savedToken && !token.value) {
        token.value = savedToken
      }
    } catch (e) {
      console.error('init user state error:', e)
    }
  }

  /**
   * 设置用户信息
   * @param info 用户信息对象
   */
  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    persist()
  }

  /**
   * 设置登录令牌
   * @param t 令牌字符串
   */
  function setToken(t: string) {
    token.value = t
    uni.setStorageSync('token', t)
    persist()
  }

  /**
   * 同意隐私协议
   */
  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  /**
   * 同意用户条款
   */
  function agreeTerms() {
    isTermsAgreed.value = true
    persist()
  }

  /**
   * 退出登录，清除所有用户相关状态与存储
   */
  function logout() {
    userInfo.value = null
    token.value = ''
    isPrivacyAgreed.value = false
    isTermsAgreed.value = false
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync('token')
    } catch (e) {
      console.error('logout error:', e)
    }
  }

  return {
    userInfo,
    token,
    isPrivacyAgreed,
    isTermsAgreed,
    isLoggedIn,
    userId,
    init,
    setUserInfo,
    setToken,
    agreePrivacy,
    agreeTerms,
    logout
  }
})
