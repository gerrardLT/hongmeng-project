/** 钓点类型 */
export type SpotType = 'river' | 'lake' | 'reservoir' | 'pond' | 'sea'

/** 钓法 */
export type FishMethod = 'hand_rod' | 'sea_rod' | 'lure' | 'fly' | 'ice' | 'other'

/** 意图提醒类型 */
export type IntentType = 'arrival' | 'weather' | 'tide'

/** 潮汐类型 */
export type TideType = 'high' | 'low' | 'rising' | 'falling'

/** 天气状况 */
export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'overcast'
  | 'light_rain'
  | 'moderate_rain'
  | 'heavy_rain'
  | 'thunderstorm'
  | 'snow'
  | 'fog'
  | 'windy'

/** 预设鱼种 */
export const FISH_SPECIES = [
  '鲫鱼', '鲤鱼', '草鱼', '鲢鱼', '鳙鱼', '青鱼',
  '鲈鱼', '黑鱼', '鳜鱼', '翘嘴', '马口', '白条',
  '鲶鱼', '黄颡鱼', '罗非鱼', '鳊鱼', '鲮鱼',
  '石斑鱼', '黄鱼', '带鱼', '鲷鱼', '鲅鱼',
  '其他'
] as const

export type FishSpecies = (typeof FISH_SPECIES)[number] | string

/** 钓点类型映射 */
export const SPOT_TYPE_MAP: Record<SpotType, string> = {
  river: '河流',
  lake: '湖泊',
  reservoir: '水库',
  pond: '池塘',
  sea: '海洋'
}

/** 钓法映射 */
export const FISH_METHOD_MAP: Record<FishMethod, string> = {
  hand_rod: '手竿',
  sea_rod: '海竿',
  lure: '路亚',
  fly: '飞蝇',
  ice: '冰钓',
  other: '其他'
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

/** 钓点 */
export interface FishingSpot {
  spotId: string
  userId: string
  name: string
  type: SpotType
  latitude: number
  longitude: number
  address?: string
  note?: string
  photos: string[]
  catchCount?: number
  createdAt: string
  updatedAt: string
}

/** 渔获记录 */
export interface CatchRecord {
  recordId: string
  userId: string
  spotId: string
  spotName?: string
  date: string
  time: string
  fishSpecies: FishSpecies
  weight: number
  count: number
  method: FishMethod
  bait?: string
  weather?: WeatherCondition
  temperature?: number
  pressure?: number
  windSpeed?: number
  note?: string
  photos: string[]
  createdAt: string
}

/** 意图提醒设置 */
export interface IntentSetting {
  settingId: string
  userId: string
  type: IntentType
  spotId?: string
  spotName?: string
  condition: Record<string, any>
  isEnabled: boolean
  createdAt: string
}

/** 当前天气数据 */
export interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: string
  condition: WeatherCondition
  conditionText: string
  fishingIndex: number
  uvIndex?: number
  visibility?: number
  feelsLike?: number
  updateTime: string
}

/** 逐小时天气 */
export interface HourlyWeather {
  time: string
  temperature: number
  pressure: number
  humidity: number
  windSpeed: number
  condition: WeatherCondition
  conditionText: string
  fishingIndex: number
}

/** 每日天气 */
export interface DailyWeather {
  date: string
  tempMax: number
  tempMin: number
  condition: WeatherCondition
  conditionText: string
  fishingIndex: number
  sunrise: string
  sunset: string
  humidity: number
  pressure: number
  windSpeed: number
}

/** 天气预警 */
export interface WeatherAlert {
  id: string
  type: string
  level: string
  title: string
  description: string
  startTime: string
  endTime: string
}

/** 潮汐信息 */
export interface TideInfo {
  time: string
  height: number
  type: TideType
}

/** 潮汐数据 */
export interface TideData {
  date: string
  location: string
  tides: TideInfo[]
  sunrise: string
  sunset: string
}

/** 月相 */
export interface MoonPhase {
  date: string
  phase: string
  phaseName: string
  illumination: number
  moonrise: string
  moonset: string
  age: number
}

/** 渔获统计 */
export interface CatchStats {
  totalTrips: number
  totalWeight: number
  totalCount: number
  topSpots: { spotId: string; spotName: string; count: number }[]
  topSpecies: { species: string; count: number }[]
  maxSingleWeight: number
  maxSingleCount: number
  maxTripWeight: number
  monthlyDistribution: { month: number; count: number }[]
}
