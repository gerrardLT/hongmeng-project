import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Artwork } from '@/types/models'

const STORAGE_KEY = 'glasscraft_artworks'

interface ArtworkStorageState {
  artworkList: Artwork[]
  currentArtwork: Artwork | null
}

export const useArtworkStore = defineStore('artwork', () => {
  // state
  const artworkList = ref<Artwork[]>([])
  const currentArtwork = ref<Artwork | null>(null)
  const loading = ref(false)

  // getters
  const sortedArtworks = computed(() => {
    return [...artworkList.value].sort((a, b) => b.createdAt - a.createdAt)
  })

  const artworkCount = computed(() => artworkList.value.length)

  // 持久化到本地存储
  function persist() {
    const state: ArtworkStorageState = {
      artworkList: artworkList.value,
      currentArtwork: currentArtwork.value
    }
    try {
      uni.setStorageSync(STORAGE_KEY, state)
    } catch (e) {
      console.error('persist artworks state error:', e)
    }
  }

  // actions
  function addArtwork(artwork: Artwork) {
    artworkList.value.unshift(artwork)
    persist()
  }

  function updateArtwork(artworkId: string, data: Partial<Artwork>) {
    const index = artworkList.value.findIndex((a) => a.artworkId === artworkId)
    if (index !== -1) {
      artworkList.value[index] = { ...artworkList.value[index], ...data }
      if (currentArtwork.value?.artworkId === artworkId) {
        currentArtwork.value = { ...currentArtwork.value, ...data }
      }
      persist()
    }
  }

  function removeArtwork(artworkId: string) {
    artworkList.value = artworkList.value.filter((a) => a.artworkId !== artworkId)
    if (currentArtwork.value?.artworkId === artworkId) {
      currentArtwork.value = null
    }
    persist()
  }

  function setCurrentArtwork(artwork: Artwork | null) {
    currentArtwork.value = artwork
    persist()
  }

  function init() {
    try {
      const state = uni.getStorageSync(STORAGE_KEY) as ArtworkStorageState | undefined
      if (state) {
        artworkList.value = state.artworkList || []
        currentArtwork.value = state.currentArtwork || null
      }
    } catch (e) {
      console.error('init artworks state error:', e)
    }
  }

  return {
    artworkList,
    currentArtwork,
    loading,
    sortedArtworks,
    artworkCount,
    addArtwork,
    updateArtwork,
    removeArtwork,
    setCurrentArtwork,
    init,
    persist
  }
})
