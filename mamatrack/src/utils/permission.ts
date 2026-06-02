/**
 * 权限申请工具
 */

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
 * 请求通知权限
 * 鸿蒙端使用原生 API，其他平台默认返回 false
 */
export async function requestNotificationPermission(): Promise<boolean> {
  let granted = false
  // #ifdef APP-HARMONY
  granted = await new Promise<boolean>((resolve) => {
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
  // #endif
  return granted
}
