/**
 * PlantCare 百科状态管理
 * 管理搜索关键词、筛选条件、收藏列表
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlantDifficulty, PlantCategory } from '@/types/models'

const STORAGE_KEY = 'plantcare_wiki'

export const useWikiStore = defineStore('wiki', () => {
  // state
  const searchKeyword = ref('')
  const selectedDifficulty = ref<PlantDifficulty | ''>('')
  const selectedCategory = ref<PlantCategory | ''>('')
  const favorites = ref<string[]>([]) // speciesId 列表

  // actions
  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
  }

  function setDifficulty(difficulty: PlantDifficulty | '') {
    selectedDifficulty.value = difficulty
  }

  function setCategory(category: PlantCategory | '') {
    selectedCategory.value = category
  }

  function toggleFavorite(speciesId: string) {
    const index = favorites.value.indexOf(speciesId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(speciesId)
    }
    persist()
  }

  function persist() {
    try {
      uni.setStorageSync(STORAGE_KEY, {
        favorites: favorites.value
      })
    } catch (e) {
      console.error('[wiki store] persist error:', e)
    }
  }

  function init() {
    try {
      const stored = uni.getStorageSync(STORAGE_KEY) as {
        favorites?: string[]
      } | undefined

      if (stored?.favorites) {
        favorites.value = stored.favorites
      }
    } catch (e) {
      console.error('[wiki store] init error:', e)
    }
  }

  return {
    searchKeyword,
    selectedDifficulty,
    selectedCategory,
    favorites,
    setSearchKeyword,
    setDifficulty,
    setCategory,
    toggleFavorite,
    init,
    persist
  }
})
