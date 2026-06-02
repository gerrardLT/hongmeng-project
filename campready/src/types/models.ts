/** 装备分类 */
export type GearCategory = 'tent' | 'sleeping' | 'cooking' | 'lighting' | 'tools' | 'clothing' | 'food' | 'other'

/** 清单状态 */
export type ChecklistStatus = 'preparing' | 'completed' | 'archived'

/** 清单生成方式 */
export type GenerationType = 'template' | 'smart' | 'blank'

/** 露营类型 */
export type CampType = 'car' | 'backpack' | 'rv' | 'glamping'

/** 季节 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

/** 模板分类 */
export type TemplateCategory = 'glamping' | 'backpacking' | 'family' | 'minimal'

/** 重量单位 */
export type WeightUnit = 'g' | 'kg'

/** 装备分类映射 */
export const GEAR_CATEGORY_MAP: Record<GearCategory, string> = {
  tent: '帐篷',
  sleeping: '睡眠',
  cooking: '炊具',
  lighting: '照明',
  tools: '工具',
  clothing: '衣物',
  food: '食品',
  other: '其他'
}

/** 装备分类颜色 */
export const GEAR_CATEGORY_COLORS: Record<GearCategory, string> = {
  tent: '#E91E63',
  sleeping: '#9C27B0',
  cooking: '#FF9800',
  lighting: '#FFC107',
  tools: '#607D8B',
  clothing: '#03A9F4',
  food: '#8BC34A',
  other: '#9E9E9E'
}

/** 露营类型映射 */
export const CAMP_TYPE_MAP: Record<CampType, string> = {
  car: '自驾露营',
  backpack: '背包露营',
  rv: '房车露营',
  glamping: '精致露营'
}

/** 季节映射 */
export const SEASON_MAP: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季'
}

/** 模板分类映射 */
export const TEMPLATE_CATEGORY_MAP: Record<TemplateCategory, string> = {
  glamping: '精致露营',
  backpacking: '背包露营',
  family: '亲子露营',
  minimal: '极简露营'
}

/** 用户信息 */
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: string
  updatedAt: string
}

/** 装备 */
export interface Gear {
  gearId: string
  userId: string
  name: string
  category: GearCategory
  weight: number  // 克
  quantity: number
  photos: string[]
  purchaseLink: string
  storageLocation: string
  note: string
  createdAt: string
  updatedAt: string
}

/** 清单中的装备项 */
export interface ChecklistItem {
  itemId: string
  gearId: string
  name: string
  category: GearCategory
  quantity: number
  weight: number  // 单件重量（克）
  isChecked: boolean
  note: string
}

/** 智能生成参数 */
export interface SmartGenParams {
  people: number
  days: number
  season: Season
  campType: CampType
  overnight: boolean
  cooking: boolean
}

/** 清单 */
export interface Checklist {
  checklistId: string
  userId: string
  name: string
  campingDate: string
  status: ChecklistStatus
  generationType: GenerationType
  parameters: SmartGenParams | null
  items: ChecklistItem[]
  totalWeight: number
  createdAt: string
  updatedAt: string
}

/** 清单模板 */
export interface Template {
  templateId: string
  name: string
  description: string
  category: TemplateCategory
  defaultItems: Omit<ChecklistItem, 'itemId' | 'isChecked'>[]
  isBuiltin: boolean
}

/** 装备统计 */
export interface GearStats {
  totalCount: number
  totalWeight: number
  categoryDistribution: { category: GearCategory; count: number; weight: number }[]
  recentAdded: Gear[]
}

/** 清单统计 */
export interface ChecklistStats {
  totalChecklists: number
  preparingCount: number
  completedCount: number
  archivedCount: number
}
