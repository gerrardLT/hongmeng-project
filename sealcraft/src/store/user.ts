import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/models'
import { dbSetEncrypted, dbGetEncrypted } from '@/utils/db'

const STORAGE_KEY = 'secure_user'
const PRIVACY_KEY = 'sealcraft_privacy_agreed'
const USER_INFO_ID = 'info'
const TOKEN_ID = 'token'

export const useUserStore = defineStore('user', () => {
  // state
  const userInfo = ref<User | null>(null)
  const token = ref('')
  const isPrivacyAgreed = ref(false)

  // getters
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userId = computed(() => userInfo.value?.userId || '')

  // 持久化到本地存储（敏感数据加密存储）
  function persist() {
    // 用户信息和 Token 使用加密存储
    dbSetEncrypted(STORAGE_KEY, USER_INFO_ID, userInfo.value)
    dbSetEncrypted(STORAGE_KEY, TOKEN_ID, token.value)
    // 隐私协议状态不加密，启动时需快速检查
    try {
      uni.setStorageSync(PRIVACY_KEY, isPrivacyAgreed.value)
    } catch (e) {
      console.error('persist privacy state error:', e)
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

  function logout() {
    userInfo.value = null
    token.value = ''
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
      // 从加密存储读取用户信息和 Token
      const storedUserInfo = dbGetEncrypted<User>(STORAGE_KEY, USER_INFO_ID)
      if (storedUserInfo) {
        userInfo.value = storedUserInfo
      }
      const storedToken = dbGetEncrypted<string>(STORAGE_KEY, TOKEN_ID)
      if (storedToken) {
        token.value = storedToken
      }
      // 单独恢复隐私协议状态（未加密）
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
