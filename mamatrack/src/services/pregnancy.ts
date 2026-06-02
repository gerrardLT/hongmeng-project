/**
 * MamaTrack 孕期档案服务
 * 处理孕期档案的创建、更新、完成等操作
 */
import type { PregnancyProfile, BMICategory } from '@/types/models'
import { usePregnancyStore } from '@/store/pregnancy'
import { useUserStore } from '@/store/user'
import { calculateBMI, getBMICategory, getRecommendedGainRange } from '@/utils/pregnancy'
import { formatDate } from '@/utils/format'

/**
 * 创建孕期档案
 * 自动计算 BMI、BMI 分类、推荐增重范围
 */
export async function createPregnancyProfile(data: {
  height: number
  preWeight: number
  dueDate: string
}): Promise<PregnancyProfile> {
  try {
    const userStore = useUserStore()
    const pregnancyStore = usePregnancyStore()

    // 计算 BMI 及分类
    const preBMI = calculateBMI(data.height, data.preWeight)
    const bmiCategory: BMICategory = getBMICategory(preBMI)
    const { min: targetGainMin, max: targetGainMax } = getRecommendedGainRange(bmiCategory)

    const profile = pregnancyStore.createProfile({
      userId: userStore.userId,
      height: data.height,
      preWeight: data.preWeight,
      preBMI,
      bmiCategory,
      dueDate: data.dueDate,
      startDate: formatDate(Date.now()),
      targetGainMin,
      targetGainMax,
      status: 'active'
    })

    return profile
  } catch (e) {
    console.error('[pregnancy service] createPregnancyProfile error:', e)
    throw new Error('创建孕期档案失败')
  }
}

/**
 * 更新孕期档案
 */
export async function updatePregnancyProfile(
  profileId: string,
  data: Partial<PregnancyProfile>
): Promise<PregnancyProfile | undefined> {
  try {
    const pregnancyStore = usePregnancyStore()

    // 如果更新了身高或孕前体重，需重新计算 BMI 相关字段
    const updateData: Partial<PregnancyProfile> = { ...data }
    const profile = pregnancyStore.currentProfile

    if (profile && (data.height || data.preWeight)) {
      const height = data.height ?? profile.height
      const preWeight = data.preWeight ?? profile.preWeight
      updateData.preBMI = calculateBMI(height, preWeight)
      updateData.bmiCategory = getBMICategory(updateData.preBMI)
      const { min, max } = getRecommendedGainRange(updateData.bmiCategory)
      updateData.targetGainMin = min
      updateData.targetGainMax = max
    }

    const updated = pregnancyStore.updateProfile(updateData)
    return updated
  } catch (e) {
    console.error('[pregnancy service] updatePregnancyProfile error:', e)
    throw new Error('更新孕期档案失败')
  }
}

/**
 * 获取孕期档案
 */
export function getPregnancyProfile(profileId: string): PregnancyProfile | null {
  try {
    const pregnancyStore = usePregnancyStore()
    if (pregnancyStore.currentProfile?.profileId === profileId) {
      return pregnancyStore.currentProfile
    }
    return null
  } catch (e) {
    console.error('[pregnancy service] getPregnancyProfile error:', e)
    return null
  }
}

/**
 * 标记孕期完成
 */
export async function completePregnancy(profileId: string): Promise<void> {
  try {
    const pregnancyStore = usePregnancyStore()
    pregnancyStore.updateProfile({
      status: 'completed'
    })
  } catch (e) {
    console.error('[pregnancy service] completePregnancy error:', e)
    throw new Error('标记完成失败')
  }
}
