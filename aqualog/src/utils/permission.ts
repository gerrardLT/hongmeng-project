/**
 * 权限请求工具 — 相机/存储权限 + 鸿蒙端条件编译
 */

/**
 * 请求存储/相册权限
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

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：请求通知权限
 */
export async function requestNotificationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        const permission = 'ohos.permission.NOTIFICATION'
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
      console.error('requestNotificationPermission error:', e)
      resolve(false)
    }
  })
}
// #endif

// #ifndef APP-HARMONY
/**
 * 非鸿蒙端：通知权限请求降级
 */
export async function requestNotificationPermission(): Promise<boolean> {
  return Promise.resolve(false)
}
// #endif

/**
 * 检查权限状态
 * @param permName 权限名称，如 scope.camera、scope.writePhotosAlbum
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
