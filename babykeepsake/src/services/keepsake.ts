import type { KeepsakeType, KeepsakeCategory } from '@/types/models'
import type { PageResult } from '@/types/api'
import { dbGet, dbGetAll, dbSet, dbQuery } from '@/utils/db'

const KEEPSAKE_COLLECTION = 'keepsakes'

/** Mock 纪念品数据 */
const MOCK_KEEPSAKES: KeepsakeType[] = [
  {
    typeId: 'ks_handprint_frame',
    name: '手足印相框',
    category: 'handprint',
    description: '将宝宝娇嫩的手印和脚印拓印后，精心装裱入实木相框，搭配出生信息卡，成为独一无二的成长纪念。采用安全无毒的印泥，对宝宝肌肤零刺激，拓印过程轻松愉快。',
    suitableAge: '0-12个月',
    duration: '7-10个工作日',
    priceRange: '298-598元',
    photos: ['/static/keepsake/handprint_1.jpg', '/static/keepsake/handprint_2.jpg'],
    technique: '安全印泥拓印 + 实木装裱，可搭配烫金出生信息卡',
    storageMethod: '避免阳光直射，保持干燥环境，定期用软布轻拭框面',
    createdAt: Date.now() - 86400000 * 30
  },
  {
    typeId: 'ks_hair_painting',
    name: '胎毛画',
    category: 'hair',
    description: '将宝宝第一次理下的胎毛，经过清洁消毒后，由专业画师精心粘贴成书画作品。可定制书法、水墨、卡通等多种风格，将宝贝的胎毛融入艺术创作中，寓意深远。',
    suitableAge: '0-6个月（胎毛采集期）',
    duration: '15-20个工作日',
    priceRange: '398-1280元',
    photos: ['/static/keepsake/hair_painting_1.jpg', '/static/keepsake/hair_painting_2.jpg'],
    technique: '胎毛清洁消毒 + 传统装裱工艺，宣纸/绢布底材，手工粘贴',
    storageMethod: '装裱后悬挂于干燥通风处，避免潮湿环境，无需特殊保养',
    createdAt: Date.now() - 86400000 * 25
  },
  {
    typeId: 'ks_hair_brush',
    name: '胎毛笔',
    category: 'hair',
    description: '以宝宝胎毛为笔毫，精选优质竹木或牛角为笔杆，手工制作成毛笔。自古有"胎毛笔"传统，寓意文运亨通、前程似锦，是中华传统育儿文化的珍贵传承。',
    suitableAge: '0-6个月（胎毛采集期）',
    duration: '10-15个工作日',
    priceRange: '268-688元',
    photos: ['/static/keepsake/hair_brush_1.jpg', '/static/keepsake/hair_brush_2.jpg'],
    technique: '胎毛梳理扎束 + 传统制笔工艺，天然竹木/牛角笔杆，刻字定制',
    storageMethod: '置于笔盒中存放，避免潮湿，可放入防虫樟木片',
    createdAt: Date.now() - 86400000 * 20
  },
  {
    typeId: 'ks_hair_seal',
    name: '胎毛印章',
    category: 'hair',
    description: '将宝宝胎毛封存于水晶或玛瑙印章之中，可刻宝宝姓名和生日。晶莹剔透的材质包裹着珍贵胎毛，既是实用印章，又是一生珍藏的纪念品。',
    suitableAge: '0-6个月（胎毛采集期）',
    duration: '12-18个工作日',
    priceRange: '358-998元',
    photos: ['/static/keepsake/hair_seal_1.jpg', '/static/keepsake/hair_seal_2.jpg'],
    technique: '胎毛真空封装 + 水晶/玛瑙切割打磨，激光刻字，底面篆刻',
    storageMethod: '避免磕碰，定期擦拭保持光泽，远离高温',
    createdAt: Date.now() - 86400000 * 18
  },
  {
    typeId: 'ks_tooth_box',
    name: '乳牙保存盒',
    category: 'tooth',
    description: '精巧可爱的乳牙收藏盒，每个小格子对应一颗乳牙脱落的位置，记录宝宝换牙的完整过程。盒盖内侧可刻姓名和起始日期，是成长记录的温馨载体。',
    suitableAge: '6个月-7岁（乳牙脱落期）',
    duration: '3-5个工作日',
    priceRange: '128-358元',
    photos: ['/static/keepsake/tooth_box_1.jpg', '/static/keepsake/tooth_box_2.jpg'],
    technique: '榉木/锌合金外壳 + EVA内衬，激光刻字，每槽对应牙位图',
    storageMethod: '乳牙清洗晾干后放入，保持干燥，定期检查内衬状态',
    createdAt: Date.now() - 86400000 * 15
  },
  {
    typeId: 'ks_birth_frame',
    name: '出生纪念框',
    category: 'birth',
    description: '将宝宝的出生信息卡、小手印、第一张照片整合设计，搭配精美相框。记录出生日期、时辰、体重、身长等珍贵数据，是送给自己和长辈最温馨的新生礼物。',
    suitableAge: '新生儿',
    duration: '5-8个工作日',
    priceRange: '198-498元',
    photos: ['/static/keepsake/birth_frame_1.jpg', '/static/keepsake/birth_frame_2.jpg'],
    technique: '专业排版设计 + 高清印刷 + 实木/金属相框，UV覆膜防褪色',
    storageMethod: '悬挂或摆放在阴凉处，避免阳光直射导致褪色',
    createdAt: Date.now() - 86400000 * 12
  },
  {
    typeId: 'ks_umbilical_cord',
    name: '脐带纪念品',
    category: 'birth',
    description: '将宝宝脱落的脐带干燥处理后，封存于精美容器中。脐带是母子连心的见证，封存这份纪念象征着生命的起源与传承。可做成项链坠、钥匙扣或摆件。',
    suitableAge: '新生儿（脐带脱落期）',
    duration: '7-12个工作日',
    priceRange: '258-688元',
    photos: ['/static/keepsake/umbilical_1.jpg', '/static/keepsake/umbilical_2.jpg'],
    technique: '脐带干燥防腐处理 + 树脂封装/银饰镶嵌，手工塑形',
    storageMethod: '树脂封装品正常佩戴即可，银饰定期擦拭防氧化',
    createdAt: Date.now() - 86400000 * 10
  },
  {
    typeId: 'ks_growth_timeline',
    name: '成长时间轴相框',
    category: 'growth',
    description: '创意时间轴设计，将宝宝从出生到周岁的12个月照片依次排列，搭配月龄贴纸和成长数据，直观呈现宝宝每月的变化。记录从初生到蹒跚学步的每一步成长。',
    suitableAge: '0-12个月',
    duration: '5-7个工作日',
    priceRange: '168-398元',
    photos: ['/static/keepsake/growth_timeline_1.jpg', '/static/keepsake/growth_timeline_2.jpg'],
    technique: '专业模板排版 + 布纹/光面相纸输出，实木多格相框',
    storageMethod: '悬挂于室内墙面，避免潮湿和阳光直射',
    createdAt: Date.now() - 86400000 * 5
  }
]

/** 案例数据 */
interface KeepsakeCase {
  caseId: string
  typeId: string
  title: string
  description: string
  photos: string[]
  designStyle: string
  createdAt: number
}

const MOCK_CASES: KeepsakeCase[] = [
  {
    caseId: 'case_001',
    typeId: 'ks_handprint_frame',
    title: '双印合一经典款',
    description: '宝宝左手印与右脚印对称排列，金色印泥搭配原木色相框，中央嵌入出生信息烫金卡片。',
    photos: ['/static/cases/handprint_case1.jpg'],
    designStyle: 'vintage',
    createdAt: Date.now() - 86400000 * 20
  },
  {
    caseId: 'case_002',
    typeId: 'ks_handprint_frame',
    title: '卡通手印趣味版',
    description: '将宝宝手印搭配可爱卡通元素，粉色系配色，适合女宝宝，整体风格活泼甜美。',
    photos: ['/static/cases/handprint_case2.jpg'],
    designStyle: 'cartoon',
    createdAt: Date.now() - 86400000 * 15
  },
  {
    caseId: 'case_003',
    typeId: 'ks_hair_painting',
    title: '水墨胎毛画',
    description: '以胎毛粘贴成远山水墨意境画，书法题写宝宝姓名与生辰，传统与纪念完美融合。',
    photos: ['/static/cases/hair_painting_case1.jpg'],
    designStyle: 'traditional',
    createdAt: Date.now() - 86400000 * 18
  },
  {
    caseId: 'case_004',
    typeId: 'ks_hair_brush',
    title: '牛角胎毛笔定制款',
    description: '精选天然牛角笔杆，胎毛扎束后手工制笔，杆身刻宝宝姓名，附精美笔盒。',
    photos: ['/static/cases/hair_brush_case1.jpg'],
    designStyle: 'traditional',
    createdAt: Date.now() - 86400000 * 12
  },
  {
    caseId: 'case_005',
    typeId: 'ks_hair_seal',
    title: '水晶胎毛印章',
    description: '透明水晶印章内封胎毛，侧面激光刻姓名与生日，底部篆刻宝宝名字。',
    photos: ['/static/cases/hair_seal_case1.jpg'],
    designStyle: 'modern',
    createdAt: Date.now() - 86400000 * 8
  },
  {
    caseId: 'case_006',
    typeId: 'ks_tooth_box',
    title: '萌兔乳牙盒',
    description: '兔耳朵造型的锌合金乳牙盒，粉色/蓝色可选，内衬柔软EVA，每个槽位标注牙位。',
    photos: ['/static/cases/tooth_box_case1.jpg'],
    designStyle: 'cartoon',
    createdAt: Date.now() - 86400000 * 6
  },
  {
    caseId: 'case_007',
    typeId: 'ks_birth_frame',
    title: 'ins风出生信息框',
    description: '简约白色系排版，搭配干花和麻绳装饰，记录宝宝出生的全部数据，清新文艺。',
    photos: ['/static/cases/birth_frame_case1.jpg'],
    designStyle: 'modern',
    createdAt: Date.now() - 86400000 * 4
  },
  {
    caseId: 'case_008',
    typeId: 'ks_growth_timeline',
    title: '12格成长相框',
    description: '3×4排列的12格实木相框，每月一张照片配上月龄贴纸，记录从0到12个月的蜕变。',
    photos: ['/static/cases/growth_case1.jpg'],
    designStyle: 'modern',
    createdAt: Date.now() - 86400000 * 2
  }
]

/**
 * 初始化 Mock 纪念品数据（首次加载时写入）
 */
function ensureMockData(): void {
  const existing = dbGetAll<KeepsakeType>(KEEPSAKE_COLLECTION)
  if (existing.length > 0) return

  MOCK_KEEPSAKES.forEach((item) => {
    dbSet(KEEPSAKE_COLLECTION, item.typeId, item)
  })

  MOCK_CASES.forEach((item) => {
    dbSet('keepsake_cases', item.caseId, item)
  })
}

/**
 * 获取纪念品类型列表
 * @param category 可选分类筛选
 * @returns 纪念品类型数组
 */
export function getKeepsakeList(category?: KeepsakeCategory): KeepsakeType[] {
  ensureMockData()

  if (category) {
    return dbQuery<KeepsakeType>(KEEPSAKE_COLLECTION, (item) => item.category === category)
  }

  return dbGetAll<KeepsakeType>(KEEPSAKE_COLLECTION).sort((a, b) => a.createdAt - b.createdAt)
}

/**
 * 获取纪念品详情
 * @param typeId 纪念品类型 ID
 * @returns 纪念品详情或 null
 */
export function getKeepsakeDetail(typeId: string): KeepsakeType | null {
  ensureMockData()
  return dbGet<KeepsakeType>(KEEPSAKE_COLLECTION, typeId)
}

/**
 * 获取纪念品案例
 * @param typeId 纪念品类型 ID
 * @param page 页码（从1开始）
 * @param pageSize 每页数量
 * @returns 分页案例数据
 */
export function getKeepsakeCases(typeId: string, page = 1, pageSize = 10): PageResult<KeepsakeCase> {
  ensureMockData()

  const allCases = dbQuery<KeepsakeCase>('keepsake_cases', (item) => item.typeId === typeId)
    .sort((a, b) => b.createdAt - a.createdAt)

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const list = allCases.slice(start, end)

  return {
    list,
    total: allCases.length,
    page,
    pageSize,
    hasMore: end < allCases.length
  }
}
