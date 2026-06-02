/**
 * 请求位置权限
 * @returns 是否授权成功
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
 * 请求相册/存储权限
 * @returns 是否授权成功
 */
export async function requestAlbumPermission(): Promise<boolean> {
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
 * @returns 是否授权成功
 */
export async function requestNotificationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.requestSubscribeMessage({
      tmplIds: [],
      success: () => resolve(true),
      fail: () => resolve(false)
    })
  })
}

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
