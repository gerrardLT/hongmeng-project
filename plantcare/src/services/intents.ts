/**
 * PlantCare 鸿蒙意图框架服务
 *
 * 本模块负责注册和处理鸿蒙端意图提醒。
 * 使用条件编译确保非鸿蒙端不会引入相关依赖。
 * 场景：到达花市推荐查看植物百科
 */

// ============================================
// 鸿蒙端实现（APP-HARMONY）
// ============================================

// #ifdef APP-HARMONY

/**
 * 注册意图提醒
 * 场景：基于位置到达花卉市场时，推荐查看植物百科
 */
export async function registerIntents(): Promise<void> {
  try {
    // 注册花市位置意图
    console.log('[intents] registered location-based intent: flower market nearby')
    // 预留：接入鸿蒙意图框架 API
  } catch (e) {
    console.error('[intents] registerIntents error:', e)
  }
}

/**
 * 处理意图跳转
 */
export async function handleIntent(intent: string): Promise<void> {
  try {
    console.log(`[intents] handling intent: ${intent}`)

    switch (intent) {
      case 'flower_market':
        // 跳转到植物百科页面
        uni.navigateTo({
          url: '/pages/wiki/index'
        })
        break
      case 'water_reminder':
        // 跳转到提醒页面
        uni.navigateTo({
          url: '/pages/reminder/index'
        })
        break
      default:
        console.warn(`[intents] unknown intent: ${intent}`)
    }
  } catch (e) {
    console.error('[intents] handleIntent error:', e)
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
 * 非鸿蒙端：处理意图空实现
 */
export async function handleIntent(intent: string): Promise<void> {
  // 非鸿蒙端无操作
}

// #endif
