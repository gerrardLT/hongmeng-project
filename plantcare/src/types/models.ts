// 联合类型
export type ReminderMode = 'fixed' | 'smart'
export type CareType = 'water' | 'fertilize' | 'repot' | 'prune'
export type PlantStatus = 'healthy' | 'needsWater' | 'needsFertilizer' | 'sick' | 'dormant' | 'dead'
export type PlantDifficulty = 'beginner' | 'intermediate' | 'expert'
export type PlantCategory = 'airPurify' | 'ornamental' | 'easycare' | 'succulent' | 'herb' | 'flower'
export type HealthStatus = 'good' | 'fair' | 'poor'

// 提醒设置
export interface ReminderSettings {
  waterInterval: number        // 浇水间隔（天）
  fertilizeInterval: number    // 施肥间隔（天）
  repotInterval?: number       // 换盆间隔（天）
  pruneInterval?: number       // 修剪间隔（天）
  smartAdjust?: boolean        // 是否开启季节/天气调整
}

// 植物
export interface Plant {
  plantId: string
  userId: string
  speciesId?: string
  nickname: string
  photoUrl: string
  location: string
  purchaseDate: string
  reminderMode: ReminderMode
  reminderSettings: ReminderSettings
  nextWaterDate: string
  nextFertilizeDate?: string
  status: PlantStatus
  createdAt: number
  updatedAt?: number
}

// 养护记录
export interface CareRecord {
  recordId: string
  plantId: string
  type: CareType
  date: string
  note: string
  photos: string[]
  createdAt: number
}

// 生长记录
export interface GrowthRecord {
  recordId: string
  plantId: string
  date: string
  content: string
  photos: string[]
  createdAt: number
}

// 植物百科
export interface PlantWiki {
  speciesId: string
  name: string
  scientificName: string
  family: string
  origin: string
  description: string
  careGuide: CareGuide
  commonIssues: string[]
  propagation: string
  difficulty: PlantDifficulty
  category: PlantCategory[]
  imageUrl: string
}

// 养护指南
export interface CareGuide {
  light: string
  water: string
  temperature: string
  humidity: string
  soil: string
  fertilizer: string
}

// 用户信息
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  phone?: string
  createdAt: number
}

// 天气数据
export interface WeatherData {
  temperature: number
  humidity: number
  condition: string
  city: string
  updatedAt: number
}

// 养护统计
export interface CareStats {
  totalPlants: number
  todayNeedWater: number
  weekCompleted: number
  consecutiveDays: number
}
