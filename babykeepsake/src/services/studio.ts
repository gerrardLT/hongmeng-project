import type { Studio } from '@/types/models'
import type { PaginationParams } from '@/types/api'
import { dbGet, dbGetAll, dbSet, dbQuery } from '@/utils/db'

const STUDIO_COLLECTION = 'studios'

/** Mock 工作室数据 */
const MOCK_STUDIOS: Studio[] = [
  {
    studioId: 'studio_01',
    name: '初见纪念手工坊',
    address: '北京市朝阳区建国路88号SOHO现代城B座1206',
    location: { latitude: 39.9087, longitude: 116.4605 },
    services: ['手足印相框', '胎毛画', '胎毛笔', '出生纪念框'],
    rating: 4.9,
    photos: ['/static/studio/studio01_1.jpg', '/static/studio/studio01_2.jpg'],
    phone: '010-65881234',
    businessHours: '周一至周日 10:00-20:00'
  },
  {
    studioId: 'studio_02',
    name: '宝贝时光工坊',
    address: '上海市浦东新区张杨路500号华润时代广场3层',
    location: { latitude: 31.2363, longitude: 121.5154 },
    services: ['胎毛印章', '脐带纪念品', '乳牙保存盒', '成长时间轴相框'],
    rating: 4.8,
    photos: ['/static/studio/studio02_1.jpg', '/static/studio/studio02_2.jpg'],
    phone: '021-58885678',
    businessHours: '周一至周六 09:30-19:30'
  },
  {
    studioId: 'studio_03',
    name: '萌印纪亲子手作',
    address: '广州市天河区天河路228号正佳广场5楼',
    location: { latitude: 23.1365, longitude: 113.3238 },
    services: ['手足印相框', '胎毛笔', '胎毛画', '出生纪念框', '成长时间轴相框'],
    rating: 4.7,
    photos: ['/static/studio/studio03_1.jpg', '/static/studio/studio03_2.jpg'],
    phone: '020-38883456',
    businessHours: '周一至周日 10:00-21:00'
  },
  {
    studioId: 'studio_04',
    name: '小小手印艺术空间',
    address: '深圳市南山区科技园南区科苑路15号科兴科学园B3单元',
    location: { latitude: 22.5362, longitude: 113.9514 },
    services: ['手足印相框', '胎毛印章', '乳牙保存盒'],
    rating: 4.6,
    photos: ['/static/studio/studio04_1.jpg', '/static/studio/studio04_2.jpg'],
    phone: '0755-86887890',
    businessHours: '周二至周日 10:00-18:00'
  },
  {
    studioId: 'studio_05',
    name: '纽爱母婴纪念定制',
    address: '成都市锦江区春熙路26号百盛购物中心2楼',
    location: { latitude: 30.6571, longitude: 104.0818 },
    services: ['手足印相框', '胎毛画', '胎毛笔', '胎毛印章', '脐带纪念品', '出生纪念框'],
    rating: 4.9,
    photos: ['/static/studio/studio05_1.jpg', '/static/studio/studio05_2.jpg'],
    phone: '028-86661234',
    businessHours: '周一至周日 09:00-21:00'
  },
  {
    studioId: 'studio_06',
    name: '印记宝宝纪念品',
    address: '杭州市西湖区文三路478号华星科技大厦1楼',
    location: { latitude: 30.2847, longitude: 120.1258 },
    services: ['手足印相框', '胎毛画', '成长时间轴相框'],
    rating: 4.5,
    photos: ['/static/studio/studio06_1.jpg', '/static/studio/studio06_2.jpg'],
    phone: '0571-88885678',
    businessHours: '周三至周一 10:00-19:00'
  },
  {
    studioId: 'studio_07',
    name: '掌心纪念工作室',
    address: '南京市鼓楼区中山北路283号南京新百3楼',
    location: { latitude: 32.0617, longitude: 118.7778 },
    services: ['手足印相框', '胎毛笔', '胎毛印章', '乳牙保存盒', '脐带纪念品'],
    rating: 4.7,
    photos: ['/static/studio/studio07_1.jpg', '/static/studio/studio07_2.jpg'],
    phone: '025-83889012',
    businessHours: '周一至周六 09:30-18:30'
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
  const R = 6371 // 地球半径（千米）
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
  service?: string
  minRating?: number
}

/**
 * 获取工作室列表（支持排序/筛选）
 * @param params 筛选与分页参数
 * @returns 工作室分页列表
 */
export function getStudioList(params?: StudioListParams) {
  ensureMockData()

  let studios = dbGetAll<Studio>(STUDIO_COLLECTION)

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
export function getStudioDetail(studioId: string): Studio | null {
  ensureMockData()
  return dbGet<Studio>(STUDIO_COLLECTION, studioId)
}

/**
 * 获取附近工作室
 * @param lat 纬度
 * @param lon 经度
 * @param radius 搜索半径（千米，默认50）
 * @returns 附近工作室列表（按距离升序）
 */
export function getNearbyStudios(lat: number, lon: number, radius = 50): Studio[] {
  ensureMockData()

  const studios = dbGetAll<Studio>(STUDIO_COLLECTION)

  return studios
    .map((studio) => ({
      ...studio,
      distance: parseFloat(
        calculateDistance(lat, lon, studio.location.latitude, studio.location.longitude).toFixed(1)
      )
    }))
    .filter((studio) => studio.distance! <= radius)
    .sort((a, b) => (a.distance || 0) - (b.distance || 0))
}
