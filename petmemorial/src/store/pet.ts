import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PetProfile } from '@/types/models'

const STORAGE_KEY = 'petmemorial_pets'

interface PetStorageState {
  pets: PetProfile[]
  currentPetId: string
}

export const usePetStore = defineStore('pet', () => {
  // state
  const pets = ref<PetProfile[]>([])
  const currentPetId = ref('')

  // getters
  const currentPet = computed<PetProfile | null>(() => {
    if (!currentPetId.value) return null
    return pets.value.find((p) => p.petId === currentPetId.value) || null
  })

  const petCount = computed(() => pets.value.length)

  // 持久化到本地存储
  function persist() {
    const state: PetStorageState = {
      pets: pets.value,
      currentPetId: currentPetId.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist pets error:', e)
    }
  }

  // actions
  function addPet(pet: PetProfile) {
    pets.value.push(pet)
    persist()
  }

  function updatePet(petId: string, data: Partial<PetProfile>) {
    const index = pets.value.findIndex((p) => p.petId === petId)
    if (index !== -1) {
      pets.value[index] = { ...pets.value[index], ...data, updatedAt: Date.now() }
      persist()
    }
  }

  function deletePet(petId: string) {
    const index = pets.value.findIndex((p) => p.petId === petId)
    if (index !== -1) {
      pets.value.splice(index, 1)
      if (currentPetId.value === petId) {
        currentPetId.value = pets.value.length > 0 ? pets.value[0].petId : ''
      }
      persist()
    }
  }

  function selectPet(petId: string) {
    currentPetId.value = petId
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as PetStorageState | undefined
      if (state) {
        pets.value = state.pets || []
        currentPetId.value = state.currentPetId || ''
      }
    } catch (e) {
      console.error('init pets error:', e)
    }
  }

  return {
    pets,
    currentPetId,
    currentPet,
    petCount,
    addPet,
    updatePet,
    deletePet,
    selectPet,
    init,
    persist
  }
})
