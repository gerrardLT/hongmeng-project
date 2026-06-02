import type { UserInfo } from '@/types/models'
import { useUserStore } from '@/store/user'
import { dbGet, dbSet, dbDelete, dbList, generateId } from '@/utils/db'

const USER_COLLECTION = 'users'
const AUTH_COLLECTION = 'auth'

/**
 * 获取当前登录用户 ID
 * @returns 用户 ID 或空字符串
 */
function getCurrentUserId(): string {
  const authData = uni.getStorageSync('glasscraft_auth') as { userId?: string } | undefined
  return authData?.userId || ''
}

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：华为 Account Kit 一键登录
 * 登录前必须检查隐私政策同意状态
 * @returns 用户信息和 token
 */
export async function loginWithHarmony(): Promise<{ userInfo: UserInfo; token: string }> {
  const userStore = useUserStore()

  if (!userStore.isPrivacyAgreed) {
    throw new Error('请先阅读并同意《用户协议》和《隐私政策》')
  }

  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'huawei',
      success: (res) => {
        if (res.code) {
          const userId = `hw_${res.code.slice(0, 16)}`
          let userInfo = dbGet<UserInfo>(USER_COLLECTION, userId)

          if (!userInfo) {
            userInfo = {
              userId,
              nickname: '华为用户',
              avatar: '',
              createdAt: Date.now()
            }
            dbSet(USER_COLLECTION, userId, userInfo)
          }

          const token = `token_harmony_${res.code}_${Date.now()}`
          dbSet(AUTH_COLLECTION, 'current', { userId, token })

          userStore.setUserInfo(userInfo)
          userStore.setToken(token)

          resolve({ userInfo, token })
        } else {
          reject(new Error('登录失败，未获取到授权码'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '华为账号登录失败'))
      }
    })
  })
}
// #endif

// #ifndef APP-HARMONY
/**
 * 通用端：手机号验证码登录
 * @param phone 手机号
 * @param code 验证码
 * @returns 用户信息和 token
 */
export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: UserInfo; token: string }> {
  const userStore = useUserStore()

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }
  if (!code || code.length !== 6) {
    throw new Error('请输入6位验证码')
  }

  // 模拟 API 调用延迟
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userId = `phone_${phone.slice(-4)}_${Date.now().toString(36)}`
  let userInfo = dbGet<UserInfo>(USER_COLLECTION, userId)

  if (!userInfo) {
    userInfo = {
      userId,
      nickname: `用户${phone.slice(-4)}`,
      avatar: '',
      phone,
      createdAt: Date.now()
    }
    dbSet(USER_COLLECTION, userId, userInfo)
  }

  const token = `token_phone_${phone.slice(-4)}_${Date.now()}`
  dbSet(AUTH_COLLECTION, 'current', { userId, token })

  userStore.setUserInfo(userInfo)
  userStore.setToken(token)

  return { userInfo, token }
}
// #endif

/**
 * 发送验证码（Mock 实现）
 * @param phone 手机号
 * @returns 是否发送成功
 */
export async function sendVerifyCode(phone: string): Promise<boolean> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  const verifyCode = '123456'
  dbSet('verify_codes', phone, { code: verifyCode, expireAt: Date.now() + 5 * 60 * 1000 })

  console.log(`[auth] 验证码已发送至 ${phone}（Mock: ${verifyCode}）`)
  return true
}

/**
 * 登出：清除登录态，保留用户数据
 */
export async function logout(): Promise<void> {
  const userStore = useUserStore()

  return new Promise((resolve) => {
    try {
      dbDelete(AUTH_COLLECTION, 'current')
      userStore.logout()
    } catch (e) {
      console.error('logout error:', e)
    }
    resolve()
  })
}

/**
 * 注销账户：删除用户所有数据
 */
export async function deleteAccount(): Promise<void> {
  const userId = getCurrentUserId()
  if (!userId) {
    throw new Error('当前未登录')
  }

  // 删除用户数据
  dbDelete(USER_COLLECTION, userId)

  // 删除用户相关的预约
  const bookings = dbList<{ bookingId: string; userId: string }>('bookings')
  bookings.forEach((b) => {
    if (b.userId === userId) {
      dbDelete('bookings', b.bookingId)
    }
  })

  // 删除用户相关的作品
  const artworks = dbList<{ artworkId: string; userId: string }>('artworks')
  artworks.forEach((a) => {
    if (a.userId === userId) {
      dbDelete('artworks', a.artworkId)
    }
  })

  // 清除登录态
  dbDelete(AUTH_COLLECTION, 'current')

  const userStore = useUserStore()
  userStore.logout()
}
