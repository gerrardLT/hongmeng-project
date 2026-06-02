import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SealType, Material, FontStyle } from '@/types/models'

export const useSealStore = defineStore('seal', () => {
  // state
  const sealTypes = ref<SealType[]>([])
  const materials = ref<Material[]>([])
  const fontStyles = ref<FontStyle[]>([])
  const loaded = ref(false)

  // actions
  async function loadSealData(
    fetchSealTypes: () => Promise<SealType[]>,
    fetchMaterials: () => Promise<Material[]>,
    fetchFontStyles: () => Promise<FontStyle[]>
  ) {
    if (loaded.value) return
    try {
      const [types, mats, fonts] = await Promise.all([
        fetchSealTypes(),
        fetchMaterials(),
        fetchFontStyles()
      ])
      sealTypes.value = types
      materials.value = mats
      fontStyles.value = fonts
      loaded.value = true
    } catch (e) {
      console.error('loadSealData error:', e)
    }
  }

  function getSealTypeById(typeId: string): SealType | null {
    return sealTypes.value.find((t) => t.typeId === typeId) || null
  }

  function getMaterialById(materialId: string): Material | null {
    return materials.value.find((m) => m.materialId === materialId) || null
  }

  function getFontById(fontId: string): FontStyle | null {
    return fontStyles.value.find((f) => f.fontId === fontId) || null
  }

  function reset() {
    sealTypes.value = []
    materials.value = []
    fontStyles.value = []
    loaded.value = false
  }

  return {
    sealTypes,
    materials,
    fontStyles,
    loaded,
    loadSealData,
    getSealTypeById,
    getMaterialById,
    getFontById,
    reset
  }
})
