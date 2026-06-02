import type { ApiResponse } from '@/types/api'
import { API_BASE_URL } from '@/utils/config'

/**
 * 后端服务地址
 * 优先使用环境变量，其次使用 config.ts 中的配置，最后使用默认值
 */
const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || API_BASE_URL || 'https://api.campready.com'

/** 获取存储的 token */
function getToken(): string {
  return uni.getStorageSync('token') || ''
}

/** 通用请求封装 */
function request<T = any>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: Record<string, any>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = getToken()

    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        const statusCode = res.statusCode
        if (statusCode === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error('登录已过期，请重新登录'))
          return
        }

        if (statusCode < 200 || statusCode >= 300) {
          const msg = (res.data as ApiResponse)?.message || '请求失败'
          uni.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
          return
        }

        const body = res.data as ApiResponse<T>
        if (body.code !== 0 && body.code !== 200) {
          uni.showToast({ title: body.message || '请求异常', icon: 'none' })
          reject(new Error(body.message))
          return
        }

        resolve(body.data)
      },
      fail: (err) => {
        uni.showToast({ title: '网络连接失败', icon: 'none' })
        reject(new Error(err.errMsg || '网络连接失败'))
      }
    })
  })
}

/** GET 请求 */
export function get<T = any>(url: string, data?: Record<string, any>): Promise<T> {
  return request<T>(url, 'GET', data)
}

/** POST 请求 */
export function post<T = any>(url: string, data?: Record<string, any>): Promise<T> {
  return request<T>(url, 'POST', data)
}

/** PUT 请求 */
export function put<T = any>(url: string, data?: Record<string, any>): Promise<T> {
  return request<T>(url, 'PUT', data)
}

/** DELETE 请求 */
export function del<T = any>(url: string, data?: Record<string, any>): Promise<T> {
  return request<T>(url, 'DELETE', data)
}
