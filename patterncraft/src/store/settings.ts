import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CustomColor, UserSettings } from '@/types/models'
import { generateId } from '@/utils/db'

const STORAGE_KEY = 'patterncraft_settings'

const DEFAULT_SETTINGS: UserSettings = {
  cloudSyncEnabled: false,
  customColors: []
}

export const useSettingsStore = defineStore('settings', () => {
  // state
  const cloudSyncEnabled = ref<boolean>(DEFAULT_SETTINGS.cloudSyncEnabled)
  const customColors = ref<CustomColor[]>([...DEFAULT_SETTINGS.customColors])

  /**
   * 持久化设置到本地存储
   */
  function persist() {
    const settings: UserSettings = {
      cloudSyncEnabled: cloudSyncEnabled.value,
      customColors: customColors.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, settings)
    } catch (e) {
      console.error('persist settings error:', e)
    }
  }

  /**
   * 从本地存储恢复设置状态
   */
  function init() {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY) as UserSettings | undefined
      if (saved) {
        cloudSyncEnabled.value = saved.cloudSyncEnabled ?? DEFAULT_SETTINGS.cloudSyncEnabled
        customColors.value = saved.customColors ?? [...DEFAULT_SETTINGS.customColors]
      }
    } catch (e) {
      console.error('init settings error:', e)
    }
  }

  /**
   * 切换云同步开关
   */
  function toggleCloudSync() {
    cloudSyncEnabled.value = !cloudSyncEnabled.value
    persist()
  }

  /**
   * 添加自定义颜色
   * @param color 颜色数据（不含 colorId 和 createdAt）
   */
  function addCustomColor(color: Omit<CustomColor, 'colorId' | 'createdAt'>) {
    const newColor: CustomColor = {
      ...color,
      colorId: generateId(),
      createdAt: Date.now()
    }
    customColors.value.push(newColor)
    persist()
    return newColor
  }

  /**
   * 更新自定义颜色
   * @param color 更新后的颜色对象
   */
  function updateCustomColor(color: CustomColor) {
    const index = customColors.value.findIndex(c => c.colorId === color.colorId)
    if (index !== -1) {
      customColors.value[index] = color
      persist()
    }
  }

  /**
   * 删除自定义颜色
   * @param colorId 颜色ID
   */
  function deleteCustomColor(colorId: string) {
    customColors.value = customColors.value.filter(c => c.colorId !== colorId)
    persist()
  }

  return {
    cloudSyncEnabled,
    customColors,
    init,
    toggleCloudSync,
    addCustomColor,
    updateCustomColor,
    deleteCustomColor
  }
})
