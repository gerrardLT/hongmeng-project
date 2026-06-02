import { get, post, put, del } from '@/utils/request'
import type { CatchRecord, CatchStats } from '@/types/models'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 创建渔获记录
 */
export async function createCatch(
  data: Omit<CatchRecord, 'recordId' | 'userId' | 'createdAt'>
): Promise<CatchRecord> {
  return post<CatchRecord>('/catches', data as Record<string, any>)
}

/**
 * 获取渔获详情
 */
export async function getCatchDetail(recordId: string): Promise<CatchRecord> {
  return get<CatchRecord>(`/catches/${recordId}`)
}

/**
 * 获取渔获列表
 */
export async function getCatchList(
  params?: PageParams & { spotId?: string; fishSpecies?: string; startDate?: string; endDate?: string }
): Promise<PageResult<CatchRecord>> {
  return get<PageResult<CatchRecord>>('/catches', params as Record<string, any>)
}

/**
 * 更新渔获记录
 */
export async function updateCatch(recordId: string, data: Partial<CatchRecord>): Promise<CatchRecord> {
  return put<CatchRecord>(`/catches/${recordId}`, data as Record<string, any>)
}

/**
 * 删除渔获记录
 */
export async function deleteCatch(recordId: string): Promise<void> {
  return del<void>(`/catches/${recordId}`)
}

/**
 * 获取渔获统计
 */
export async function getCatchStats(): Promise<CatchStats> {
  return get<CatchStats>('/catches/stats')
}
