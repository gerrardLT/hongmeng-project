import type { DesignDraft, Material, FontStyle, SealType } from '@/types/models'
import { dbGet, dbGetAll, dbSet, dbQuery, generateId } from '@/utils/db'
import { initSealData } from './seal'

const DESIGN_COLLECTION = 'designs'

/** 预览数据结构 */
export interface DesignPreview {
  content: string
  fontName: string
  materialName: string
  sealTypeName: string
  layout: string
  inkColor: string
  previewImage: string
  dimensions: { width: number; height: number }
}

/** 印泥效果数据 */
export interface InkEffect {
  content: string
  fontId: string
  inkColor: string
  effectImage: string
  description: string
}

/** 材质对比项 */
export interface MaterialComparison {
  materialId: string
  name: string
  features: string[]
  priceRange: string
  hardness: string
  texture: string
  suitableFor: string[]
}

/** 设计历史记录 */
export interface DesignHistory {
  designId: string
  userId: string
  content: string
  fontId: string
  materialId: string
  sealTypeId: string
  layout: string
  inkColor: string
  createdAt: string
}

/** 布局名称映射 */
const LAYOUT_LABELS: Record<string, string> = {
  auto: '自动布局',
  horizontal: '横排布局',
  vertical: '竖排布局',
  circular: '圆章布局'
}

/** 印泥颜色名称映射 */
const INK_COLOR_LABELS: Record<string, string> = {
  red: '朱砂红',
  vermilion: '朱红',
  blue: '靛蓝'
}

/**
 * 生成设计方案预览数据
 * @param draft 设计方案草稿
 * @returns 预览数据
 */
export function generatePreview(draft: DesignDraft): DesignPreview {
  initSealData()

  const sealType = dbGet<SealType>('seal_types', draft.sealTypeId)
  const material = dbGet<Material>('materials', draft.materialId)
  const fontStyle = dbGet<FontStyle>('font_styles', draft.fontId)

  // 根据布局和印章类型确定尺寸
  const isCircular = draft.layout === 'circular'
  const dimensions = isCircular
    ? { width: 30, height: 30 }
    : draft.layout === 'vertical'
      ? { width: 20, height: 40 }
      : { width: 40, height: 20 }

  return {
    content: draft.content,
    fontName: fontStyle?.name || '篆书',
    materialName: material?.name || '寿山石',
    sealTypeName: sealType?.name || '姓名章',
    layout: LAYOUT_LABELS[draft.layout] || '自动布局',
    inkColor: INK_COLOR_LABELS[draft.inkColor] || '朱砂红',
    previewImage: `/static/design/preview_${draft.layout}_${draft.inkColor}.png`,
    dimensions
  }
}

/**
 * 生成印泥效果
 * @param content 印章文字
 * @param fontId 字体 ID
 * @param inkColor 印泥颜色
 * @returns 印泥效果数据
 */
export function generateInkEffect(content: string, fontId: string, inkColor: string): InkEffect {
  initSealData()

  const fontStyle = dbGet<FontStyle>('font_styles', fontId)
  const colorLabel = INK_COLOR_LABELS[inkColor] || '朱砂红'

  const descriptions: Record<string, string> = {
    red: '传统朱砂印泥，色泽沉稳浓郁，盖印效果庄重大方，是最经典的印泥色彩',
    vermilion: '朱红印泥，色调明亮鲜艳，印迹清晰饱满，适合书画作品和日常签章',
    blue: '靛蓝印泥，古雅清新，多用于藏书章和文房印，别具文人气质'
  }

  return {
    content,
    fontId,
    inkColor,
    effectImage: `/static/design/ink_${fontId}_${inkColor}.png`,
    description: descriptions[inkColor] || descriptions.red
  }
}

/**
 * 材质对比数据
 * @param materialIds 需要对比的材质 ID 数组
 * @returns 对比数据列表
 */
export function compareMaterials(materialIds: string[]): MaterialComparison[] {
  initSealData()

  const result: MaterialComparison[] = []
  const sealTypes = dbGetAll<SealType>('seal_types')

  for (const id of materialIds) {
    const material = dbGet<Material>('materials', id)
    if (!material) continue

    // 将 suitableFor 中的 category 转为中文名称
    const suitableNames = material.suitableFor.map((cat) => {
      const found = sealTypes.find((st) => st.category === cat)
      return found?.name || cat
    })

    result.push({
      materialId: material.materialId,
      name: material.name,
      features: material.features,
      priceRange: material.priceRange,
      hardness: material.hardness,
      texture: material.texture,
      suitableFor: suitableNames
    })
  }

  return result
}

/**
 * 保存设计方案
 * @param draft 设计方案草稿
 * @returns 保存后的设计历史记录
 */
export function saveDesign(draft: DesignDraft): DesignHistory {
  // 获取当前用户 ID
  const authData = uni.getStorageSync('sealcraft_auth') as { userId?: string } | undefined
  const userId = authData?.userId || ''

  const design: DesignHistory = {
    designId: generateId(),
    userId,
    content: draft.content,
    fontId: draft.fontId,
    materialId: draft.materialId,
    sealTypeId: draft.sealTypeId,
    layout: draft.layout,
    inkColor: draft.inkColor,
    createdAt: new Date().toISOString()
  }

  dbSet(DESIGN_COLLECTION, design.designId, design)
  return design
}

/**
 * 获取设计历史列表
 * @returns 设计历史列表（按时间倒序）
 */
export function getDesignHistory(): DesignHistory[] {
  const authData = uni.getStorageSync('sealcraft_auth') as { userId?: string } | undefined
  const userId = authData?.userId || ''

  if (!userId) return []

  return dbQuery<DesignHistory>(DESIGN_COLLECTION, (d) => d.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
