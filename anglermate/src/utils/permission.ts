/**
 * 申请定位权限
 * @returns 是否授权成功
 */
export function requestLocationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.userLocation',
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '需要定位权限',
          content: '记录钓点和获取天气需要您的位置信息，请在设置中开启定位权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting?.['scope.userLocation'])
                },
                fail: () => resolve(false)
              })
            } else {
              resolve(false)
            }
          }
        })
      }
    })
  })
}

/**
 * 申请相机权限
 * @returns 是否授权成功
 */
export function requestCameraPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.camera',
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '需要相机权限',
          content: '拍摄钓点和渔获照片需要使用相机，请在设置中开启相机权限',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting?.['scope.camera'])
                },
                fail: () => resolve(false)
              })
            } else {
              resolve(false)
            }
          }
        })
      }
    })
  })
}

/**
 * 申请存储权限（相册读写）
 * @returns 是否授权成功
 */
export function requestStoragePermission(): Promise<boolean> {
  return new Promise((resolve) => {
    uni.authorize({
      scope: 'scope.writePhotosAlbum',
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '需要存储权限',
          content: '保存照片需要存储权限，请在设置中开启',
          confirmText: '去设置',
          success: (res) => {
            if (res.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  resolve(!!settingRes.authSetting?.['scope.writePhotosAlbum'])
                },
                fail: () => resolve(false)
              })
            } else {
              resolve(false)
            }
          }
        })
      }
    })
  })
}

/**
 * 申请通知权限
 * @returns 是否授权成功
 */
export function requestNotificationPermission(): Promise<boolean> {
  return new Promise((resolve) => {
    // #ifdef APP-HARMONY
    uni.requestSubscribeMessage({
      tmplIds: [],
      success: () => resolve(true),
      fail: () => resolve(false)
    })
    // #endif

    // #ifndef APP-HARMONY
    uni.requestSubscribeMessage({
      tmplIds: [],
      success: () => resolve(true),
      fail: () => {
        uni.showModal({
          title: '需要通知权限',
          content: '意图提醒需要通知权限，请在设置中开启通知',
          confirmText: '知道了',
          showCancel: false,
          success: () => resolve(false)
        })
      }
    })
    // #endif
  })
}
