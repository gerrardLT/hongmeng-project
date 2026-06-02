import type { Studio } from '@/types/models'
import { dbGet, dbGetAll, dbSet } from '@/utils/db'
import { sortStudiosByDistance } from '@/utils/location'

const STUDIO_COLLECTION = 'studios'

/** Mock 工作室数据 */
const MOCK_STUDIOS: Studio[] = [
  {
    studioId: 'studio_01',
    name: '金石篆刻坊',
    address: '北京市西城区琉璃厂东街68号',
    location: { latitude: 39.8963, longitude: 116.3712 },
    services: ['name', 'leisure', 'bookplate'],
    rating: 4.9,
    reviewCount: 386,
    photos: ['/static/images/studios/studio-1.png'],
    phone: '010-63041234',
    businessHours: '周一至周日 09:30-18:30',
    description: '坐落琉璃厂文化街，传承三代的篆刻世家，专注姓名章与闲章定制。师傅师从西泠印社名家，刀法精湛，金石韵味十足。店内陈列各类名石，可现场挑选石料，亲睹刻制过程。',
    distance: undefined,
    masterName: '王石安',
    specialties: ['name', 'leisure', 'collection']
  },
  {
    studioId: 'studio_02',
    name: '方寸印舍',
    address: '上海市黄浦区福州路380号',
    location: { latitude: 31.2345, longitude: 121.4782 },
    services: ['name', 'leisure', 'bookplate', 'signature', 'collection'],
    rating: 4.8,
    reviewCount: 272,
    photos: ['/static/images/studios/studio-2.png'],
    phone: '021-63225678',
    businessHours: '周一至周六 10:00-19:00',
    description: '上海老牌篆刻工作室，以"方寸之间见天地"为理念，提供全品类印章定制服务。擅长将传统篆刻与现代设计美学融合，为年轻客户打造兼具古韵与时尚的个性印章。',
    distance: undefined,
    masterName: '陈印白',
    specialties: ['name', 'signature', 'leisure']
  },
  {
    studioId: 'studio_03',
    name: '翰墨金石',
    address: '杭州市上城区河坊街128号',
    location: { latitude: 30.2478, longitude: 120.1685 },
    services: ['name', 'bookplate', 'collection'],
    rating: 4.9,
    reviewCount: 315,
    photos: ['/static/images/studios/studio-3.png'],
    phone: '0571-87663456',
    businessHours: '周二至周日 09:00-18:00',
    description: '西泠印社旁的篆刻名店，师承浙派篆刻传统，尤善藏书章与收藏章。选料讲究，多用昌化鸡血石、青田封门青等名贵石种。每方印章均附作者亲笔签名证书，具有收藏价值。',
    distance: undefined,
    masterName: '林墨轩',
    specialties: ['bookplate', 'collection', 'name']
  },
  {
    studioId: 'studio_04',
    name: '铁笔斋',
    address: '南京市秦淮区夫子庙贡院街56号',
    location: { latitude: 32.0328, longitude: 118.7946 },
    services: ['name', 'leisure', 'signature'],
    rating: 4.7,
    reviewCount: 198,
    photos: ['/static/images/studios/studio-4.png'],
    phone: '025-52227890',
    businessHours: '周一至周日 10:00-20:00',
    description: '六朝古都的篆刻老店，以铁笔刻铜著称，铜印制作工艺独步一方。同时提供木质、石质印章定制，价格亲民，是入门印章爱好者的首选。可加急制作，最快当天取件。',
    distance: undefined,
    masterName: '张铁生',
    specialties: ['name', 'signature', 'leisure']
  },
  {
    studioId: 'studio_05',
    name: '云章阁',
    address: '成都市青羊区宽窄巷子井巷子12号',
    location: { latitude: 30.6698, longitude: 104.0556 },
    services: ['name', 'leisure', 'bookplate', 'signature', 'collection'],
    rating: 4.8,
    reviewCount: 256,
    photos: ['/static/images/studios/studio-5.png'],
    phone: '028-86261234',
    businessHours: '周一至周日 09:30-19:30',
    description: '宽窄巷子内的文雅篆刻工坊，融合巴蜀文化元素与篆刻艺术，独创蜀韵风格印章。特色服务包括熊猫主题闲章、川剧脸谱藏书章等文创印章。环境雅致，可品茗赏印，体验慢生活。',
    distance: undefined,
    masterName: '赵云章',
    specialties: ['leisure', 'bookplate', 'name', 'collection']
  },
  {
    studioId: 'studio_06',
    name: '印道工作室',
    address: '广州市越秀区北京路312号',
    location: { latitude: 23.1289, longitude: 113.2645 },
    services: ['name', 'signature', 'leisure'],
    rating: 4.6,
    reviewCount: 163,
    photos: ['/static/images/studios/studio-6.png'],
    phone: '020-83334567',
    businessHours: '周二至周日 10:00-18:30',
    description: '广州本土篆刻品牌，擅长商务签名章和姓名章定制。引入数字化设计流程，可在手机端实时预览印面效果，确认后再手工刻制，兼顾效率与品质。提供企业批量定制服务。',
    distance: undefined,
    masterName: '黄印道',
    specialties: ['signature', 'name']
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
 * 获取所有工作室
 * @returns 工作室列表
 */
export function getStudios(): Studio[] {
  ensureMockData()
  return dbGetAll<Studio>(STUDIO_COLLECTION)
}

/**
 * 获取附近工作室（按距离排序）
 * @param lat 用户纬度
 * @param lng 用户经度
 * @returns 按距离排序的工作室列表
 */
export function getNearbyStudios(lat: number, lng: number): Studio[] {
  ensureMockData()
  const studios = dbGetAll<Studio>(STUDIO_COLLECTION)
  return sortStudiosByDistance(studios, lat, lng)
}

/**
 * 获取工作室详情
 * @param id 工作室 ID
 * @returns 工作室详情或 null
 */
export function getStudioById(id: string): Studio | null {
  ensureMockData()
  return dbGet<Studio>(STUDIO_COLLECTION, id)
}

/**
 * 获取工作室评价
 * @param id 工作室 ID
 * @returns 评价列表
 */
export function getStudioReviews(id: string): { userName: string; rating: number; content: string; date: string }[] {
  // Mock 评价数据
  const mockReviews = [
    { userName: '文***客', rating: 5, content: '姓名章刻得非常精细，篆书古朴大气，石料品质也很好，下次还来！', date: '2026-04-22' },
    { userName: '书***人', rating: 5, content: '藏书章设计很用心，师傅根据我的需求调整了多次，最后效果超出预期。', date: '2026-04-18' },
    { userName: '墨***缘', rating: 4, content: '闲章刻得不错，就是等待时间稍长，不过好东西值得等。', date: '2026-04-12' },
    { userName: '印***痴', rating: 5, content: '收藏章用鸡血石刻的，血色鲜艳，印面清晰，包装也很精美，送人很有面子。', date: '2026-04-05' },
    { userName: '雅***士', rating: 4, content: '签名章设计很专业，师傅还帮我优化了字形，盖印效果比想象中好很多。', date: '2026-03-28' }
  ]

  return mockReviews
}
