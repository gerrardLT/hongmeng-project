import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'glasscraft_settings'

interface SettingsStorageState {
  notificationEnabled: boolean
  cacheSize: string
  appVersion: string
}

export const useSettingsStore = defineStore('settings', () => {
  // state
  const notificationEnabled = ref(true)
  const cacheSize = ref('')
  const appVersion = ref('1.0.0')

  // 持久化到本地存储
  function persist() {
    const state: SettingsStorageState = {
      notificationEnabled: notificationEnabled.value,
      cacheSize: cacheSize.value,
      appVersion: appVersion.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist settings error:', e)
    }
  }

  // actions
  function setNotification(enabled: boolean) {
    notificationEnabled.value = enabled
    persist()
  }

  function clearCache() {
    cacheSize.value = ''
    try {
      // 清除非用户认证和设置相关的缓存
      const preservedKeys = ['glasscraft_user', 'glasscraft_settings']
      const info = uni.getStorageInfoSync()
      info.keys.forEach((key) => {
        if (!preservedKeys.includes(key)) {
          uni.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.error('clearCache error:', e)
    }
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as SettingsStorageState | undefined
      if (state) {
        notificationEnabled.value = state.notificationEnabled ?? true
        cacheSize.value = state.cacheSize || ''
        appVersion.value = state.appVersion || '1.0.0'
      }
    } catch (e) {
      console.error('init settings error:', e)
    }
  }

  return {
    notificationEnabled,
    cacheSize,
    appVersion,
    setNotification,
    clearCache,
    init,
    persist
  }
})
