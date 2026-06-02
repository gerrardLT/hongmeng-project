const MAX_SIZE = 500 * 1024 // 500KB
const QUALITY = 80

function getFileName(filePath: string): string {
  const arr = filePath.split('/')
  return arr[arr.length - 1] || `${Date.now()}.jpg`
}

function getSavedPath(fileName: string): string {
  // #ifdef APP-HARMONY
  return `internal://files/anglermate/images/${fileName}`
  // #endif
  // #ifndef APP-HARMONY
  return `${uni.env.USER_DATA_PATH}/anglermate/images/${fileName}`
  // #endif
}

function ensureDir(dirPath: string): Promise<void> {
  return new Promise((resolve) => {
    const fs = uni.getFileSystemManager()
    fs.access({
      path: dirPath,
      success: () => resolve(),
      fail: () => {
        fs.mkdir({
          dirPath,
          recursive: true,
          success: () => resolve(),
          fail: () => resolve()
        })
      }
    })
  })
}

/**
 * 压缩图片（≤500KB/张）
 */
export async function compressImage(filePath: string, quality?: number): Promise<string> {
  return new Promise((resolve) => {
    uni.getFileInfo({
      filePath,
      success: (info) => {
        if (info.size <= MAX_SIZE) {
          resolve(filePath)
          return
        }
        uni.compressImage({
          src: filePath,
          quality: quality || QUALITY,
          success: (res) => {
            resolve(res.tempFilePath)
          },
          fail: () => {
            console.warn('压缩图片失败，使用原图')
            resolve(filePath)
          }
        })
      },
      fail: () => {
        // 无法获取文件信息，直接压缩
        uni.compressImage({
          src: filePath,
          quality: quality || QUALITY,
          success: (res) => {
            resolve(res.tempFilePath)
          },
          fail: () => {
            resolve(filePath)
          }
        })
      }
    })
  })
}

/**
 * 上传单张图片，返回云端 URL
 */
export async function uploadImage(filePath: string): Promise<string> {
  // 上传前先压缩
  const compressed = await compressImage(filePath)
  const fileName = getFileName(compressed)
  const savedPath = getSavedPath(fileName)

  // 确保目录存在
  const dirPath = savedPath.substring(0, savedPath.lastIndexOf('/'))
  await ensureDir(dirPath)

  // #ifdef APP-HARMONY
  // 鸿蒙端：使用 Cloud Storage 上传
  console.warn('鸿蒙 Cloud Storage 上传占位实现，保存到本地')
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().copyFile({
      srcPath: compressed,
      destPath: savedPath,
      success: () => resolve(savedPath),
      fail: (err) => reject(new Error(err.errMsg || '保存图片失败'))
    })
  })
  // #endif

  // #ifndef APP-HARMONY
  // 通用端：保存到本地文件系统
  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().copyFile({
      srcPath: compressed,
      destPath: savedPath,
      success: () => resolve(savedPath),
      fail: (err) => reject(new Error(err.errMsg || '保存图片失败'))
    })
  })
  // #endif
}

/**
 * 批量上传图片
 */
export async function uploadImages(filePaths: string[]): Promise<string[]> {
  const results: string[] = []
  for (const path of filePaths) {
    try {
      const url = await uploadImage(path)
      results.push(url)
    } catch (e) {
      console.error('上传图片失败:', e)
    }
  }
  return results
}

/**
 * 删除图片
 */
export async function deleteImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      uni.getFileSystemManager().unlink({
        filePath: url,
        success: () => resolve(),
        fail: () => resolve()
      })
    } catch (e) {
      console.error('删除图片失败:', e)
      resolve()
    }
  })
}
