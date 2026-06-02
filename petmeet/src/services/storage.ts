const QUALITY = 80

function getFileName(filePath: string): string {
  const arr = filePath.split('/')
  return arr[arr.length - 1] || `${Date.now()}.jpg`
}

function getSavedPath(fileName: string): string {
  // #ifdef APP-HARMONY
  return `internal://files/petmeet/images/${fileName}`
  // #endif
  return `${uni.env.USER_DATA_PATH}/petmeet/images/${fileName}`
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

export async function chooseImage(count = 1): Promise<string[]> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths as string[])
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '选择图片失败'))
      }
    })
  })
}

export async function compressImage(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.compressImage({
      src: filePath,
      quality: QUALITY,
      success: (res) => {
        resolve(res.tempFilePath)
      },
      fail: (err) => {
        // 压缩失败则返回原图
        console.warn('压缩图片失败，使用原图:', err)
        resolve(filePath)
      }
    })
  })
}

export async function saveImage(filePath: string): Promise<string> {
  const fileName = getFileName(filePath)
  const savedPath = getSavedPath(fileName)

  // 确保目录存在
  const dirPath = savedPath.substring(0, savedPath.lastIndexOf('/'))
  await ensureDir(dirPath)

  return new Promise((resolve, reject) => {
    uni.getFileSystemManager().copyFile({
      srcPath: filePath,
      destPath: savedPath,
      success: () => {
        resolve(savedPath)
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '保存图片失败'))
      }
    })
  })
}

// #ifdef APP-HARMONY
export async function uploadToCloud(filePath: string): Promise<string> {
  // 鸿蒙端 Cloud Storage 上传占位实现
  // 实际接入时需要替换为真实的 Cloud Storage SDK
  console.warn('鸿蒙 Cloud Storage 上传未接入，保存到本地')
  return saveImage(filePath)
}
// #endif

export async function processImages(filePaths: string[]): Promise<string[]> {
  const results: string[] = []
  for (const path of filePaths) {
    try {
      const compressed = await compressImage(path)
      const saved = await saveImage(compressed)
      results.push(saved)
    } catch (e) {
      console.error('处理图片失败:', e)
    }
  }
  return results
}
