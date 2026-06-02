import type { UserSettings } from '@/types/models'

const SETTINGS_KEY = 'coloraid_settings'

/**
 * 保存用户设置到本地存储
 * @param settings 用户设置对象
 */
export function saveSettings(settings: UserSettings): void {
  try {
    uni.setStorageSync(SETTINGS_KEY, settings)
  } catch (e) {
    console.error('[storage] saveSettings error:', e)
  }
}

/**
 * 从本地存储读取用户设置
 * @returns 用户设置对象或 null
 */
export function loadSettings(): UserSettings | null {
  try {
    const data = uni.getStorageSync(SETTINGS_KEY) as UserSettings | undefined
    return data ?? null
  } catch (e) {
    console.error('[storage] loadSettings error:', e)
    return null
  }
}

/**
 * 同步设置到云端（预留接口）
 * 当前为空实现，后续可接入华为云或后端服务
 */
export async function syncToCloud(): Promise<void> {
  console.log('[storage] syncToCloud: 云端同步预留接口，当前无操作')
  return Promise.resolve()
}

/**
 * 清除 ColorAid 所有本地数据
 * 包括设置、历史记录、分析结果等
 */
export function clearAllData(): void {
  try {
    const keys = uni.getStorageInfoSync().keys
    const prefix = 'coloraid_'
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        uni.removeStorageSync(key)
      }
    }
    console.log('[storage] all coloraid data cleared')
  } catch (e) {
    console.error('[storage] clearAllData error:', e)
  }
}
