let systemInfo: UniApp.GetSystemInfoResult | null = null

/**
 * 获取系统信息（带缓存）
 * @returns 系统信息对象
 */
export function getSystemInfo(): UniApp.GetSystemInfoResult {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync()
  }
  return systemInfo
}

/**
 * 是否鸿蒙端
 * @returns boolean
 */
export function isHarmony(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

/**
 * 是否 App 端（包含鸿蒙、Android、iOS）
 * @returns boolean
 */
export function isApp(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app' || info.uniPlatform === 'app-plus' || info.uniPlatform === 'app-harmony'
}

/**
 * 是否 Web/H5 平台
 * @returns boolean
 */
export function isWeb(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

/**
 * 获取当前平台标识
 * @returns 平台名称字符串
 */
export function getPlatform(): string {
  // #ifdef APP-HARMONY
  return 'harmony'
  // #endif
  // #ifdef APP-PLUS
  return 'app-plus'
  // #endif
  // #ifdef H5
  return 'web'
  // #endif
  // #ifdef MP-WEIXIN
  return 'mp-weixin'
  // #endif
  return getSystemInfo().uniPlatform || 'unknown'
}
