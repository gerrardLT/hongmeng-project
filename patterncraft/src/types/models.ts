/**
 * 纹样分类
 */
export type PatternCategory = 'chinese-traditional' | 'miao' | 'tibetan' | 'yi' | 'zhuang' | 'uyghur'

/**
 * 纹样密度
 */
export type PatternDensity = 'sparse' | 'medium' | 'dense'

/**
 * 纹样旋转角度
 */
export type PatternRotation = '0' | '45' | '90' | 'random'

/**
 * 应用场景类型
 */
export type SceneType = 'wallpaper' | 'card' | 'invitation' | 'preview'

/**
 * 预览物品类型
 */
export type PreviewItemType = 'phone-case' | 'scarf' | 'tote-bag' | 'tshirt' | 'mug'

/**
 * 配色方案类型
 */
export type ColorSchemeType = 'traditional' | 'modern' | 'festival' | 'custom'

/**
 * 纹样参数
 */
export interface PatternParameters {
  density: PatternDensity
  size: number
  rotation: PatternRotation
  advanced?: Record<string, number | string>
}

/**
 * 纹样
 */
export interface Pattern {
  patternId: string
  name: string
  category: PatternCategory
  subCategory: string
  previewUrl: string
  description: string
  origin: string
  meaning: string
  history: string
  usageScenarios: string[]
  parameters: PatternParameters
  isBuiltin: boolean
}

/**
 * 用户作品
 */
export interface Artwork {
  artworkId: string
  userId: string
  patternId: string
  patternParams: PatternParameters
  colorScheme: ColorScheme
  sceneType: SceneType
  sceneTemplate: string
  customText: string
  outputImageUrl: string
  createdAt: number
  updatedAt: number
}

/**
 * 配色方案
 */
export interface ColorScheme {
  colorId: string
  name: string
  type: ColorSchemeType
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor?: string
}

/**
 * 用户自定义颜色
 */
export interface CustomColor {
  colorId: string
  userId: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  createdAt: number
}

/**
 * 收藏纹样
 */
export interface FavoritePattern {
  favoriteId: string
  userId: string
  patternId: string
  createdAt: number
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
 * 用户设置
 */
export interface UserSettings {
  cloudSyncEnabled: boolean
  customColors: CustomColor[]
}

/**
 * 每日纹样
 */
export interface DailyPattern {
  date: string
  patternId: string
  story: string
}

/**
 * 场景模板
 */
export interface SceneTemplate {
  templateId: string
  name: string
  type: SceneType
  layout: string
  description: string
}
