import type { MemorialType, MemorialCategory } from '@/types/models'
import { dbGet, dbGetAll, dbSet } from '@/utils/db'

const MEMORIAL_COLLECTION = 'memorials'

/** Mock 纪念品种类数据 */
const MOCK_MEMORIAL_TYPES: MemorialType[] = [
  {
    typeId: 'memorial_01',
    name: '爪印相框',
    category: 'pawprint',
    description: '将爱宠的爪印永久珍藏，采用高品质相框搭配精细爪印泥，为您留下最珍贵的记忆。支持3D立体爪印和平面爪印两种形式，可搭配照片、名字刻字等个性化元素。',
    suitablePet: '猫、狗、兔子等中小型宠物',
    duration: '7-14个工作日',
    priceRange: '¥198 - ¥698',
    photos: ['/static/memorial/pawprint_1.jpg', '/static/memorial/pawprint_2.jpg', '/static/memorial/pawprint_3.jpg'],
    technique: '采用安全无毒的宠物专用印泥，配合精细翻模工艺，真实还原每一个细节。相框选用实木或铝合金材质，表面经防氧化处理，持久不褪色。',
    collectionMethod: '使用配套爪印泥在家中自行采集，或将宠物带至工作室由专业人员协助采集。爪印泥开封后需在30分钟内完成采集。',
    createdAt: Date.now()
  },
  {
    typeId: 'memorial_02',
    name: '毛发纪念品',
    category: 'fur',
    description: '将爱宠的毛发制作成精美纪念品，包括毛发琉璃珠、毛发吊坠、毛发树脂摆件等多种形式。每一件都是独一无二的艺术品，让爱宠的温暖永远陪伴在您身边。',
    suitablePet: '猫、狗等有毛发的宠物',
    duration: '10-20个工作日',
    priceRange: '¥298 - ¥1298',
    photos: ['/static/memorial/fur_1.jpg', '/static/memorial/fur_2.jpg', '/static/memorial/fur_3.jpg'],
    technique: '毛发经清洁消毒后，采用真空封装技术封存于琉璃或树脂中。琉璃工艺需在1400°C高温下烧制，确保毛发色泽永不变。树脂工艺采用高透光AB胶，多层浇注消除气泡。',
    collectionMethod: '可在家中自行收集宠物脱落的毛发，建议收集量约5g以上。也可在宠物美容时收集修剪下来的毛发，装入密封袋送至或邮寄至工作室。',
    createdAt: Date.now()
  },
  {
    typeId: 'memorial_03',
    name: '宠物肖像画',
    category: 'portrait',
    description: '由专业画师手绘您爱宠的专属肖像，支持油画、水彩、彩铅、工笔画等多种风格。无论是活泼好动的瞬间还是安静沉睡的模样，都能在画布上永恒定格。',
    suitablePet: '所有宠物类型',
    duration: '15-30个工作日',
    priceRange: '¥398 - ¥2998',
    photos: ['/static/memorial/portrait_1.jpg', '/static/memorial/portrait_2.jpg', '/static/memorial/portrait_3.jpg'],
    technique: '画师根据您提供的照片进行纯手绘创作。油画使用专业级亚麻画布和进口颜料，水彩使用阿诗水彩纸，彩铅使用辉柏嘉艺术家级铅笔。完成后统一进行防潮防紫外线处理。',
    collectionMethod: '请提供3-5张清晰的宠物照片，尽量包含不同角度和表情。画师将根据照片与您沟通创作方向，确认后开始绘制。',
    createdAt: Date.now()
  },
  {
    typeId: 'memorial_04',
    name: '宠物印章',
    category: 'seal',
    description: '以爱宠的形象为主题定制专属印章，可用于书信、手账、贺卡等场景。支持橡皮章、光敏章、木质章等多种材质，让爱宠的印记出现在您生活的每个角落。',
    suitablePet: '所有宠物类型',
    duration: '5-10个工作日',
    priceRange: '¥68 - ¥468',
    photos: ['/static/memorial/seal_1.jpg', '/static/memorial/seal_2.jpg', '/static/memorial/seal_3.jpg'],
    technique: '设计师根据宠物照片进行图案设计，橡皮章采用激光雕刻，光敏章使用感光树脂技术，木质章采用手工刻制。每种材质均有独特的质感和印迹效果。',
    collectionMethod: '提供1-2张宠物侧面或正面照片，要求轮廓清晰。设计师将提取宠物特征线条制作印面图案，设计稿确认后开始制作。',
    createdAt: Date.now()
  },
  {
    typeId: 'memorial_05',
    name: '纪念首饰',
    category: 'jewelry',
    description: '将爱宠的爪印、鼻纹或形象制作成精致首饰，包括项链、手链、耳饰、胸针等。采用925纯银、18K金等贵金属材质，每一件都是可佩戴的永恒纪念。',
    suitablePet: '猫、狗等中小型宠物',
    duration: '14-21个工作日',
    priceRange: '¥498 - ¥3998',
    photos: ['/static/memorial/jewelry_1.jpg', '/static/memorial/jewelry_2.jpg', '/static/memorial/jewelry_3.jpg'],
    technique: '采用失蜡铸造工艺，先将爪印或鼻纹制作成蜡模，再浇铸贵金属。银饰表面镀铑防氧化，金饰可选择性镶嵌锆石或宠物出生石。所有首饰均附权威机构材质鉴定证书。',
    collectionMethod: '使用专用印模材料采集爪印或鼻纹（工作室提供免费印模套装），也可将宠物带至工作室由专业人员采集。印模采集过程安全无痛，宠物无任何不适。',
    createdAt: Date.now()
  }
]

/** 分类标签映射 */
const CATEGORY_LABELS: Record<MemorialCategory, string> = {
  pawprint: '爪印相框',
  fur: '毛发纪念品',
  portrait: '宠物肖像画',
  seal: '宠物印章',
  jewelry: '纪念首饰'
}

/**
 * 初始化 Mock 纪念品种类数据（首次加载时写入）
 */
function ensureMockData(): void {
  const existing = dbGetAll<MemorialType>(MEMORIAL_COLLECTION)
  if (existing.length > 0) return

  MOCK_MEMORIAL_TYPES.forEach((memorial) => {
    dbSet(MEMORIAL_COLLECTION, memorial.typeId, memorial)
  })
}

/**
 * 获取所有纪念品种类列表
 * @returns 纪念品种类列表
 */
export function getMemorialTypes(): MemorialType[] {
  ensureMockData()
  return dbGetAll<MemorialType>(MEMORIAL_COLLECTION)
}

/**
 * 获取单个纪念品种类详情
 * @param typeId 纪念品种类 ID
 * @returns 纪念品种类详情或 null
 */
export function getMemorialTypeById(typeId: string): MemorialType | null {
  ensureMockData()
  return dbGet<MemorialType>(MEMORIAL_COLLECTION, typeId)
}

/**
 * 按分类筛选纪念品种类
 * @param category 纪念品分类
 * @returns 该分类下的纪念品种类列表
 */
export function getMemorialTypesByCategory(category: MemorialCategory): MemorialType[] {
  ensureMockData()
  const all = dbGetAll<MemorialType>(MEMORIAL_COLLECTION)
  return all.filter((m) => m.category === category)
}

/**
 * 获取案例照片
 * @param typeId 纪念品种类 ID
 * @returns 案例照片 URL 数组
 */
export function getCasePhotos(typeId: string): string[] {
  const memorial = getMemorialTypeById(typeId)
  return memorial?.photos || []
}

/**
 * 获取分类标签
 * @param category 纪念品分类
 * @returns 分类标签文字
 */
export function getCategoryLabel(category: MemorialCategory): string {
  return CATEGORY_LABELS[category] || '未知分类'
}

/**
 * 获取所有分类
 * @returns 分类列表
 */
export function getAllCategories(): { value: MemorialCategory; label: string }[] {
  return Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as MemorialCategory,
    label
  }))
}
