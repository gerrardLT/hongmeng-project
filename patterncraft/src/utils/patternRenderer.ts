import type { PatternParameters, PatternDensity, PatternRotation } from '@/types/models'

// ==================== 绘制参数接口 ====================

interface DrawOptions {
  x: number
  y: number
  size: number
  color: string
  secondaryColor?: string
  lineWidth?: number
}

// ==================== 密度映射 ====================

/**
 * 根据密度获取间距系数
 * @param density 密度级别
 * @returns 间距系数（相对于 size 的倍数）
 */
function getDensitySpacing(density: PatternDensity): number {
  switch (density) {
    case 'sparse': return 2.5
    case 'medium': return 1.6
    case 'dense': return 1.1
  }
}

// ==================== 基础纹样绘制 ====================

/**
 * 绘制祥云纹
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawCloudPattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const r = size / 4

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  // 主体三个圆弧组成祥云
  ctx.arc(x, y, r, Math.PI, 0, false)
  ctx.arc(x + r, y - r * 0.3, r * 0.7, Math.PI, 0, false)
  ctx.arc(x - r, y - r * 0.3, r * 0.7, Math.PI, 0, false)

  // 云尾卷曲
  ctx.moveTo(x - r * 1.7, y)
  ctx.quadraticCurveTo(x - r * 2, y + r * 0.8, x - r * 1.3, y + r * 0.5)

  ctx.stroke()
  ctx.restore()
}

/**
 * 绘制回纹（回字纹/雷纹）
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawFretPattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const s = size / 2

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'miter'
  ctx.beginPath()

  // 外框
  ctx.rect(x - s, y - s, size, size)

  // 内部回旋路径
  const inset = s * 0.3
  ctx.moveTo(x - s + inset, y - s + inset)
  ctx.lineTo(x + s - inset, y - s + inset)
  ctx.lineTo(x + s - inset, y + s - inset)
  ctx.lineTo(x - s + inset * 2, y + s - inset)
  ctx.lineTo(x - s + inset * 2, y - s + inset * 2)
  ctx.lineTo(x + s - inset * 2, y - s + inset * 2)

  ctx.stroke()
  ctx.restore()
}

/**
 * 绘制波浪纹（水波纹）
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawWavePattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const amplitude = size / 4
  const wavelength = size

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  // 绘制三条波浪线
  for (let row = 0; row < 3; row++) {
    const offsetY = y + row * amplitude * 1.2
    ctx.moveTo(x - wavelength / 2, offsetY)

    for (let i = 0; i <= 20; i++) {
      const px = x - wavelength / 2 + (wavelength / 20) * i
      const py = offsetY + Math.sin((i / 20) * Math.PI * 2) * amplitude * 0.5
      ctx.lineTo(px, py)
    }
  }

  ctx.stroke()
  ctx.restore()
}

/**
 * 绘制如意纹
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawRuyiPattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const r = size / 3

  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = 'transparent'
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  // 如意头部（心形变体）
  ctx.arc(x - r * 0.4, y - r * 0.2, r * 0.5, Math.PI, 0, false)
  ctx.arc(x + r * 0.4, y - r * 0.2, r * 0.5, Math.PI, 0, false)

  // 如意柄
  ctx.moveTo(x, y + r * 0.3)
  ctx.quadraticCurveTo(x + r * 0.3, y + r, x, y + r * 1.5)
  ctx.quadraticCurveTo(x - r * 0.3, y + r, x, y + r * 0.3)

  ctx.stroke()
  ctx.restore()
}

/**
 * 绘制卷草纹
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawScrollPattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const r = size / 3

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()

  // 主茎
  ctx.moveTo(x - r * 1.5, y)
  ctx.quadraticCurveTo(x - r * 0.5, y - r, x, y)
  ctx.quadraticCurveTo(x + r * 0.5, y + r, x + r * 1.5, y)

  // 左卷
  ctx.moveTo(x - r * 0.5, y - r * 0.5)
  ctx.arc(x - r * 0.8, y - r * 0.5, r * 0.3, 0, Math.PI * 1.5, true)

  // 右卷
  ctx.moveTo(x + r * 0.5, y + r * 0.5)
  ctx.arc(x + r * 0.8, y + r * 0.5, r * 0.3, Math.PI, Math.PI * 0.5, true)

  ctx.stroke()
  ctx.restore()
}

/**
 * 绘制万字纹（卍）
 * @param ctx Canvas 2D 渲染上下文
 * @param options 绘制参数
 */
export function drawSwastikaPattern(ctx: CanvasRenderingContext2D, options: DrawOptions): void {
  const { x, y, size, color, lineWidth = 2 } = options
  const s = size / 3

  ctx.save()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'miter'
  ctx.beginPath()

  // 十字主体
  ctx.moveTo(x - s, y)
  ctx.lineTo(x + s, y)
  ctx.moveTo(x, y - s)
  ctx.lineTo(x, y + s)

  // 四个折角
  ctx.moveTo(x - s, y)
  ctx.lineTo(x - s, y - s * 0.6)
  ctx.moveTo(x + s, y)
  ctx.lineTo(x + s, y + s * 0.6)
  ctx.moveTo(x, y - s)
  ctx.lineTo(x + s * 0.6, y - s)
  ctx.moveTo(x, y + s)
  ctx.lineTo(x - s * 0.6, y + s)

  ctx.stroke()
  ctx.restore()
}

// ==================== 平铺与旋转 ====================

/**
 * 对 Canvas 应用纹样平铺
 * @param ctx Canvas 2D 渲染上下文
 * @param canvasWidth 画布宽度
 * @param canvasHeight 画布高度
 * @param params 纹样参数
 * @param drawFn 单个纹样的绘制函数
 * @param color 纹样颜色
 */
export function applyTiling(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  params: PatternParameters,
  drawFn: (ctx: CanvasRenderingContext2D, options: DrawOptions) => void,
  color: string
): void {
  const spacing = params.size * getDensitySpacing(params.density)

  const cols = Math.ceil(canvasWidth / spacing) + 1
  const rows = Math.ceil(canvasHeight / spacing) + 1

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing + (row % 2 === 1 ? spacing / 2 : 0)
      const y = row * spacing

      ctx.save()
      ctx.translate(x, y)

      const angle = getRotationAngle(params.rotation)
      if (angle !== 0) {
        ctx.rotate((angle * Math.PI) / 180)
      }

      drawFn(ctx, {
        x: 0,
        y: 0,
        size: params.size,
        color
      })

      ctx.restore()
    }
  }
}

/**
 * 获取旋转角度
 * @param rotation 旋转配置
 * @returns 实际角度值
 */
function getRotationAngle(rotation: PatternRotation): number {
  switch (rotation) {
    case '0': return 0
    case '45': return 45
    case '90': return 90
    case 'random': return Math.random() * 360
  }
}

/**
 * 对 Canvas 上下文应用旋转变换
 * @param ctx Canvas 2D 渲染上下文
 * @param centerX 旋转中心X
 * @param centerY 旋转中心Y
 * @param angleDeg 旋转角度（度）
 */
export function applyRotation(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  angleDeg: number
): void {
  ctx.translate(centerX, centerY)
  ctx.rotate((angleDeg * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)
}

/**
 * 清空画布并填充背景色
 * @param ctx Canvas 2D 渲染上下文
 * @param width 画布宽度
 * @param height 画布高度
 * @param bgColor 背景颜色
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgColor = '#FFFFFF'
): void {
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, width, height)
}
