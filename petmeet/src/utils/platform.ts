let platformInfo: UniApp.GetSystemInfoResult | null = null

function getPlatformInfo(): UniApp.GetSystemInfoResult {
  if (!platformInfo) {
    platformInfo = uni.getSystemInfoSync()
  }
  return platformInfo
}

export function isHarmony(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'app-harmony' || info.osName === 'harmony'
}

export function isAndroid(): boolean {
  const info = getPlatformInfo()
  return info.osName === 'android'
}

export function isIOS(): boolean {
  const info = getPlatformInfo()
  return info.osName === 'ios'
}

export function isH5(): boolean {
  const info = getPlatformInfo()
  return info.uniPlatform === 'web' || info.platform === 'web'
}

export function getPlatformName(): string {
  if (isHarmony()) return 'HarmonyOS'
  if (isAndroid()) return 'Android'
  if (isIOS()) return 'iOS'
  if (isH5()) return 'H5'
  return 'Unknown'
}
