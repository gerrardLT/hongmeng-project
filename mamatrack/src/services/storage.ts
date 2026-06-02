/**
 * MamaTrack 存储服务
 * 处理图片保存、数据导入导出等操作
 */
import { dbGetAll, dbSet } from '@/utils/db'

/**
 * 保存图片到本地持久化存储
 * 将临时路径的图片保存到应用持久化目录
 */
export async function saveImageToLocal(tempPath: string): Promise<string> {
  try {
    const fileName = `mamatrack_photo_${Date.now()}.jpg`

    return new Promise((resolve, reject) => {
      uni.saveFile({
        tempFilePath: tempPath,
        success: (res) => {
          resolve(res.savedFilePath)
        },
        fail: (err) => {
          // saveFile 不可用时回退到直接使用临时路径
          console.warn('[storage service] saveFile failed, using temp path:', err.errMsg)
          resolve(tempPath)
        }
      })
    })
  } catch (e) {
    console.error('[storage service] saveImageToLocal error:', e)
    throw new Error('保存图片失败')
  }
}

/**
 * 删除本地图片
 */
export async function deleteLocalImage(path: string): Promise<void> {
  try {
    return new Promise((resolve, reject) => {
      uni.getFileInfo({
        filePath: path,
        success: () => {
          uni.removeSavedFile({
            filePath: path,
            success: () => {
              resolve()
            },
            fail: (err) => {
              console.warn('[storage service] removeSavedFile failed:', err.errMsg)
              resolve()
            }
          })
        },
        fail: () => {
          // 文件不存在，无需删除
          resolve()
        }
      })
    })
  } catch (e) {
    console.error('[storage service] deleteLocalImage error:', e)
    // 删除失败不抛出异常，避免影响主流程
  }
}

/**
 * 获取本地图片路径
 */
export function getLocalImagePath(filename: string): string {
  try {
    // 返回相对路径，实际使用时由各平台解析
    return `${(uni as any).env.USER_DATA_PATH}/${filename}`
  } catch (e) {
    console.error('[storage service] getLocalImagePath error:', e)
    return filename
  }
}

/**
 * 导出数据为 JSON 字符串
 */
export async function exportData(): Promise<string> {
  try {
    const collections = ['profiles', 'weight_records', 'pregnancy_logs', 'family_shares']
    const data: Record<string, any[]> = {}
    for (const col of collections) {
      data[col] = dbGetAll(col)
    }
    return JSON.stringify(data)
  } catch (e) {
    console.error('[storage service] exportData error:', e)
    throw new Error('导出数据失败')
  }
}

/**
 * 导入数据
 */
export async function importData(jsonStr: string): Promise<void> {
  try {
    const data = JSON.parse(jsonStr) as Record<string, any[]>
    for (const [collection, items] of Object.entries(data)) {
      if (Array.isArray(items)) {
        for (const item of items) {
          // 自动查找 ID 字段（以 Id 结尾但不包括 userId 等）
          const idField = Object.keys(item).find(
            (k) => k.endsWith('Id') && k !== 'userId' && k !== 'speciesId'
          )
          if (idField) {
            dbSet(collection, item[idField], item)
          }
        }
      }
    }
  } catch (e) {
    console.error('[storage service] importData error:', e)
    throw new Error('导入数据失败')
  }
}
