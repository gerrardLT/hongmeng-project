import type { Pattern, FavoritePattern } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbDelete, dbQuery, generateId } from '@/utils/db'

/** 内置纹样数据（从 data 模块导入） */
let builtinPatterns: Pattern[] = []

/** 缓存版本号和过期机制 */
let cacheVersion = 0
let cacheTimestamp = 0
const CACHE_TTL = 30 * 60 * 1000 // 30分钟

function isCacheValid(): boolean {
  return builtinPatterns.length > 0 && cacheTimestamp > 0 && (Date.now() - cacheTimestamp) < CACHE_TTL
}

function invalidateCache(): void {
  cacheTimestamp = 0
  cacheVersion++
}

/** 收藏集合名 */
const FAVORITES_COLLECTION = 'favorites'
/** 最近使用集合名 */
const RECENT_COLLECTION = 'recent_patterns'
/** 每日纹样存储键 */
const DAILY_KEY = 'daily_pattern'

/**
 * 加载内置纹样数据
 * 从 @/data/patterns 导入预置纹样列表并缓存到内存中
 * @returns 纹样数组
 */
export async function loadBuiltinPatterns(): Promise<Pattern[]> {
  if (isCacheValid()) {
    return builtinPatterns
  }

  try {
    // 动态导入内置纹样数据
    const module = await import('@/data/patterns')
    builtinPatterns = module.builtinPatterns || module.default || []
    cacheTimestamp = Date.now()
    cacheVersion++
    console.log(`[pattern] loaded ${builtinPatterns.length} builtin patterns (v${cacheVersion})`)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[PatternService] loadBuiltinPatterns failed:', message)
    uni.showToast({ title: '加载纹样失败', icon: 'none' })
    builtinPatterns = []
    throw e
  }

  return builtinPatterns
}

/**
 * 根据 ID 获取单个纹样
 * @param id 纹样 ID
 * @returns 纹样对象或 null
 */
export function getPatternById(id: string): Pattern | null {
  return builtinPatterns.find((p) => p.patternId === id) ?? null
}

/**
 * 搜索纹样
 * @param keyword 关键词，匹配名称、描述、来源
 * @returns 匹配的纹样数组
 */
export function searchPatterns(keyword: string): Pattern[] {
  if (!keyword.trim()) {
    return builtinPatterns
  }
  const kw = keyword.toLowerCase()
  return builtinPatterns.filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw) ||
      p.origin.toLowerCase().includes(kw) ||
      p.subCategory.toLowerCase().includes(kw)
  )
}

/**
 * 按分类获取纹样
 * @param category 纹样分类
 * @returns 该分类下的纹样数组
 */
export function getPatternsByCategory(category: string): Pattern[] {
  return builtinPatterns.filter((p) => p.category === category)
}

/**
 * 收藏纹样
 * @param patternId 纹样 ID
 */
export function addFavorite(patternId: string): void {
  const existing = dbQuery<FavoritePattern>(FAVORITES_COLLECTION, (f) => f.patternId === patternId)
  if (existing.length > 0) {
    console.log('[pattern] already favorited:', patternId)
    return
  }

  const favorite: FavoritePattern = {
    favoriteId: generateId(),
    userId: (uni.getStorageSync('userInfo') as { userId?: string })?.userId || 'local',
    patternId,
    createdAt: Date.now()
  }
  dbSet<FavoritePattern>(FAVORITES_COLLECTION, favorite.favoriteId, favorite)
  console.log('[pattern] favorited:', patternId)
}

/**
 * 取消收藏纹样
 * @param patternId 纹样 ID
 */
export function removeFavorite(patternId: string): void {
  const favorites = dbQuery<FavoritePattern>(FAVORITES_COLLECTION, (f) => f.patternId === patternId)
  for (const fav of favorites) {
    dbDelete(FAVORITES_COLLECTION, fav.favoriteId)
  }
  console.log('[pattern] unfavorited:', patternId)
}

/**
 * 获取收藏列表（返回完整纹样对象）
 * @returns 收藏的纹样数组
 */
export function getFavorites(): Pattern[] {
  const favorites = dbGetAll<FavoritePattern>(FAVORITES_COLLECTION)
  const favIds = new Set(favorites.map((f) => f.patternId))
  return builtinPatterns.filter((p) => favIds.has(p.patternId))
}

/**
 * 获取每日纹样推荐
 * 每天根据日期 hash 推荐一个纹样，同一天返回相同结果
 * @returns 推荐的纹样或 null
 */
export function getDailyPattern(): Pattern | null {
  if (builtinPatterns.length === 0) return null

  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const cached = uni.getStorageSync(DAILY_KEY) as { date: string; patternId: string } | undefined

  if (cached?.date === today) {
    return getPatternById(cached.patternId)
  }

  // 基于日期生成稳定的索引
  const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part, 10), 0)
  const index = dateHash % builtinPatterns.length
  const pattern = builtinPatterns[index]

  try {
    uni.setStorageSync(DAILY_KEY, { date: today, patternId: pattern.patternId })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[PatternService] save daily pattern failed:', message)
  }

  return pattern
}

/**
 * 获取最近使用的纹样
 * @param limit 返回数量，默认 10
 * @returns 最近使用的纹样数组
 */
export function getRecentPatterns(limit = 10): Pattern[] {
  const records = dbGetAll<{ patternId: string; usedAt: number }>(RECENT_COLLECTION)
  const sorted = records.sort((a, b) => b.usedAt - a.usedAt).slice(0, limit)
  return sorted
    .map((r) => getPatternById(r.patternId))
    .filter((p): p is Pattern => p !== null)
}

/**
 * 记录纹样使用（内部调用）
 * @param patternId 纹样 ID
 */
export function recordPatternUsage(patternId: string): void {
  const record = { patternId, usedAt: Date.now() }
  dbSet(RECENT_COLLECTION, patternId, record)
}
