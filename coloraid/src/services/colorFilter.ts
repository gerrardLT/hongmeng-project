import type { FilterMode, FilterStrength, ColorBlindType } from '@/types/models'

/* ============================================================
 *  Gamma 辅助函数
 * ============================================================ */

/**
 * sRGB (0-255) → 线性 RGB (0-1)
 */
function srgbToLinear(c: number): number {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/**
 * 线性 RGB (0-1) → sRGB (0-255)
 */
function linearToSrgb(c: number): number {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  return v * 255
}

/**
 * 数值截断到 [min, max]
 */
function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

/* ============================================================
 *  色觉模拟（Brettel / Viénot 模型）
 * ============================================================ */

/**
 * 模拟指定色盲类型下人眼对颜色的感知
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @param type 色盲类型
 * @returns 模拟后的 RGB 值
 */
export function simulateColorBlindness(
  r: number,
  g: number,
  b: number,
  type: ColorBlindType
): { r: number; g: number; b: number } {
  // 转为线性空间
  const R = srgbToLinear(r)
  const G = srgbToLinear(g)
  const B = srgbToLinear(b)

  // RGB → LMS（Hunt–Pointer–Estevez 归一化）
  let L = 17.8824 * R + 43.5161 * G + 4.11935 * B
  let M = 3.45565 * R + 27.1554 * G + 3.86714 * B
  let S = 0.0299566 * R + 0.184309 * G + 1.46709 * B

  // 根据色盲类型对 LMS 进行投影（缺失的视锥细胞信息由保留的细胞线性组合替代）
  switch (type) {
    case 'protanopia': {
      // L 视锥缺失
      L = 2.02344 * M - 2.52580 * S
      break
    }
    case 'deuteranopia': {
      // M 视锥缺失
      M = 0.494207 * L + 1.24827 * S
      break
    }
    case 'tritanopia': {
      // S 视锥缺失
      S = -0.012246 * L + 0.072035 * M
      break
    }
    case 'achromatopsia': {
      // 全色盲：仅保留亮度
      const Y = 0.299 * R + 0.587 * G + 0.114 * B
      L = Y
      M = Y
      S = Y
      break
    }
    case 'normal':
    default:
      return { r, g, b }
  }

  // LMS → RGB（逆矩阵）
  let R_new = 0.0809444479 * L - 0.130504409 * M + 0.116721066 * S
  let G_new = -0.0102485335 * L + 0.0540193266 * M - 0.113614708 * S
  let B_new = -0.000365296938 * L - 0.00412161469 * M + 0.693511405 * S

  // 转回 sRGB 并截断
  return {
    r: Math.round(clamp(linearToSrgb(R_new), 0, 255)),
    g: Math.round(clamp(linearToSrgb(G_new), 0, 255)),
    b: Math.round(clamp(linearToSrgb(B_new), 0, 255))
  }
}

/* ============================================================
 *  Daltonization 单像素增强
 * ============================================================ */

/**
 * 对单个像素颜色执行 Daltonization 增强
 * @param r 红色通道 0-255
 * @param g 绿色通道 0-255
 * @param b 蓝色通道 0-255
 * @param mode 滤镜模式（色盲类型）
 * @param strength 增强强度 1-10
 * @returns 增强后的 RGB 值
 */
export function enhanceColor(
  r: number,
  g: number,
  b: number,
  mode: FilterMode,
  strength: FilterStrength
): { r: number; g: number; b: number } {
  const simulated = simulateColorBlindness(r, g, b, mode)

  const errR = r - simulated.r
  const errG = g - simulated.g
  const errB = b - simulated.b

  // 强度系数：1→0.2，10→2.0
  const factor = strength * 0.2

  let newR = r
  let newG = g
  let newB = b

  switch (mode) {
    case 'protanopia':
    case 'deuteranopia': {
      // 红绿色盲：将红/绿通道的差异映射到蓝通道（蓝黄通道更易分辨）
      newB = b + factor * (errR * 0.7 + errG * 1.0)
      break
    }
    case 'tritanopia': {
      // 蓝黄色盲：将蓝通道差异映射到红/绿通道
      newR = r + factor * errB * 0.7
      newG = g + factor * errB * 0.7
      break
    }
    case 'achromatopsia': {
      // 全色盲：增强亮度对比度
      const gray = 0.299 * r + 0.587 * g + 0.114 * b
      const contrast = 1 + factor * 0.5 // 1.1 ~ 2.0
      newR = gray + contrast * (r - gray)
      newG = gray + contrast * (g - gray)
      newB = gray + contrast * (b - gray)
      break
    }
  }

  return {
    r: Math.round(clamp(newR, 0, 255)),
    g: Math.round(clamp(newG, 0, 255)),
    b: Math.round(clamp(newB, 0, 255))
  }
}

/* ============================================================
 *  整幅图像 Daltonization
 * ============================================================ */

/**
 * 对整张图片的 ImageData 执行 Daltonization 增强
 * @param imageData RGBA 像素数组
 * @param width 图像宽度
 * @param height 图像高度
 * @param mode 滤镜模式
 * @param strength 增强强度 1-10
 * @returns 新的增强后 RGBA 像素数组
 */
export function applyDaltonization(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  mode: FilterMode,
  strength: FilterStrength
): Uint8ClampedArray {
  const totalPixels = width * height
  const output = new Uint8ClampedArray(imageData.length)

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4
    const r = imageData[idx]
    const g = imageData[idx + 1]
    const b = imageData[idx + 2]
    const a = imageData[idx + 3]

    const enhanced = enhanceColor(r, g, b, mode, strength)

    output[idx] = enhanced.r
    output[idx + 1] = enhanced.g
    output[idx + 2] = enhanced.b
    output[idx + 3] = a
  }

  return output
}
