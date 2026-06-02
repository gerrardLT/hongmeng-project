let systemInfo: UniApp.GetSystemInfoResult | null = null

/**
 * 获取系统信息（带缓存）
 * @returns 系统信息
 */
export function getSystemInfo(): UniApp.GetSystemInfoResult {
  if (!systemInfo) {
    systemInfo = uni.getSystemInfoSync()
  }
  return systemInfo
}

/**
 * 是否为鸿蒙平台
 * @returns boolean
 */
export function isHarmony(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

/**
 * 是否为 H5 平台
 * @returns boolean
 */
export function isH5(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

/**
 * 是否为 App 平台
 * @returns boolean
 */
export function isApp(): boolean {
  const info = getSystemInfo()
  return info.uniPlatform === 'app' || info.uniPlatform === 'app-plus' || info.uniPlatform === 'app-harmony'
}
