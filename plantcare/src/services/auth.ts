/**
 * PlantCare 登录认证服务
 * 鸿蒙端使用华为Account Kit，通用端使用手机号验证码登录
 */
import type { UserInfo } from '@/types/models'
import { useUserStore } from '@/store/user'

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
            nickname: '花友',
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
 * 通用端：模拟手机号登录（开发阶段）
 */
export async function loginWithPhone(phone: string, code: string): Promise<{ userInfo: UserInfo; token: string }> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }
  if (!code || code.length !== 6) {
    throw new Error('请输入6位验证码')
  }

  // 模拟 API 调用延迟
  await new Promise((resolve) => setTimeout(resolve, 600))

  const userInfo: UserInfo = {
    userId: `phone_${phone.slice(-4)}_${Date.now()}`,
    nickname: `花友${phone.slice(-4)}`,
    avatar: '',
    createdAt: Date.now()
  }
  const token = `token_phone_${phone.slice(-4)}_${Date.now()}`

  return { userInfo, token }
}

/**
 * 发送验证码
 */
export async function sendVerifyCode(phone: string): Promise<void> {
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    throw new Error('请输入正确的11位手机号')
  }

  // 模拟发送验证码
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log(`验证码已发送到 ${phone}`)
}
// #endif

/**
 * 通用登出：清除所有本地存储
 */
export async function logout(): Promise<void> {
  return new Promise((resolve) => {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('[auth] logout clear storage error:', e)
    }
    resolve()
  })
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): UserInfo | null {
  const userStore = useUserStore()
  return userStore.userInfo
}

/**
 * 检查登录状态
 */
export function checkLoginStatus(): boolean {
  const userStore = useUserStore()
  userStore.init()
  return userStore.isLoggedIn
}
