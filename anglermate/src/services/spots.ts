import { get, post, put, del } from '@/utils/request'
import type { FishingSpot } from '@/types/models'
import type { PageParams, PageResult } from '@/types/api'

/**
 * 创建钓点
 */
export async function createSpot(
  data: Omit<FishingSpot, 'spotId' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<FishingSpot> {
  return post<FishingSpot>('/spots', data as Record<string, any>)
}

/**
 * 获取钓点详情
 */
export async function getSpotDetail(spotId: string): Promise<FishingSpot> {
  return get<FishingSpot>(`/spots/${spotId}`)
}

/**
 * 获取钓点列表
 */
export async function getSpotList(
  params?: PageParams & { sortBy?: 'time' | 'distance'; lat?: number; lng?: number }
): Promise<PageResult<FishingSpot>> {
  return get<PageResult<FishingSpot>>('/spots', params as Record<string, any>)
}

/**
 * 更新钓点信息
 */
export async function updateSpot(spotId: string, data: Partial<FishingSpot>): Promise<FishingSpot> {
  return put<FishingSpot>(`/spots/${spotId}`, data as Record<string, any>)
}

/**
 * 删除钓点
 */
export async function deleteSpot(spotId: string): Promise<void> {
  return del<void>(`/spots/${spotId}`)
}

/**
 * 获取所有钓点标记（用于地图展示）
 */
export async function getAllSpotMarkers(): Promise<
  Array<{ spotId: string; name: string; latitude: number; longitude: number }>
> {
  return get<Array<{ spotId: string; name: string; latitude: number; longitude: number }>>('/spots/markers')
}
