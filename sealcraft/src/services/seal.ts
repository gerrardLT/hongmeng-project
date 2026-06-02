import type { SealType, Material, FontStyle, SealCategory } from '@/types/models'
import { dbGet, dbGetAll, dbSet } from '@/utils/db'

const SEAL_TYPE_COLLECTION = 'seal_types'
const MATERIAL_COLLECTION = 'materials'
const FONT_STYLE_COLLECTION = 'font_styles'

/** Mock 印章类型数据 */
const MOCK_SEAL_TYPES: SealType[] = [
  {
    typeId: 'seal_type_01',
    name: '姓名章',
    category: 'name',
    description: '姓名章是最为传统和常见的印章类型，以个人姓名为主要内容，通常采用篆书刻制。自古以来，姓名章便是个人身份的重要标识，在书画作品、重要文件、信函往来中不可或缺。一方精工细作的姓名章，既是实用的签名工具，也是彰显个人品位的文化象征。',
    usage: '书画落款、文件签署、信函封蜡、收藏标记',
    priceRange: '¥128 - ¥1,280',
    photos: ['/static/images/seals/name-seal-1.png', '/static/images/seals/name-seal-2.png', '/static/images/seals/name-seal-3.png']
  },
  {
    typeId: 'seal_type_02',
    name: '闲章',
    category: 'leisure',
    description: '闲章又称"闲文印"，刻有成语、诗词、格言、座右铭等内容，是中国文人最富个性化的印章类型。闲章不拘于姓名，而以表达志趣、寄托情怀为旨，往往能从方寸之间窥见印主的心境与追求。常见内容如"淡泊明志""宁静致远""厚德载物"等，既是文房雅物，亦是心灵写照。',
    usage: '书画引首、压角印、书房装饰、礼品馈赠',
    priceRange: '¥158 - ¥1,580',
    photos: ['/static/images/seals/leisure-seal-1.png', '/static/images/seals/leisure-seal-2.png', '/static/images/seals/leisure-seal-3.png']
  },
  {
    typeId: 'seal_type_03',
    name: '藏书章',
    category: 'bookplate',
    description: '藏书章是藏书爱好者专用的标识印章，通常刻有"某某藏书""某某珍藏""某某阅读"等字样，盖在书籍扉页或切口处，用以标示书籍归属和藏主身份。藏书章历史悠久，自宋代私家藏书兴起后便广为流传。一枚精美的藏书章不仅是爱书人的身份标识，更是一种文化传承和雅致生活态度的体现。',
    usage: '书籍标记、藏书标识、图书馆专用、阅读纪念',
    priceRange: '¥98 - ¥880',
    photos: ['/static/images/seals/bookplate-seal-1.png', '/static/images/seals/bookplate-seal-2.png', '/static/images/seals/bookplate-seal-3.png']
  },
  {
    typeId: 'seal_type_04',
    name: '签名章',
    category: 'signature',
    description: '签名章以个人签名为印面内容，兼具传统印章的庄重与现代签名的便捷。在商务活动、合同签署、作品授权等场景中，签名章可替代手写签名，既高效又具有防伪性。设计上融合了书法艺术与个人风格，使每一枚签名章都独一无二。现代签名章还可搭配光敏印垫，实现快速清晰的重复盖印。',
    usage: '合同签署、商务文件、作品授权、日常办公',
    priceRange: '¥168 - ¥1,380',
    photos: ['/static/images/seals/signature-seal-1.png', '/static/images/seals/signature-seal-2.png', '/static/images/seals/signature-seal-3.png']
  },
  {
    typeId: 'seal_type_05',
    name: '收藏章',
    category: 'collection',
    description: '收藏章是艺术收藏领域专用的鉴藏印章，用于标注藏品的归属和流传经历。传统收藏章多刻有"某某珍藏""某某鉴赏""某某过眼"等字样，钤盖于书画、碑帖、古籍等藏品之上。历代收藏章的递传钤盖，本身便构成了藏品流传有序的重要证据，具有极高的文献和艺术价值。',
    usage: '艺术品收藏标记、书画鉴赏、文博馆专用、传承标识',
    priceRange: '¥138 - ¥1,180',
    photos: ['/static/images/seals/collection-seal-1.png', '/static/images/seals/collection-seal-2.png', '/static/images/seals/collection-seal-3.png']
  }
]

/** Mock 材质数据 */
const MOCK_MATERIALS: Material[] = [
  {
    materialId: 'mat_01',
    name: '铜',
    features: ['经久耐用', '质感厚重', '适合精细刻制', '抗氧化性强', '可镀金镀银'],
    priceRange: '¥128 - ¥680',
    suitableFor: ['name', 'signature', 'collection'],
    hardness: '中等（莫氏3-4度）',
    texture: '金属光泽，手感沉稳，可做古铜、镀金、镀银等表面处理',
    photos: ['/static/images/materials/copper-1.png', '/static/images/materials/copper-2.png']
  },
  {
    materialId: 'mat_02',
    name: '寿山石',
    features: ['石质温润', '易于受刀', '纹理天然', '历史名石', '适合篆刻'],
    priceRange: '¥258 - ¥3,880',
    suitableFor: ['name', 'leisure', 'bookplate', 'collection'],
    hardness: '较软（莫氏2-3度）',
    texture: '质地细腻温润，色彩丰富多变，以田黄、芙蓉、杜陵等品种最为名贵，是篆刻首选石料',
    photos: ['/static/images/materials/shoushan-1.png', '/static/images/materials/shoushan-2.png']
  },
  {
    materialId: 'mat_03',
    name: '青田石',
    features: ['脆爽宜刀', '色泽淡雅', '封门青名品', '篆刻佳石', '性价比高'],
    priceRange: '¥168 - ¥2,280',
    suitableFor: ['name', 'leisure', 'bookplate'],
    hardness: '较软（莫氏2-3度）',
    texture: '石质爽脆，刀感清脆利落，以封门青、灯光冻、蓝星等品种著称，为篆刻界四大名石之一',
    photos: ['/static/images/materials/qingtian-1.png', '/static/images/materials/qingtian-2.png']
  },
  {
    materialId: 'mat_04',
    name: '牛角',
    features: ['天然材质', '温润如玉', '轻便便携', '经久耐磨', '独特纹理'],
    priceRange: '¥98 - ¥580',
    suitableFor: ['name', 'signature', 'bookplate'],
    hardness: '中等（莫氏3度）',
    texture: '天然角质纹理，色泽由浅黄至深棕渐变，触感温润光滑，随身携带不易磕损',
    photos: ['/static/images/materials/horn-1.png', '/static/images/materials/horn-2.png']
  },
  {
    materialId: 'mat_05',
    name: '檀木',
    features: ['香气怡人', '纹理典雅', '文化底蕴深厚', '越用越润', '环保天然'],
    priceRange: '¥148 - ¥1,280',
    suitableFor: ['name', 'leisure', 'bookplate', 'collection'],
    hardness: '较硬（莫氏4-5度）',
    texture: '紫檀色泽深沉，绿檀幽香淡雅，黑檀纹理分明，木质印章古朴典雅，盘玩后愈加润泽',
    photos: ['/static/images/materials/sandalwood-1.png', '/static/images/materials/sandalwood-2.png']
  },
  {
    materialId: 'mat_06',
    name: '鸡血石',
    features: ['血色鲜红', '名贵石种', '收藏价值高', '寓意吉祥', '产量稀少'],
    priceRange: '¥580 - ¥8,800',
    suitableFor: ['name', 'leisure', 'collection'],
    hardness: '较软（莫氏2-3度）',
    texture: '辰砂浸润形成鲜红"血色"，与灰白或淡黄的"地子"交相辉映，昌化鸡血石为印石三宝之一',
    photos: ['/static/images/materials/jixue-1.png', '/static/images/materials/jixue-2.png']
  }
]

/** Mock 字体风格数据 */
const MOCK_FONT_STYLES: FontStyle[] = [
  {
    fontId: 'font_01',
    name: '篆书',
    style: '古朴典雅',
    sampleText: '大音希声',
    suitableFor: ['name', 'leisure', 'bookplate', 'collection'],
    history: '篆书是最早的汉字书体，源于殷商甲骨文，成熟于秦代小篆。篆书笔画匀称圆润，结构对称均衡，具有庄重典雅的艺术风格。篆刻艺术以篆书为基础，"以篆入印"是篆刻最根本的传统。秦代李斯统一文字为小篆，使篆书成为印章的正统字体，延续至今已有两千余年历史。篆书印章浑厚古朴，最能体现金石韵味。',
    photos: ['/static/images/fonts/seal-script.png']
  },
  {
    fontId: 'font_02',
    name: '隶书',
    style: '端庄舒展',
    sampleText: '宁静致远',
    suitableFor: ['name', 'leisure', 'signature'],
    history: '隶书起源于秦代，盛于汉代，是汉字由古文字向今文字过渡的关键书体。隶书以"蚕头雁尾"的笔画特征著称，横画起笔如蚕头，收笔如雁尾，舒展大方，气势开张。汉代碑刻多用隶书，故又称"汉隶"。隶书入印在明清时期开始流行，其方整端庄的风格为印章增添了古朴庄重的气息，特别适合姓名章和闲章。',
    photos: ['/static/images/fonts/clerical-script.png']
  },
  {
    fontId: 'font_03',
    name: '楷书',
    style: '端正严谨',
    sampleText: '厚德载物',
    suitableFor: ['name', 'bookplate', 'signature'],
    history: '楷书又称正书、真书，形成于东汉末年，至唐代达到鼎盛。楷书笔画规范、结构端正，是最易辨识的书体。楷书四大家——欧阳询、颜真卿、柳公权、赵孟頫，各成一家，影响深远。楷书入印虽非篆刻主流，但在藏书章、签名章等实用印章中广受欢迎，其清晰可读的特点使印章内容一目了然，兼具实用性与艺术性。',
    photos: ['/static/images/fonts/regular-script.png']
  },
  {
    fontId: 'font_04',
    name: '行书',
    style: '流畅灵动',
    sampleText: '上善若水',
    suitableFor: ['leisure', 'signature', 'collection'],
    history: '行书是介于楷书与草书之间的书体，由后汉颍川刘德升所创，至晋代王羲之达到巅峰，其《兰亭序》被誉为"天下第一行书"。行书书写流畅自然，既保留楷书的可识性，又兼具草书的灵动韵律，是最富表现力的书体之一。行书入印线条活泼，气韵生动，适合表达洒脱不羁的个性，在闲章和收藏章中尤有韵味。',
    photos: ['/static/images/fonts/running-script.png']
  }
]

/**
 * 初始化 Mock 数据（首次加载时写入）
 */
export function initSealData(): void {
  // 初始化印章类型
  const existingTypes = dbGetAll<SealType>(SEAL_TYPE_COLLECTION)
  if (existingTypes.length === 0) {
    MOCK_SEAL_TYPES.forEach((sealType) => {
      dbSet(SEAL_TYPE_COLLECTION, sealType.typeId, sealType)
    })
  }

  // 初始化材质
  const existingMaterials = dbGetAll<Material>(MATERIAL_COLLECTION)
  if (existingMaterials.length === 0) {
    MOCK_MATERIALS.forEach((material) => {
      dbSet(MATERIAL_COLLECTION, material.materialId, material)
    })
  }

  // 初始化字体风格
  const existingFonts = dbGetAll<FontStyle>(FONT_STYLE_COLLECTION)
  if (existingFonts.length === 0) {
    MOCK_FONT_STYLES.forEach((font) => {
      dbSet(FONT_STYLE_COLLECTION, font.fontId, font)
    })
  }
}

/**
 * 获取印章类型列表
 * @returns 印章类型列表
 */
export function getSealTypes(): SealType[] {
  initSealData()
  return dbGetAll<SealType>(SEAL_TYPE_COLLECTION)
}

/**
 * 获取单个印章类型详情
 * @param typeId 印章类型 ID
 * @returns 印章类型详情或 null
 */
export function getSealTypeById(typeId: string): SealType | null {
  initSealData()
  return dbGet<SealType>(SEAL_TYPE_COLLECTION, typeId)
}

/**
 * 按分类筛选印章类型
 * @param category 印章分类
 * @returns 该分类下的印章类型列表
 */
export function getSealTypesByCategory(category: SealCategory): SealType[] {
  initSealData()
  const all = dbGetAll<SealType>(SEAL_TYPE_COLLECTION)
  return all.filter((s) => s.category === category)
}

/**
 * 获取材质列表
 * @returns 材质列表
 */
export function getMaterials(): Material[] {
  initSealData()
  return dbGetAll<Material>(MATERIAL_COLLECTION)
}

/**
 * 获取单个材质详情
 * @param materialId 材质 ID
 * @returns 材质详情或 null
 */
export function getMaterialById(materialId: string): Material | null {
  initSealData()
  return dbGet<Material>(MATERIAL_COLLECTION, materialId)
}

/**
 * 获取字体风格列表
 * @returns 字体风格列表
 */
export function getFontStyles(): FontStyle[] {
  initSealData()
  return dbGetAll<FontStyle>(FONT_STYLE_COLLECTION)
}

/**
 * 获取单个字体风格详情
 * @param fontId 字体 ID
 * @returns 字体风格详情或 null
 */
export function getFontStyleById(fontId: string): FontStyle | null {
  initSealData()
  return dbGet<FontStyle>(FONT_STYLE_COLLECTION, fontId)
}
