/**
 * 请求相机权限
 * @returns 是否授权成功
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
 * 请求存储权限
 * @returns 是否授权成功
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

// #ifdef APP-HARMONY
/**
 * 鸿蒙端特殊权限请求：相机与存储
 * 使用鸿蒙 abilityAccessCtrl API
 */
export async function requestHarmonyCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        const permission = 'ohos.permission.CAMERA'
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
          scope: 'scope.camera',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      }
    } catch (e) {
      console.error('requestHarmonyCameraPermission error:', e)
      resolve(false)
    }
  })
}

/**
 * 鸿蒙端存储权限请求
 */
export async function requestHarmonyStoragePermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        const permission = 'ohos.permission.WRITE_MEDIA'
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
          scope: 'scope.writePhotosAlbum',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      }
    } catch (e) {
      console.error('requestHarmonyStoragePermission error:', e)
      resolve(false)
    }
  })
}
// #endif

/**
 * 检查权限状态
 * @param permName 权限名称，如 scope.camera、scope.writePhotosAlbum
 * @returns 是否已授权
 */
export function checkPermission(permName: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const authSetting = (res.authSetting as unknown) as Record<string, boolean>
        resolve(authSetting[permName] === true)
      },
      fail: () => resolve(false)
    })
  })
}
