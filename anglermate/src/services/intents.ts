import { get, post, put, del } from '@/utils/request'
import type { IntentSetting } from '@/types/models'

/**
 * 创建意图提醒
 */
export async function createIntent(
  data: Omit<IntentSetting, 'settingId' | 'userId' | 'createdAt'>
): Promise<IntentSetting> {
  return post<IntentSetting>('/intents', data as Record<string, any>)
}

/**
 * 获取意图提醒详情
 */
export async function getIntentDetail(settingId: string): Promise<IntentSetting> {
  return get<IntentSetting>(`/intents/${settingId}`)
}

/**
 * 获取意图提醒列表
 */
export async function getIntentList(): Promise<IntentSetting[]> {
  return get<IntentSetting[]>('/intents')
}

/**
 * 更新意图提醒
 */
export async function updateIntent(settingId: string, data: Partial<IntentSetting>): Promise<IntentSetting> {
  return put<IntentSetting>(`/intents/${settingId}`, data as Record<string, any>)
}

/**
 * 删除意图提醒
 */
export async function deleteIntent(settingId: string): Promise<void> {
  return del<void>(`/intents/${settingId}`)
}

/**
 * 切换意图提醒启用状态
 */
export async function toggleIntent(settingId: string): Promise<IntentSetting> {
  return put<IntentSetting>(`/intents/${settingId}/toggle`)
}
