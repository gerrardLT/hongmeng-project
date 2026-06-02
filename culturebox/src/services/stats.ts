import type { Entry, EntryType, YearStats } from '@/types/models'

/**
 * 计算指定年份的统计数据
 * @param entries 所有条目
 * @param year 年份
 * @returns 年度统计数据
 */
export function calculateYearStats(entries: Entry[], year: number): YearStats {
  const yearEntries = entries.filter((e) => new Date(e.date).getFullYear() === year)

  const totalBooks = yearEntries.filter((e) => e.type === 'book').length
  const totalMovies = yearEntries.filter((e) => e.type === 'movie').length
  const totalPodcasts = yearEntries.filter((e) => e.type === 'podcast').length
  const totalExhibitions = yearEntries.filter((e) => e.type === 'exhibition').length

  const monthlyDistribution = Array(12).fill(0)
  yearEntries.forEach((e) => {
    const month = new Date(e.date).getMonth()
    monthlyDistribution[month]++
  })

  const typeDistribution: Record<EntryType, number> = {
    book: totalBooks,
    movie: totalMovies,
    podcast: totalPodcasts,
    exhibition: totalExhibitions
  }

  const ratingDistribution = Array(5).fill(0)
  yearEntries.forEach((e) => {
    if (e.rating >= 1 && e.rating <= 5) {
      ratingDistribution[e.rating - 1]++
    }
  })

  // 统计标签使用次数
  const tagCounts = new Map<string, number>()
  yearEntries.forEach((e) => {
    e.tags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
    })
  })

  const topTags = Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    year,
    totalBooks,
    totalMovies,
    totalPodcasts,
    totalExhibitions,
    monthlyDistribution,
    typeDistribution,
    ratingDistribution,
    topTags
  }
}

/**
 * 获取有记录的年份列表
 * @param entries 所有条目
 * @returns 去重并排序的年份数组
 */
export function getAvailableYears(entries: Entry[]): number[] {
  const years = new Set<number>()
  entries.forEach((e) => {
    years.add(new Date(e.date).getFullYear())
  })
  return Array.from(years).sort((a, b) => b - a)
}

/**
 * 获取年度精选条目
 * @param entries 所有条目
 * @param year 年份
 * @param type 条目类型
 * @param limit 返回数量限制
 * @returns 年度精选条目数组
 */
export function getTopEntries(
  entries: Entry[],
  year: number,
  type: EntryType,
  limit?: number
): Entry[] {
  const result = entries
    .filter((e) => new Date(e.date).getFullYear() === year && e.type === type && e.isTopOfYear)
    .sort((a, b) => b.createdAt - a.createdAt)

  return limit ? result.slice(0, limit) : result
}
