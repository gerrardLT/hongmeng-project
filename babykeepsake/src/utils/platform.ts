let platformInfo: UniApp.GetSystemInfoResult | null = null

/**
 * 获取平台信息（带缓存）
 * @returns 系统信息
 */
function getPlatformInfo(): UniApp.GetSystemInfoResult {
  if (!platformInfo) {
    platformInfo = uni.getSystemInfoSync()
  }
  return platformInfo
}

/**
 * 是否为鸿蒙平台
 * @returns boolean
 */
export function isHarmony(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

/**
 * 是否为 H5 平台
 * @returns boolean
 */
export function isH5(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

/**
 * 是否为小程序平台
 * @returns boolean
 */
export function isMP(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'mp-weixin' || info.uniPlatform === 'mp-alipay' || info.uniPlatform === 'mp'
}

/**
 * 是否为 App 平台
 * @returns boolean
 */
export function isApp(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'app' || info.uniPlatform === 'app-plus' || info.uniPlatform === 'app-harmony'
}

/**
 * 获取当前平台名称
 * @returns 平台名称字符串
 */
export function getPlatform(): string {
  if (isHarmony()) return 'HarmonyOS'
  if (isApp()) return 'App'
  if (isMP()) return 'MiniProgram'
  if (isH5()) return 'H5'
  return 'Unknown'
}
