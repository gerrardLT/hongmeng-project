/**
 * PlantCare 记录服务
 * 处理养护记录和生长记录的增删查及统计
 */
import type { CareRecord, GrowthRecord, CareStats, CareType } from '@/types/models'
import { useRecordStore } from '@/store/record'
import { usePlantStore } from '@/store/plant'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'
import { formatDate } from '@/utils/format'

/**
 * 添加养护记录
 */
export async function addCareRecord(
  plantId: string,
  type: CareType,
  note?: string,
  photos?: string[]
): Promise<CareRecord> {
  const recordStore = useRecordStore()
  return recordStore.addCareRecord({
    plantId,
    type,
    date: formatDate(Date.now()),
    note: note || '',
    photos: photos || []
  })
}

/**
 * 添加生长记录
 */
export async function addGrowthRecord(
  plantId: string,
  content: string,
  photos: string[]
): Promise<GrowthRecord> {
  const recordStore = useRecordStore()
  return recordStore.addGrowthRecord({
    plantId,
    date: formatDate(Date.now()),
    content,
    photos
  })
}

/**
 * 获取某植物的生长记录
 */
export function getGrowthRecordsByPlant(plantId: string): GrowthRecord[] {
  const recordStore = useRecordStore()
  return recordStore.growthRecords
    .filter((r) => r.plantId === plantId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 获取某植物的养护记录
 */
export function getCareRecordsByPlant(plantId: string): CareRecord[] {
  const recordStore = useRecordStore()
  return recordStore.careRecords
    .filter((r) => r.plantId === plantId)
    .sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * 计算养护统计数据
 */
export function getCareStats(): CareStats {
  const recordStore = useRecordStore()
  const plantStore = usePlantStore()

  const baseStats = recordStore.careStats

  return {
    ...baseStats,
    totalPlants: plantStore.totalPlants,
    todayNeedWater: plantStore.plantsNeedingWater.length
  }
}

/**
 * 删除生长记录
 */
export function deleteGrowthRecord(recordId: string): void {
  const recordStore = useRecordStore()
  recordStore.deleteGrowthRecord(recordId)
}
