import { dbQuery, dbGet } from '@/utils/db'
import type { User, Booking, SealCollection, Progress } from '@/types/models'

export interface ExportData {
  exportTime: string
  appVersion: string
  userData: {
    profile: User | null
    bookings: Booking[]
    collections: SealCollection[]
    progressRecords: Progress[]
  }
}

/**
 * 导出用户的所有个人数据
 * 符合GDPR和隐私法规的数据可携带权
 */
export async function exportUserData(userId: string): Promise<ExportData> {
  // 1. 获取用户基本信息
  const profile = dbGet<User>('users', userId)

  // 2. 获取所有预约记录
  const bookings = dbQuery<Booking>('bookings', (b) => b.userId === userId)

  // 3. 获取所有印章收藏
  const collections = dbQuery<SealCollection>('collections', (c) => c.userId === userId)

  // 4. 获取所有制作进度
  const bookingIds = bookings.map((b) => b.bookingId)
  const progressRecords = dbQuery<Progress>('progresses', (p) => bookingIds.includes(p.bookingId))

  // 5. 组装为 ExportData 结构
  const exportData: ExportData = {
    exportTime: new Date().toISOString(),
    appVersion: '1.0.0',
    userData: {
      profile,
      bookings,
      collections,
      progressRecords
    }
  }

  // 6. 返回完整数据对象
  return exportData
}

/**
 * 将导出数据保存为JSON文件到用户设备
 */
export async function saveExportFile(data: ExportData): Promise<string> {
  const jsonStr = JSON.stringify(data, null, 2)
  const fileName = `sealcraft_data_${new Date().toISOString().slice(0, 10)}.json`

  // #ifdef H5
  // H5端：创建Blob下载
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
  return fileName
  // #endif

  // #ifndef H5
  // App端/鸿蒙端：写入文件系统
  return new Promise((resolve, reject) => {
    const fs = uni.getFileSystemManager()
    const tempPath = `${uni.env.USER_DATA_PATH}/${fileName}`

    fs.writeFile({
      filePath: tempPath,
      data: jsonStr,
      encoding: 'utf-8',
      success: () => {
        uni.saveFile({
          tempFilePath: tempPath,
          success: (res) => {
            resolve(res.savedFilePath)
          },
          fail: () => {
            // 如果 saveFile 失败，返回临时路径
            resolve(tempPath)
          }
        })
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '文件写入失败'))
      }
    })
  })
  // #endif
}
