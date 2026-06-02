/**
 * SealCraft 占位图片生成脚本
 * 使用 SVG 生成占位图片（保存为 .png 后缀，UniApp 支持直接渲染 SVG 内容）
 */
const fs = require('fs')
const path = require('path')

const OUTPUT_DIR = path.resolve(__dirname, '../src/static/images')

// ===== 颜色主题 =====
const COLORS = {
  sealRed: '#C41A1A',
  sealRedLight: '#E85454',
  inkBlack: '#2C2C2C',
  paperBg: '#FBF8F5',
  copper: '#B87333',
  copperLight: '#D4956B',
  shoushan: '#E8D5B7',
  shoushanDark: '#C4A87A',
  qingtian: '#7BA7A7',
  qingtianDark: '#5A8686',
  horn: '#8B7355',
  hornLight: '#A89070',
  sandalwood: '#8B4513',
  sandalwoodLight: '#A0522D',
  jixue: '#8B0000',
  jixueLight: '#CD5C5C',
  studioWarm1: '#D4A853',
  studioWarm2: '#C4956B',
  studioWarm3: '#A0522D',
  white: '#FFFFFF',
  gray: '#F5F5F5',
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * 生成 SVG 字符串
 */
function createSVG({ width = 400, height = 400, bg, elements }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bg}"/>
  ${elements}
</svg>`
}

/** 生成印章类型图片 - 白底 + 朱砂红印章图案 */
function generateSealImage(name, label, index) {
  const isOdd = index % 2 === 0
  const sealSize = isOdd ? 140 : 120
  const cx = 200, cy = 180
  const elements = isOdd
    ? `<!-- 方形印章 -->
    <rect x="${cx - sealSize/2}" y="${cy - sealSize/2}" width="${sealSize}" height="${sealSize}" rx="8" fill="none" stroke="${COLORS.sealRed}" stroke-width="6"/>
    <rect x="${cx - sealSize/2 + 12}" y="${cy - sealSize/2 + 12}" width="${sealSize - 24}" height="${sealSize - 24}" rx="4" fill="none" stroke="${COLORS.sealRed}" stroke-width="2"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="48" font-weight="bold" fill="${COLORS.sealRed}" font-family="serif">${label.slice(0, 2)}</text>
    <text x="${cx}" y="${cy + sealSize/2 + 60}" text-anchor="middle" font-size="24" fill="${COLORS.inkBlack}" font-family="sans-serif">${label}</text>
    <text x="${cx}" y="${cy + sealSize/2 + 90}" text-anchor="middle" font-size="16" fill="#999" font-family="sans-serif">SealCraft · 示例${index + 1}</text>`
    : `<!-- 圆形印章 -->
    <circle cx="${cx}" cy="${cy}" r="${sealSize/2}" fill="none" stroke="${COLORS.sealRed}" stroke-width="6"/>
    <circle cx="${cx}" cy="${cy}" r="${sealSize/2 - 12}" fill="none" stroke="${COLORS.sealRed}" stroke-width="2"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="42" font-weight="bold" fill="${COLORS.sealRed}" font-family="serif">${label.slice(0, 2)}</text>
    <text x="${cx}" y="${cy + sealSize/2 + 60}" text-anchor="middle" font-size="24" fill="${COLORS.inkBlack}" font-family="sans-serif">${label}</text>
    <text x="${cx}" y="${cy + sealSize/2 + 90}" text-anchor="middle" font-size="16" fill="#999" font-family="sans-serif">SealCraft · 示例${index + 1}</text>`

  return createSVG({ bg: COLORS.white, elements })
}

/** 生成材质图片 - 对应材质色调 */
function generateMaterialImage(name, label, colors, index) {
  const [mainColor, subColor] = colors
  const cx = 200, cy = 180
  const elements = `
    <!-- 材质纹理背景 -->
    <defs>
      <linearGradient id="grad_${name}_${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${mainColor};stop-opacity:0.3"/>
        <stop offset="100%" style="stop-color:${subColor};stop-opacity:0.5"/>
      </linearGradient>
    </defs>
    <rect x="40" y="40" width="320" height="240" rx="16" fill="url(#grad_${name}_${index})"/>
    <rect x="40" y="40" width="320" height="240" rx="16" fill="none" stroke="${mainColor}" stroke-width="2" opacity="0.6"/>
    <!-- 材质标识 -->
    <rect x="${cx - 50}" y="${cy - 40}" width="100" height="80" rx="8" fill="${mainColor}" opacity="0.85"/>
    <text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="36" font-weight="bold" fill="${COLORS.white}" font-family="serif">${label}</text>
    <!-- 底部文字 -->
    <text x="${cx}" y="340" text-anchor="middle" font-size="22" fill="${COLORS.inkBlack}" font-family="sans-serif">${label}材质 · 示例${index + 1}</text>
    <text x="${cx}" y="370" text-anchor="middle" font-size="14" fill="#999" font-family="sans-serif">SealCraft</text>`

  return createSVG({ bg: COLORS.gray, elements })
}

/** 生成字体图片 - 宣纸色背景 + 墨色文字 */
function generateFontImage(name, label, sampleText) {
  const cx = 200, cy = 160
  const elements = `
    <!-- 宣纸边框 -->
    <rect x="30" y="30" width="340" height="260" rx="4" fill="none" stroke="#D4C5A9" stroke-width="2"/>
    <rect x="36" y="36" width="328" height="248" rx="2" fill="none" stroke="#D4C5A9" stroke-width="1"/>
    <!-- 字体名称 -->
    <text x="${cx}" y="80" text-anchor="middle" font-size="20" fill="${COLORS.sealRed}" font-family="sans-serif">${label}</text>
    <!-- 示例文字 -->
    <text x="${cx}" y="${cy + 20}" text-anchor="middle" font-size="56" font-weight="bold" fill="${COLORS.inkBlack}" font-family="serif">${sampleText}</text>
    <!-- 分隔线 -->
    <line x1="80" y1="240" x2="320" y2="240" stroke="#D4C5A9" stroke-width="1"/>
    <!-- 底部说明 -->
    <text x="${cx}" y="330" text-anchor="middle" font-size="20" fill="#888" font-family="sans-serif">${label}示例</text>
    <text x="${cx}" y="360" text-anchor="middle" font-size="14" fill="#BBB" font-family="sans-serif">SealCraft · 印章字体</text>`

  return createSVG({ bg: COLORS.paperBg, elements })
}

/** 生成工作室图片 - 暖色调 */
function generateStudioImage(studioName, index) {
  const warmColors = ['#D4A853', '#C4956B', '#A0522D', '#8B7355', '#B87333', '#CD853F']
  const color = warmColors[index % warmColors.length]
  const cx = 200, cy = 160
  const elements = `
    <!-- 店铺外观 -->
    <rect x="60" y="80" width="280" height="180" rx="12" fill="${color}" opacity="0.15"/>
    <rect x="60" y="80" width="280" height="180" rx="12" fill="none" stroke="${color}" stroke-width="2"/>
    <!-- 门牌 -->
    <rect x="${cx - 70}" y="100" width="140" height="50" rx="6" fill="${color}" opacity="0.9"/>
    <text x="${cx}" y="133" text-anchor="middle" font-size="22" font-weight="bold" fill="${COLORS.white}" font-family="sans-serif">${studioName.slice(0, 4)}</text>
    <!-- 门 -->
    <rect x="${cx - 30}" y="180" width="60" height="80" rx="4" fill="${color}" opacity="0.3"/>
    <circle cx="${cx + 20}" cy="220" r="4" fill="${color}" opacity="0.7"/>
    <!-- 底部说明 -->
    <text x="${cx}" y="310" text-anchor="middle" font-size="22" fill="${COLORS.inkBlack}" font-family="sans-serif">${studioName}</text>
    <text x="${cx}" y="340" text-anchor="middle" font-size="14" fill="#999" font-family="sans-serif">SealCraft · 合作工作室</text>`

  return createSVG({ bg: '#FDF8F0', elements })
}

/** 生成 Logo 图片 - 朱砂红圆形印章内含"印"字 */
function generateLogo() {
  const elements = `
    <!-- 外圆 -->
    <circle cx="200" cy="200" r="160" fill="${COLORS.sealRed}"/>
    <circle cx="200" cy="200" r="148" fill="none" stroke="${COLORS.white}" stroke-width="3" opacity="0.4"/>
    <circle cx="200" cy="200" r="140" fill="none" stroke="${COLORS.white}" stroke-width="1" opacity="0.3"/>
    <!-- "印" 字 -->
    <text x="200" y="225" text-anchor="middle" font-size="140" font-weight="bold" fill="${COLORS.white}" font-family="serif">印</text>
    <!-- 底部弧形文字 -->
    <text x="200" y="380" text-anchor="middle" font-size="18" fill="${COLORS.sealRed}" font-family="sans-serif">SealCraft</text>`

  return createSVG({ bg: 'transparent', elements: elements.replace('fill="transparent"', '') })
}

/** 生成默认头像 */
function generateDefaultAvatar() {
  const elements = `
    <circle cx="200" cy="200" r="200" fill="#F0E0E0"/>
    <circle cx="200" cy="160" r="60" fill="${COLORS.sealRed}" opacity="0.6"/>
    <ellipse cx="200" cy="310" rx="90" ry="60" fill="${COLORS.sealRed}" opacity="0.4"/>
    <text x="200" y="390" text-anchor="middle" font-size="14" fill="#999">默认头像</text>`

  return createSVG({ bg: '#F5F5F5', elements })
}

/** 生成空状态图 */
function generateEmptyState() {
  const elements = `
    <!-- 空印章盒 -->
    <rect x="120" y="100" width="160" height="140" rx="12" fill="none" stroke="#D0D0D0" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="200" y="185" text-anchor="middle" font-size="48" fill="#D0D0D0" font-family="serif">印</text>
    <!-- 文字 -->
    <text x="200" y="300" text-anchor="middle" font-size="24" fill="#BBBBBB" font-family="sans-serif">暂无内容</text>
    <text x="200" y="340" text-anchor="middle" font-size="18" fill="#D0D0D0" font-family="sans-serif">开始您的印章之旅吧</text>`

  return createSVG({ bg: COLORS.white, elements })
}

function writeSVG(filePath, svgContent) {
  ensureDir(path.dirname(filePath))
  fs.writeFileSync(filePath, svgContent, 'utf-8')
  console.log(`  \u2713 ${path.relative(OUTPUT_DIR, filePath)}`)
}

/** 生成默认材质图 */
function generateDefaultMaterial() {
  const elements = `
    <rect x="80" y="80" width="240" height="200" rx="16" fill="#E0E0E0" opacity="0.5"/>
    <rect x="80" y="80" width="240" height="200" rx="16" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-dasharray="8,4"/>
    <text x="200" y="195" text-anchor="middle" font-size="40" fill="#BDBDBD" font-family="serif">\u77F3</text>
    <text x="200" y="340" text-anchor="middle" font-size="20" fill="#BDBDBD" font-family="sans-serif">\u6750\u8D28\u56FE\u7247</text>`
  return createSVG({ bg: COLORS.gray, elements })
}

/** 生成默认印\u7ae0图 */
function generateDefaultSeal() {
  const elements = `
    <rect x="110" y="80" width="180" height="180" rx="8" fill="none" stroke="#DBBCBC" stroke-width="3" stroke-dasharray="8,4"/>
    <text x="200" y="190" text-anchor="middle" font-size="56" fill="#DBBCBC" font-family="serif">\u5370</text>
    <text x="200" y="340" text-anchor="middle" font-size="20" fill="#BDBDBD" font-family="sans-serif">\u5370\u7AE0\u56FE\u7247</text>`
  return createSVG({ bg: COLORS.white, elements })
}

// ===================== 主流程 =====================
function main() {
  console.log('🖌  SealCraft 占位图片生成器\n')
  console.log(`输出目录: ${OUTPUT_DIR}\n`)

  ensureDir(OUTPUT_DIR)

  // 1. 印章类型图片
  console.log('── 印章类型 ──')
  const sealTypes = [
    { name: 'name-seal', label: '姓名章' },
    { name: 'leisure-seal', label: '闲章' },
    { name: 'bookplate-seal', label: '藏书章' },
    { name: 'signature-seal', label: '签名章' },
    { name: 'collection-seal', label: '收藏章' },
  ]
  sealTypes.forEach(({ name, label }) => {
    for (let i = 1; i <= 3; i++) {
      const svg = generateSealImage(name, label, i - 1)
      writeSVG(path.join(OUTPUT_DIR, 'seals', `${name}-${i}.png`), svg)
    }
  })

  // 2. 材质图片
  console.log('\n── 材质 ──')
  const materials = [
    { name: 'copper', label: '铜', colors: [COLORS.copper, COLORS.copperLight] },
    { name: 'shoushan', label: '寿山石', colors: [COLORS.shoushanDark, COLORS.shoushan] },
    { name: 'qingtian', label: '青田石', colors: [COLORS.qingtianDark, COLORS.qingtian] },
    { name: 'horn', label: '牛角', colors: [COLORS.horn, COLORS.hornLight] },
    { name: 'sandalwood', label: '檀木', colors: [COLORS.sandalwood, COLORS.sandalwoodLight] },
    { name: 'jixue', label: '鸡血石', colors: [COLORS.jixue, COLORS.jixueLight] },
  ]
  materials.forEach(({ name, label, colors }) => {
    for (let i = 1; i <= 2; i++) {
      const svg = generateMaterialImage(name, label, colors, i - 1)
      writeSVG(path.join(OUTPUT_DIR, 'materials', `${name}-${i}.png`), svg)
    }
  })

  // 3. 字体图片
  console.log('\n── 字体 ──')
  const fonts = [
    { name: 'seal-script', label: '篆书', sample: '大音希声' },
    { name: 'clerical-script', label: '隶书', sample: '宁静致远' },
    { name: 'regular-script', label: '楷书', sample: '厚德载物' },
    { name: 'running-script', label: '行书', sample: '上善若水' },
  ]
  fonts.forEach(({ name, label, sample }) => {
    const svg = generateFontImage(name, label, sample)
    writeSVG(path.join(OUTPUT_DIR, 'fonts', `${name}.png`), svg)
  })

  // 4. 工作室图片
  console.log('\n── 工作室 ──')
  const studios = ['金石篆刻坊', '方寸印舍', '翰墨金石', '铁笔斋', '云章阁', '印道工作室']
  studios.forEach((name, i) => {
    const svg = generateStudioImage(name, i)
    writeSVG(path.join(OUTPUT_DIR, 'studios', `studio-${i + 1}.png`), svg)
  })

  // 5. 通用图片
  console.log('\n── 通用 ──')
  writeSVG(path.join(OUTPUT_DIR, 'logo.png'), generateLogo())
  writeSVG(path.join(OUTPUT_DIR, 'default-avatar.png'), generateDefaultAvatar())
  writeSVG(path.join(OUTPUT_DIR, 'empty-state.png'), generateEmptyState())
  writeSVG(path.join(OUTPUT_DIR, 'default-material.png'), generateDefaultMaterial())
  writeSVG(path.join(OUTPUT_DIR, 'default-seal.png'), generateDefaultSeal())

  console.log('\n✅ 全部图片生成完毕！')
}

main()
