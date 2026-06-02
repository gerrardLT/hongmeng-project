import type { AnalysisResult, AnalysisColor, ColorInfo } from '@/types/models'
import { dbGetAll, dbSet, generateId } from '@/utils/db'

const COLLECTION_ANALYSIS = 'analysis_results'
const MAX_HISTORY = 50

/* ============================================================
 *  K-Means 主色调提取（简化版）
 * ============================================================ */

interface PixelCluster {
  center: { r: number; g: number; b: number }
  pixels: { r: number; g: number; b: number; x: number; y: number }[]
}

/**
 * 计算两个颜色之间的欧几里得距离
 */
function colorDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  )
}

/**
 * 简化版 K-Means：提取图像主色调
 * @param imageData RGBA 像素数组
 * @param width 图像宽度
 * @param height 图像高度
 * @param k 聚类数量（默认 5）
 * @returns 聚类中心列表（主色调）
 */
function kmeans(
  imageData: Uint8ClampedArray,
  width: number,
  height: number,
  k: number = 5
): { color: { r: number; g: number; b: number }; count: number; region: { x: number; y: number; width: number; height: number } }[] {
  // 1. 均匀采样像素（减少计算量，每 16 像素取 1 个）
  const step = 4
  const pixels: { r: number; g: number; b: number; x: number; y: number }[] = []

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4
      if (idx + 2 < imageData.length) {
        pixels.push({
          r: imageData[idx],
          g: imageData[idx + 1],
          b: imageData[idx + 2],
          x,
          y
        })
      }
    }
  }

  if (pixels.length === 0) return []

  // 2. 初始化聚类中心（均匀分散）
  const clusters: PixelCluster[] = []
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((pixels.length * i) / k)
    clusters.push({
      center: { r: pixels[idx].r, g: pixels[idx].g, b: pixels[idx].b },
      pixels: []
    })
  }

  // 3. 迭代聚类（固定 10 次）
  for (let iter = 0; iter < 10; iter++) {
    // 清空当前聚类
    clusters.forEach((c) => (c.pixels = []))

    // 分配像素到最近中心
    for (const pixel of pixels) {
      let minDist = Infinity
      let closestIdx = 0
      for (let i = 0; i < clusters.length; i++) {
        const dist = colorDistance(pixel, clusters[i].center)
        if (dist < minDist) {
          minDist = dist
          closestIdx = i
        }
      }
      clusters[closestIdx].pixels.push(pixel)
    }

    // 重新计算中心
    for (const cluster of clusters) {
      if (cluster.pixels.length === 0) continue
      let sumR = 0
      let sumG = 0
      let sumB = 0
      for (const p of cluster.pixels) {
        sumR += p.r
        sumG += p.g
        sumB += p.b
      }
      cluster.center = {
        r: Math.round(sumR / cluster.pixels.length),
        g: Math.round(sumG / cluster.pixels.length),
        b: Math.round(sumB / cluster.pixels.length)
      }
    }
  }

  // 4. 返回结果（含占比和区域）
  return clusters
    .filter((c) => c.pixels.length > 0)
    .map((cluster) => {
      const xs = cluster.pixels.map((p) => p.x)
      const ys = cluster.pixels.map((p) => p.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)

      return {
        color: cluster.center,
        count: cluster.pixels.length,
        region: {
          x: minX,
          y: minY,
          width: maxX - minX + step,
          height: maxY - minY + step
        }
      }
    })
    .sort((a, b) => b.count - a.count)
}

/* ============================================================
 *  RGB 转 ColorInfo 辅助
 * ============================================================ */

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/* ============================================================
 *  图像分析接口
 * ============================================================ */

/**
 * 分析照片主要颜色
 * @param imagePath 本地图片路径
 * @returns 分析结果
 */
export function analyzeImage(imagePath: string): Promise<AnalysisResult> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imagePath,
      success: (imgInfo) => {
        const canvasId = 'temp_analysis_canvas'
        const query = uni.createSelectorQuery()

        // 缩小采样尺寸以提升性能
        const maxSize = 256
        const scale = Math.min(1, maxSize / Math.max(imgInfo.width, imgInfo.height))
        const w = Math.round(imgInfo.width * scale)
        const h = Math.round(imgInfo.height * scale)

        const ctx = uni.createCanvasContext(canvasId)
        if (!ctx) {
          reject(new Error('Canvas 创建失败'))
          return
        }

        ctx.drawImage(imagePath, 0, 0, w, h)
        ctx.draw(false, () => {
          uni.canvasGetImageData({
            canvasId,
            x: 0,
            y: 0,
            width: w,
            height: h,
            success: (res) => {
              try {
                const clusters = kmeans(res.data as unknown as Uint8ClampedArray, w, h, 5)
                const total = clusters.reduce((sum, c) => sum + c.count, 0)

                const colors: AnalysisColor[] = clusters.map((c) => {
                  const { r, g, b } = c.color
                  const colorInfo: ColorInfo = {
                    hex: rgbToHex(r, g, b),
                    rgb: { r, g, b },
                    hsl: rgbToHsl(r, g, b),
                    name: '',
                    nameEn: '',
                    timestamp: Date.now()
                  }
                  return {
                    color: colorInfo,
                    percentage: total > 0 ? Math.round((c.count / total) * 1000) / 10 : 0,
                    region: c.region
                  }
                })

                const result: AnalysisResult = {
                  analysisId: generateId(),
                  imagePath,
                  colors,
                  analyzedAt: Date.now()
                }

                resolve(result)
              } catch (e) {
                reject(new Error('分析像素数据失败'))
              }
            },
            fail: (err) => {
              reject(new Error(err.errMsg || '获取图像像素失败'))
            }
          })
        })
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '读取图片信息失败'))
      }
    })
  })
}

/**
 * 保存分析结果到本地存储
 * @param result 分析结果
 */
export function saveAnalysisResult(result: AnalysisResult): void {
  try {
    dbSet<AnalysisResult>(COLLECTION_ANALYSIS, result.analysisId, result)

    // 限制历史数量
    const all = dbGetAll<AnalysisResult>(COLLECTION_ANALYSIS)
    if (all.length > MAX_HISTORY) {
      const sorted = all.sort((a, b) => b.analyzedAt - a.analyzedAt)
      const toDelete = sorted.slice(MAX_HISTORY)
      // dbDelete is available in db.ts
      toDelete.forEach((item) => {
        try {
          const key = `coloraid_db_${COLLECTION_ANALYSIS}`
          const existing = uni.getStorageSync(key) as Record<string, AnalysisResult> | undefined
          if (existing) {
            delete existing[item.analysisId]
            uni.setStorageSync(key, existing)
          }
        } catch (e) {
          console.error('delete old analysis error:', e)
        }
      })
    }
  } catch (e) {
    console.error('save analysis result error:', e)
  }
}

/**
 * 获取历史分析记录
 * @returns 分析结果列表（按时间倒序）
 */
export function getAnalysisHistory(): AnalysisResult[] {
  try {
    const all = dbGetAll<AnalysisResult>(COLLECTION_ANALYSIS)
    return all.sort((a, b) => b.analyzedAt - a.analyzedAt)
  } catch (e) {
    console.error('get analysis history error:', e)
    return []
  }
}
