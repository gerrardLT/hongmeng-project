/**
 * AquaLog 照片存储服务
 * 选择/拍摄照片、压缩、保存到本地
 */

/**
 * 选择或拍摄照片
 */
export function chooseImage(count: number = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths)
      },
      fail: (err) => {
        if (err.errMsg?.includes('cancel')) {
          resolve([])
        } else {
          reject(new Error(err.errMsg || '选择图片失败'))
        }
      }
    })
  })
}

/**
 * 压缩图片
 */
export function compressImage(path: string, quality: number = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-HARMONY
    uni.compressImage({
      src: path,
      quality,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (err) => {
        console.warn('[storage] compress failed, using original:', err)
        resolve(path)
      }
    })
    // #endif

    // #ifndef APP-HARMONY
    uni.compressImage({
      src: path,
      quality,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: () => {
        // 压缩失败时返回原图
        resolve(path)
      }
    })
    // #endif
  })
}

/**
 * 保存图片到本地存储
 */
export function saveToLocal(tempPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName = `aqualog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`

    uni.saveFile({
      tempFilePath: tempPath,
      success: (res) => {
        resolve(res.savedFilePath)
      },
      fail: (err) => {
        console.error('[storage] saveToLocal error:', err)
        // 保存失败时返回临时路径
        resolve(tempPath)
      }
    })
  })
}

/**
 * 选择照片 + 压缩 + 保存（完整流程）
 */
export async function pickAndSavePhoto(): Promise<string> {
  const paths = await chooseImage(1)
  if (paths.length === 0) return ''

  const compressed = await compressImage(paths[0])
  const saved = await saveToLocal(compressed)
  return saved
}
