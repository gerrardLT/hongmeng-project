import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ColorBlindType, FilterMode, FilterStrength, UserSettings } from '@/types/models'

const STORAGE_KEY = 'coloraid_settings'

const DEFAULT_SETTINGS: UserSettings = {
  colorBlindType: 'normal',
  filterMode: null,
  filterStrength: 5,
  voiceEnabled: true,
  voiceVolume: 80,
  autoFilter: false
}

/**
 * 根据色盲类型推荐滤镜模式
 * @param type 色盲类型
 * @returns 推荐的滤镜模式或 null
 */
function getRecommendedFilter(type: ColorBlindType): FilterMode | null {
  switch (type) {
    case 'protanopia':
      return 'protanopia'
    case 'deuteranopia':
      return 'deuteranopia'
    case 'tritanopia':
      return 'tritanopia'
    case 'achromatopsia':
      return 'achromatopsia'
    case 'normal':
    default:
      return null
  }
}

export const useSettingsStore = defineStore('settings', () => {
  // state
  const colorBlindType = ref<ColorBlindType>(DEFAULT_SETTINGS.colorBlindType)
  const filterMode = ref<FilterMode | null>(DEFAULT_SETTINGS.filterMode)
  const filterStrength = ref<FilterStrength>(DEFAULT_SETTINGS.filterStrength)
  const voiceEnabled = ref<boolean>(DEFAULT_SETTINGS.voiceEnabled)
  const voiceVolume = ref<number>(DEFAULT_SETTINGS.voiceVolume)
  const autoFilter = ref<boolean>(DEFAULT_SETTINGS.autoFilter)

  /**
   * 持久化设置到本地存储
   */
  function persist() {
    const settings: UserSettings = {
      colorBlindType: colorBlindType.value,
      filterMode: filterMode.value,
      filterStrength: filterStrength.value,
      voiceEnabled: voiceEnabled.value,
      voiceVolume: voiceVolume.value,
      autoFilter: autoFilter.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, settings)
    } catch (e) {
      console.error('persist settings error:', e)
    }
  }

  // 监听所有设置变更并自动持久化
  watch(
    [colorBlindType, filterMode, filterStrength, voiceEnabled, voiceVolume, autoFilter],
    () => {
      persist()
    },
    { deep: true }
  )

  /**
   * 设置色盲类型，同时自动推荐滤镜模式
   * @param type 色盲类型
   */
  function setColorBlindType(type: ColorBlindType) {
    colorBlindType.value = type
    filterMode.value = getRecommendedFilter(type)
    persist()
  }

  /**
   * 设置滤镜模式
   * @param mode 滤镜模式或 null
   */
  function setFilterMode(mode: FilterMode | null) {
    filterMode.value = mode
    persist()
  }

  /**
   * 设置滤镜强度
   * @param strength 强度值 1-10
   */
  function setFilterStrength(strength: FilterStrength) {
    filterStrength.value = strength
    persist()
  }

  /**
   * 设置是否启用语音播报
   * @param enabled 是否启用
   */
  function setVoiceEnabled(enabled: boolean) {
    voiceEnabled.value = enabled
    persist()
  }

  /**
   * 设置语音音量
   * @param volume 音量值 0-100
   */
  function setVoiceVolume(volume: number) {
    voiceVolume.value = Math.max(0, Math.min(100, volume))
    persist()
  }

  /**
   * 设置是否自动启用滤镜
   * @param auto 是否自动
   */
  function setAutoFilter(auto: boolean) {
    autoFilter.value = auto
    persist()
  }

  /**
   * 获取完整设置对象
   * @returns 当前用户设置
   */
  function getSettings(): UserSettings {
    return {
      colorBlindType: colorBlindType.value,
      filterMode: filterMode.value,
      filterStrength: filterStrength.value,
      voiceEnabled: voiceEnabled.value,
      voiceVolume: voiceVolume.value,
      autoFilter: autoFilter.value
    }
  }

  /**
   * 从本地存储恢复设置状态
   */
  function init() {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY) as UserSettings | undefined
      if (saved) {
        colorBlindType.value = saved.colorBlindType ?? DEFAULT_SETTINGS.colorBlindType
        filterMode.value = saved.filterMode ?? DEFAULT_SETTINGS.filterMode
        filterStrength.value = saved.filterStrength ?? DEFAULT_SETTINGS.filterStrength
        voiceEnabled.value = saved.voiceEnabled ?? DEFAULT_SETTINGS.voiceEnabled
        voiceVolume.value = saved.voiceVolume ?? DEFAULT_SETTINGS.voiceVolume
        autoFilter.value = saved.autoFilter ?? DEFAULT_SETTINGS.autoFilter
      }
    } catch (e) {
      console.error('init settings error:', e)
    }
  }

  /**
   * 重置所有设置为默认值
   */
  function reset() {
    colorBlindType.value = DEFAULT_SETTINGS.colorBlindType
    filterMode.value = DEFAULT_SETTINGS.filterMode
    filterStrength.value = DEFAULT_SETTINGS.filterStrength
    voiceEnabled.value = DEFAULT_SETTINGS.voiceEnabled
    voiceVolume.value = DEFAULT_SETTINGS.voiceVolume
    autoFilter.value = DEFAULT_SETTINGS.autoFilter
    persist()
  }

  return {
    colorBlindType,
    filterMode,
    filterStrength,
    voiceEnabled,
    voiceVolume,
    autoFilter,
    setColorBlindType,
    setFilterMode,
    setFilterStrength,
    setVoiceEnabled,
    setVoiceVolume,
    setAutoFilter,
    getRecommendedFilter,
    getSettings,
    init,
    reset
  }
})
