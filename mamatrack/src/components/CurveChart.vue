<template>
  <view class="curve-chart">
    <canvas
      canvas-id="curveChart"
      id="curveChart"
      :style="{ width: width + 'rpx', height: height + 'rpx' }"
      @click="onCanvasClick"
    />
  </view>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import type { ChartPoint } from '@/utils/chart'
import { calculateYRange } from '@/utils/chart'

interface StandardRangeItem {
  week: number
  min: number
  max: number
}

interface PopulationCurveItem {
  week: number
  avg: number
}

const props = withDefaults(defineProps<{
  personalPoints: ChartPoint[]
  standardRange: StandardRangeItem[]
  populationCurve?: PopulationCurveItem[]
  mode: 'weight' | 'gain'
  width?: number
  height?: number
  preWeight?: number
}>(), {
  width: 700,
  height: 400,
  populationCurve: () => [],
  preWeight: 0
})

const emit = defineEmits<{
  pointClick: [point: ChartPoint]
}>()

// 图表边距
const PADDING_LEFT = 60
const PADDING_RIGHT = 20
const PADDING_TOP = 20
const PADDING_BOTTOM = 40

let ctx: UniApp.CanvasContext | null = null

function getCtx(): UniApp.CanvasContext | null {
  if (!ctx) {
    ctx = uni.createCanvasContext('curveChart')
  }
  return ctx
}

function rpxToPx(rpx: number): number {
  const sysInfo = uni.getSystemInfoSync()
  const screenWidth = sysInfo.screenWidth
  return (rpx / 750) * screenWidth
}

function drawChart() {
  const c = getCtx()
  if (!c) return

  const canvasWidth = rpxToPx(props.width)
  const canvasHeight = rpxToPx(props.height)

  const chartLeft = PADDING_LEFT
  const chartRight = canvasWidth - PADDING_RIGHT
  const chartTop = PADDING_TOP
  const chartBottom = canvasHeight - PADDING_BOTTOM
  const chartWidth = chartRight - chartLeft
  const chartHeight = chartBottom - chartTop

  // 清空画布
  c.clearRect(0, 0, canvasWidth, canvasHeight)

  // 计算 Y 轴范围
  const yRange = calculateYRange(
    props.personalPoints,
    props.standardRange as any[]
  )
  const yMin = yRange.min
  const yMax = yRange.max
  const yStep = yRange.step

  // X 轴范围 0-40 周
  const xMin = 0
  const xMax = 40

  function toCanvasX(val: number): number {
    return chartLeft + ((val - xMin) / (xMax - xMin)) * chartWidth
  }

  function toCanvasY(val: number): number {
    return chartBottom - ((val - yMin) / (yMax - yMin)) * chartHeight
  }

  // 1. 绘制网格线（浅灰色虚线）
  c.setLineDash([4, 4])
  c.setStrokeStyle('#F0F0F0')
  c.setLineWidth(0.5)

  // 水平网格线
  for (let v = yMin; v <= yMax; v += yStep) {
    const y = toCanvasY(v)
    c.beginPath()
    c.moveTo(chartLeft, y)
    c.lineTo(chartRight, y)
    c.stroke()
  }

  // 垂直网格线（每4周）
  for (let w = 0; w <= 40; w += 4) {
    const x = toCanvasX(w)
    c.beginPath()
    c.moveTo(x, chartTop)
    c.lineTo(x, chartBottom)
    c.stroke()
  }
  c.setLineDash([])

  // 2. 绘制标准范围区域（浅绿色半透明填充）
  if (props.standardRange && props.standardRange.length > 0) {
    c.beginPath()
    // 上边界（从左到右）
    for (let i = 0; i < props.standardRange.length; i++) {
      const item = props.standardRange[i]
      const x = toCanvasX(item.week)
      const y = toCanvasY(item.max)
      if (i === 0) {
        c.moveTo(x, y)
      } else {
        c.lineTo(x, y)
      }
    }
    // 下边界（从右到左）
    for (let i = props.standardRange.length - 1; i >= 0; i--) {
      const item = props.standardRange[i]
      const x = toCanvasX(item.week)
      const y = toCanvasY(item.min)
      c.lineTo(x, y)
    }
    c.closePath()
    c.setFillStyle('rgba(76, 175, 80, 0.12)')
    c.fill()
  }

  // 3. 绘制群体平均曲线（灰色虚线）
  if (props.populationCurve && props.populationCurve.length > 0) {
    c.setLineDash([6, 4])
    c.setStrokeStyle('#BBBBBB')
    c.setLineWidth(1.5)
    c.beginPath()
    for (let i = 0; i < props.populationCurve.length; i++) {
      const item = props.populationCurve[i]
      const x = toCanvasX(item.week)
      const y = toCanvasY(item.avg)
      if (i === 0) {
        c.moveTo(x, y)
      } else {
        c.lineTo(x, y)
      }
    }
    c.stroke()
    c.setLineDash([])
  }

  // 4. 绘制孕前体重基准线（weight模式时）
  if (props.mode === 'weight' && props.preWeight > 0) {
    c.setLineDash([8, 4])
    c.setStrokeStyle('#CCCCCC')
    c.setLineWidth(1)
    const baseY = toCanvasY(props.preWeight)
    c.beginPath()
    c.moveTo(chartLeft, baseY)
    c.lineTo(chartRight, baseY)
    c.stroke()
    c.setLineDash([])

    // 基准线标签
    c.setFontSize(10)
    c.setFillStyle('#999999')
    c.fillText('孕前', chartLeft - 38, baseY + 3)
  }

  // 5. 绘制个人数据折线（粉紫色实线 + 数据点）
  if (props.personalPoints.length > 0) {
    c.setStrokeStyle('#E91E8C')
    c.setLineWidth(2.5)
    c.setLineDash([])
    c.beginPath()

    const sortedPoints = [...props.personalPoints].sort((a, b) => a.x - b.x)
    for (let i = 0; i < sortedPoints.length; i++) {
      const p = sortedPoints[i]
      const x = toCanvasX(p.x)
      const y = toCanvasY(p.y)
      if (i === 0) {
        c.moveTo(x, y)
      } else {
        c.lineTo(x, y)
      }
    }
    c.stroke()

    // 数据点圆点
    for (const p of sortedPoints) {
      const x = toCanvasX(p.x)
      const y = toCanvasY(p.y)

      // 外圈白色
      c.beginPath()
      c.arc(x, y, 5, 0, 2 * Math.PI)
      c.setFillStyle('#FFFFFF')
      c.fill()

      // 内圈粉紫色
      c.beginPath()
      c.arc(x, y, 3.5, 0, 2 * Math.PI)
      c.setFillStyle('#E91E8C')
      c.fill()
    }
  }

  // 6. 绘制坐标轴
  c.setStrokeStyle('#999999')
  c.setLineWidth(1)
  c.setLineDash([])

  // X 轴
  c.beginPath()
  c.moveTo(chartLeft, chartBottom)
  c.lineTo(chartRight, chartBottom)
  c.stroke()

  // Y 轴
  c.beginPath()
  c.moveTo(chartLeft, chartTop)
  c.lineTo(chartLeft, chartBottom)
  c.stroke()

  // 坐标轴标签
  c.setFontSize(10)
  c.setFillStyle('#999999')

  // X 轴标签
  c.setTextAlign('center')
  for (let w = 0; w <= 40; w += 4) {
    const x = toCanvasX(w)
    c.fillText(`${w}`, x, chartBottom + 16)
  }

  // X 轴标题
  c.setFontSize(10)
  c.fillText('孕周', (chartLeft + chartRight) / 2, chartBottom + 32)

  // Y 轴标签
  c.setTextAlign('right')
  for (let v = yMin; v <= yMax; v += yStep) {
    const y = toCanvasY(v)
    c.fillText(`${v}`, chartLeft - 8, y + 3)
  }

  // Y 轴单位
  c.setTextAlign('left')
  c.setFontSize(10)
  c.fillText(props.mode === 'weight' ? 'kg' : 'kg', chartLeft - 30, chartTop - 6)

  c.draw()
}

function onCanvasClick(e: any) {
  if (!props.personalPoints.length) return

  const canvasWidth = rpxToPx(props.width)
  const chartLeft = PADDING_LEFT
  const chartRight = canvasWidth - PADDING_RIGHT
  const chartWidth = chartRight - chartLeft

  const clickX = e.detail?.x ?? e.x ?? 0

  // 找到最近的数据点
  const sortedPoints = [...props.personalPoints].sort((a, b) => a.x - b.x)
  let closest: ChartPoint | null = null
  let minDist = Infinity

  for (const p of sortedPoints) {
    const px = chartLeft + (p.x / 40) * chartWidth
    const dist = Math.abs(px - clickX)
    if (dist < minDist) {
      minDist = dist
      closest = p
    }
  }

  if (closest && minDist < 30) {
    emit('pointClick', closest)
  }
}

onMounted(() => {
  nextTick(() => {
    drawChart()
  })
})

watch(
  () => [props.personalPoints, props.standardRange, props.populationCurve, props.mode, props.preWeight],
  () => {
    nextTick(() => {
      drawChart()
    })
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.curve-chart {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
