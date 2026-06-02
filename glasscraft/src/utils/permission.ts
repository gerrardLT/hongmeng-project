/**
 * 检查权限状态
 * @param scope 权限名称，如 scope.camera、scope.userLocation
 * @returns 是否已授权
 */
export function checkPermission(scope: string): Promise<boolean> {
  return new Promise((resolve) => {
    uni.getSetting({
      success: (res) => {
        const authSetting = res.authSetting as unknown as Record<string, boolean>
        resolve(authSetting[scope] === true)
      },
      fail: () => resolve(false)
    })
  })
}

// #ifdef APP-HARMONY
/**
 * 鸿蒙端请求相机权限
 * @returns 是否授权成功
 */
async function requestHarmonyCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: ['ohos.permission.CAMERA'],
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
 * 鸿蒙端请求位置权限
 * @returns 是否授权成功
 */
async function requestHarmonyLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: ['ohos.permission.LOCATION', 'ohos.permission.APPROXIMATELY_LOCATION'],
          success: (result: any) => {
            resolve(result.authResults?.[0] === 0)
          },
          fail: () => resolve(false)
        })
      } else {
        uni.authorize({
          scope: 'scope.userLocation',
          success: () => resolve(true),
          fail: () => resolve(false)
        })
      }
    } catch (e) {
      console.error('requestHarmonyLocationPermission error:', e)
      resolve(false)
    }
  })
}

/**
 * 鸿蒙端请求存储权限
 * @returns 是否授权成功
 */
async function requestHarmonyStoragePermission(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore 鸿蒙原生 API
      if (typeof abilityAccessCtrl !== 'undefined') {
        // @ts-ignore
        const atManager = abilityAccessCtrl.createAtManager()
        // @ts-ignore
        atManager.requestPermissionsFromUser({
          permissions: ['ohos.permission.WRITE_MEDIA', 'ohos.permission.READ_MEDIA'],
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
 * 请求相机权限（跨平台）
 * @returns 是否授权成功
 */
export async function requestCameraPermission(): Promise<boolean> {
  // #ifdef APP-HARMONY
  return requestHarmonyCameraPermission()
  // #endif

  // #ifndef APP-HARMONY
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
  // #endif
}

/**
 * 请求位置权限（跨平台）
 * @returns 是否授权成功
 */
export async function requestLocationPermission(): Promise<boolean> {
  // #ifdef APP-HARMONY
  return requestHarmonyLocationPermission()
  // #endif

  // #ifndef APP-HARMONY
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
  // #endif
}

/**
 * 请求存储/相册权限（跨平台）
 * @returns 是否授权成功
 */
export async function requestStoragePermission(): Promise<boolean> {
  // #ifdef APP-HARMONY
  return requestHarmonyStoragePermission()
  // #endif

  // #ifndef APP-HARMONY
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
  // #endif
}
