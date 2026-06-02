/**
 * MamaTrack 孕期拍照记录服务
 * 处理孕期各周拍照记录的增删查
 */
import type { PregnancyLog } from '@/types/models'
import { useRecordStore } from '@/store/record'
import { usePregnancyStore } from '@/store/pregnancy'

/**
 * 添加拍照记录，自动关联当前孕周
 */
export async function addPhotoLog(data: {
  frontPhotoUrl?: string
  sidePhotoUrl?: string
  note?: string
}): Promise<PregnancyLog> {
  try {
    const recordStore = useRecordStore()
    const pregnancyStore = usePregnancyStore()

    const profile = pregnancyStore.currentProfile
    if (!profile) {
      throw new Error('请先创建孕期档案')
    }

    // 自动计算当前孕周
    const currentWeek = pregnancyStore.currentWeek.week

    const log = recordStore.addLog({
      profileId: profile.profileId,
      week: currentWeek,
      frontPhotoUrl: data.frontPhotoUrl || '',
      sidePhotoUrl: data.sidePhotoUrl || '',
      note: data.note || ''
    })

    return log
  } catch (e) {
    console.error('[photo service] addPhotoLog error:', e)
    throw new Error('添加拍照记录失败')
  }
}

/**
 * 删除拍照记录
 */
export async function deletePhotoLog(logId: string): Promise<void> {
  try {
    const recordStore = useRecordStore()
    recordStore.deleteLog(logId)
  } catch (e) {
    console.error('[photo service] deletePhotoLog error:', e)
    throw new Error('删除拍照记录失败')
  }
}

/**
 * 获取所有拍照记录
 */
export function getPhotoLogs(): PregnancyLog[] {
  try {
    const recordStore = useRecordStore()
    return recordStore.sortedLogs
  } catch (e) {
    console.error('[photo service] getPhotoLogs error:', e)
    return []
  }
}

/**
 * 按孕周获取拍照记录
 */
export function getPhotoLogsByWeek(week: number): PregnancyLog[] {
  try {
    const recordStore = useRecordStore()
    return recordStore.getLogByWeek(week)
  } catch (e) {
    console.error('[photo service] getPhotoLogsByWeek error:', e)
    return []
  }
}

/**
 * 选择照片
 * 调用 uni.chooseImage 选择照片并返回临时路径
 */
export async function choosePhoto(): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          resolve(res.tempFilePaths[0])
        } else {
          reject(new Error('未选择照片'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '选择照片失败'))
      }
    })
  })
}
