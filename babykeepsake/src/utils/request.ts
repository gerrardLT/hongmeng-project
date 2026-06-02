import type { ApiResponse } from '@/types/api'

const BASE_URL = 'https://api.babykeepsake.com'

interface RequestOptions {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  headers?: Record<string, string>
}

/**
 * 通用请求方法
 * @param options 请求配置
 * @returns Promise<T> 响应数据
 */
function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') as string | undefined

    uni.request({
      url: options.url.startsWith('http') ? options.url : `${BASE_URL}${options.url}`,
      method: options.method,
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      success: (res) => {
        const response = res.data as ApiResponse<T>
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (response.code === 200 || response.code === 0) {
            resolve(response.data)
          } else {
            reject(new Error(response.message || '请求失败'))
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * GET 请求
 * @param url 请求路径
 * @param params 查询参数
 * @returns Promise<T>
 */
export function get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
  const query = params
    ? '?' + Object.entries(params).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&')
    : ''
  return request<T>({ url: url + query, method: 'GET' })
}

/**
 * POST 请求
 * @param url 请求路径
 * @param data 请求体
 * @returns Promise<T>
 */
export function post<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'POST', data })
}

/**
 * PUT 请求
 * @param url 请求路径
 * @param data 请求体
 * @returns Promise<T>
 */
export function put<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'PUT', data })
}

/**
 * DELETE 请求
 * @param url 请求路径
 * @param data 请求体
 * @returns Promise<T>
 */
export function del<T = any>(url: string, data?: any): Promise<T> {
  return request<T>({ url, method: 'DELETE', data })
}
