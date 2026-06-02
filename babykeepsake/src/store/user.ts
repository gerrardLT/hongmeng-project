import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, BabyInfo } from '@/types/models'

const STORAGE_KEY = 'babykeepsake_user'
const PRIVACY_KEY = 'privacy_agreed'

interface UserStorageState {
  userInfo: User | null
  token: string
  isPrivacyAgreed: boolean
  selectedBabyId: string
}

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<User | null>(null)
  const token = ref('')
  const isPrivacyAgreed = ref(false)
  const selectedBabyId = ref('')

  // getters
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userId = computed(() => userInfo.value?.userId || '')
  const selectedBaby = computed<BabyInfo | null>(() => {
    if (!userInfo.value || !selectedBabyId.value) return null
    return userInfo.value.babyInfos.find((b) => b.babyId === selectedBabyId.value) || null
  })

  // 持久化到本地存储
  function persist() {
    const state: UserStorageState = {
      userInfo: userInfo.value,
      token: token.value,
      isPrivacyAgreed: isPrivacyAgreed.value,
      selectedBabyId: selectedBabyId.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist user state error:', e)
    }
  }

  // actions
  function setUserInfo(user: User) {
    userInfo.value = user
    persist()
  }

  function setToken(tok: string) {
    token.value = tok
    persist()
  }

  function agreePrivacy() {
    isPrivacyAgreed.value = true
    try {
      uni.setStorageSync(PRIVACY_KEY, true)
    } catch (e) {
      console.error('agreePrivacy error:', e)
    }
    persist()
  }

  function selectBaby(babyId: string) {
    selectedBabyId.value = babyId
    persist()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    selectedBabyId.value = ''
    isPrivacyAgreed.value = false
    try {
      uni.removeStorageSync(STORAGE_KEY)
      uni.removeStorageSync(PRIVACY_KEY)
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
        selectedBabyId.value = state.selectedBabyId || ''
      }
      // 单独恢复隐私协议状态
      const privacyAgreed = uni.getStorageSync(PRIVACY_KEY) as boolean | undefined
      if (privacyAgreed) {
        isPrivacyAgreed.value = true
      }
    } catch (e) {
      console.error('init user state error:', e)
    }
  }

  return {
    userInfo,
    token,
    isPrivacyAgreed,
    selectedBabyId,
    isLoggedIn,
    userId,
    selectedBaby,
    setUserInfo,
    setToken,
    agreePrivacy,
    selectBaby,
    logout,
    init,
    persist
  }
})
