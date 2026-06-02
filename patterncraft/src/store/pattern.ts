import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Pattern, FavoritePattern, PatternCategory, DailyPattern } from '@/types/models'
import { dbGetAll, dbSet, dbDelete, dbGet } from '@/utils/db'

const FAVORITES_COLLECTION = 'favorites'
const DAILY_PATTERN_KEY = 'patterncraft_daily_pattern'

export const usePatternStore = defineStore('pattern', () => {
  // state
  const patterns = ref<Pattern[]>([])
  const favorites = ref<FavoritePattern[]>([])
  const currentCategory = ref<PatternCategory | 'all'>('all')
  const searchKeyword = ref<string>('')
  const dailyPattern = ref<DailyPattern | null>(null)

  // getters
  const filteredPatterns = computed(() => {
    let result = patterns.value
    if (currentCategory.value !== 'all') {
      result = result.filter(p => p.category === currentCategory.value)
    }
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.origin.toLowerCase().includes(keyword)
      )
    }
    return result
  })

  const favoritePatternIds = computed(() => {
    return new Set(favorites.value.map(f => f.patternId))
  })

  /**
   * 判断指定纹样是否已收藏
   * @param patternId 纹样ID
   */
  function isFavorite(patternId: string): boolean {
    return favoritePatternIds.value.has(patternId)
  }

  /**
   * 加载纹样列表
   * @param list 纹样数组
   */
  function loadPatterns(list: Pattern[]) {
    patterns.value = list
  }

  /**
   * 设置当前筛选分类
   * @param category 分类或 'all'
   */
  function setCategory(category: PatternCategory | 'all') {
    currentCategory.value = category
  }

  /**
   * 设置搜索关键词
   * @param keyword 关键词
   */
  function setSearchKeyword(keyword: string) {
    searchKeyword.value = keyword
  }

  /**
   * 切换纹样收藏状态
   * @param patternId 纹样ID
   * @param userId 用户ID
   */
  function toggleFavorite(patternId: string, userId: string) {
    const existing = favorites.value.find(f => f.patternId === patternId)
    if (existing) {
      favorites.value = favorites.value.filter(f => f.patternId !== patternId)
      dbDelete(FAVORITES_COLLECTION, existing.favoriteId)
    } else {
      const fav: FavoritePattern = {
        favoriteId: `fav_${Date.now().toString(36)}`,
        userId,
        patternId,
        createdAt: Date.now()
      }
      favorites.value.push(fav)
      dbSet(FAVORITES_COLLECTION, fav.favoriteId, fav)
    }
  }

  /**
   * 从本地存储加载收藏列表
   */
  function loadFavorites() {
    favorites.value = dbGetAll<FavoritePattern>(FAVORITES_COLLECTION)
  }

  /**
   * 加载每日纹样
   */
  function loadDailyPattern() {
    try {
      const saved = uni.getStorageSync(DAILY_PATTERN_KEY) as DailyPattern | undefined
      if (saved) {
        dailyPattern.value = saved
      }
    } catch (e) {
      console.error('loadDailyPattern error:', e)
    }
  }

  /**
   * 设置每日纹样
   * @param daily 每日纹样数据
   */
  function setDailyPattern(daily: DailyPattern) {
    dailyPattern.value = daily
    try {
      uni.setStorageSync(DAILY_PATTERN_KEY, daily)
    } catch (e) {
      console.error('setDailyPattern error:', e)
    }
  }

  return {
    patterns,
    favorites,
    currentCategory,
    searchKeyword,
    dailyPattern,
    filteredPatterns,
    favoritePatternIds,
    isFavorite,
    loadPatterns,
    setCategory,
    setSearchKeyword,
    toggleFavorite,
    loadFavorites,
    loadDailyPattern,
    setDailyPattern
  }
})
