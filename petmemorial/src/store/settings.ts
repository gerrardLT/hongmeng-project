import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'petmemorial_settings'

interface SettingsStorageState {
  notificationEnabled: boolean
  locationEnabled: boolean
  theme: string
  language: string
}

export const useSettingsStore = defineStore('settings', () => {
  // state
  const notificationEnabled = ref(false)
  const locationEnabled = ref(false)
  const theme = ref('light')
  const language = ref('zh-CN')

  // 持久化到本地存储
  function persist() {
    const state: SettingsStorageState = {
      notificationEnabled: notificationEnabled.value,
      locationEnabled: locationEnabled.value,
      theme: theme.value,
      language: language.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist settings error:', e)
    }
  }

  // actions
  function toggleNotification() {
    notificationEnabled.value = !notificationEnabled.value
    persist()
  }

  function toggleLocation() {
    locationEnabled.value = !locationEnabled.value
    persist()
  }

  function setTheme(newTheme: string) {
    theme.value = newTheme
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as SettingsStorageState | undefined
      if (state) {
        notificationEnabled.value = state.notificationEnabled ?? false
        locationEnabled.value = state.locationEnabled ?? false
        theme.value = state.theme || 'light'
        language.value = state.language || 'zh-CN'
      }
    } catch (e) {
      console.error('init settings error:', e)
    }
  }

  return {
    notificationEnabled,
    locationEnabled,
    theme,
    language,
    toggleNotification,
    toggleLocation,
    setTheme,
    init,
    persist
  }
})
