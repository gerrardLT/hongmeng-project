/**
 * MamaTrack 家人共享服务
 * 处理家人邀请、接受邀请、共享管理等操作
 */
import type { FamilyShare } from '@/types/models'
import { useFamilyStore } from '@/store/family'
import { usePregnancyStore } from '@/store/pregnancy'
import { useUserStore } from '@/store/user'

/**
 * 邀请家人（创建邀请码）
 */
export async function inviteFamily(nickname: string): Promise<FamilyShare> {
  try {
    const familyStore = useFamilyStore()
    const pregnancyStore = usePregnancyStore()
    const userStore = useUserStore()

    const profile = pregnancyStore.currentProfile
    if (!profile) {
      throw new Error('请先创建孕期档案')
    }

    // 生成邀请码
    const inviteCode = generateShareCode()

    const share = familyStore.addShare({
      profileId: profile.profileId,
      ownerId: userStore.userId,
      familyUserId: '',
      familyNickname: nickname,
      inviteCode,
      status: 'active'
    })

    return share
  } catch (e) {
    console.error('[family service] inviteFamily error:', e)
    throw new Error('邀请家人失败')
  }
}

/**
 * 接受邀请（模拟）
 */
export async function acceptInvite(inviteCode: string): Promise<FamilyShare> {
  try {
    const familyStore = useFamilyStore()
    const pregnancyStore = usePregnancyStore()
    const userStore = useUserStore()

    const profile = pregnancyStore.currentProfile
    if (!profile) {
      throw new Error('请先创建孕期档案')
    }

    // 模拟 API 调用延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟接受邀请，创建共享记录
    const share = familyStore.addShare({
      profileId: profile.profileId,
      ownerId: '',
      familyUserId: userStore.userId,
      familyNickname: userStore.nickname || '家人',
      inviteCode,
      status: 'active'
    })

    return share
  } catch (e) {
    console.error('[family service] acceptInvite error:', e)
    throw new Error('接受邀请失败')
  }
}

/**
 * 取消共享
 */
export async function revokeShare(shareId: string): Promise<void> {
  try {
    const familyStore = useFamilyStore()
    familyStore.removeShare(shareId)
  } catch (e) {
    console.error('[family service] revokeShare error:', e)
    throw new Error('取消共享失败')
  }
}

/**
 * 获取共享列表
 */
export function getSharedFamilies(): FamilyShare[] {
  try {
    const familyStore = useFamilyStore()
    return familyStore.activeShares
  } catch (e) {
    console.error('[family service] getSharedFamilies error:', e)
    return []
  }
}

/**
 * 生成6位共享码（大写字母+数字）
 */
export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
