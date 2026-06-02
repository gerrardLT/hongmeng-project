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
 * HEX 转 HSL
 * @param hex 十六进制颜色值
 * @returns HSL 对象
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHsl(r, g, b)
}

/**
 * HSL 转 HEX
 * @param h 色相 0-360
 * @param s 饱和度 0-100
 * @param l 亮度 0-100
 * @returns 十六进制颜色值
 */
export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
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

// ==================== 颜色操作 ====================

/**
 * 生成互补色
 * @param hex 十六进制颜色值
 * @returns 互补色十六进制值
 */
export function generateComplementary(hex: string): string {
  const hsl = hexToHsl(hex)
  const complementaryH = (hsl.h + 180) % 360
  return hslToHex(complementaryH, hsl.s, hsl.l)
}

/**
 * 调整颜色亮度
 * @param hex 十六进制颜色值
 * @param amount 亮度调整量（-100 ~ 100）
 * @returns 调整后的十六进制颜色值
 */
export function adjustBrightness(hex: string, amount: number): string {
  const hsl = hexToHsl(hex)
  const newL = Math.max(0, Math.min(100, hsl.l + amount))
  return hslToHex(hsl.h, hsl.s, newL)
}

/**
 * 混合两种颜色
 * @param hex1 颜色1十六进制值
 * @param hex2 颜色2十六进制值
 * @param ratio 混合比例（0~1，0=全为颜色1，1=全为颜色2）
 * @returns 混合后的十六进制颜色值
 */
export function blendColors(hex1: string, hex2: string, ratio: number): string {
  const c1 = hexToRgb(hex1)
  const c2 = hexToRgb(hex2)
  const t = Math.max(0, Math.min(1, ratio))

  const r = Math.round(c1.r + (c2.r - c1.r) * t)
  const g = Math.round(c1.g + (c2.g - c1.g) * t)
  const b = Math.round(c1.b + (c2.b - c1.b) * t)

  return rgbToHex(r, g, b)
}
