// ===== 联合类型 =====

/** 水族箱类型：淡水 | 草缸 | 海水 | 虾缸 */
export type AquariumType = 'freshwater' | 'planted' | 'marine' | 'shrimp'

/** 水族箱状态 */
export type AquariumStatus = 'normal' | 'warning' | 'danger'

/** 维护类型 */
export type MaintenanceType = 'waterChange' | 'feeding' | 'filter' | 'light' | 'co2' | 'other'

/** 喂食反应 */
export type FeedingResponse = 'good' | 'normal' | 'poor' | 'none'

/** 预警级别 */
export type AlertLevel = 'info' | 'warning' | 'danger'

/** 预警类型 */
export type AlertType = 'paramOutOfRange' | 'maintenanceDue' | 'noRecordDays'

/** 知识库分类 */
export type KnowledgeCategory = 'paramGuide' | 'faq' | 'maintenanceGuide'

/** 趋势周期 */
export type TrendPeriod = '7d' | '30d' | '90d' | '1y'

// ===== 安全范围 =====

/** 水质参数安全范围 */
export interface SafeRanges {
  temperature: { min: number; max: number }
  ph: { min: number; max: number }
  ammonia: { min: number; max: number }
  nitrite: { min: number; max: number }
  nitrate: { min: number; max: number }
  gh: { min: number; max: number }
  kh: { min: number; max: number }
  salinity?: { min: number; max: number }
  phosphate: { min: number; max: number }
}

// ===== 水族箱 =====

/** 水族箱信息 */
export interface Aquarium {
  aquariumId: string
  userId: string
  name: string
  type: AquariumType
  volume: number
  setupDate: string
  safeRanges: SafeRanges
  status: AquariumStatus
  note: string
  createdAt: number
  updatedAt: number
}

// ===== 参数记录 =====

/** 水质参数记录 */
export interface ParameterRecord {
  recordId: string
  aquariumId: string
  date: string
  time: string
  temperature: number | null
  ph: number | null
  ammonia: number | null
  nitrite: number | null
  nitrate: number | null
  gh: number | null
  kh: number | null
  salinity: number | null
  phosphate: number | null
  photoUrl: string
  note: string
  createdAt: number
}

// ===== 维护日志 =====

/** 换水详情 */
export interface WaterChangeDetails {
  percentage: number
  volume: number
  filterCleaned: boolean
  trimmedPlants: boolean
}

/** 喂食详情 */
export interface FeedingDetails {
  foodType: string
  amount: string
  feedingResponse: FeedingResponse
}

/** 滤材维护详情 */
export interface FilterDetails {
  filterType: string
  action: string
}

/** 其他维护详情 */
export interface OtherDetails {
  description: string
}

/** 维护日志 */
export interface MaintenanceLog {
  logId: string
  aquariumId: string
  type: MaintenanceType
  date: string
  details: WaterChangeDetails | FeedingDetails | FilterDetails | OtherDetails
  note: string
  createdAt: number
}

// ===== 预警 =====

/** 预警项 */
export interface AlertItem {
  alertId: string
  aquariumId: string
  type: AlertType
  level: AlertLevel
  title: string
  message: string
  suggestion: string
  paramName?: string
  paramValue?: number
  dismissed: boolean
  createdAt: number
}

// ===== 知识库 =====

/** 知识库文章 */
export interface KnowledgeArticle {
  articleId: string
  category: KnowledgeCategory
  title: string
  summary: string
  content: string
  tags: string[]
  relatedIds: string[]
}

// ===== 用户信息 =====

/** 用户信息 */
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: number
}

// ===== 统计 =====

/** 水族箱统计数据 */
export interface AquariumStats {
  totalAquariums: number
  totalRecords: number
  todayAlerts: number
  healthScore: number
}

// ===== 趋势 =====

/** 趋势数据点 */
export interface TrendDataPoint {
  date: string
  value: number
}

/** 趋势统计摘要 */
export interface TrendSummary {
  avg: number
  min: number
  max: number
  dataPoints: TrendDataPoint[]
}
