import type { ChecklistItem, SmartGenParams, Template } from '@/types/models'
import { useTemplatesStore } from '@/store/templates'
import { BUILTIN_TEMPLATES, generateSmartChecklist } from '@/data/templates'

/**
 * 获取所有模板
 */
export function getTemplates(): Template[] {
  const templatesStore = useTemplatesStore()
  return templatesStore.templates
}

/**
 * 从模板生成清单项
 */
export function generateFromTemplate(templateId: string): Omit<ChecklistItem, 'itemId' | 'isChecked'>[] {
  const templatesStore = useTemplatesStore()
  const template = templatesStore.getTemplateById(templateId)

  if (!template) {
    console.warn(`模板不存在: ${templateId}`)
    return []
  }

  return template.defaultItems.map(item => ({
    gearId: item.gearId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    weight: item.weight,
    note: item.note
  }))
}

/**
 * 智能生成清单项
 */
export function generateSmartList(params: SmartGenParams): Omit<ChecklistItem, 'itemId' | 'isChecked'>[] {
  return generateSmartChecklist(params)
}
