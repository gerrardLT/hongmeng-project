import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/models'

const STORAGE_KEY = 'campready_user'

interface UserStorageState {
  userInfo: UserInfo | null
  token: string
  isPrivacyAgreed: boolean
}

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<UserInfo | null>(null)
  const token = ref('')
  const isPrivacyAgreed = ref(false)

  // getters
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)

  // 持久化到本地存储
  function persist() {
    const state: UserStorageState = {
      userInfo: userInfo.value,
      token: token.value,
      isPrivacyAgreed: isPrivacyAgreed.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist user state error:', e)
    }
  }

  // actions
  function setUser(user: UserInfo, tok: string) {
    userInfo.value = user
    token.value = tok
    uni.setStorageSync('token', tok)
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync('token')
    } catch (e) {
      console.error('logout error:', e)
    }
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as UserStorageState | undefined
      if (state) {
        userInfo.value = state.userInfo || null
        token.value = state.token || ''
        isPrivacyAgreed.value = state.isPrivacyAgreed || false
      }
    } catch (e) {
      console.error('init user state error:', e)
    }
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    isPrivacyAgreed,
    setUser,
    logout,
    agreePrivacy,
    init
  }
})
