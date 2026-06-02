import type { Studio, MemorialCategory } from '@/types/models'
import type { PaginationParams } from '@/types/api'
import { dbGet, dbGetAll, dbSet, dbQuery } from '@/utils/db'

const STUDIO_COLLECTION = 'studios'

/** Mock 工作室数据 */
const MOCK_STUDIOS: Studio[] = [
  {
    studioId: 'studio_01',
    name: '永恒印记宠物纪念工坊',
    address: '北京市朝阳区建国路88号SOHO现代城B座1206',
    location: { latitude: 39.9087, longitude: 116.4605 },
    services: ['pawprint', 'fur', 'jewelry'],
    rating: 4.9,
    reviewCount: 326,
    photos: ['/static/studio/studio01_1.jpg', '/static/studio/studio01_2.jpg'],
    phone: '010-65881234',
    businessHours: '周一至周日 10:00-20:00',
    description: '专注宠物纪念品定制10年，拥有资深匠人团队，提供爪印相框、毛发琉璃、纪念首饰等全品类服务。每件作品均附赠精美礼盒和纪念证书。'
  },
  {
    studioId: 'studio_02',
    name: '毛孩子纪念品定制',
    address: '上海市浦东新区张杨路500号华润时代广场3层',
    location: { latitude: 31.2363, longitude: 121.5154 },
    services: ['seal', 'portrait', 'pawprint'],
    rating: 4.8,
    reviewCount: 218,
    photos: ['/static/studio/studio02_1.jpg', '/static/studio/studio02_2.jpg'],
    phone: '021-58885678',
    businessHours: '周一至周六 09:30-19:30',
    description: '以艺术视角打造宠物专属纪念品，擅长宠物肖像画和个性印章定制。画师均来自专业美术学院，作品风格多样，品质卓越。'
  },
  {
    studioId: 'studio_03',
    name: '爪印时光宠物手作',
    address: '广州市天河区天河路228号正佳广场5楼',
    location: { latitude: 23.1365, longitude: 113.3238 },
    services: ['pawprint', 'fur', 'portrait', 'jewelry'],
    rating: 4.7,
    reviewCount: 189,
    photos: ['/static/studio/studio03_1.jpg', '/static/studio/studio03_2.jpg'],
    phone: '020-38883456',
    businessHours: '周一至周日 10:00-21:00',
    description: '华南地区知名宠物纪念品工作室，提供一站式宠物纪念服务。特色项目包括3D立体爪印、毛发琉璃珠和宠物肖像油画，深受宠物主人好评。'
  },
  {
    studioId: 'studio_04',
    name: '小爪子艺术空间',
    address: '深圳市南山区科技园南区科苑路15号科兴科学园B3单元',
    location: { latitude: 22.5362, longitude: 113.9514 },
    services: ['pawprint', 'seal', 'fur'],
    rating: 4.6,
    reviewCount: 142,
    photos: ['/static/studio/studio04_1.jpg', '/static/studio/studio04_2.jpg'],
    phone: '0755-86887890',
    businessHours: '周二至周日 10:00-18:00',
    description: '深圳本土宠物纪念品牌，主打爪印相框和宠物印章定制。价格亲民，工艺精良，是新手宠物主人的首选工作室。'
  },
  {
    studioId: 'studio_05',
    name: '念念不忘宠物纪念',
    address: '成都市锦江区春熙路26号百盛购物中心2楼',
    location: { latitude: 30.6571, longitude: 104.0818 },
    services: ['pawprint', 'portrait', 'fur', 'seal', 'jewelry'],
    rating: 4.9,
    reviewCount: 401,
    photos: ['/static/studio/studio05_1.jpg', '/static/studio/studio05_2.jpg'],
    phone: '028-86661234',
    businessHours: '周一至周日 09:00-21:00',
    description: '成都人气最高的宠物纪念品工坊，全品类覆盖，尤其擅长纪念首饰定制。提供18K金、925银等多种材质选择，每件首饰附权威鉴定证书。'
  },
  {
    studioId: 'studio_06',
    name: '星桥宠物纪念工作室',
    address: '杭州市西湖区文三路478号华星科技大厦1楼',
    location: { latitude: 30.2847, longitude: 120.1258 },
    services: ['portrait', 'fur', 'pawprint'],
    rating: 4.5,
    reviewCount: 97,
    photos: ['/static/studio/studio06_1.jpg', '/static/studio/studio06_2.jpg'],
    phone: '0571-88885678',
    businessHours: '周三至周一 10:00-19:00',
    description: '杭州新锐宠物纪念工作室，由留法艺术家创办，将法式浪漫融入宠物纪念品设计。特色服务为宠物印象派油画和毛发树脂摆件。'
  }
]

/**
 * 初始化 Mock 工作室数据（首次加载时写入）
 */
function ensureMockData(): void {
  const existing = dbGetAll<Studio>(STUDIO_COLLECTION)
  if (existing.length > 0) return

  MOCK_STUDIOS.forEach((studio) => {
    dbSet(STUDIO_COLLECTION, studio.studioId, studio)
  })
}

/**
 * 计算两点之间的距离（Haversine 公式）
 * @param lat1 纬度1
 * @param lon1 经度1
 * @param lat2 纬度2
 * @param lon2 经度2
 * @returns 距离（千米）
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/** 工作室列表筛选参数 */
interface StudioListParams extends PaginationParams {
  keyword?: string
  service?: MemorialCategory
  minRating?: number
}

/**
 * 获取工作室列表（支持排序/筛选）
 * @param latitude 纬度（用于距离计算）
 * @param longitude 经度（用于距离计算）
 * @param params 筛选与分页参数
 * @returns 工作室分页列表
 */
export function getStudios(latitude?: number, longitude?: number, params?: StudioListParams) {
  ensureMockData()

  let studios = dbGetAll<Studio>(STUDIO_COLLECTION)

  // 计算距离
  if (latitude !== undefined && longitude !== undefined) {
    studios = studios.map((s) => ({
      ...s,
      distance: parseFloat(
        calculateDistance(latitude, longitude, s.location.latitude, s.location.longitude).toFixed(1)
      )
    }))
  }

  // 关键词搜索
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase()
    studios = studios.filter(
      (s) =>
        s.name.toLowerCase().includes(kw) ||
        s.address.toLowerCase().includes(kw) ||
        s.services.some((svc) => svc.toLowerCase().includes(kw))
    )
  }

  // 服务项目筛选
  if (params?.service) {
    studios = studios.filter((s) => s.services.includes(params.service!))
  }

  // 最低评分筛选
  if (params?.minRating) {
    studios = studios.filter((s) => s.rating >= params.minRating!)
  }

  // 排序
  const sortBy = params?.sortBy || 'rating'
  const order = params?.order || 'desc'
  studios.sort((a, b) => {
    const valA = (a as any)[sortBy] ?? 0
    const valB = (b as any)[sortBy] ?? 0
    return order === 'asc' ? valA - valB : valB - valA
  })

  // 分页
  const page = params?.page || 1
  const pageSize = params?.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = studios.slice(start, end)

  return {
    list,
    total: studios.length,
    page,
    pageSize,
    hasMore: end < studios.length
  }
}

/**
 * 获取工作室详情
 * @param studioId 工作室 ID
 * @returns 工作室详情或 null
 */
export function getStudioById(studioId: string): Studio | null {
  ensureMockData()
  return dbGet<Studio>(STUDIO_COLLECTION, studioId)
}

/**
 * 按服务分类筛选工作室
 * @param category 纪念品分类
 * @returns 提供该分类服务的工作室列表
 */
export function getStudiosByService(category: MemorialCategory): Studio[] {
  ensureMockData()
  const all = dbGetAll<Studio>(STUDIO_COLLECTION)
  return all.filter((s) => s.services.includes(category))
}

/**
 * 获取工作室评价
 * @param studioId 工作室 ID
 * @returns 评价列表
 */
export function getStudioReviews(studioId: string): { userName: string; rating: number; content: string; date: string }[] {
  // Mock 评价数据
  const mockReviews = [
    { userName: '猫***妈', rating: 5, content: '爪印相框做得非常精致，细节完美，物流也很快！', date: '2026-04-20' },
    { userName: '汪***爸', rating: 5, content: '毛发琉璃珠很漂亮，能在阳光下看到里面宝宝的毛发，很感动。', date: '2026-04-15' },
    { userName: '兔***主', rating: 4, content: '肖像画画得很像，就是等的时间有点长，不过值得。', date: '2026-04-10' },
    { userName: '狗***迷', rating: 5, content: '纪念首饰品质超出预期，925银质感很好，客服也非常耐心。', date: '2026-04-05' },
    { userName: '喵***酱', rating: 4, content: '印章刻得非常细腻，按出来的图案很清晰，包装也很精美。', date: '2026-03-28' }
  ]

  return mockReviews
}
