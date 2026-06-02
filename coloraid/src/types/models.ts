/**
 * 色盲类型
 */
export type ColorBlindType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'normal'

/**
 * 滤镜模式
 */
export type FilterMode = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

/**
 * 增强强度 1-10
 */
export type FilterStrength = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * 颜色信息
 */
export interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name: string
  nameEn: string
  timestamp: number
}

/**
 * 石原图测试题
 */
export interface IshiharaPlate {
  plateId: string
  imageUrl: string
  correctAnswer: string
  options: string[]
  targetType: ColorBlindType[]
}

/**
 * 测试结果
 */
export interface TestResult {
  resultId: string
  answers: { plateId: string; selected: string; correct: boolean }[]
  colorBlindType: ColorBlindType
  recommendedFilter: FilterMode | null
  confidence: number
  testedAt: number
}

/**
 * 拍照分析结果
 */
export interface AnalysisResult {
  analysisId: string
  imagePath: string
  colors: AnalysisColor[]
  analyzedAt: number
}

/**
 * 分析颜色
 */
export interface AnalysisColor {
  color: ColorInfo
  percentage: number
  region: { x: number; y: number; width: number; height: number }
}

/**
 * 用户设置
 */
export interface UserSettings {
  colorBlindType: ColorBlindType
  filterMode: FilterMode | null
  filterStrength: FilterStrength
  voiceEnabled: boolean
  voiceVolume: number
  autoFilter: boolean
}

/**
 * 用户信息
 */
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string
  createdAt: number
}

/**
 * 颜色识别历史
 */
export interface ColorHistory {
  historyId: string
  color: ColorInfo
  source: 'camera' | 'photo'
  createdAt: number
}
