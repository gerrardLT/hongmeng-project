/**
 * PlantCare 用户状态管理
 * 管理用户登录态、隐私协议、用户信息等
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/models'

const STORAGE_KEY = 'plantcare_user'

interface UserStorageState {
  userInfo: UserInfo | null
  token: string
  isLoggedIn: boolean
  isPrivacyAgreed: boolean
}

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')
  const isLoggedIn = ref(false)
  const isPrivacyAgreed = ref(false)

  // getters
  const userId = computed(() => userInfo.value?.userId || '')
  const nickname = computed(() => userInfo.value?.nickname || '')

  // 持久化到本地存储
  function persist() {
    const state: UserStorageState = {
      userInfo: userInfo.value,
      token: token.value,
      isLoggedIn: isLoggedIn.value,
      isPrivacyAgreed: isPrivacyAgreed.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('[user store] persist error:', e)
    }
  }

  // actions
  function login(user: UserInfo, tok: string) {
    userInfo.value = user
    token.value = tok
    isLoggedIn.value = true
    uni.setStorageSync('token', tok)
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    isLoggedIn.value = false
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync('token')
    } catch (e) {
      console.error('[user store] logout error:', e)
    }
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  function setUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      persist()
    }
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as UserStorageState | undefined
      if (state && state.isLoggedIn && state.token) {
        userInfo.value = state.userInfo
        token.value = state.token
        isLoggedIn.value = true
        isPrivacyAgreed.value = state.isPrivacyAgreed || false
      }
    } catch (e) {
      console.error('[user store] init error:', e)
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isPrivacyAgreed,
    userId,
    nickname,
    login,
    logout,
    agreePrivacy,
    setUserInfo,
    init,
    persist
  }
})
