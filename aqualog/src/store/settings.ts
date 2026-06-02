/**
 * AquaLog 应用设置状态管理
 * 管理提醒开关、维护周期等设置项
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'aqualog_settings'

interface SettingsState {
  waterChangeReminder: boolean
  waterChangeInterval: number
  feedingReminder: boolean
  feedingInterval: number
  filterReminder: boolean
  filterInterval: number
  noRecordReminder: boolean
  noRecordDays: number
}

const DEFAULT_SETTINGS: SettingsState = {
  waterChangeReminder: true,
  waterChangeInterval: 7,
  feedingReminder: true,
  feedingInterval: 1,
  filterReminder: true,
  filterInterval: 30,
  noRecordReminder: true,
  noRecordDays: 3
}

export const useSettingsStore = defineStore('settings', () => {
  // state
  const waterChangeReminder = ref(DEFAULT_SETTINGS.waterChangeReminder)
  const waterChangeInterval = ref(DEFAULT_SETTINGS.waterChangeInterval)
  const feedingReminder = ref(DEFAULT_SETTINGS.feedingReminder)
  const feedingInterval = ref(DEFAULT_SETTINGS.feedingInterval)
  const filterReminder = ref(DEFAULT_SETTINGS.filterReminder)
  const filterInterval = ref(DEFAULT_SETTINGS.filterInterval)
  const noRecordReminder = ref(DEFAULT_SETTINGS.noRecordReminder)
  const noRecordDays = ref(DEFAULT_SETTINGS.noRecordDays)

  // actions
  function updateSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    switch (key) {
      case 'waterChangeReminder': waterChangeReminder.value = value as boolean; break
      case 'waterChangeInterval': waterChangeInterval.value = value as number; break
      case 'feedingReminder': feedingReminder.value = value as boolean; break
      case 'feedingInterval': feedingInterval.value = value as number; break
      case 'filterReminder': filterReminder.value = value as boolean; break
      case 'filterInterval': filterInterval.value = value as number; break
      case 'noRecordReminder': noRecordReminder.value = value as boolean; break
      case 'noRecordDays': noRecordDays.value = value as number; break
    }
    persist()
  }

  function resetDefaults() {
    waterChangeReminder.value = DEFAULT_SETTINGS.waterChangeReminder
    waterChangeInterval.value = DEFAULT_SETTINGS.waterChangeInterval
    feedingReminder.value = DEFAULT_SETTINGS.feedingReminder
    feedingInterval.value = DEFAULT_SETTINGS.feedingInterval
    filterReminder.value = DEFAULT_SETTINGS.filterReminder
    filterInterval.value = DEFAULT_SETTINGS.filterInterval
    noRecordReminder.value = DEFAULT_SETTINGS.noRecordReminder
    noRecordDays.value = DEFAULT_SETTINGS.noRecordDays
    persist()
  }

  function persist() {
    const state: SettingsState = {
      waterChangeReminder: waterChangeReminder.value,
      waterChangeInterval: waterChangeInterval.value,
      feedingReminder: feedingReminder.value,
      feedingInterval: feedingInterval.value,
      filterReminder: filterReminder.value,
      filterInterval: filterInterval.value,
      noRecordReminder: noRecordReminder.value,
      noRecordDays: noRecordDays.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('[settings store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as SettingsState | undefined
      if (stored) {
        waterChangeReminder.value = stored.waterChangeReminder ?? DEFAULT_SETTINGS.waterChangeReminder
        waterChangeInterval.value = stored.waterChangeInterval ?? DEFAULT_SETTINGS.waterChangeInterval
        feedingReminder.value = stored.feedingReminder ?? DEFAULT_SETTINGS.feedingReminder
        feedingInterval.value = stored.feedingInterval ?? DEFAULT_SETTINGS.feedingInterval
        filterReminder.value = stored.filterReminder ?? DEFAULT_SETTINGS.filterReminder
        filterInterval.value = stored.filterInterval ?? DEFAULT_SETTINGS.filterInterval
        noRecordReminder.value = stored.noRecordReminder ?? DEFAULT_SETTINGS.noRecordReminder
        noRecordDays.value = stored.noRecordDays ?? DEFAULT_SETTINGS.noRecordDays
      }
    } catch (e) {
      console.error('[settings store] init error:', e)
    }
  }

  return {
    waterChangeReminder,
    waterChangeInterval,
    feedingReminder,
    feedingInterval,
    filterReminder,
    filterInterval,
    noRecordReminder,
    noRecordDays,
    updateSetting,
    resetDefaults,
    init,
    persist
  }
})
