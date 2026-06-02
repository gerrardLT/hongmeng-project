export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface PageParams {
  page?: number
  pageSize?: number
}
