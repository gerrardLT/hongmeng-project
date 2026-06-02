import { requestCameraPermission, requestStoragePermission } from '@/utils/permission'

const MAX_SIZE = 500 * 1024 // 500KB
const QUALITY = 80

function getFileName(filePath: string): string {
  const arr = filePath.split('/')
  return arr[arr.length - 1] || `${Date.now()}.jpg`
}

function getSavedPath(fileName: string): string {
  // #ifdef APP-HARMONY
  return `internal://files/glasscraft/images/${fileName}`
  // #endif
  // #ifndef APP-HARMONY
  return `${(uni as any).env.USER_DATA_PATH}/glasscraft/images/${fileName}`
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
 * @param filePath 图片路径
 * @param quality 压缩质量（默认80）
 * @returns 压缩后的图片路径
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
 * 保存图片到本地
 * @param tempPath 临时文件路径
 * @returns 保存后的本地路径
 */
export async function saveImage(tempPath: string): Promise<string> {
  const compressed = await compressImage(tempPath)
  const fileName = getFileName(compressed)
  const savedPath = getSavedPath(fileName)

  const dirPath = savedPath.substring(0, savedPath.lastIndexOf('/'))
  await ensureDir(dirPath)

  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().copyFile({
      srcPath: compressed,
      destPath: savedPath,
      success: () => resolve(savedPath),
      fail: (err) => reject(new Error(err.errMsg || '保存图片失败'))
    })
  })
}

/**
 * 选择图片（相机/相册）
 * @param count 选择数量（默认1，最大9）
 * @returns 选中的图片临时路径列表
 */
export async function chooseImage(count = 1): Promise<string[]> {
  const hasCameraPermission = await requestCameraPermission()
  const hasStoragePermission = await requestStoragePermission()

  if (!hasCameraPermission && !hasStoragePermission) {
    throw new Error('请授权相机或相册权限')
  }

  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: Math.min(count, 9),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : [res.tempFilePaths]
        resolve(paths)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '选择图片失败'))
      }
    })
  })
}

/**
 * 保存到系统相册
 * @param filePath 图片文件路径
 * @returns 是否保存成功
 */
export async function saveToAlbum(filePath: string): Promise<boolean> {
  const hasPermission = await requestStoragePermission()
  if (!hasPermission) {
    throw new Error('请授权相册写入权限')
  }

  return new Promise((resolve) => {
    uni.saveImageToPhotosAlbum({
      filePath,
      success: () => resolve(true),
      fail: (err) => {
        console.error('保存到相册失败:', err)
        resolve(false)
      }
    })
  })
}
