import type { Pattern, PatternParameters, ColorScheme } from '@/types/models'
import {
  drawCloudPattern,
  drawFretPattern,
  drawWavePattern,
  drawRuyiPattern,
  drawScrollPattern,
  drawSwastikaPattern,
  applyTiling,
  clearCanvas
} from '@/utils/patternRenderer'

/**
 * 根据纹样分类和子分类选择对应的绘制函数
 * @param category 纹样分类
 * @param subCategory 子分类
 * @returns 绘制函数
 */
function getDrawFunction(
  category: string,
  subCategory: string
): (ctx: CanvasRenderingContext2D, options: { x: number; y: number; size: number; color: string }) => void {
  // 根据子分类匹配绘制函数
  const drawFnMap: Record<string, typeof drawCloudPattern> = {
    cloud: drawCloudPattern,
    fret: drawFretPattern,
    wave: drawWavePattern,
    ruyi: drawRuyiPattern,
    scroll: drawScrollPattern,
    swastika: drawSwastikaPattern
  }

  // 优先按 subCategory 匹配
  const subKey = subCategory.toLowerCase()
  for (const [key, fn] of Object.entries(drawFnMap)) {
    if (subKey.includes(key)) {
      return fn
    }
  }

  // 默认使用祥云纹
  return drawCloudPattern
}

/**
 * 渲染纹样主入口
 * @param ctx Canvas 2D 渲染上下文
 * @param pattern 纹样对象
 * @param params 纹样参数
 * @param colorScheme 配色方案
 */
export function renderPattern(
  ctx: CanvasRenderingContext2D,
  pattern: Pattern,
  params: PatternParameters,
  colorScheme: ColorScheme
): void {
  const width = ctx.canvas.width
  const height = ctx.canvas.height

  // 1. 清空画布并填充背景色
  clearCanvas(ctx, width, height, colorScheme.backgroundColor || '#FFFFFF')

  // 2. 应用配色
  applyColorScheme(ctx, colorScheme)

  // 3. 获取绘制函数
  const drawFn = getDrawFunction(pattern.category, pattern.subCategory)

  // 4. 执行平铺绘制
  applyTiling(ctx, width, height, params, drawFn, colorScheme.primaryColor)

  // 5. 叠加装饰层（使用次要色和强调色）
  ctx.globalAlpha = 0.3
  applyTiling(ctx, width, height, {
    ...params,
    size: params.size * 0.6,
    density: 'sparse'
  }, drawFn, colorScheme.secondaryColor)
  ctx.globalAlpha = 1.0
}

/**
 * 生成纹样预览图
 * @param pattern 纹样对象
 * @param params 纹样参数
 * @param colorScheme 配色方案
 * @param width 预览宽度，默认 300
 * @param height 预览高度，默认 300
 * @returns base64 dataUrl 字符串
 */
export function generatePreview(
  pattern: Pattern,
  params: PatternParameters,
  colorScheme: ColorScheme,
  width = 300,
  height = 300
): string {
  try {
    // 创建离屏 Canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('[render] cannot get 2d context for preview')
      return ''
    }

    renderPattern(ctx, pattern, params, colorScheme)
    return canvas.toDataURL('image/png')
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[RenderService] generatePreview failed:', message)
    uni.showToast({ title: '生成预览失败', icon: 'none' })
    return ''
  }
}

/**
 * 渲染纹样到指定的 uni-app canvas
 * @param canvasId Canvas 组件 ID
 * @param pattern 纹样对象
 * @param params 纹样参数
 * @param colorScheme 配色方案
 */
export function renderToCanvas(
  canvasId: string,
  pattern: Pattern,
  params: PatternParameters,
  colorScheme: ColorScheme
): void {
  try {
    const query = uni.createSelectorQuery()
    query
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res: any[]) => {
        if (!res?.[0]?.node) {
          console.error('[render] canvas node not found:', canvasId)
          return
        }

        const canvas = res[0].node
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
        if (!ctx) {
          console.error('[render] Failed to get 2D context for canvas:', canvasId)
          return
        }
        canvas.width = res[0].width || 300
        canvas.height = res[0].height || 300

        renderPattern(ctx, pattern, params, colorScheme)
        console.log('[render] rendered to canvas:', canvasId)
      })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : '未知错误'
    console.error('[RenderService] renderToCanvas failed:', message)
    uni.showToast({ title: '渲染失败，请重试', icon: 'none' })
  }
}

/**
 * 应用配色方案到 Canvas 上下文
 * @param ctx Canvas 2D 渲染上下文
 * @param colorScheme 配色方案
 */
export function applyColorScheme(ctx: CanvasRenderingContext2D, colorScheme: ColorScheme): void {
  ctx.strokeStyle = colorScheme.primaryColor
  ctx.fillStyle = colorScheme.primaryColor
}
