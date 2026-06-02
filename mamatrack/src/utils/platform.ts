/**
 * 平台检测工具
 */

let platformInfo: UniApp.GetSystemInfoResult | null = null

function getPlatformInfo(): UniApp.GetSystemInfoResult {
  if (!platformInfo) {
    platformInfo = uni.getSystemInfoSync()
  }
  return platformInfo
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): UniApp.GetSystemInfoResult {
  return getPlatformInfo()
}

/**
 * 是否鸿蒙平台
 */
export function isHarmony(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

/**
 * 是否 App 平台（含鸿蒙、安卓、iOS）
 */
export function isApp(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'app' || info.uniPlatform === 'app-harmony' || info.uniPlatform === 'app-android' || info.uniPlatform === 'app-ios'
}

/**
 * 是否 H5 平台
 */
export function isH5(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

/**
 * 是否微信小程序平台
 */
export function isWeixin(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'mp-weixin'
}

/**
 * 获取平台名称
 */
export function getPlatformName(): string {
  if (isHarmony()) return 'HarmonyOS'
  if (isH5()) return 'H5'
  if (isWeixin()) return 'Weixin'
  if (isApp()) return 'App'
  return 'Unknown'
}
