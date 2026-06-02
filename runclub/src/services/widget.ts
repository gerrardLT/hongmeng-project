/**
 * RunClub 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 活动状态变更后
 * - 训练打卡后
 * - 跑步记录添加后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

import { dbGetAll, dbQuery } from '@/utils/db'
import type { Activity, TrainingPlan, RunRecord } from '@/types/models'

interface WidgetData {
  nextActivityName: string
  nextActivityTime: string
  todayTraining: string
  weeklyDistance: number
}

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  // 1. 获取最近待参加活动
  const activities = dbGetAll<Activity>('activities')
  const upcoming = activities
    .filter((a) => a.status === 'upcoming')
    .sort((a, b) => a.createdAt - b.createdAt)
  const nextActivity = upcoming.length > 0 ? upcoming[0] : null

  // 2. 获取今日训练
  const plans = dbGetAll<TrainingPlan>('training_plans')
  const activePlan = plans.find((p) => p.status === 'active')
  let todayTraining = '今日无训练'
  if (activePlan) {
    const startDate = new Date(activePlan.startDate)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
    if (diffDays >= 0 && diffDays < activePlan.schedule.length) {
      const dayPlan = activePlan.schedule[diffDays]
      todayTraining = dayPlan.description || dayPlan.type
    }
  }

  // 3. 获取本周跑量
  const records = dbGetAll<RunRecord>('records')
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const weeklyRecords = records.filter((r) => new Date(r.date) >= weekAgo)
  const weeklyDistance = weeklyRecords.reduce((sum, r) => sum + r.distance, 0)

  return {
    nextActivityName: nextActivity?.name || '暂无活动',
    nextActivityTime: nextActivity ? `${nextActivity.date} ${nextActivity.time}` : '',
    todayTraining,
    weeklyDistance: Math.round(weeklyDistance * 10) / 10
  }
}

/**
 * 刷新服务卡片数据
 */
export function refreshWidget(): void {
  try {
    const widgetModule = require('@/uni_modules/runclub-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed:', data.nextActivityName, data.weeklyDistance)
    } else {
      console.warn('[widget service] updateWidget not available')
    }
  } catch (e) {
    console.error('[widget service] refreshWidget error:', e)
  }
}

// #endif

// ============================================
// 通用端空实现（避免编译错误）
// ============================================

// #ifndef APP-HARMONY

/**
 * 非鸿蒙端空实现
 * 确保其他平台编译时不会报错
 */
export function refreshWidget(): void {
  // 非鸿蒙端无操作
  // console.log('[widget service] non-harmony platform, skip widget refresh')
}

// #endif
