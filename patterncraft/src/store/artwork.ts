import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Artwork, SceneType } from '@/types/models'
import { dbGetAll, dbSet, dbDelete } from '@/utils/db'

const ARTWORKS_COLLECTION = 'artworks'

export const useArtworkStore = defineStore('artwork', () => {
  // state
  const artworks = ref<Artwork[]>([])
  const currentFilter = ref<SceneType | 'all'>('all')

  // getters
  const filteredArtworks = computed(() => {
    if (currentFilter.value === 'all') {
      return artworks.value
    }
    return artworks.value.filter(a => a.sceneType === currentFilter.value)
  })

  const artworkCount = computed(() => artworks.value.length)

  /**
   * 从本地存储加载作品列表
   */
  function loadArtworks() {
    artworks.value = dbGetAll<Artwork>(ARTWORKS_COLLECTION)
    // 按创建时间倒序
    artworks.value.sort((a, b) => b.createdAt - a.createdAt)
  }

  /**
   * 添加作品
   * @param artwork 作品对象
   */
  function addArtwork(artwork: Artwork) {
    artworks.value.unshift(artwork)
    dbSet(ARTWORKS_COLLECTION, artwork.artworkId, artwork)
  }

  /**
   * 更新作品
   * @param artwork 更新后的作品对象
   */
  function updateArtwork(artwork: Artwork) {
    const index = artworks.value.findIndex(a => a.artworkId === artwork.artworkId)
    if (index !== -1) {
      artworks.value[index] = artwork
    }
    dbSet(ARTWORKS_COLLECTION, artwork.artworkId, artwork)
  }

  /**
   * 删除作品
   * @param artworkId 作品ID
   */
  function deleteArtwork(artworkId: string) {
    artworks.value = artworks.value.filter(a => a.artworkId !== artworkId)
    dbDelete(ARTWORKS_COLLECTION, artworkId)
  }

  /**
   * 设置筛选条件
   * @param filter 场景类型或 'all'
   */
  function setFilter(filter: SceneType | 'all') {
    currentFilter.value = filter
  }

  return {
    artworks,
    currentFilter,
    filteredArtworks,
    artworkCount,
    loadArtworks,
    addArtwork,
    updateArtwork,
    deleteArtwork,
    setFilter
  }
})
