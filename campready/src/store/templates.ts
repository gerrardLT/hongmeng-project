import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Template } from '@/types/models'
import { BUILTIN_TEMPLATES } from '@/data/templates'

export const useTemplatesStore = defineStore('templates', () => {
  // state
  const templates = ref<Template[]>([])

  // getters
  const builtinTemplates = computed(() =>
    templates.value.filter(t => t.isBuiltin)
  )

  const getTemplateById = computed(() => {
    return (id: string) => templates.value.find(t => t.templateId === id) || null
  })

  // actions
  function init() {
    // 加载预设模板
    if (templates.value.length === 0) {
      templates.value = [...BUILTIN_TEMPLATES]
    }
  }

  return {
    templates,
    builtinTemplates,
    getTemplateById,
    init
  }
})
