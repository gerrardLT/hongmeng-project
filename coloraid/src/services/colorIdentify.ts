import type { ColorInfo } from '@/types/models'

/**
 * 近似颜色名称映射表（简化版，覆盖常见颜色）
 */
const COLOR_NAMES: { r: number; g: number; b: number; name: string; nameEn: string }[] = [
  { r: 255, g: 0, b: 0, name: '红色', nameEn: 'Red' },
  { r: 255, g: 128, b: 0, name: '橙色', nameEn: 'Orange' },
  { r: 255, g: 255, b: 0, name: '黄色', nameEn: 'Yellow' },
  { r: 128, g: 255, b: 0, name: '黄绿色', nameEn: 'Chartreuse' },
  { r: 0, g: 255, b: 0, name: '绿色', nameEn: 'Green' },
  { r: 0, g: 255, b: 128, name: '春绿色', nameEn: 'Spring Green' },
  { r: 0, g: 255, b: 255, name: '青色', nameEn: 'Cyan' },
  { r: 0, g: 128, b: 255, name: '天蓝色', nameEn: 'Sky Blue' },
  { r: 0, g: 0, b: 255, name: '蓝色', nameEn: 'Blue' },
  { r: 128, g: 0, b: 255, name: '紫色', nameEn: 'Purple' },
  { r: 255, g: 0, b: 255, name: '品红色', nameEn: 'Magenta' },
  { r: 255, g: 0, b: 128, name: '玫瑰红', nameEn: 'Rose' },
  { r: 255, g: 255, b: 255, name: '白色', nameEn: 'White' },
  { r: 128, g: 128, b: 128, name: '灰色', nameEn: 'Gray' },
  { r: 0, g: 0, b: 0, name: '黑色', nameEn: 'Black' },
  { r: 139, g: 69, b: 19, name: '棕色', nameEn: 'Brown' },
  { r: 255, g: 192, b: 203, name: '粉色', nameEn: 'Pink' },
  { r: 64, g: 64, b: 64, name: '深灰色', nameEn: 'Dark Gray' }
]

/**
 * RGB 转 HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * RGB 转 HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const R = r / 255
  const G = g / 255
  const B = b / 255

  const max = Math.max(R, G, B)
  const min = Math.min(R, G, B)
  const diff = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

    switch (max) {
      case R:
        h = ((G - B) / diff + (G < B ? 6 : 0)) / 6
        break
      case G:
        h = ((B - R) / diff + 2) / 6
        break
      case B:
        h = ((R - G) / diff + 4) / 6
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
 * 查找最接近的颜色名称
 */
function findClosestColorName(r: number, g: number, b: number): { name: string; nameEn: string } {
  let minDist = Infinity
  let closest = COLOR_NAMES[COLOR_NAMES.length - 1]

  for (const color of COLOR_NAMES) {
    const dr = r - color.r
    const dg = g - color.g
    const db = b - color.b
    const dist = dr * dr + dg * dg + db * db
    if (dist < minDist) {
      minDist = dist
      closest = color
    }
  }

  return { name: closest.name, nameEn: closest.nameEn }
}

/**
 * 从像素数据中识别指定位置 3×3 区域的主色调
 * @param x 像素 x 坐标
 * @param y 像素 y 坐标
 * @param imageData RGBA 像素数组
 * @param width 图像宽度
 * @returns 颜色信息
 */
export function identifyColor(
  x: number,
  y: number,
  imageData: Uint8ClampedArray,
  width: number
): ColorInfo {
  let sumR = 0
  let sumG = 0
  let sumB = 0
  let count = 0

  // 采样 3×3 区域
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = x + dx
      const py = y + dy
      if (px < 0 || py < 0 || px >= width) continue

      const idx = (py * width + px) * 4
      if (idx < 0 || idx + 2 >= imageData.length) continue

      sumR += imageData[idx]
      sumG += imageData[idx + 1]
      sumB += imageData[idx + 2]
      count++
    }
  }

  const r = count > 0 ? Math.round(sumR / count) : 0
  const g = count > 0 ? Math.round(sumG / count) : 0
  const b = count > 0 ? Math.round(sumB / count) : 0

  const hex = rgbToHex(r, g, b)
  const hsl = rgbToHsl(r, g, b)
  const { name, nameEn } = findClosestColorName(r, g, b)

  return {
    hex,
    rgb: { r, g, b },
    hsl,
    name,
    nameEn,
    timestamp: Date.now()
  }
}

/**
 * 从 canvas 上下文获取指定位置的颜色
 * @param canvasId canvas 元素 ID
 * @param x 像素 x 坐标
 * @param y 像素 y 坐标
 * @returns Promise<颜色信息>
 */
export function identifyFromCanvas(
  canvasId: string,
  x: number,
  y: number
): Promise<ColorInfo> {
  return new Promise((resolve, reject) => {
    const context = uni.createCanvasContext(canvasId)
    if (!context) {
      reject(new Error('Canvas 上下文创建失败'))
      return
    }

    uni.canvasGetImageData({
      canvasId,
      x: Math.max(0, x - 1),
      y: Math.max(0, y - 1),
      width: 3,
      height: 3,
      success: (res) => {
        try {
          const info = identifyColor(1, 1, res.data as unknown as Uint8ClampedArray, 3)
          resolve(info)
        } catch (e) {
          reject(new Error('颜色识别失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '获取 canvas 像素失败'))
      }
    })
  })
}
