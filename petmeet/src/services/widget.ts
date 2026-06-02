/**
 * PetMeet 服务卡片数据服务
 *
 * 本模块负责在业务数据变化时刷新鸿蒙负一屏服务卡片的展示内容。
 * 使用条件编译确保非鸿蒙端不会引入 UTS 相关依赖。
 *
 * 更新时机：
 * - 创建/更新宠物名片后
 * - 发布新日记后
 * - 添加新宠友后
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

import type { WidgetData } from '@/uni_modules/pet-widget/utssdk/app-harmony/index.uts'
import { dbGetAll } from '@/utils/db'
import type { Pet, Diary, Friendship } from '@/types/models'

/**
 * 从本地存储组装最新的卡片数据
 */
function buildWidgetData(): WidgetData {
  // 1. 获取当前用户主宠物信息
  const userInfo = uni.getStorageSync('userInfo') as { userId?: string } | undefined
  const userId = userInfo?.userId || 'default_user'

  const pets = dbGetAll<Pet>('pets')
  const myPets = pets.filter((p) => p.userId === userId)
  const primaryPet = myPets.length > 0 ? myPets[0] : null

  // 2. 获取最近日记摘要
  const diaries = dbGetAll<Diary>('diaries')
  const myDiaries = diaries
    .filter((d) => d.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt)
  const latestDiary = myDiaries.length > 0 ? myDiaries[0] : null
  const diarySummary = latestDiary
    ? latestDiary.content.length > 30
      ? latestDiary.content.substring(0, 30) + '...'
      : latestDiary.content
    : '还没有日记哦~'

  // 3. 获取宠友数量
  const friendships = dbGetAll<Friendship>('friendships')
  const friendCount = friendships.filter(
    (f) => f.userId === userId && f.status === 'active'
  ).length

  return {
    petName: primaryPet?.name || '我的宠物',
    petAvatar: primaryPet?.avatar || '',
    latestDiary: diarySummary,
    friendCount
  }
}

/**
 * 刷新服务卡片数据
 *
 * 在以下业务时机调用：
 * - 创建/更新宠物名片后
 * - 发布新日记后
 * - 添加新宠友后
 */
export function refreshWidget(): void {
  try {
    // 动态导入 UTS 插件，避免非鸿蒙端编译错误
    const widgetModule = require('@/uni_modules/pet-widget/utssdk/app-harmony/index.uts')

    const data = buildWidgetData()

    if (widgetModule && typeof widgetModule.updateWidget === 'function') {
      widgetModule.updateWidget(data)
      console.log('[widget service] widget refreshed:', data.petName, data.friendCount)
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
