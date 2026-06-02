/**
 * PlantCare 提醒服务
 * 管理养护提醒的创建、完成标记、智能日期计算
 */
import type { Plant, CareType } from '@/types/models'
import { usePlantStore } from '@/store/plant'
import { useReminderStore } from '@/store/reminder'
import type { ReminderItem } from '@/store/reminder'
import { useRecordStore } from '@/store/record'
import { calculateNextWaterDate, calculateNextFertilizeDate, getSeasonAdjustment } from '@/utils/reminder'
import { getWeatherAdjustment } from '@/utils/weather'
import { formatDate } from '@/utils/format'
import { refreshWidget } from '@/services/widget'

/**
 * 根据植物创建提醒列表项
 */
export function createReminder(plant: Plant): ReminderItem[] {
  const items: ReminderItem[] = []

  // 浇水提醒
  items.push({
    plantId: plant.plantId,
    plantName: plant.nickname,
    photoUrl: plant.photoUrl,
    careType: 'water',
    dueDate: plant.nextWaterDate,
    done: false
  })

  // 施肥提醒
  if (plant.nextFertilizeDate) {
    items.push({
      plantId: plant.plantId,
      plantName: plant.nickname,
      photoUrl: plant.photoUrl,
      careType: 'fertilize',
      dueDate: plant.nextFertilizeDate,
      done: false
    })
  }

  return items
}

/**
 * 计算下次养护日期（支持固定/智能模式）
 * 智能模式会结合季节系数和天气系数
 */
export function calculateNextDate(plant: Plant, careType: CareType): string {
  if (careType === 'water') {
    return calculateNextWaterDate(plant)
  }

  if (careType === 'fertilize') {
    return calculateNextFertilizeDate(plant) || formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  }

  // repot / prune 使用对应间隔
  const intervalMap: Record<string, number | undefined> = {
    repot: plant.reminderSettings.repotInterval,
    prune: plant.reminderSettings.pruneInterval
  }
  const interval = intervalMap[careType] || 30
  let adjustedInterval = interval

  if (plant.reminderMode === 'smart' && plant.reminderSettings.smartAdjust) {
    adjustedInterval = Math.round(interval * getSeasonAdjustment())
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + Math.max(1, adjustedInterval))
  return formatDate(nextDate)
}

/**
 * 标记养护完成
 * 更新下次养护日期，创建养护记录
 */
export async function markCareComplete(
  plantId: string,
  careType: CareType,
  note?: string,
  photos?: string[]
): Promise<void> {
  const plantStore = usePlantStore()
  const reminderStore = useReminderStore()
  const recordStore = useRecordStore()

  const plant = plantStore.plants.find((p) => p.plantId === plantId)
  if (!plant) return

  // 1. 添加养护记录
  recordStore.addCareRecord({
    plantId,
    type: careType,
    date: formatDate(Date.now()),
    note: note || '',
    photos: photos || []
  })

  // 2. 计算并更新下次养护日期
  const nextDate = calculateNextDate(plant, careType)
  const updateData: Partial<Plant> = {}
  if (careType === 'water') {
    updateData.nextWaterDate = nextDate
    updateData.status = 'healthy'
  } else if (careType === 'fertilize') {
    updateData.nextFertilizeDate = nextDate
  }
  plantStore.updatePlant(plantId, updateData)

  // 3. 标记提醒已完成
  reminderStore.markReminderDone(plantId, careType)

  // 4. 重新构建提醒列表
  rebuildReminders()

  refreshWidget()
}

/**
 * 获取今日待处理提醒
 */
export function getTodayReminders(): ReminderItem[] {
  const reminderStore = useReminderStore()
  return reminderStore.todayReminders
}

/**
 * 获取未来N天的提醒
 */
export function getUpcomingReminders(days: number = 7): ReminderItem[] {
  const reminderStore = useReminderStore()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  const futureDateStr = formatDate(futureDate)

  return reminderStore.upcomingReminders.filter((r) => r.dueDate <= futureDateStr)
}

/**
 * 重新构建所有植物的提醒列表
 */
export function rebuildReminders(): void {
  const plantStore = usePlantStore()
  const reminderStore = useReminderStore()

  const allReminders: ReminderItem[] = []
  for (const plant of plantStore.plants) {
    allReminders.push(...createReminder(plant))
  }

  reminderStore.setReminders(allReminders)
}
