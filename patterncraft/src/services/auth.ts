import type { UserInfo } from '@/types/models'
import { useUserStore } from '@/store/index'

// #ifdef APP-HARMONY
/**
 * 鸿蒙端：华为 Account Kit 一键登录
 * 登录前必须检查 isPrivacyAgreed，未同意隐私政策不可初始化 SDK
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
          const userInfo: UserInfo = {
            userId: `hw_${res.code.slice(0, 16)}`,
            nickname: '华为用户',
            avatar: '',
            createdAt: Date.now()
          }
          const token = `token_harmony_${res.code}_${Date.now()}`
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
 */
export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: UserInfo; token: string }> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }
  if (!code || code.length !== 6) {
    throw new Error('请输入6位验证码')
  }

  await new Promise((resolve) => setTimeout(resolve, 600))

  const userInfo: UserInfo = {
    userId: `phone_${phone.slice(-4)}_${Date.now()}`,
    nickname: `用户${phone.slice(-4)}`,
    avatar: '',
    createdAt: Date.now()
  }
  const token = `token_phone_${phone.slice(-4)}_${Date.now()}`

  return { userInfo, token }
}
// #endif

/**
 * 统一登录入口
 * @param params 登录参数，鸿蒙端无需传参，其他端需传手机号和验证码
 */
export async function login(params?: { phone?: string; code?: string }): Promise<{ userInfo: UserInfo; token: string }> {
  const userStore = useUserStore()

  if (!userStore.isPrivacyAgreed) {
    throw new Error('请先阅读并同意《用户协议》和《隐私政策》')
  }

  let result: { userInfo: UserInfo; token: string }

  // #ifdef APP-HARMONY
  result = await loginWithHarmony()
  // #endif

  // #ifndef APP-HARMONY
  if (!params?.phone || !params?.code) {
    throw new Error('请输入手机号和验证码')
  }
  result = await loginWithPhone(params.phone, params.code)
  // #endif

  // 存储登录信息
  uni.setStorageSync('token', result.token)
  uni.setStorageSync('userInfo', result.userInfo)
  userStore.setUserInfo(result.userInfo)
  userStore.setToken(result.token)

  return result
}

/**
 * 统一登出：清除 token 和用户信息
 */
export async function logout(): Promise<void> {
  const userStore = useUserStore()

  try {
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    userStore.clearUser()
  } catch (e) {
    console.error('[auth] logout error:', e)
  }
}

/**
 * 发送手机号验证码
 * @param phone 手机号
 */
export async function sendVerifyCode(phone: string): Promise<void> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }

  // 模拟发送验证码，开发阶段延迟模拟
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log(`[auth] 验证码已发送至 ${phone}（开发模式）`)
}

/**
 * 检查登录状态
 * @returns 是否已登录
 */
export function checkLoginStatus(): boolean {
  try {
    const token = uni.getStorageSync('token') as string | undefined
    const userInfo = uni.getStorageSync('userInfo') as UserInfo | undefined

    if (token && userInfo?.userId) {
      const userStore = useUserStore()
      userStore.setUserInfo(userInfo)
      userStore.setToken(token)
      return true
    }
    return false
  } catch (e) {
    console.error('[auth] checkLoginStatus error:', e)
    return false
  }
}
