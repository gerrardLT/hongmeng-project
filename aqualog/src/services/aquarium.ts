/**
 * AquaLog 水族箱服务
 * 封装水族箱的增删改查及状态计算
 */
import type { Aquarium, AquariumStatus } from '@/types/models'
import { useAquariumStore } from '@/store/aquarium'
import { useRecordStore } from '@/store/record'
import { useAlertStore } from '@/store/alert'
import { checkParamStatus } from '@/utils/paramRanges'

/**
 * 创建水族箱
 */
export function createAquarium(data: Omit<Aquarium, 'aquariumId' | 'safeRanges' | 'status' | 'createdAt' | 'updatedAt'>): Aquarium {
  const aquariumStore = useAquariumStore()
  return aquariumStore.addAquarium(data)
}

/**
 * 更新水族箱
 */
export function updateAquarium(id: string, data: Partial<Aquarium>): Aquarium | null {
  const aquariumStore = useAquariumStore()
  return aquariumStore.updateAquarium(id, data)
}

/**
 * 删除水族箱（级联删除相关记录和日志）
 */
export function deleteAquarium(id: string): void {
  const aquariumStore = useAquariumStore()
  const recordStore = useRecordStore()

  // 先删除关联的记录和日志
  recordStore.deleteRecordsByAquarium(id)
  // 再删除水族箱本身
  aquariumStore.deleteAquarium(id)
}

/**
 * 获取水族箱列表
 */
export function getAquariumList(): Aquarium[] {
  const aquariumStore = useAquariumStore()
  return aquariumStore.aquariums
}

/**
 * 获取水族箱详情
 */
export function getAquariumDetail(id: string): Aquarium | null {
  const aquariumStore = useAquariumStore()
  return aquariumStore.getAquariumById(id)
}

/**
 * 根据最新参数计算水族箱状态
 */
export function calculateStatus(aquariumId: string): AquariumStatus {
  const aquariumStore = useAquariumStore()
  const recordStore = useRecordStore()

  const aquarium = aquariumStore.getAquariumById(aquariumId)
  if (!aquarium) return 'normal'

  const latestRecord = recordStore.getLatestRecord(aquariumId)
  if (!latestRecord) return 'normal'

  const paramNames = ['temperature', 'ph', 'ammonia', 'nitrite', 'nitrate', 'gh', 'kh', 'salinity', 'phosphate']
  let hasDanger = false
  let hasWarning = false

  for (const param of paramNames) {
    const value = (latestRecord as any)[param] as number | null
    if (value === null || value === undefined) continue
    const status = checkParamStatus(param, value, aquarium.safeRanges)
    if (status === 'danger') hasDanger = true
    if (status === 'warning') hasWarning = true
  }

  return hasDanger ? 'danger' : hasWarning ? 'warning' : 'normal'
}
