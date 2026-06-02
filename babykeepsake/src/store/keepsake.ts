import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { KeepsakeType, KeepsakeCategory } from '@/types/models'

export const useKeepsakeStore = defineStore('keepsake', () => {
  // state
  const keepsakeTypes = ref<KeepsakeType[]>([])
  const currentKeepsake = ref<KeepsakeType | null>(null)
  const categories = ref<KeepsakeCategory[]>([])

  // getters
  const getByCategory = computed(() => {
    return (category: KeepsakeCategory) =>
      keepsakeTypes.value.filter((k) => k.category === category)
  })

  const popularKeepsakes = computed(() => {
    return keepsakeTypes.value.slice(0, 6)
  })

  // actions
  function setKeepsakeTypes(types: KeepsakeType[]) {
    keepsakeTypes.value = types
  }

  function setCurrentKeepsake(keepsake: KeepsakeType | null) {
    currentKeepsake.value = keepsake
  }

  function init() {
    keepsakeTypes.value = []
    currentKeepsake.value = null
    categories.value = []
  }

  return {
    keepsakeTypes,
    currentKeepsake,
    categories,
    getByCategory,
    popularKeepsakes,
    setKeepsakeTypes,
    setCurrentKeepsake,
    init
  }
})
