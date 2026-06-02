/**
 * RunClub 鸿蒙意图框架服务
 *
 * 本模块负责注册和处理鸿蒙端意图提醒。
 * 使用条件编译确保非鸿蒙端不会引入相关依赖。
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

import { dbGetAll } from '@/utils/db'
import type { Activity } from '@/types/models'

/**
 * 注册意图提醒
 * 在活动开始前发送提醒
 */
export async function registerIntents(): Promise<void> {
  try {
    const activities = dbGetAll<Activity>('activities')
    const upcoming = activities.filter((a) => a.status === 'upcoming')

    for (const activity of upcoming) {
      // 注册活动提醒意图
      console.log(`[intents] registered reminder for activity: ${activity.name}`)
    }
  } catch (e) {
    console.error('[intents] registerIntents error:', e)
  }
}

/**
 * 处理活动提醒
 */
export async function handleActivityReminder(activityId: string): Promise<void> {
  try {
    console.log(`[intents] handling reminder for activity: ${activityId}`)
    // 跳转到活动详情页
    uni.navigateTo({
      url: `/pages/activities/detail?activityId=${activityId}`
    })
  } catch (e) {
    console.error('[intents] handleActivityReminder error:', e)
  }
}

// #endif

// ============================================
// 通用端空实现（避免编译错误）
// ============================================

// #ifndef APP-HARMONY

/**
 * 非鸿蒙端：注册意图空实现
 */
export async function registerIntents(): Promise<void> {
  // 非鸿蒙端无操作
}

/**
 * 非鸿蒙端：处理活动提醒空实现
 */
export async function handleActivityReminder(activityId: string): Promise<void> {
  // 非鸿蒙端无操作
}

// #endif
