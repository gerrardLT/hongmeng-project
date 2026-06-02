/**
 * PlantCare 提醒状态管理
 * 管理养护提醒、全局提醒设置
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Plant, CareType } from '@/types/models'
import { formatDate } from '@/utils/format'

const STORAGE_KEY = 'plantcare_reminders'

export interface ReminderItem {
  plantId: string
  plantName: string
  photoUrl: string
  careType: CareType
  dueDate: string
  done: boolean
}

interface GlobalReminderSettings {
  defaultWaterInterval: number
  defaultFertilizeInterval: number
  reminderTime: string           // 每日提醒时间，如 "08:00"
  enableNotification: boolean
}

export const useReminderStore = defineStore('reminder', () => {
  // state
  const reminders = ref<ReminderItem[]>([])
  const globalSettings = ref<GlobalReminderSettings>({
    defaultWaterInterval: 3,
    defaultFertilizeInterval: 14,
    reminderTime: '08:00',
    enableNotification: true
  })

  // getters
  const todayReminders = computed(() => {
    const today = formatDate(Date.now())
    return reminders.value.filter((r) => r.dueDate <= today && !r.done)
  })

  const upcomingReminders = computed(() => {
    const today = formatDate(Date.now())
    return reminders.value
      .filter((r) => r.dueDate > today && !r.done)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  })

  // actions
  function updateReminderSettings(settings: Partial<GlobalReminderSettings>) {
    globalSettings.value = { ...globalSettings.value, ...settings }
    persist()
  }

  function markReminderDone(plantId: string, careType: CareType) {
    const reminder = reminders.value.find(
      (r) => r.plantId === plantId && r.careType === careType && !r.done
    )
    if (reminder) {
      reminder.done = true
      persist()
    }
  }

  function setReminders(items: ReminderItem[]) {
    reminders.value = items
    persist()
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        reminders: reminders.value,
        globalSettings: globalSettings.value
      })
    } catch (e) {
      console.error('[reminder store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as {
        reminders?: ReminderItem[]
        globalSettings?: GlobalReminderSettings
      } | undefined

      if (stored) {
        if (stored.reminders) reminders.value = stored.reminders
        if (stored.globalSettings) globalSettings.value = { ...globalSettings.value, ...stored.globalSettings }
      }
    } catch (e) {
      console.error('[reminder store] init error:', e)
    }
  }

  return {
    reminders,
    globalSettings,
    todayReminders,
    upcomingReminders,
    updateReminderSettings,
    markReminderDone,
    setReminders,
    init,
    persist
  }
})
