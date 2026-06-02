import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DesignDraft } from '@/types/models'

const DRAFT_KEY = 'sealcraft_design_draft'
const HISTORY_KEY = 'sealcraft_design_history'

const DEFAULT_DRAFT: DesignDraft = {
  content: '',
  fontId: '',
  materialId: '',
  sealTypeId: '',
  layout: 'auto',
  inkColor: 'red'
}

export const useDesignStore = defineStore('design', () => {
  // state
  const currentDraft = ref<DesignDraft>({ ...DEFAULT_DRAFT })
  const history = ref<DesignDraft[]>([])

  // getters
  const hasContent = computed(() => !!currentDraft.value.content.trim())
  const isComplete = computed(() => {
    const d = currentDraft.value
    return !!(d.content.trim() && d.fontId && d.materialId && d.sealTypeId)
  })

  // actions
  function setContent(content: string) {
    currentDraft.value.content = content
    saveDraft()
  }

  function setFont(fontId: string) {
    currentDraft.value.fontId = fontId
    saveDraft()
  }

  function setMaterial(materialId: string) {
    currentDraft.value.materialId = materialId
    saveDraft()
  }

  function setSealType(sealTypeId: string) {
    currentDraft.value.sealTypeId = sealTypeId
    saveDraft()
  }

  function setLayout(layout: DesignDraft['layout']) {
    currentDraft.value.layout = layout
    saveDraft()
  }

  function setInkColor(inkColor: DesignDraft['inkColor']) {
    currentDraft.value.inkColor = inkColor
    saveDraft()
  }

  function saveDraft() {
    try {
      uni.setStorageSync(DRAFT_KEY, currentDraft.value)
    } catch (e) {
      console.error('saveDraft error:', e)
    }
  }

  function loadDraft() {
    try {
      const draft = uni.getStorageSync(DRAFT_KEY) as DesignDraft | undefined
      if (draft) {
        currentDraft.value = { ...DEFAULT_DRAFT, ...draft }
      }
      const hist = uni.getStorageSync(HISTORY_KEY) as DesignDraft[] | undefined
      if (hist) {
        history.value = hist
      }
    } catch (e) {
      console.error('loadDraft error:', e)
    }
  }

  function resetDraft() {
    currentDraft.value = { ...DEFAULT_DRAFT }
    try {
      uni.removeStorageSync(DRAFT_KEY)
    } catch (e) {
      console.error('resetDraft error:', e)
    }
  }

  function saveToHistory() {
    if (!hasContent.value) return
    history.value.unshift({ ...currentDraft.value })
    // 最多保留 20 条历史
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
    try {
      uni.setStorageSync(HISTORY_KEY, history.value)
    } catch (e) {
      console.error('saveToHistory error:', e)
    }
  }

  return {
    currentDraft,
    history,
    hasContent,
    isComplete,
    setContent,
    setFont,
    setMaterial,
    setSealType,
    setLayout,
    setInkColor,
    saveDraft,
    loadDraft,
    resetDraft,
    saveToHistory
  }
})
