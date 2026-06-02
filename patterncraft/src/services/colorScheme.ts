import type { ColorScheme, ColorSchemeType } from '@/types/models'
import { presetColorSchemes } from '@/data/colorSchemes'
import { dbGetAll, dbSet, dbDelete, generateId } from '@/utils/db'

/** 自定义配色集合名 */
const CUSTOM_SCHEMES_COLLECTION = 'custom_color_schemes'

/** 自定义配色最大数量 */
const MAX_CUSTOM_SCHEMES = 10

/**
 * 获取所有预设配色方案
 * @returns 预设配色方案数组
 */
export function getPresetSchemes(): ColorScheme[] {
  return presetColorSchemes.map((p) => ({
    colorId: p.colorId,
    name: p.name,
    type: p.type as ColorSchemeType,
    primaryColor: p.primaryColor,
    secondaryColor: p.secondaryColor,
    accentColor: p.accentColor,
    backgroundColor: p.backgroundColor
  }))
}

/**
 * 按类型筛选预设配色方案
 * @param type 配色类型：traditional | modern | festival
 * @returns 筛选后的配色方案数组
 */
export function getPresetByType(type: ColorSchemeType): ColorScheme[] {
  return getPresetSchemes().filter((s) => s.type === type)
}

/**
 * 获取用户自定义配色方案
 * @returns 自定义配色数组
 */
export function getCustomSchemes(): ColorScheme[] {
  return dbGetAll<ColorScheme>(CUSTOM_SCHEMES_COLLECTION)
}

/**
 * 保存自定义配色方案
 * 自定义配色最多 10 套，超出限制将抛出错误
 * @param scheme 配色方案数据（不含 colorId）
 * @returns 保存后的完整配色对象
 */
export function saveCustomScheme(scheme: Omit<ColorScheme, 'colorId'>): ColorScheme {
  try {
    const existing = getCustomSchemes()
    if (existing.length >= MAX_CUSTOM_SCHEMES) {
      throw new Error(`自定义配色最多保存 ${MAX_CUSTOM_SCHEMES} 套，请删除后再添加`)
    }

    const newScheme: ColorScheme = {
      ...scheme,
      colorId: generateId(),
      type: 'custom'
    }
    dbSet<ColorScheme>(CUSTOM_SCHEMES_COLLECTION, newScheme.colorId, newScheme)
    console.log('[colorScheme] saved custom scheme:', newScheme.colorId)
    return newScheme
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ColorSchemeService] saveCustomScheme failed:', message)
    uni.showToast({ title: message, icon: 'none' })
    throw e
  }
}

/**
 * 更新自定义配色方案
 * @param id 配色方案 ID
 * @param data 要更新的字段
 * @returns 更新后的配色方案或 null
 */
export function updateCustomScheme(id: string, data: Partial<Omit<ColorScheme, 'colorId'>>): ColorScheme | null {
  const existing = dbGetAll<ColorScheme>(CUSTOM_SCHEMES_COLLECTION)
  const target = existing.find((s) => s.colorId === id)
  if (!target) {
    console.warn('[colorScheme] custom scheme not found:', id)
    return null
  }

  const updated: ColorScheme = {
    ...target,
    ...data,
    colorId: id,
    type: 'custom'
  }
  dbSet<ColorScheme>(CUSTOM_SCHEMES_COLLECTION, id, updated)
  console.log('[colorScheme] updated custom scheme:', id)
  return updated
}

/**
 * 删除自定义配色方案
 * @param id 配色方案 ID
 */
export function deleteCustomScheme(id: string): void {
  try {
    dbDelete(CUSTOM_SCHEMES_COLLECTION, id)
    console.log('[colorScheme] deleted custom scheme:', id)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[ColorSchemeService] deleteCustomScheme failed:', message)
    uni.showToast({ title: '删除配色方案失败', icon: 'none' })
    throw e
  }
}
