/**
 * 水质参数安全范围配置
 * 根据 PRD 5.3.2 定义各类型水族箱的默认安全范围
 */
import type { AquariumType, SafeRanges } from '@/types/models'

/** 各类型水族箱默认安全范围 */
const DEFAULT_RANGES: Record<AquariumType, SafeRanges> = {
  // 淡水缸
  freshwater: {
    temperature: { min: 22, max: 28 },
    ph: { min: 6.5, max: 7.5 },
    ammonia: { min: 0, max: 0.25 },
    nitrite: { min: 0, max: 0.5 },
    nitrate: { min: 0, max: 40 },
    gh: { min: 4, max: 12 },
    kh: { min: 3, max: 8 },
    phosphate: { min: 0, max: 1 }
  },
  // 草缸
  planted: {
    temperature: { min: 22, max: 28 },
    ph: { min: 6.0, max: 7.0 },
    ammonia: { min: 0, max: 0.1 },
    nitrite: { min: 0, max: 0.25 },
    nitrate: { min: 5, max: 25 },
    gh: { min: 3, max: 8 },
    kh: { min: 2, max: 6 },
    phosphate: { min: 0.5, max: 2 }
  },
  // 海水缸
  marine: {
    temperature: { min: 24, max: 27 },
    ph: { min: 8.0, max: 8.4 },
    ammonia: { min: 0, max: 0.1 },
    nitrite: { min: 0, max: 0.1 },
    nitrate: { min: 0, max: 20 },
    gh: { min: 0, max: 0 }, // 海水缸不适用 GH
    kh: { min: 7, max: 11 },
    salinity: { min: 33, max: 36 },
    phosphate: { min: 0, max: 0.03 }
  },
  // 虾缸
  shrimp: {
    temperature: { min: 20, max: 26 },
    ph: { min: 6.0, max: 7.5 },
    ammonia: { min: 0, max: 0.1 },
    nitrite: { min: 0, max: 0.25 },
    nitrate: { min: 0, max: 20 },
    gh: { min: 4, max: 8 },
    kh: { min: 1, max: 4 },
    phosphate: { min: 0, max: 0.5 }
  }
}

/**
 * 获取指定类型水族箱的默认安全范围
 */
export function getDefaultSafeRanges(type: AquariumType): SafeRanges {
  return JSON.parse(JSON.stringify(DEFAULT_RANGES[type]))
}

/**
 * 检查参数状态：与安全范围对比
 * @returns 'normal' 在安全范围内, 'warning' 接近边界(±10%), 'danger' 超出范围
 */
export function checkParamStatus(
  paramName: string,
  value: number | null,
  safeRanges: SafeRanges
): 'normal' | 'warning' | 'danger' {
  if (value === null || value === undefined) return 'normal'

  const range = (safeRanges as any)[paramName] as { min: number; max: number } | undefined
  if (!range) return 'normal'

  // 海水缸 GH 不适用
  if (paramName === 'gh' && range.min === 0 && range.max === 0) return 'normal'

  const span = range.max - range.min
  const warningMargin = span * 0.1 // 10% 预警边界

  if (value < range.min || value > range.max) {
    return 'danger'
  }
  if (value < range.min + warningMargin || value > range.max - warningMargin) {
    return 'warning'
  }
  return 'normal'
}

/** 参数中文名映射 */
const PARAM_LABELS: Record<string, string> = {
  temperature: '温度',
  ph: 'pH',
  ammonia: '氨氮',
  nitrite: '亚硝酸盐',
  nitrate: '硝酸盐',
  gh: 'GH',
  kh: 'KH',
  salinity: '盐度',
  phosphate: '磷酸盐'
}

/**
 * 获取参数中文名
 */
export function getParamLabel(paramName: string): string {
  return PARAM_LABELS[paramName] || paramName
}

/** 参数单位映射 */
const PARAM_UNITS: Record<string, string> = {
  temperature: '°C',
  ph: '',
  ammonia: 'mg/L',
  nitrite: 'mg/L',
  nitrate: 'mg/L',
  gh: 'dGH',
  kh: 'dKH',
  salinity: '‰',
  phosphate: 'mg/L'
}

/**
 * 获取参数单位
 */
export function getParamUnit(paramName: string): string {
  return PARAM_UNITS[paramName] || ''
}
