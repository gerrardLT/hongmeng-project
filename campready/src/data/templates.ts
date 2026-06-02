import type { Template, SmartGenParams, ChecklistItem, GearCategory } from '@/types/models'

/** 生成唯一 ID */
function genId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 精致露营模板 */
const glampingTemplate: Template = {
  templateId: 'tpl_glamping',
  name: '精致露营',
  description: '适合自驾出行，追求舒适体验的露营方式，装备齐全、氛围感满分',
  category: 'glamping',
  isBuiltin: true,
  defaultItems: [
    { gearId: '', name: '帐篷', category: 'tent', quantity: 1, weight: 5500, note: '建议4-6人大帐篷' },
    { gearId: '', name: '天幕', category: 'tent', quantity: 1, weight: 3200, note: '遮阳挡雨必备' },
    { gearId: '', name: '地垫', category: 'tent', quantity: 1, weight: 800, note: '防潮隔热' },
    { gearId: '', name: '充气床垫', category: 'sleeping', quantity: 1, weight: 2800, note: '双人加厚款' },
    { gearId: '', name: '睡袋', category: 'sleeping', quantity: 2, weight: 1200, note: '信封式舒适睡袋' },
    { gearId: '', name: '枕头', category: 'sleeping', quantity: 2, weight: 350, note: '充气枕或记忆枕' },
    { gearId: '', name: '折叠桌', category: 'tools', quantity: 1, weight: 3500, note: '铝合金蛋卷桌' },
    { gearId: '', name: '折叠椅', category: 'tools', quantity: 2, weight: 2200, note: '月亮椅或克米特椅' },
    { gearId: '', name: '卡式炉', category: 'cooking', quantity: 1, weight: 1800, note: '户外便携卡式炉' },
    { gearId: '', name: '气罐', category: 'cooking', quantity: 2, weight: 230, note: '卡式气罐' },
    { gearId: '', name: '锅具套装', category: 'cooking', quantity: 1, weight: 1500, note: '含煎锅、汤锅' },
    { gearId: '', name: '餐具套装', category: 'cooking', quantity: 1, weight: 600, note: '碗盘杯筷刀叉' },
    { gearId: '', name: '水壶', category: 'cooking', quantity: 1, weight: 450, note: '不锈钢烧水壶' },
    { gearId: '', name: '冰桶', category: 'food', quantity: 1, weight: 3000, note: '保温冰桶25L' },
    { gearId: '', name: 'LED灯串', category: 'lighting', quantity: 1, weight: 200, note: '营造氛围' },
    { gearId: '', name: '营地灯', category: 'lighting', quantity: 1, weight: 380, note: 'LED充电营地灯' },
    { gearId: '', name: '折叠推车', category: 'tools', quantity: 1, weight: 8500, note: '搬运装备利器' },
    { gearId: '', name: '收纳箱', category: 'tools', quantity: 1, weight: 2500, note: '可折叠收纳箱60L' },
    { gearId: '', name: '垃圾袋', category: 'other', quantity: 10, weight: 15, note: '带走所有垃圾' },
    { gearId: '', name: '防蚊液', category: 'other', quantity: 1, weight: 120, note: '户外驱蚊喷雾' }
  ]
}

/** 背包露营模板 */
const backpackingTemplate: Template = {
  templateId: 'tpl_backpacking',
  name: '背包露营',
  description: '轻量化背包露营，适合徒步进山，注重每一克重量的控制',
  category: 'backpacking',
  isBuiltin: true,
  defaultItems: [
    { gearId: '', name: '轻量帐篷', category: 'tent', quantity: 1, weight: 1800, note: '单人/双人超轻帐篷' },
    { gearId: '', name: '地布', category: 'tent', quantity: 1, weight: 200, note: '防磨防潮' },
    { gearId: '', name: '充气睡垫', category: 'sleeping', quantity: 1, weight: 480, note: 'R值3.0以上' },
    { gearId: '', name: '羽绒睡袋', category: 'sleeping', quantity: 1, weight: 750, note: '800蓬鸭绒，舒适温度5°C' },
    { gearId: '', name: '压缩枕头', category: 'sleeping', quantity: 1, weight: 80, note: '充气压缩枕' },
    { gearId: '', name: '炉头', category: 'cooking', quantity: 1, weight: 95, note: '一体化折叠炉头' },
    { gearId: '', name: '气罐(小)', category: 'cooking', quantity: 1, weight: 200, note: '110g高山气罐' },
    { gearId: '', name: '钛锅', category: 'cooking', quantity: 1, weight: 120, note: '钛合金单人锅550ml' },
    { gearId: '', name: '折叠碗筷', category: 'cooking', quantity: 1, weight: 65, note: '钛碗+钛筷' },
    { gearId: '', name: '水袋', category: 'cooking', quantity: 1, weight: 150, note: '2L水袋' },
    { gearId: '', name: '头灯', category: 'lighting', quantity: 1, weight: 60, note: '200流明以上' },
    { gearId: '', name: '打火机', category: 'tools', quantity: 1, weight: 20, note: '防风打火机' },
    { gearId: '', name: '急救包', category: 'other', quantity: 1, weight: 250, note: '创可贴、纱布、碘伏等' },
    { gearId: '', name: '多功能刀', category: 'tools', quantity: 1, weight: 85, note: '瑞士军刀或折叠刀' },
    { gearId: '', name: '防水袋', category: 'other', quantity: 1, weight: 60, note: '10L防水袋' },
    { gearId: '', name: '速干毛巾', category: 'clothing', quantity: 1, weight: 80, note: '超细纤维速干' },
    { gearId: '', name: '登山杖', category: 'tools', quantity: 2, weight: 220, note: '碳纤维折叠登山杖' },
    { gearId: '', name: '垃圾袋', category: 'other', quantity: 5, weight: 15, note: 'LNT无痕山林' }
  ]
}

/** 亲子露营模板 */
const familyTemplate: Template = {
  templateId: 'tpl_family',
  name: '亲子露营',
  description: '适合带小朋友的家庭露营，注重安全性和趣味性',
  category: 'family',
  isBuiltin: true,
  defaultItems: [
    { gearId: '', name: '家庭帐篷', category: 'tent', quantity: 1, weight: 7200, note: '6-8人家庭帐，一室一厅' },
    { gearId: '', name: '地垫', category: 'tent', quantity: 1, weight: 1200, note: '加厚防潮地垫' },
    { gearId: '', name: '充气床垫', category: 'sleeping', quantity: 2, weight: 2800, note: '双人充气床垫' },
    { gearId: '', name: '睡袋', category: 'sleeping', quantity: 3, weight: 1000, note: '含1个儿童睡袋' },
    { gearId: '', name: '枕头', category: 'sleeping', quantity: 3, weight: 350, note: '充气枕头' },
    { gearId: '', name: '折叠桌', category: 'tools', quantity: 1, weight: 3500, note: '铝合金蛋卷桌' },
    { gearId: '', name: '折叠椅', category: 'tools', quantity: 4, weight: 2200, note: '含2把儿童椅' },
    { gearId: '', name: '卡式炉', category: 'cooking', quantity: 1, weight: 1800, note: '户外卡式炉' },
    { gearId: '', name: '气罐', category: 'cooking', quantity: 2, weight: 230, note: '卡式气罐' },
    { gearId: '', name: '锅具', category: 'cooking', quantity: 1, weight: 1500, note: '套装锅具' },
    { gearId: '', name: '餐具套装', category: 'cooking', quantity: 1, weight: 800, note: '家庭装碗盘杯筷' },
    { gearId: '', name: '保温杯', category: 'cooking', quantity: 2, weight: 380, note: '大人和儿童各一个' },
    { gearId: '', name: '零食箱', category: 'food', quantity: 1, weight: 2000, note: '儿童零食、水果' },
    { gearId: '', name: '营地灯', category: 'lighting', quantity: 1, weight: 380, note: 'LED营地灯' },
    { gearId: '', name: '应急灯', category: 'lighting', quantity: 1, weight: 150, note: '备用手电筒' },
    { gearId: '', name: '防蚊液', category: 'other', quantity: 1, weight: 120, note: '儿童适用型' },
    { gearId: '', name: '儿童驱蚊手环', category: 'other', quantity: 2, weight: 15, note: '天然植物精油' },
    { gearId: '', name: '急救包', category: 'other', quantity: 1, weight: 350, note: '含儿童退烧贴等' },
    { gearId: '', name: '儿童玩具', category: 'other', quantity: 1, weight: 500, note: '飞盘、泡泡机等' },
    { gearId: '', name: '折叠桶', category: 'tools', quantity: 1, weight: 250, note: '取水/洗手用' }
  ]
}

/** 极简露营模板 */
const minimalTemplate: Template = {
  templateId: 'tpl_minimal',
  name: '极简露营',
  description: '最少装备、最快出发，适合说走就走的短途露营',
  category: 'minimal',
  isBuiltin: true,
  defaultItems: [
    { gearId: '', name: '帐篷', category: 'tent', quantity: 1, weight: 2200, note: '快速搭建帐篷' },
    { gearId: '', name: '地垫', category: 'tent', quantity: 1, weight: 400, note: '轻量防潮垫' },
    { gearId: '', name: '睡袋', category: 'sleeping', quantity: 1, weight: 900, note: '三季通用睡袋' },
    { gearId: '', name: '睡垫', category: 'sleeping', quantity: 1, weight: 350, note: '蛋槽泡沫垫' },
    { gearId: '', name: '头灯', category: 'lighting', quantity: 1, weight: 60, note: '基础照明' },
    { gearId: '', name: '打火机', category: 'tools', quantity: 1, weight: 20, note: '防风打火机' },
    { gearId: '', name: '水壶', category: 'cooking', quantity: 1, weight: 200, note: '运动水壶750ml' },
    { gearId: '', name: '干粮', category: 'food', quantity: 1, weight: 500, note: '能量棒、压缩饼干等' },
    { gearId: '', name: '多功能刀', category: 'tools', quantity: 1, weight: 85, note: '瑞士军刀' },
    { gearId: '', name: '垃圾袋', category: 'other', quantity: 5, weight: 15, note: '无痕露营' },
    { gearId: '', name: '急救包', category: 'other', quantity: 1, weight: 200, note: '基础急救用品' },
    { gearId: '', name: '雨衣', category: 'clothing', quantity: 1, weight: 250, note: '轻便雨衣' }
  ]
}

/** 所有预设模板 */
export const BUILTIN_TEMPLATES: Template[] = [
  glampingTemplate,
  backpackingTemplate,
  familyTemplate,
  minimalTemplate
]

/** 基础装备库（用于智能生成） */
interface BaseGearItem {
  name: string
  category: GearCategory
  weight: number
  note: string
  tags: string[]  // 标签用于智能匹配
}

const BASE_GEAR_POOL: BaseGearItem[] = [
  // 帐篷类
  { name: '轻量帐篷', category: 'tent', weight: 1800, note: '超轻双人帐', tags: ['backpack', 'minimal'] },
  { name: '家庭帐篷', category: 'tent', weight: 7200, note: '一室一厅大帐', tags: ['car', 'rv', 'glamping', 'family'] },
  { name: '标准帐篷', category: 'tent', weight: 3500, note: '3-4人帐篷', tags: ['car', 'rv'] },
  { name: '天幕', category: 'tent', weight: 3200, note: '遮阳挡雨', tags: ['car', 'glamping', 'rv'] },
  { name: '地布', category: 'tent', weight: 200, note: '防磨防潮', tags: ['backpack'] },
  { name: '地垫', category: 'tent', weight: 800, note: '防潮隔热', tags: ['car', 'glamping', 'rv', 'minimal'] },

  // 睡眠类
  { name: '充气床垫', category: 'sleeping', weight: 2800, note: '双人加厚', tags: ['car', 'glamping', 'rv'] },
  { name: '充气睡垫', category: 'sleeping', weight: 480, note: '轻量充气垫', tags: ['backpack'] },
  { name: '蛋槽泡沫垫', category: 'sleeping', weight: 350, note: '轻量泡沫垫', tags: ['minimal'] },
  { name: '羽绒睡袋', category: 'sleeping', weight: 750, note: '800蓬鸭绒', tags: ['backpack', 'winter'] },
  { name: '信封睡袋', category: 'sleeping', weight: 1200, note: '舒适信封式', tags: ['car', 'glamping', 'rv'] },
  { name: '三季睡袋', category: 'sleeping', weight: 900, note: '春夏秋通用', tags: ['minimal'] },
  { name: '冬季睡袋', category: 'sleeping', weight: 1800, note: '耐寒-10°C', tags: ['winter'] },
  { name: '充气枕头', category: 'sleeping', weight: 80, note: '轻量充气枕', tags: ['backpack', 'minimal'] },
  { name: '枕头', category: 'sleeping', weight: 350, note: '舒适枕头', tags: ['car', 'glamping', 'rv'] },

  // 炊具类
  { name: '卡式炉', category: 'cooking', weight: 1800, note: '户外卡式炉', tags: ['car', 'glamping', 'rv'] },
  { name: '炉头', category: 'cooking', weight: 95, note: '超轻折叠炉头', tags: ['backpack'] },
  { name: '气罐', category: 'cooking', weight: 230, note: '卡式气罐', tags: ['car', 'glamping', 'rv'] },
  { name: '气罐(小)', category: 'cooking', weight: 200, note: '110g高山气罐', tags: ['backpack'] },
  { name: '锅具套装', category: 'cooking', weight: 1500, note: '煎锅+汤锅', tags: ['car', 'glamping', 'rv'] },
  { name: '钛锅', category: 'cooking', weight: 120, note: '钛合金单人锅', tags: ['backpack'] },
  { name: '餐具套装', category: 'cooking', weight: 600, note: '碗盘杯筷', tags: ['car', 'glamping', 'rv'] },
  { name: '折叠碗筷', category: 'cooking', weight: 65, note: '钛碗+钛筷', tags: ['backpack'] },
  { name: '水壶', category: 'cooking', weight: 450, note: '不锈钢烧水壶', tags: ['car', 'glamping', 'rv'] },
  { name: '运动水壶', category: 'cooking', weight: 200, note: '750ml水壶', tags: ['backpack', 'minimal'] },
  { name: '水袋', category: 'cooking', weight: 150, note: '2L水袋', tags: ['backpack'] },
  { name: '保温杯', category: 'cooking', weight: 380, note: '500ml保温杯', tags: ['winter'] },

  // 照明类
  { name: '营地灯', category: 'lighting', weight: 380, note: 'LED充电营地灯', tags: ['car', 'glamping', 'rv'] },
  { name: '头灯', category: 'lighting', weight: 60, note: '200流明以上', tags: ['backpack', 'minimal'] },
  { name: 'LED灯串', category: 'lighting', weight: 200, note: '氛围灯串', tags: ['glamping'] },
  { name: '应急手电', category: 'lighting', weight: 150, note: '备用照明', tags: ['car', 'rv'] },

  // 工具类
  { name: '折叠桌', category: 'tools', weight: 3500, note: '铝合金蛋卷桌', tags: ['car', 'glamping', 'rv'] },
  { name: '折叠椅', category: 'tools', weight: 2200, note: '月亮椅/克米特椅', tags: ['car', 'glamping', 'rv'] },
  { name: '折叠推车', category: 'tools', weight: 8500, note: '搬运装备', tags: ['car', 'glamping'] },
  { name: '收纳箱', category: 'tools', weight: 2500, note: '60L折叠收纳箱', tags: ['car', 'glamping', 'rv'] },
  { name: '多功能刀', category: 'tools', weight: 85, note: '瑞士军刀', tags: ['backpack', 'minimal'] },
  { name: '打火机', category: 'tools', weight: 20, note: '防风打火机', tags: ['backpack', 'minimal'] },
  { name: '登山杖', category: 'tools', weight: 220, note: '碳纤维折叠', tags: ['backpack'] },
  { name: '折叠桶', category: 'tools', weight: 250, note: '取水洗手', tags: ['car', 'rv'] },
  { name: '营地锤', category: 'tools', weight: 350, note: '打地钉用', tags: ['car', 'glamping'] },

  // 衣物类
  { name: '速干毛巾', category: 'clothing', weight: 80, note: '超细纤维', tags: ['backpack'] },
  { name: '雨衣', category: 'clothing', weight: 250, note: '轻便雨衣', tags: ['minimal', 'backpack'] },
  { name: '抓绒衣', category: 'clothing', weight: 350, note: '保暖中层', tags: ['winter', 'autumn'] },
  { name: '羽绒服', category: 'clothing', weight: 600, note: '压缩收纳', tags: ['winter'] },
  { name: '防晒衣', category: 'clothing', weight: 150, note: 'UPF50+', tags: ['summer', 'spring'] },

  // 食品类
  { name: '冰桶', category: 'food', weight: 3000, note: '保温冰桶25L', tags: ['car', 'glamping', 'rv'] },
  { name: '干粮', category: 'food', weight: 500, note: '能量棒、压缩饼干', tags: ['backpack', 'minimal'] },
  { name: '零食箱', category: 'food', weight: 2000, note: '水果零食', tags: ['car', 'rv'] },

  // 其他
  { name: '急救包', category: 'other', weight: 250, note: '创可贴纱布碘伏', tags: ['backpack', 'minimal', 'car', 'glamping', 'rv'] },
  { name: '防蚊液', category: 'other', weight: 120, note: '户外驱蚊喷雾', tags: ['summer', 'spring', 'glamping', 'car'] },
  { name: '防水袋', category: 'other', weight: 60, note: '10L防水袋', tags: ['backpack'] },
  { name: '垃圾袋', category: 'other', weight: 15, note: '无痕露营', tags: ['backpack', 'minimal', 'car', 'glamping', 'rv'] },
  { name: '防晒霜', category: 'other', weight: 80, note: 'SPF50+', tags: ['summer', 'spring'] },
  { name: '暖宝宝', category: 'other', weight: 30, note: '一次性暖贴', tags: ['winter'] },
  { name: '手套', category: 'clothing', weight: 60, note: '保暖手套', tags: ['winter'] },
]

/**
 * 智能生成清单
 * 根据参数从基础装备库中选择推荐装备，并调整数量
 */
export function generateSmartChecklist(params: SmartGenParams): Omit<ChecklistItem, 'itemId' | 'isChecked'>[] {
  const { people, days, season, campType, overnight, cooking } = params

  // 根据 campType 和 season 筛选装备
  let selected = BASE_GEAR_POOL.filter(item => {
    // 匹配露营类型
    const matchType = item.tags.includes(campType)
    // 匹配季节
    const matchSeason = item.tags.includes(season)
    // 通用装备（同时匹配类型或季节的）
    return matchType || matchSeason
  })

  // backpack 类型去除重型装备（单件 > 5000g）
  if (campType === 'backpack') {
    selected = selected.filter(item => item.weight <= 5000)
  }

  // 不过夜：去除睡眠装备
  if (!overnight) {
    selected = selected.filter(item => item.category !== 'sleeping')
  }

  // 不做饭：去除炊具（但保留水壶/水袋）
  if (!cooking) {
    selected = selected.filter(item => {
      if (item.category !== 'cooking') return true
      return item.name.includes('水壶') || item.name.includes('水袋') || item.name.includes('运动水壶')
    })
  }

  // 去重：同分类同名只保留一个（优先匹配类型的）
  const uniqueMap = new Map<string, BaseGearItem>()
  for (const item of selected) {
    const key = item.name
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item)
    }
  }
  const uniqueItems = Array.from(uniqueMap.values())

  // 根据人数调整数量
  const result: Omit<ChecklistItem, 'itemId' | 'isChecked'>[] = uniqueItems.map(item => {
    let quantity = 1

    // 按人数调整的装备
    const perPersonItems = ['折叠椅', '睡袋', '枕头', '充气枕头', '餐具套装', '折叠碗筷', '保温杯']
    if (perPersonItems.includes(item.name)) {
      quantity = people
    }

    // 床垫按2人1个计算
    if (item.name.includes('床垫') || item.name.includes('睡垫') || item.name.includes('泡沫垫')) {
      quantity = Math.ceil(people / 2)
    }

    // 气罐根据天数调整
    if (item.name.includes('气罐')) {
      quantity = Math.max(1, Math.ceil(days * people / 3))
    }

    // 垃圾袋根据人数和天数
    if (item.name === '垃圾袋') {
      quantity = Math.max(5, people * days * 2)
    }

    // 多天增加干粮
    if (item.name === '干粮') {
      quantity = days
    }

    return {
      gearId: '',
      name: item.name,
      category: item.category,
      quantity,
      weight: item.weight,
      note: item.note
    }
  })

  // 按分类排序
  const categoryOrder: GearCategory[] = ['tent', 'sleeping', 'cooking', 'lighting', 'tools', 'clothing', 'food', 'other']
  result.sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))

  return result
}
