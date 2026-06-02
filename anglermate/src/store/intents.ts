import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { IntentSetting, IntentType } from '@/types/models'

const STORAGE_KEY = 'anglermate_intents'

interface IntentsStorageState {
  intentList: IntentSetting[]
}

export const useIntentsStore = defineStore('intents', () => {
  // state
  const intentList = ref<IntentSetting[]>([])

  // getters
  const enabledCount = computed(() => intentList.value.filter((i) => i.isEnabled).length)

  const arrivalIntents = computed(() => intentList.value.filter((i) => i.type === 'arrival'))

  const weatherIntents = computed(() => intentList.value.filter((i) => i.type === 'weather'))

  const tideIntents = computed(() => intentList.value.filter((i) => i.type === 'tide'))

  // 持久化到本地存储
  function persist() {
    const state: IntentsStorageState = {
      intentList: intentList.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist intents state error:', e)
    }
  }

  // actions
  function setIntentList(data: IntentSetting[]) {
    intentList.value = data
    persist()
  }

  function addIntent(intent: IntentSetting) {
    intentList.value.unshift(intent)
    persist()
  }

  function updateIntent(settingId: string, data: Partial<IntentSetting>) {
    const index = intentList.value.findIndex((i) => i.settingId === settingId)
    if (index !== -1) {
      intentList.value[index] = { ...intentList.value[index], ...data }
    }
    persist()
  }

  function removeIntent(settingId: string) {
    const index = intentList.value.findIndex((i) => i.settingId === settingId)
    if (index !== -1) {
      intentList.value.splice(index, 1)
    }
    persist()
  }

  function toggleIntent(settingId: string) {
    const intent = intentList.value.find((i) => i.settingId === settingId)
    if (intent) {
      intent.isEnabled = !intent.isEnabled
    }
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as IntentsStorageState | undefined
      if (state) {
        intentList.value = state.intentList || []
      }
    } catch (e) {
      console.error('init intents state error:', e)
    }
  }

  return {
    intentList,
    enabledCount,
    arrivalIntents,
    weatherIntents,
    tideIntents,
    setIntentList,
    addIntent,
    updateIntent,
    removeIntent,
    toggleIntent,
    init
  }
})
