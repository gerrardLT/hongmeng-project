/** 是否鸿蒙平台 */
export function isHarmony(): boolean {
  let result = false
  // #ifdef APP-HARMONY
  result = true
  // #endif
  return result
}

/** 是否安卓平台 */
export function isAndroid(): boolean {
  let result = false
  // #ifdef APP-ANDROID
  result = true
  // #endif
  return result
}

/** 是否 iOS 平台 */
export function isIOS(): boolean {
  let result = false
  // #ifdef APP-IOS
  result = true
  // #endif
  return result
}

/** 是否 H5 平台 */
export function isH5(): boolean {
  let result = false
  // #ifdef H5
  result = true
  // #endif
  return result
}

/** 是否 App 平台（含鸿蒙、安卓、iOS） */
export function isApp(): boolean {
  let result = false
  // #ifdef APP
  result = true
  // #endif
  return result
}
