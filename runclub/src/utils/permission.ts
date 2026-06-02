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

/**
 * 鸿蒙端：请求健康数据权限
 */
export async function requestHealthPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        const permission = 'ohos.permission.READ_HEALTH_DATA'
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: [permission],
          success: (result: any) => {
            resolve(result.authResults?.[0] === 0)
          },
          fail: () => resolve(false)
        })
      } else {
        resolve(false)
      }
    } catch (e) {
      console.error('requestHealthPermission error:', e)
      resolve(false)
    }
  })
}
// #endif

// #ifndef APP-HARMONY
/**
 * 非鸿蒙端：NFC 权限请求降级
 */
export async function requestNFCPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.nfc',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 非鸿蒙端：健康数据权限请求降级
 */
export async function requestHealthPermission(): Promise<boolean> {
  return Promise.resolve(false)
}
// #endif

/**
 * 请求存储权限
 */
export async function requestStoragePermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

/**
 * 检查权限状态
 * @param permName 权限名称，如 scope.userLocation
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
