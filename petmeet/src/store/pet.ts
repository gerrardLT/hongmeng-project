import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pet } from '@/types/models'
import { getMyPets as getMyPetsService } from '@/services/pet'

export const usePetStore = defineStore('pet', () => {
  // State
  const myPets = ref<Pet[]>([])
  const currentPet = ref<Pet | null>(null)

  // Getters
  const hasPet = computed(() => myPets.value.length > 0)
  const petCount = computed(() => myPets.value.length)

  // Actions
  function loadMyPets() {
    myPets.value = getMyPetsService()
    if (myPets.value.length > 0 && !currentPet.value) {
      currentPet.value = myPets.value[0]
    }
  }

  function addPet(pet: Pet) {
    myPets.value.push(pet)
    if (!currentPet.value) {
      currentPet.value = pet
    }
  }

  function updatePet(petId: string, data: Partial<Pet>) {
    const index = myPets.value.findIndex((p) => p.petId === petId)
    if (index !== -1) {
      myPets.value[index] = { ...myPets.value[index], ...data }
      if (currentPet.value?.petId === petId) {
        currentPet.value = { ...currentPet.value, ...data }
      }
    }
  }

  function deletePet(petId: string) {
    const index = myPets.value.findIndex((p) => p.petId === petId)
    if (index !== -1) {
      myPets.value.splice(index, 1)
    }
    if (currentPet.value?.petId === petId) {
      currentPet.value = myPets.value.length > 0 ? myPets.value[0] : null
    }
  }

  function setCurrentPet(pet: Pet | null) {
    currentPet.value = pet
  }

  return {
    myPets,
    currentPet,
    hasPet,
    petCount,
    loadMyPets,
    addPet,
    updatePet,
    deletePet,
    setCurrentPet
  }
})
