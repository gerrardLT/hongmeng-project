/**
 * 石原图版（Ishihara）测试图片生成脚本
 * 使用纯 Node.js 生成 SVG 格式的模拟石原图版
 * 运行：node scripts/generate-ishihara.js
 */

const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'static', 'images', 'ishihara')
const SIZE = 400
const CENTER = SIZE / 2
const RADIUS = 180 // 圆盘半径

// 数字点阵定义（5x7 网格，1=填充，0=空白）
const DIGIT_PATTERNS = {
  '1': [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0]
  ],
  '2': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1]
  ],
  '3': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '4': [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0]
  ],
  '5': [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '6': [
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '7': [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
  ],
  '8': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ],
  '9': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0]
  ],
  '0': [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
  ]
}

// 配色方案：每张图的背景色和数字色
const PLATES = [
  {
    id: 'plate_1',
    number: '12',
    bgColors: ['#6B8E23', '#556B2F', '#8FBC8F', '#2E8B57', '#3CB371'],
    numColors: ['#E8963E', '#D2691E', '#CD853F', '#F4A460', '#DEB887'],
    desc: '通用测试 - 所有人可见数字12'
  },
  {
    id: 'plate_2',
    number: '8',
    bgColors: ['#6B8E23', '#556B2F', '#8FBC8F', '#2E8B57', '#3CB371'],
    numColors: ['#DC143C', '#B22222', '#CD5C5C', '#F08080', '#E07060'],
    desc: '红绿色盲测试 - 数字8'
  },
  {
    id: 'plate_3',
    number: '6',
    bgColors: ['#B8860B', '#DAA520', '#F0C040', '#CD853F', '#D2B48C'],
    numColors: ['#228B22', '#2E8B57', '#3CB371', '#32CD32', '#00AA55'],
    desc: '红绿色盲测试 - 数字6'
  },
  {
    id: 'plate_4',
    number: '29',
    bgColors: ['#4682B4', '#5F9EA0', '#6495ED', '#87CEEB', '#708090'],
    numColors: ['#FF8C00', '#FFA500', '#FFB347', '#FFD700', '#FF7F50'],
    desc: '蓝黄色盲测试 - 数字29'
  },
  {
    id: 'plate_5',
    number: '57',
    bgColors: ['#8B4513', '#A0522D', '#CD853F', '#D2691E', '#BC8F8F'],
    numColors: ['#4169E1', '#6495ED', '#4682B4', '#5B9BD5', '#7B68EE'],
    desc: '综合测试 - 数字57'
  }
]

/**
 * 简易伪随机数生成器（可重复种子）
 */
function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * 判断一个点是否在圆内
 */
function isInCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2
}

/**
 * 获取数字的像素掩码（在指定区域内）
 * @param {string} numberStr - 要显示的数字，如 "12"
 * @param {number} width - 区域宽度
 * @param {number} height - 区域高度
 * @param {number} offsetX - X偏移
 * @param {number} offsetY - Y偏移
 * @returns {Set<string>} - 命中的像素坐标集合 "x,y"
 */
function getNumberMask(numberStr, width, height, offsetX, offsetY) {
  const digits = numberStr.split('')
  const digitCount = digits.length
  const digitWidth = Math.floor(width / digitCount)
  const digitHeight = height
  const mask = new Set()

  digits.forEach((d, idx) => {
    const pattern = DIGIT_PATTERNS[d]
    if (!pattern) return

    const dx = offsetX + idx * digitWidth
    const dy = offsetY

    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (pattern[row][col] === 1) {
          // 将点阵的每个像素映射到区域中的多个像素
          const cellW = digitWidth / 5
          const cellH = digitHeight / 7
          const px = Math.floor(dx + col * cellW)
          const py = Math.floor(dy + row * cellH)
          // 填充单元格区域
          for (let ci = 0; ci < Math.ceil(cellW); ci++) {
            for (let cj = 0; cj < Math.ceil(cellH); cj++) {
              mask.add(`${px + ci},${py + cj}`)
            }
          }
        }
      }
    }
  })

  return mask
}

/**
 * 生成一张石原图版 SVG
 */
function generatePlate(plateConfig) {
  const { id, number, bgColors, numColors, desc } = plateConfig
  const rand = seededRandom(id.charCodeAt(id.length - 1) * 1000 + number.charCodeAt(0) * 100)

  // 数字掩码区域（居中偏上）
  const maskW = 160
  const maskH = 120
  const maskX = CENTER - maskW / 2
  const maskY = CENTER - maskH / 2 - 10
  const mask = getNumberMask(number, maskW, maskH, maskX, maskY)

  // 生成圆点
  const circles = []
  const attempts = 3000
  const placed = []

  for (let i = 0; i < attempts; i++) {
    const x = rand() * SIZE
    const y = rand() * SIZE

    // 只在圆盘范围内
    if (!isInCircle(x, y, CENTER, CENTER, RADIUS)) continue

    const r = 3 + rand() * 8 // 圆点半径 3-11

    // 检查是否与已放置的圆点重叠太多
    let overlap = false
    for (const p of placed) {
      const dist = Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2)
      if (dist < (r + p.r) * 0.5) {
        overlap = true
        break
      }
    }
    if (overlap) continue

    // 判断圆点中心是否在数字掩码内
    const isNumber = mask.has(`${Math.floor(x)},${Math.floor(y)}`)

    // 选择颜色
    const colorArr = isNumber ? numColors : bgColors
    const color = colorArr[Math.floor(rand() * colorArr.length)]

    circles.push({ x, y, r, color })
    placed.push({ x, y, r })

    // 达到足够密度就停止
    if (placed.length > 600) break
  }

  // 构建 SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`
  svg += `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">\n`
  svg += `  <!-- ${desc} -->\n`
  svg += `  <defs>\n`
  svg += `    <clipPath id="plate-clip">\n`
  svg += `      <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" />\n`
  svg += `    </clipPath>\n`
  svg += `  </defs>\n`

  // 背景
  svg += `  <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="#F5F0E6" />\n`

  // 圆点
  svg += `  <g clip-path="url(#plate-clip)">\n`
  for (const c of circles) {
    svg += `    <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${c.r.toFixed(1)}" fill="${c.color}" />\n`
  }
  svg += `  </g>\n`

  // 圆盘边框
  svg += `  <circle cx="${CENTER}" cy="${CENTER}" r="${RADIUS}" fill="none" stroke="#D0C8B8" stroke-width="2" />\n`
  svg += `</svg>\n`

  return svg
}

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

// 生成所有图片
for (const plate of PLATES) {
  const svg = generatePlate(plate)
  const filePath = path.join(OUTPUT_DIR, `${plate.id}.svg`)
  fs.writeFileSync(filePath, svg, 'utf-8')
  console.log(`✓ 已生成: ${filePath}`)
}

console.log('\n全部生成完成！')
