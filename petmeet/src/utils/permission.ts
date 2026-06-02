/**
 * 请求相机权限
 */
export async function requestCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 请求位置权限
 */
export async function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

// #ifdef APP-HARMONY
/**
 * 鸿蒙端特殊权限请求：NFC
 * 使用鸿蒙 abilityAccessCtrl API
 */
export async function requestNFCPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        const permission = 'ohos.permission.NFC'
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: [permission],
          success: (result: any) => {
            resolve(result.authResults?.[0] === 0)
          },
          fail: () => resolve(false)
        })
      } else {
        // 降级使用 uni.authorize
        uni.authorize({
          scope: 'scope.nfc',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      }
    } catch (e) {
      console.error('requestNFCPermission error:', e)
      resolve(false)
    }
  })
}
// #endif

/**
 * 检查权限状态
 * @param permName 权限名称，如 scope.camera、scope.userLocation
 */
export function checkPermission(permName: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const authSetting = res.authSetting as Record<string, boolean>
        resolve(authSetting[permName] === true)
      },
      fail: () => resolve(false)
    })
  })
}
