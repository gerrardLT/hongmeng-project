import { ColorInfo } from '@/types/models'

// ==================== 颜色转换 ====================

/**
 * HEX 转 RGB
 * @param hex 十六进制颜色值，如 #FF5733
 * @returns RGB 对象
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

/**
 * RGB 转 HEX
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @returns 十六进制颜色值
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * RGB 转 HSL
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @returns HSL 对象
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6
        break
      case gNorm:
        h = ((bNorm - rNorm) / d + 2) / 6
        break
      case bNorm:
        h = ((rNorm - gNorm) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL 转 RGB
 * @param h 色相 0-360
 * @param s 饱和度 0-100
 * @param l 亮度 0-100
 * @returns RGB 对象
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue = h / 360
  const sat = s / 100
  const light = l / 100

  let r: number, g: number, b: number

  if (sat === 0) {
    r = g = b = light
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
    const p = 2 * light - q

    r = hue2rgb(p, q, hue + 1 / 3)
    g = hue2rgb(p, q, hue)
    b = hue2rgb(p, q, hue - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// ==================== 颜色名称映射 ====================

interface NamedColor {
  name: string
  nameEn: string
  r: number
  g: number
  b: number
}

/**
 * 常用中文颜色映射表（50+ 种）
 */
const namedColors: NamedColor[] = [
  // 红色系
  { name: '大红', nameEn: 'Scarlet', r: 255, g: 0, b: 0 },
  { name: '深红', nameEn: 'Dark Red', r: 139, g: 0, b: 0 },
  { name: '玫瑰红', nameEn: 'Rose', r: 255, g: 0, b: 128 },
  { name: '粉红', nameEn: 'Pink', r: 255, g: 192, b: 203 },
  { name: '浅粉', nameEn: 'Light Pink', r: 255, g: 182, b: 193 },
  { name: '桃红', nameEn: 'Peach Pink', r: 255, g: 218, b: 185 },
  { name: '朱红', nameEn: 'Vermilion', r: 227, g: 66, b: 52 },
  { name: '酒红', nameEn: 'Burgundy', r: 128, g: 0, b: 32 },
  { name: '珊瑚红', nameEn: 'Coral', r: 255, g: 127, b: 80 },
  { name: '砖红', nameEn: 'Brick Red', r: 178, g: 34, b: 34 },
  // 橙色系
  { name: '橙色', nameEn: 'Orange', r: 255, g: 165, b: 0 },
  { name: '深橙', nameEn: 'Dark Orange', r: 255, g: 140, b: 0 },
  { name: '橘红', nameEn: 'Tangerine', r: 255, g: 114, b: 0 },
  { name: '琥珀', nameEn: 'Amber', r: 255, g: 191, b: 0 },
  { name: '杏色', nameEn: 'Apricot', r: 251, g: 206, b: 177 },
  // 黄色系
  { name: '黄色', nameEn: 'Yellow', r: 255, g: 255, b: 0 },
  { name: '金黄', nameEn: 'Gold', r: 255, g: 215, b: 0 },
  { name: '柠檬黄', nameEn: 'Lemon', r: 255, g: 247, b: 0 },
  { name: '浅黄', nameEn: 'Light Yellow', r: 255, g: 255, b: 224 },
  { name: '卡其', nameEn: 'Khaki', r: 240, g: 230, b: 140 },
  { name: '米色', nameEn: 'Beige', r: 245, g: 245, b: 220 },
  // 绿色系
  { name: '绿色', nameEn: 'Green', r: 0, g: 128, b: 0 },
  { name: '浅绿', nameEn: 'Light Green', r: 144, g: 238, b: 144 },
  { name: '深绿', nameEn: 'Dark Green', r: 0, g: 100, b: 0 },
  { name: '翠绿', nameEn: 'Emerald', r: 80, g: 200, b: 120 },
  { name: '草绿', nameEn: 'Grass Green', r: 124, g: 252, b: 0 },
  { name: '橄榄绿', nameEn: 'Olive', r: 128, g: 128, b: 0 },
  { name: '薄荷绿', nameEn: 'Mint', r: 152, g: 255, b: 152 },
  { name: '青绿', nameEn: 'Teal', r: 0, g: 128, b: 128 },
  // 蓝色系
  { name: '蓝色', nameEn: 'Blue', r: 0, g: 0, b: 255 },
  { name: '浅蓝', nameEn: 'Light Blue', r: 173, g: 216, b: 230 },
  { name: '深蓝', nameEn: 'Dark Blue', r: 0, g: 0, b: 139 },
  { name: '天蓝', nameEn: 'Sky Blue', r: 135, g: 206, b: 235 },
  { name: '宝蓝', nameEn: 'Royal Blue', r: 65, g: 105, b: 225 },
  { name: '湖蓝', nameEn: 'Lake Blue', r: 0, g: 127, b: 255 },
  { name: '靛蓝', nameEn: 'Indigo', r: 75, g: 0, b: 130 },
  { name: '海军蓝', nameEn: 'Navy', r: 0, g: 0, b: 128 },
  // 紫色系
  { name: '紫色', nameEn: 'Purple', r: 128, g: 0, b: 128 },
  { name: '浅紫', nameEn: 'Lavender', r: 230, g: 230, b: 250 },
  { name: '深紫', nameEn: 'Dark Purple', r: 48, g: 25, b: 52 },
  { name: '紫罗兰', nameEn: 'Violet', r: 238, g: 130, b: 238 },
  { name: '品红', nameEn: 'Magenta', r: 255, g: 0, b: 255 },
  // 粉色系
  { name: '洋红', nameEn: 'Fuchsia', r: 255, g: 0, b: 128 },
  { name: '玫红', nameEn: 'Hot Pink', r: 255, g: 105, b: 180 },
  // 棕色系
  { name: '棕色', nameEn: 'Brown', r: 165, g: 42, b: 42 },
  { name: '深棕', nameEn: 'Dark Brown', r: 101, g: 67, b: 33 },
  { name: '浅棕', nameEn: 'Tan', r: 210, g: 180, b: 140 },
  { name: '巧克力色', nameEn: 'Chocolate', r: 210, g: 105, b: 30 },
  { name: '驼色', nameEn: 'Camel', r: 193, g: 154, b: 107 },
  // 黑白灰系
  { name: '黑色', nameEn: 'Black', r: 0, g: 0, b: 0 },
  { name: '白色', nameEn: 'White', r: 255, g: 255, b: 255 },
  { name: '灰色', nameEn: 'Gray', r: 128, g: 128, b: 128 },
  { name: '深灰', nameEn: 'Dark Gray', r: 64, g: 64, b: 64 },
  { name: '浅灰', nameEn: 'Light Gray', r: 211, g: 211, b: 211 },
  { name: '银灰', nameEn: 'Silver', r: 192, g: 192, b: 192 }
]

// ==================== 颜色距离与匹配 ====================

/**
 * 计算两种颜色之间的欧几里得距离
 * @param r1 颜色1红色通道
 * @param g1 颜色1绿色通道
 * @param b1 颜色1蓝色通道
 * @param r2 颜色2红色通道
 * @param g2 颜色2绿色通道
 * @param b2 颜色2蓝色通道
 * @returns 颜色距离
 */
export function colorDistance(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  )
}

/**
 * 根据 RGB 值获取最接近的颜色名称
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @returns 颜色名称对象
 */
export function getColorName(r: number, g: number, b: number): { name: string; nameEn: string } {
  let minDistance = Infinity
  let closestColor = namedColors[0]

  for (const color of namedColors) {
    const dist = colorDistance(r, g, b, color.r, color.g, color.b)
    if (dist < minDistance) {
      minDistance = dist
      closestColor = color
    }
  }

  return {
    name: closestColor.name,
    nameEn: closestColor.nameEn
  }
}

// ==================== ColorInfo 创建 ====================

/**
 * 从 RGB 值创建完整的 ColorInfo 对象
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @returns ColorInfo 对象
 */
export function createColorInfo(r: number, g: number, b: number): ColorInfo {
  const clampedR = Math.max(0, Math.min(255, Math.round(r)))
  const clampedG = Math.max(0, Math.min(255, Math.round(g)))
  const clampedB = Math.max(0, Math.min(255, Math.round(b)))

  const hex = rgbToHex(clampedR, clampedG, clampedB)
  const hsl = rgbToHsl(clampedR, clampedG, clampedB)
  const { name, nameEn } = getColorName(clampedR, clampedG, clampedB)

  return {
    hex,
    rgb: { r: clampedR, g: clampedG, b: clampedB },
    hsl,
    name,
    nameEn,
    timestamp: Date.now()
  }
}
