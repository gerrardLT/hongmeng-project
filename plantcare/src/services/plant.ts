/**
 * PlantCare 植物管理服务
 * 处理植物的增删改查及状态更新
 */
import type { Plant } from '@/types/models'
import { usePlantStore } from '@/store/plant'
import { useUserStore } from '@/store/user'
import { calculateNextWaterDate, calculateNextFertilizeDate, isWaterDueToday } from '@/utils/reminder'
import { formatDate } from '@/utils/format'
import { refreshWidget } from '@/services/widget'

/**
 * 添加植物，自动计算首次提醒日期
 */
export async function addPlant(data: {
  nickname: string
  photoUrl: string
  location: string
  purchaseDate: string
  speciesId?: string
  reminderMode: Plant['reminderMode']
  reminderSettings: Plant['reminderSettings']
}): Promise<Plant> {
  const userStore = useUserStore()
  const plantStore = usePlantStore()

  const plant = plantStore.addPlant({
    ...data,
    userId: userStore.userId,
    nextWaterDate: formatDate(Date.now()),
    nextFertilizeDate: undefined,
    status: 'healthy',
    updatedAt: Date.now()
  })

  // 计算首次提醒日期
  if (plant) {
    const nextWater = calculateNextWaterDate(plant)
    const nextFertilize = calculateNextFertilizeDate(plant)
    plantStore.updatePlant(plant.plantId, {
      nextWaterDate: nextWater,
      nextFertilizeDate: nextFertilize
    })
  }

  refreshWidget()
  return plant
}

/**
 * 更新植物信息
 */
export async function updatePlant(plantId: string, data: Partial<Plant>): Promise<Plant | undefined> {
  const plantStore = usePlantStore()
  const updated = plantStore.updatePlant(plantId, data)
  refreshWidget()
  return updated
}

/**
 * 删除植物及关联记录
 */
export async function deletePlant(plantId: string): Promise<void> {
  const plantStore = usePlantStore()

  // 删除关联的养护记录和生长记录
  const { dbDelete, dbGetAll } = await import('@/utils/db')
  const careRecords = dbGetAll<any>('care_records').filter((r: any) => r.plantId === plantId)
  const growthRecords = dbGetAll<any>('growth_records').filter((r: any) => r.plantId === plantId)

  for (const r of careRecords) {
    dbDelete('care_records', r.recordId)
  }
  for (const r of growthRecords) {
    dbDelete('growth_records', r.recordId)
  }

  plantStore.deletePlant(plantId)
  refreshWidget()
}

/**
 * 获取单个植物
 */
export function getPlantById(plantId: string): Plant | undefined {
  const plantStore = usePlantStore()
  return plantStore.plants.find((p) => p.plantId === plantId)
}

/**
 * 按位置分组获取植物
 */
export function getPlantsByLocation(): Record<string, Plant[]> {
  const plantStore = usePlantStore()
  return plantStore.plantsByLocation
}

/**
 * 根据提醒日期更新植物状态
 */
export function updatePlantStatus(plantId: string): void {
  const plantStore = usePlantStore()
  const plant = plantStore.plants.find((p) => p.plantId === plantId)
  if (!plant) return

  let status: Plant['status'] = 'healthy'
  if (isWaterDueToday(plant)) {
    status = 'needsWater'
  }

  if (plant.status !== status) {
    plantStore.updatePlant(plantId, { status })
    refreshWidget()
  }
}
