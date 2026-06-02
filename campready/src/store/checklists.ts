import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Checklist, ChecklistItem, ChecklistStatus } from '@/types/models'
import { setItem, getItem } from '@/utils/db'

const STORAGE_KEY = 'checklists'

export const useChecklistsStore = defineStore('checklists', () => {
  // state
  const checklists = ref<Checklist[]>([])
  const currentId = ref('')

  // getters
  const preparingList = computed(() =>
    checklists.value.filter(c => c.status === 'preparing')
  )

  const completedList = computed(() =>
    checklists.value.filter(c => c.status === 'completed')
  )

  const archivedList = computed(() =>
    checklists.value.filter(c => c.status === 'archived')
  )

  const currentChecklist = computed(() =>
    checklists.value.find(c => c.checklistId === currentId.value) || null
  )

  /** 最近的露营日期清单（未来日期中最近的 preparing 清单） */
  const nextCamping = computed(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const upcoming = preparingList.value
      .filter(c => new Date(c.campingDate) >= now)
      .sort((a, b) => new Date(a.campingDate).getTime() - new Date(b.campingDate).getTime())
    return upcoming[0] || null
  })

  // actions
  function addChecklist(checklist: Checklist) {
    checklists.value.unshift(checklist)
    persist()
  }

  function updateChecklist(id: string, data: Partial<Checklist>) {
    const index = checklists.value.findIndex(c => c.checklistId === id)
    if (index !== -1) {
      checklists.value[index] = {
        ...checklists.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      }
      persist()
    }
  }

  function deleteChecklist(id: string) {
    checklists.value = checklists.value.filter(c => c.checklistId !== id)
    persist()
  }

  function toggleItem(checklistId: string, itemId: string) {
    const checklist = checklists.value.find(c => c.checklistId === checklistId)
    if (checklist) {
      const item = checklist.items.find(i => i.itemId === itemId)
      if (item) {
        item.isChecked = !item.isChecked
        checklist.updatedAt = new Date().toISOString()
        persist()
      }
    }
  }

  function completeChecklist(id: string) {
    updateChecklist(id, { status: 'completed' })
  }

  function archiveChecklist(id: string) {
    updateChecklist(id, { status: 'archived' })
  }

  function duplicateChecklist(id: string): Checklist | null {
    const source = checklists.value.find(c => c.checklistId === id)
    if (!source) return null

    const now = new Date().toISOString()
    const newChecklist: Checklist = {
      ...JSON.parse(JSON.stringify(source)),
      checklistId: `cl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${source.name} (副本)`,
      status: 'preparing' as ChecklistStatus,
      items: source.items.map(item => ({
        ...item,
        itemId: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        isChecked: false
      })),
      createdAt: now,
      updatedAt: now
    }

    checklists.value.unshift(newChecklist)
    persist()
    return newChecklist
  }

  function persist() {
    setItem(STORAGE_KEY, checklists.value)
  }

  function init() {
    const saved = getItem<Checklist[]>(STORAGE_KEY)
    if (saved) {
      checklists.value = saved
    }
  }

  return {
    checklists,
    currentId,
    preparingList,
    completedList,
    archivedList,
    currentChecklist,
    nextCamping,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    toggleItem,
    completeChecklist,
    archiveChecklist,
    duplicateChecklist,
    init,
    persist
  }
})
