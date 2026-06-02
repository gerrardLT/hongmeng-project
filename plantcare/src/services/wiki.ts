/**
 * PlantCare 百科服务
 * 加载、搜索、筛选植物百科数据
 */
import type { PlantWiki, PlantDifficulty, PlantCategory } from '@/types/models'

// 百科数据缓存
let wikiDataCache: PlantWiki[] = []

/**
 * 加载百科数据（从 data 目录或本地存储）
 */
export async function loadWikiData(): Promise<PlantWiki[]> {
  if (wikiDataCache.length > 0) return wikiDataCache

  try {
    // 优先从本地存储加载
    const cached = uni.getStorageSync('plantcare_wiki_data') as PlantWiki[] | undefined
    if (cached && cached.length > 0) {
      wikiDataCache = cached
      return wikiDataCache
    }

    // 从内置数据加载（将来替换为远程API）
    const { wikiPlants } = await import('@/data/wiki-plants')
    wikiDataCache = wikiPlants
    uni.setStorageSync('plantcare_wiki_data', wikiDataCache)

    return wikiDataCache
  } catch (e) {
    console.error('[wiki service] loadWikiData error:', e)
    return []
  }
}

/**
 * 搜索植物（按名称、科名）
 */
export async function searchPlants(keyword: string): Promise<PlantWiki[]> {
  const data = await loadWikiData()
  if (!keyword.trim()) return data

  const kw = keyword.trim().toLowerCase()
  return data.filter(
    (p) =>
      p.name.toLowerCase().includes(kw) ||
      p.scientificName.toLowerCase().includes(kw) ||
      p.family.toLowerCase().includes(kw)
  )
}

/**
 * 按难度筛选
 */
export async function filterByDifficulty(difficulty: PlantDifficulty): Promise<PlantWiki[]> {
  const data = await loadWikiData()
  return data.filter((p) => p.difficulty === difficulty)
}

/**
 * 按分类筛选
 */
export async function filterByCategory(category: PlantCategory): Promise<PlantWiki[]> {
  const data = await loadWikiData()
  return data.filter((p) => p.category.includes(category))
}

/**
 * 获取植物详情
 */
export async function getPlantDetail(speciesId: string): Promise<PlantWiki | null> {
  const data = await loadWikiData()
  return data.find((p) => p.speciesId === speciesId) || null
}
