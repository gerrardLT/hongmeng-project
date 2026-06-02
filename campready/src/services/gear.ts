import type { Gear, GearCategory } from '@/types/models'
import { useGearStore } from '@/store/gear'
import { useChecklistsStore } from '@/store/checklists'
import { useUserStore } from '@/store/user'

/**
 * 添加装备
 */
export function addGear(data: {
  name: string
  category: GearCategory
  weight: number
  quantity?: number
  photos?: string[]
  purchaseLink?: string
  storageLocation?: string
  note?: string
}): Gear {
  const userStore = useUserStore()
  const gearStore = useGearStore()
  const now = new Date().toISOString()

  const gear: Gear = {
    gearId: `gear_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: userStore.userInfo?.userId || 'local',
    name: data.name,
    category: data.category,
    weight: data.weight,
    quantity: data.quantity || 1,
    photos: data.photos || [],
    purchaseLink: data.purchaseLink || '',
    storageLocation: data.storageLocation || '',
    note: data.note || '',
    createdAt: now,
    updatedAt: now
  }

  gearStore.addGear(gear)
  return gear
}

/**
 * 更新装备
 */
export function updateGear(id: string, data: Partial<Gear>): void {
  const gearStore = useGearStore()
  gearStore.updateGear(id, data)
}

/**
 * 删除装备
 */
export function deleteGear(id: string): void {
  const gearStore = useGearStore()
  gearStore.deleteGear(id)
}

/**
 * 检查装备是否被清单引用
 */
export function isGearInUse(gearId: string): boolean {
  const checklistsStore = useChecklistsStore()
  return checklistsStore.checklists.some(checklist =>
    checklist.items.some(item => item.gearId === gearId)
  )
}
