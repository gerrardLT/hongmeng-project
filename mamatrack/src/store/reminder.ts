/**
 * MamaTrack 提醒设置状态管理
 * 管理称重提醒、产检提醒等设置
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReminderSettings } from '@/types/models'

const STORAGE_KEY = 'mamatrack_reminder'

const DEFAULT_SETTINGS: ReminderSettings = {
  weightReminder: true,
  weightReminderTime: '08:00',
  weightReminderDays: [1, 3, 5],
  checkupReminder: true,
  nextCheckupDate: ''
}

export const useReminderStore = defineStore('reminder', () => {
  // state
  const settings = ref<ReminderSettings>({ ...DEFAULT_SETTINGS })

  // actions
  function updateSettings(partial: Partial<ReminderSettings>) {
    settings.value = { ...settings.value, ...partial }
    persist()
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        settings: settings.value
      })
    } catch (e) {
      console.error('[reminder store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as { settings?: ReminderSettings } | undefined
      if (stored?.settings) {
        settings.value = { ...DEFAULT_SETTINGS, ...stored.settings }
      }
    } catch (e) {
      console.error('[reminder store] init error:', e)
    }
  }

  return {
    settings,
    updateSettings,
    init,
    persist
  }
})
