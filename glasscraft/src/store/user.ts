import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/models'

const STORAGE_KEY = 'glasscraft_user'

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
  const userId = computed(() => userInfo.value?.userId || '')

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
  function setUserInfo(user: UserInfo) {
    userInfo.value = user
    persist()
  }

  function setToken(tok: string) {
    token.value = tok
    uni.setStorageSync('token', tok)
    persist()
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    isPrivacyAgreed.value = false
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync('token')
    } catch (e) {
      console.error('logout error:', e)
    }
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
    isPrivacyAgreed,
    isLoggedIn,
    userId,
    setUserInfo,
    setToken,
    agreePrivacy,
    logout,
    init,
    persist
  }
})
