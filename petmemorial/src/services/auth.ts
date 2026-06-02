import type { User } from '@/types/models'
import { dbGet, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

const USER_COLLECTION = 'users'
const AUTH_COLLECTION = 'auth'

/**
 * 获取当前登录用户 ID
 * @returns 用户 ID 或默认值
 */
function getCurrentUserId(): string {
  const authData = uni.getStorageSync('petmemorial_auth') as { userId?: string } | undefined
  return authData?.userId || ''
}

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：华为 Account Kit 一键登录
 * 登录前必须检查隐私政策同意状态，未同意不可初始化 SDK
 * @returns 用户信息和 token
 */
export async function loginWithHarmony(): Promise<{ userInfo: User; token: string }> {
  const privacyAgreed = uni.getStorageSync('petmemorial_privacyAgreed') as boolean | undefined
  if (!privacyAgreed) {
    throw new Error('请先阅读并同意《用户协议》和《隐私政策》')
  }

  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'huawei',
      success: (res) => {
        if (res.code) {
          const userId = `hw_${res.code.slice(0, 16)}`
          let userInfo = dbGet<User>(USER_COLLECTION, userId)

          if (!userInfo) {
            userInfo = {
              userId,
              harmonyAccountId: `hw_${res.code.slice(0, 8)}`,
              nickname: '华为用户',
              avatar: '',
              petIds: [],
              privacyAgreed: true,
              notificationEnabled: true,
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
            dbSet(USER_COLLECTION, userId, userInfo)
          }

          const token = `token_harmony_${res.code}_${Date.now()}`
          dbSet(AUTH_COLLECTION, 'current', { userId, token })

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
 * 通用端：手机号验证码登录（开发阶段使用 Mock）
 * @param phone 手机号
 * @param code 验证码
 * @returns 用户信息和 token
 */
export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: User; token: string }> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }
  if (!code || code.length !== 6) {
    throw new Error('请输入6位验证码')
  }

  // 模拟 API 调用延迟
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userId = `phone_${phone.slice(-4)}_${Date.now().toString(36)}`
  let userInfo = dbGet<User>(USER_COLLECTION, userId)

  if (!userInfo) {
    userInfo = {
      userId,
      phoneNumber: phone,
      nickname: `用户${phone.slice(-4)}`,
      avatar: '',
      petIds: [],
      privacyAgreed: true,
      notificationEnabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    dbSet(USER_COLLECTION, userId, userInfo)
  }

  const token = `token_phone_${phone.slice(-4)}_${Date.now()}`
  dbSet(AUTH_COLLECTION, 'current', { userId, token })

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

  // 模拟发送延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock: 记录验证码，实际项目中由后端发送短信
  const verifyCode = '123456'
  dbSet('verify_codes', phone, { code: verifyCode, expireAt: Date.now() + 5 * 60 * 1000 })

  console.log(`[auth] 验证码已发送至 ${phone}（Mock: ${verifyCode}）`)
  return true
}

/**
 * 登出：清除登录态，保留用户数据
 */
export async function logout(): Promise<void> {
  return new Promise((resolve) => {
    try {
      dbDelete(AUTH_COLLECTION, 'current')
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

  // 删除用户关联的所有数据
  dbDelete(USER_COLLECTION, userId)

  // 删除用户相关的预约
  const bookings = dbQuery<{ bookingId: string }>('bookings', (b) => (b as any).userId === userId)
  bookings.forEach((b) => dbDelete('bookings', (b as any).bookingId))

  // 删除用户相关的宠物档案
  const pets = dbQuery<{ petId: string }>('pets', (p) => (p as any).userId === userId)
  pets.forEach((p) => dbDelete('pets', (p as any).petId))

  // 删除用户相关的纪念日
  const anniversaries = dbQuery<{ anniversaryId: string }>('anniversaries', (a) => (a as any).userId === userId)
  anniversaries.forEach((a) => dbDelete('anniversaries', (a as any).anniversaryId))

  // 删除用户相关的进度
  const progresses = dbQuery<{ progressId: string }>('progresses', (p) => {
    const booking = dbGet<{ bookingId: string; userId: string }>('bookings', (p as any).bookingId)
    return booking?.userId === userId
  })
  progresses.forEach((p) => dbDelete('progresses', (p as any).progressId))

  // 清除登录态
  dbDelete(AUTH_COLLECTION, 'current')
}
