import type { Checklist, ChecklistItem, GenerationType, SmartGenParams } from '@/types/models'
import { useChecklistsStore } from '@/store/checklists'
import { useUserStore } from '@/store/user'
import { formatWeightGram } from '@/utils/format'

/**
 * 创建清单
 */
export function createChecklist(
  name: string,
  date: string,
  items: Omit<ChecklistItem, 'itemId' | 'isChecked'>[],
  genType: GenerationType,
  params?: SmartGenParams
): Checklist {
  const userStore = useUserStore()
  const checklistsStore = useChecklistsStore()
  const now = new Date().toISOString()

  const checklistItems: ChecklistItem[] = items.map(item => ({
    ...item,
    itemId: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    isChecked: false
  }))

  const totalWeight = checklistItems.reduce(
    (sum, item) => sum + item.weight * item.quantity, 0
  )

  const checklist: Checklist = {
    checklistId: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId: userStore.userInfo?.userId || 'local',
    name,
    campingDate: date,
    status: 'preparing',
    generationType: genType,
    parameters: params || null,
    items: checklistItems,
    totalWeight,
    createdAt: now,
    updatedAt: now
  }

  checklistsStore.addChecklist(checklist)
  return checklist
}

/**
 * 更新清单装备项
 */
export function updateChecklistItems(id: string, items: ChecklistItem[]): void {
  const checklistsStore = useChecklistsStore()
  const totalWeight = items.reduce(
    (sum, item) => sum + item.weight * item.quantity, 0
  )
  checklistsStore.updateChecklist(id, { items, totalWeight })
}

/**
 * 删除清单
 */
export function deleteChecklist(id: string): void {
  const checklistsStore = useChecklistsStore()
  checklistsStore.deleteChecklist(id)
}

/**
 * 生成分享文本
 */
export function shareChecklist(id: string): string {
  const checklistsStore = useChecklistsStore()
  const checklist = checklistsStore.checklists.find(c => c.checklistId === id)
  if (!checklist) return ''

  const header = `🏕️ ${checklist.name}\n📅 露营日期：${checklist.campingDate}\n`
  const stats = `📦 共 ${checklist.items.length} 项装备 | 总重 ${formatWeightGram(checklist.totalWeight)}\n`
  const divider = '─'.repeat(20) + '\n'

  const itemLines = checklist.items.map(item => {
    const checked = item.isChecked ? '✅' : '⬜'
    const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
    return `${checked} ${item.name}${qty} (${formatWeightGram(item.weight)})`
  }).join('\n')

  const footer = `\n${divider}📱 来自 CampReady 露营装备清单`

  return header + stats + divider + itemLines + footer
}
